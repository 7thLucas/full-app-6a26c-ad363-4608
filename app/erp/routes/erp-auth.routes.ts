import { Router } from "express";
import { ERPAuthService } from "../services/auth.service";
import { StaffModel, StaffRole } from "../models/staff.model";
import { TenantModel } from "../models/tenant.model";
import { BranchModel } from "../models/branch.model";

const router = Router();

// POST /api/erp/auth/login - PIN-based staff login
router.post("/erp/auth/login", async (req, res) => {
  try {
    const { tenant_slug, pin, branch_id } = req.body;
    if (!tenant_slug || !pin) {
      return res.status(400).json({ success: false, error: "tenant_slug and pin are required" });
    }

    const result = await ERPAuthService.loginWithPin(tenant_slug, pin, branch_id);
    return res.json({ success: true, ...result });
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({ success: false, error: error.message });
  }
});

// GET /api/erp/auth/me - get current staff session
router.get("/erp/auth/me", async (req, res) => {
  try {
    const staffAuth = ERPAuthService.getTokenFromRequest(req);
    if (!staffAuth) return res.status(401).json({ success: false, error: "Unauthorized" });

    const staff = await StaffModel.findById(staffAuth.staff_id).populate("branch_id");
    if (!staff) return res.status(404).json({ success: false, error: "Staff not found" });

    return res.json({
      success: true,
      data: {
        id: staff._id.toString(),
        name: staff.name,
        role: staff.role,
        tenant_id: staffAuth.tenant_id,
        branch_id: staffAuth.branch_id,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/erp/auth/staff-list - get staff list for PIN selection (public, by tenant)
router.get("/erp/auth/staff-list/:tenantSlug", async (req, res) => {
  try {
    const tenant = await TenantModel.findOne({ slug: req.params.tenantSlug });
    if (!tenant) return res.status(404).json({ success: false, error: "Tenant not found" });

    const branchId = req.query.branch_id as string | undefined;
    const query: Record<string, any> = { tenant_id: tenant._id, status: "active" };
    if (branchId) query.branch_id = branchId;

    const staff = await StaffModel.find(query).select("name role avatar_url branch_id").sort("name");
    return res.json({
      success: true,
      data: staff.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        role: s.role,
        avatar_url: s.avatar_url,
        branch_id: s.branch_id?.toString(),
      })),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
