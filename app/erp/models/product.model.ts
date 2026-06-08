import { prop, getModelForClass, modelOptions, Ref } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";
import { Tenant } from "./tenant.model";
import { Branch } from "./branch.model";
import { Category } from "./category.model";

export enum ProductStatus {
  Active = "active",
  Inactive = "inactive",
  OutOfStock = "out_of_stock",
}

export class ProductVariant {
  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: Number, required: true })
  price!: number;

  @prop({ type: Number, default: 0 })
  cost_price!: number;

  @prop({ type: String, required: false })
  sku?: string;

  @prop({ type: Boolean, default: true })
  is_available!: boolean;
}

export class ProductModifier {
  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: Number, default: 0 })
  price!: number;

  @prop({ type: Boolean, default: true })
  is_available!: boolean;
}

export class ModifierGroup {
  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: Boolean, default: false })
  required!: boolean;

  @prop({ type: Boolean, default: false })
  multiple!: boolean;

  @prop({ type: () => [ProductModifier] })
  modifiers!: ProductModifier[];
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_products",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Product extends CommonTypegooseEntity {
  @prop({ ref: () => Tenant, required: true })
  tenant_id!: Ref<Tenant>;

  @prop({ ref: () => Branch, required: false })
  branch_id?: Ref<Branch>;

  @prop({ ref: () => Category, required: false })
  category_id?: Ref<Category>;

  @prop({ type: String, required: true, trim: true })
  name!: string;

  @prop({ type: String, required: false })
  description?: string;

  @prop({ type: Number, required: true, default: 0 })
  price!: number;

  @prop({ type: Number, default: 0 })
  cost_price!: number;

  @prop({ type: Number, default: 0 })
  tax_rate!: number;

  @prop({ type: String, required: false })
  sku?: string;

  @prop({ type: String, required: false })
  barcode?: string;

  @prop({ type: String, required: false })
  image_url?: string;

  @prop({ type: String, enum: ProductStatus, default: ProductStatus.Active })
  status!: ProductStatus;

  @prop({ type: Boolean, default: true })
  is_available!: boolean;

  @prop({ type: Number, default: 0 })
  sort_order!: number;

  @prop({ type: () => [ProductVariant] })
  variants!: ProductVariant[];

  @prop({ type: () => [ModifierGroup] })
  modifier_groups!: ModifierGroup[];

  @prop({ type: Boolean, default: false })
  track_inventory!: boolean;

  @prop({ type: Number, default: 0 })
  preparation_time!: number; // minutes
}

export const ProductModel = getModelForClass(Product);
