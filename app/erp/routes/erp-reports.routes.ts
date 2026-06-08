import { Router } from "express";
import { OrderModel, OrderStatus } from "../models/order.model";
import { InventoryItemModel } from "../models/inventory.model";
import { ERPAuthService } from "../services/auth.service";
import { OrderService } from "../services/order.service";

const router = Router();

function requireERPAuth(req: any, res: any, next: any) {
  const auth = ERPAuthService.getTokenFromRequest(req);
  if (!auth) return res.status(401).json({ success: false, error: "Unauthorized" });
  req.staffAuth = auth;
  next();
}

// GET /api/erp/reports/dashboard - main dashboard stats
router.get("/erp/reports/dashboard", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    const query: Record<string, any> = { tenant_id: staffAuth.tenant_id };
    if (staffAuth.branch_id) query.branch_id = staffAuth.branch_id;

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayOrders, weekOrders, monthOrders, lowStockItems, activeOrders] = await Promise.all([
      OrderModel.find({ ...query, status: OrderStatus.Completed, completed_at: { $gte: todayStart, $lte: todayEnd } }),
      OrderModel.find({ ...query, status: OrderStatus.Completed, completed_at: { $gte: weekStart, $lte: todayEnd } }),
      OrderModel.find({ ...query, status: OrderStatus.Completed, completed_at: { $gte: monthStart, $lte: todayEnd } }),
      InventoryItemModel.find({ ...query, is_active: true }).then(items => items.filter(i => i.current_stock <= i.minimum_stock)),
      OrderModel.countDocuments({ ...query, status: { $in: [OrderStatus.Pending, OrderStatus.Preparing] } }),
    ]);

    const sum = (orders: typeof todayOrders) => orders.reduce((s, o) => s + o.total_amount, 0);

    // Top products today
    const productSales: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const order of todayOrders) {
      for (const item of order.items) {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = { name: item.product_name, count: 0, revenue: 0 };
        }
        productSales[item.product_id].count += item.quantity;
        productSales[item.product_id].revenue += item.total_price;
      }
    }

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([id, data]) => ({ product_id: id, ...data }));

    return res.json({
      success: true,
      data: {
        today: {
          revenue: sum(todayOrders),
          orders: todayOrders.length,
          avg_order_value: todayOrders.length > 0 ? sum(todayOrders) / todayOrders.length : 0,
        },
        week: {
          revenue: sum(weekOrders),
          orders: weekOrders.length,
        },
        month: {
          revenue: sum(monthOrders),
          orders: monthOrders.length,
        },
        active_orders: activeOrders,
        low_stock_count: lowStockItems.length,
        top_products: topProducts,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/erp/reports/sales - detailed sales report
router.get("/erp/reports/sales", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    const { period = "daily", start_date, end_date } = req.query;

    const query: Record<string, any> = {
      tenant_id: staffAuth.tenant_id,
      status: OrderStatus.Completed,
    };
    if (staffAuth.branch_id) query.branch_id = staffAuth.branch_id;

    const now = new Date();
    if (start_date && end_date) {
      query.completed_at = { $gte: new Date(start_date as string), $lte: new Date(end_date as string) };
    } else if (period === "daily") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      query.completed_at = { $gte: start };
    } else if (period === "weekly") {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      query.completed_at = { $gte: start };
    } else if (period === "monthly") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      query.completed_at = { $gte: start };
    }

    const orders = await OrderModel.find(query).sort({ completed_at: -1 });
    const totalRevenue = orders.reduce((s, o) => s + o.total_amount, 0);
    const totalTax = orders.reduce((s, o) => s + o.tax_amount, 0);
    const totalDiscount = orders.reduce((s, o) => s + o.discount_amount, 0);

    return res.json({
      success: true,
      data: {
        orders,
        summary: {
          total_orders: orders.length,
          total_revenue: totalRevenue,
          total_tax: totalTax,
          total_discount: totalDiscount,
          net_revenue: totalRevenue - totalTax,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
