import { OrderModel, OrderStatus, OrderType, PaymentMethod, PaymentStatus } from "../models/order.model";
import { TableModel, TableStatus } from "../models/table.model";
import type { StaffTokenPayload } from "./auth.service";

let orderCounter = 1000;

function generateOrderNumber(branchCode = "BR"): string {
  const today = new Date();
  const date = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  orderCounter++;
  return `${branchCode}-${date}-${String(orderCounter).padStart(4, "0")}`;
}

export class OrderService {
  static async createOrder(staffAuth: StaffTokenPayload, data: {
    table_id?: string;
    order_type?: OrderType;
    customer_name?: string;
    customer_phone?: string;
    notes?: string;
  }) {
    const order = await OrderModel.create({
      tenant_id: staffAuth.tenant_id,
      branch_id: staffAuth.branch_id,
      order_number: generateOrderNumber(),
      table_id: data.table_id,
      order_type: data.order_type ?? OrderType.DineIn,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      notes: data.notes,
      cashier_id: staffAuth.staff_id,
      status: OrderStatus.Pending,
      payment_status: PaymentStatus.Unpaid,
      items: [],
      subtotal: 0,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 0,
      paid_amount: 0,
      change_amount: 0,
      payment_method: PaymentMethod.Pending,
      payment_records: [],
    });

    // Mark table as occupied
    if (data.table_id) {
      await TableModel.findByIdAndUpdate(data.table_id, {
        status: TableStatus.Occupied,
        current_order_id: order._id.toString(),
      });
    }

    return order;
  }

  static async addItems(orderId: string, items: Array<{
    product_id: string;
    product_name: string;
    variant_name?: string;
    quantity: number;
    unit_price: number;
    notes?: string;
    modifiers?: Array<{ group_name: string; modifier_name: string; price: number }>;
  }>) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error("Order not found");

    for (const item of items) {
      const modifierTotal = (item.modifiers ?? []).reduce((sum, m) => sum + m.price, 0);
      const totalPrice = (item.unit_price + modifierTotal) * item.quantity;
      order.items.push({
        product_id: item.product_id,
        product_name: item.product_name,
        variant_name: item.variant_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: 0,
        total_price: totalPrice,
        notes: item.notes,
        kitchen_status: "pending",
        modifiers: item.modifiers ?? [],
      });
    }

    order.subtotal = order.items.reduce((s, i) => s + i.total_price, 0);
    order.tax_amount = Math.round(order.subtotal * 0.1 * 100) / 100;
    order.total_amount = order.subtotal + order.tax_amount - order.discount_amount;
    await order.save();
    return order;
  }

  static async processPayment(orderId: string, payments: Array<{
    method: PaymentMethod;
    amount: number;
    reference?: string;
  }>) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error("Order not found");

    const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
    if (totalPaid < order.total_amount) {
      throw new Error("Insufficient payment amount");
    }

    for (const p of payments) {
      order.payment_records.push({
        method: p.method,
        amount: p.amount,
        reference: p.reference,
        paid_at: new Date(),
      });
    }

    order.paid_amount = totalPaid;
    order.change_amount = totalPaid - order.total_amount;
    order.payment_method = payments.length > 1 ? PaymentMethod.Mixed : payments[0].method;
    order.payment_status = PaymentStatus.Paid;
    order.status = OrderStatus.Completed;
    order.completed_at = new Date();
    await order.save();

    // Free the table
    if (order.table_id) {
      await TableModel.findByIdAndUpdate(order.table_id, {
        status: TableStatus.Cleaning,
        current_order_id: null,
      });
    }

    return order;
  }

  static async updateStatus(orderId: string, status: OrderStatus) {
    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    return order;
  }

  static async getActiveOrders(tenantId: string, branchId: string) {
    return OrderModel.find({
      tenant_id: tenantId,
      branch_id: branchId,
      status: { $nin: [OrderStatus.Completed, OrderStatus.Cancelled] },
    }).sort({ createdAt: -1 });
  }

  static async getDailySales(tenantId: string, branchId: string, date?: Date) {
    const d = date ?? new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

    const orders = await OrderModel.find({
      tenant_id: tenantId,
      branch_id: branchId,
      status: OrderStatus.Completed,
      completed_at: { $gte: start, $lte: end },
    });

    const totalRevenue = orders.reduce((s, o) => s + o.total_amount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { orders, totalRevenue, totalOrders, averageOrderValue };
  }
}
