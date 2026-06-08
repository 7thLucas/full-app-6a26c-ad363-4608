import { Router } from "express";
import { TableModel, TableStatus } from "../models/table.model";
import { ERPAuthService } from "../services/auth.service";

const router = Router();

function requireERPAuth(req: any, res: any, next: any) {
  const auth = ERPAuthService.getTokenFromRequest(req);
  if (!auth) return res.status(401).json({ success: false, error: "Unauthorized" });
  req.staffAuth = auth;
  next();
}

// GET /api/erp/tables
router.get("/erp/tables", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    const query: Record<string, any> = {
      tenant_id: staffAuth.tenant_id,
      is_active: true,
    };
    if (staffAuth.branch_id) query.branch_id = staffAuth.branch_id;

    const tables = await TableModel.find(query).sort({ floor: 1, number: 1 });
    return res.json({ success: true, data: tables });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/erp/tables
router.post("/erp/tables", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    const table = await TableModel.create({
      ...req.body,
      tenant_id: staffAuth.tenant_id,
      branch_id: req.body.branch_id ?? staffAuth.branch_id,
    });
    return res.status(201).json({ success: true, data: table });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/erp/tables/:id
router.put("/erp/tables/:id", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    const table = await TableModel.findOneAndUpdate(
      { _id: req.params.id, tenant_id: staffAuth.tenant_id },
      req.body,
      { new: true }
    );
    if (!table) return res.status(404).json({ success: false, error: "Table not found" });
    return res.json({ success: true, data: table });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/erp/tables/:id/status
router.patch("/erp/tables/:id/status", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    const { status } = req.body;
    const table = await TableModel.findOneAndUpdate(
      { _id: req.params.id, tenant_id: staffAuth.tenant_id },
      { status },
      { new: true }
    );
    if (!table) return res.status(404).json({ success: false, error: "Table not found" });
    return res.json({ success: true, data: table });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/erp/tables/:id
router.delete("/erp/tables/:id", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    await TableModel.findOneAndUpdate(
      { _id: req.params.id, tenant_id: staffAuth.tenant_id },
      { is_active: false }
    );
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
