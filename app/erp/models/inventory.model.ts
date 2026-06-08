import { prop, getModelForClass, modelOptions, Ref } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";
import { Tenant } from "./tenant.model";
import { Branch } from "./branch.model";

export enum StockUnit {
  Kg = "kg",
  Grams = "g",
  Liters = "l",
  Ml = "ml",
  Units = "units",
  Pieces = "pieces",
  Portions = "portions",
}

export enum StockMovementType {
  Purchase = "purchase",
  Sale = "sale",
  Adjustment = "adjustment",
  Wastage = "wastage",
  Transfer = "transfer",
  Return = "return",
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_inventory_items",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class InventoryItem extends CommonTypegooseEntity {
  @prop({ ref: () => Tenant, required: true })
  tenant_id!: Ref<Tenant>;

  @prop({ ref: () => Branch, required: true })
  branch_id!: Ref<Branch>;

  @prop({ type: String, required: true, trim: true })
  name!: string;

  @prop({ type: String, required: false })
  description?: string;

  @prop({ type: String, required: false })
  sku?: string;

  @prop({ type: String, required: false })
  category?: string;

  @prop({ type: Number, default: 0 })
  current_stock!: number;

  @prop({ type: Number, default: 0 })
  minimum_stock!: number;

  @prop({ type: Number, required: false })
  maximum_stock?: number;

  @prop({ type: String, enum: StockUnit, default: StockUnit.Units })
  unit!: StockUnit;

  @prop({ type: Number, default: 0 })
  cost_per_unit!: number;

  @prop({ type: Boolean, default: true })
  is_active!: boolean;

  @prop({ type: String, required: false })
  supplier_name?: string;
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_stock_movements",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class StockMovement extends CommonTypegooseEntity {
  @prop({ ref: () => Tenant, required: true })
  tenant_id!: Ref<Tenant>;

  @prop({ ref: () => Branch, required: true })
  branch_id!: Ref<Branch>;

  @prop({ ref: () => InventoryItem, required: true })
  item_id!: Ref<InventoryItem>;

  @prop({ type: String, enum: StockMovementType, required: true })
  movement_type!: StockMovementType;

  @prop({ type: Number, required: true })
  quantity!: number;

  @prop({ type: Number, required: false })
  unit_cost?: number;

  @prop({ type: Number, required: false })
  total_cost?: number;

  @prop({ type: String, required: false })
  reference?: string;

  @prop({ type: String, required: false })
  notes?: string;

  @prop({ type: String, required: false })
  performed_by?: string;

  @prop({ type: Number, required: false })
  stock_before?: number;

  @prop({ type: Number, required: false })
  stock_after?: number;
}

export const InventoryItemModel = getModelForClass(InventoryItem);
export const StockMovementModel = getModelForClass(StockMovement);
