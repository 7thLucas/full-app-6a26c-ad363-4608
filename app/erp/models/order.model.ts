import { prop, getModelForClass, modelOptions, Ref } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";
import { Tenant } from "./tenant.model";
import { Branch } from "./branch.model";
import { Staff } from "./staff.model";
import { Table } from "./table.model";

export enum OrderStatus {
  Pending = "pending",
  Preparing = "preparing",
  Ready = "ready",
  Served = "served",
  Completed = "completed",
  Cancelled = "cancelled",
}

export enum OrderType {
  DineIn = "dine_in",
  Takeaway = "takeaway",
  Delivery = "delivery",
  RoomService = "room_service",
}

export enum PaymentMethod {
  Cash = "cash",
  Card = "card",
  MobileMoney = "mobile_money",
  BankTransfer = "bank_transfer",
  Mixed = "mixed",
  Pending = "pending",
}

export enum PaymentStatus {
  Unpaid = "unpaid",
  PartiallyPaid = "partially_paid",
  Paid = "paid",
  Refunded = "refunded",
}

export class OrderItemModifier {
  @prop({ type: String })
  group_name!: string;

  @prop({ type: String })
  modifier_name!: string;

  @prop({ type: Number, default: 0 })
  price!: number;
}

export class OrderItem {
  @prop({ type: String, required: true })
  product_id!: string;

  @prop({ type: String, required: true })
  product_name!: string;

  @prop({ type: String, required: false })
  variant_name?: string;

  @prop({ type: Number, required: true, default: 1 })
  quantity!: number;

  @prop({ type: Number, required: true })
  unit_price!: number;

  @prop({ type: Number, default: 0 })
  discount_amount!: number;

  @prop({ type: Number, required: true })
  total_price!: number;

  @prop({ type: String, required: false })
  notes?: string;

  @prop({ type: String, default: "pending" })
  kitchen_status!: string;

  @prop({ type: () => [OrderItemModifier] })
  modifiers!: OrderItemModifier[];
}

export class PaymentRecord {
  @prop({ type: String, enum: PaymentMethod })
  method!: PaymentMethod;

  @prop({ type: Number })
  amount!: number;

  @prop({ type: String, required: false })
  reference?: string;

  @prop({ type: Date, default: () => new Date() })
  paid_at!: Date;
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_orders",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Order extends CommonTypegooseEntity {
  @prop({ ref: () => Tenant, required: true })
  tenant_id!: Ref<Tenant>;

  @prop({ ref: () => Branch, required: true })
  branch_id!: Ref<Branch>;

  @prop({ type: String, required: true })
  order_number!: string;

  @prop({ ref: () => Table, required: false })
  table_id?: Ref<Table>;

  @prop({ type: String, required: false })
  table_number?: string;

  @prop({ ref: () => Staff, required: false })
  cashier_id?: Ref<Staff>;

  @prop({ ref: () => Staff, required: false })
  waiter_id?: Ref<Staff>;

  @prop({ type: String, required: false })
  customer_name?: string;

  @prop({ type: String, required: false })
  customer_phone?: string;

  @prop({ type: String, enum: OrderType, default: OrderType.DineIn })
  order_type!: OrderType;

  @prop({ type: String, enum: OrderStatus, default: OrderStatus.Pending })
  status!: OrderStatus;

  @prop({ type: String, enum: PaymentStatus, default: PaymentStatus.Unpaid })
  payment_status!: PaymentStatus;

  @prop({ type: () => [OrderItem] })
  items!: OrderItem[];

  @prop({ type: Number, default: 0 })
  subtotal!: number;

  @prop({ type: Number, default: 0 })
  tax_amount!: number;

  @prop({ type: Number, default: 0 })
  discount_amount!: number;

  @prop({ type: Number, default: 0 })
  total_amount!: number;

  @prop({ type: Number, default: 0 })
  paid_amount!: number;

  @prop({ type: Number, default: 0 })
  change_amount!: number;

  @prop({ type: String, enum: PaymentMethod, default: PaymentMethod.Pending })
  payment_method!: PaymentMethod;

  @prop({ type: () => [PaymentRecord] })
  payment_records!: PaymentRecord[];

  @prop({ type: String, required: false })
  notes?: string;

  @prop({ type: Date, required: false })
  completed_at?: Date;

  @prop({ type: Date, required: false })
  cancelled_at?: Date;

  @prop({ type: String, required: false })
  cancel_reason?: string;
}

export const OrderModel = getModelForClass(Order);
