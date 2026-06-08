import { Router } from "express";
import { InventoryItemModel, StockMovementModel } from "../models/inventory.model";
import { ERPAuthService } from "../services/auth.service";

const router = Router();

function requireERPAuth(req: any, res: any, next: any) {
  const auth = ERPAuthService.getTokenFromRequest(req);
  if (!auth) return res.status(401).json({ success: false, error: "Unauthorized" });
  req.staffAuth = auth;
  next();
}

// GET /api/erp/inventory
router.get("/erp/inventory", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    const { low_stock, search } = req.query;

    const query: Record<string, any> = {
      tenant_id: staffAuth.tenant_id,
      is_active: true,
    };
    if (staffAuth.branch_id) query.branch_id = staffAuth.branch_id;
    if (search) query.name = { $regex: search, $options: "i" };

    const items = await InventoryItemModel.find(query).sort({ name: 1 });

    const result = low_stock === "true"
      ? items.filter(i => i.current_stock <= i.minimum_stock)
      : items;

    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/erp/inventory
router.post("/erp/inventory", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    const item = await InventoryItemModel.create({
      ...req.body,
      tenant_id: staffAuth.tenant_id,
      branch_id: req.body.branch_id ?? staffAuth.branch_id,
    });
    return res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/erp/inventory/:id
router.put("/erp/inventory/:id", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    const item = await InventoryItemModel.findOneAndUpdate(
      { _id: req.params.id, tenant_id: staffAuth.tenant_id },
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, error: "Item not found" });
    return res.json({ success: true, data: item });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/erp/inventory/:id/adjust - adjust stock
router.post("/erp/inventory/:id/adjust", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    const { quantity, movement_type, notes } = req.body;

    const item = await InventoryItemModel.findOne({
      _id: req.params.id,
      tenant_id: staffAuth.tenant_id,
    });
    if (!item) return res.status(404).json({ success: false, error: "Item not found" });

    const stockBefore = item.current_stock;
    item.current_stock = Math.max(0, item.current_stock + quantity);
    await item.save();

    await StockMovementModel.create({
      tenant_id: staffAuth.tenant_id,
      branch_id: staffAuth.branch_id,
      item_id: item._id,
      movement_type,
      quantity,
      notes,
      performed_by: staffAuth.staff_id,
      stock_before: stockBefore,
      stock_after: item.current_stock,
    });

    return res.json({ success: true, data: item });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/erp/inventory/movements - stock movement history
router.get("/erp/inventory/movements", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    const { item_id, limit = "50" } = req.query;

    const query: Record<string, any> = { tenant_id: staffAuth.tenant_id };
    if (staffAuth.branch_id) query.branch_id = staffAuth.branch_id;
    if (item_id) query.item_id = item_id;

    const movements = await StockMovementModel.find(query)
      .populate("item_id", "name unit")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string));

    return res.json({ success: true, data: movements });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
