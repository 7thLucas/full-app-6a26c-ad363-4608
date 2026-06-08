import { Router } from "express";
import { OrderModel, OrderStatus, OrderType } from "../models/order.model";
import { OrderService } from "../services/order.service";
import { ERPAuthService } from "../services/auth.service";

const router = Router();

function requireERPAuth(req: any, res: any, next: any) {
  const auth = ERPAuthService.getTokenFromRequest(req);
  if (!auth) return res.status(401).json({ success: false, error: "Unauthorized" });
  req.staffAuth = auth;
  next();
}

// GET /api/erp/orders - list orders
router.get("/erp/orders", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    const { status, date, limit = "50", page = "1" } = req.query;

    const query: Record<string, any> = {
      tenant_id: staffAuth.tenant_id,
    };
    if (staffAuth.branch_id) query.branch_id = staffAuth.branch_id;
    if (status) query.status = status;
    if (date) {
      const d = new Date(date as string);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      query.createdAt = { $gte: start, $lte: end };
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const [orders, total] = await Promise.all([
      OrderModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit as string)),
      OrderModel.countDocuments(query),
    ]);

    return res.json({ success: true, data: orders, total });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/erp/orders/active
router.get("/erp/orders/active", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    const orders = await OrderService.getActiveOrders(staffAuth.tenant_id, staffAuth.branch_id ?? "");
    return res.json({ success: true, data: orders });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/erp/orders/kitchen - KDS feed
router.get("/erp/orders/kitchen", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    const orders = await OrderModel.find({
      tenant_id: staffAuth.tenant_id,
      branch_id: staffAuth.branch_id,
      status: { $in: [OrderStatus.Pending, OrderStatus.Preparing] },
    }).sort({ createdAt: 1 });
    return res.json({ success: true, data: orders });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/erp/orders/:id
router.get("/erp/orders/:id", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    const order = await OrderModel.findOne({ _id: req.params.id, tenant_id: staffAuth.tenant_id });
    if (!order) return res.status(404).json({ success: false, error: "Order not found" });
    return res.json({ success: true, data: order });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/erp/orders - create order
router.post("/erp/orders", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    const order = await OrderService.createOrder(staffAuth, req.body);
    return res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/erp/orders/:id/items - add items to order
router.post("/erp/orders/:id/items", requireERPAuth, async (req: any, res) => {
  try {
    const { items } = req.body;
    const order = await OrderService.addItems(req.params.id, items);
    return res.json({ success: true, data: order });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/erp/orders/:id/payment - process payment
router.post("/erp/orders/:id/payment", requireERPAuth, async (req: any, res) => {
  try {
    const { payments } = req.body;
    const order = await OrderService.processPayment(req.params.id, payments);
    return res.json({ success: true, data: order });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// PATCH /api/erp/orders/:id/status - update order status
router.patch("/erp/orders/:id/status", requireERPAuth, async (req: any, res) => {
  try {
    const { status } = req.body;
    const order = await OrderService.updateStatus(req.params.id, status);
    return res.json({ success: true, data: order });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
