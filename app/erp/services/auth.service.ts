import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { StaffModel, StaffRole, StaffStatus } from "../models/staff.model";
import { TenantModel } from "../models/tenant.model";
import { BranchModel } from "../models/branch.model";
import type { Request } from "express";

export interface StaffTokenPayload {
  staff_id: string;
  tenant_id: string;
  branch_id: string | null;
  name: string;
  role: StaffRole;
  iat?: number;
  exp?: number;
}

function makeError(message: string, statusCode = 400): Error {
  return Object.assign(new Error(message), { statusCode });
}

export class ERPAuthService {
  static async loginWithPin(tenantSlug: string, pin: string, branchId?: string): Promise<{
    token: string;
    staff: { id: string; name: string; role: StaffRole; branch_id: string | null };
  }> {
    const tenant = await TenantModel.findOne({ slug: tenantSlug });
    if (!tenant) throw makeError("Tenant not found", 404);

    // Get all active staff for this tenant
    const allStaff = await StaffModel.find({
      tenant_id: tenant._id,
      status: StaffStatus.Active,
    });

    if (allStaff.length === 0) throw makeError("No active staff found", 404);

    // Check if account is locked
    const now = new Date();
    let matchedStaff = null;

    for (const staff of allStaff) {
      if (staff.locked_until && staff.locked_until > now) continue;

      const isValid = await bcrypt.compare(pin, staff.pin_hash);
      if (isValid) {
        matchedStaff = staff;
        break;
      }
    }

    if (!matchedStaff) {
      // Increment failed attempts on all staff (we don't know which one)
      // In production, you'd know which user is logging in (by name/badge selection)
      throw makeError("Invalid PIN", 401);
    }

    // Reset failed attempts
    matchedStaff.failed_pin_attempts = 0;
    matchedStaff.locked_until = undefined;
    matchedStaff.last_login = new Date();
    await matchedStaff.save();

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not set");

    const staffBranchId = branchId ?? matchedStaff.branch_id?.toString() ?? null;

    const payload: StaffTokenPayload = {
      staff_id: matchedStaff._id.toString(),
      tenant_id: tenant._id.toString(),
      branch_id: staffBranchId,
      name: matchedStaff.name,
      role: matchedStaff.role,
    };

    const token = jwt.sign(payload, secret, { expiresIn: "12h" });

    return {
      token,
      staff: {
        id: matchedStaff._id.toString(),
        name: matchedStaff.name,
        role: matchedStaff.role,
        branch_id: staffBranchId,
      },
    };
  }

  static verifyToken(token: string): StaffTokenPayload {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not set");
    return jwt.verify(token, secret) as StaffTokenPayload;
  }

  static getTokenFromRequest(req: Request): StaffTokenPayload | null {
    try {
      const header = req.headers.authorization;
      if (!header) return null;
      const token = header.replace("Bearer ", "");
      return ERPAuthService.verifyToken(token);
    } catch {
      return null;
    }
  }
}
