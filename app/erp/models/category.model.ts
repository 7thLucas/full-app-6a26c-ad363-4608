import { prop, getModelForClass, modelOptions, Ref } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";
import { Tenant } from "./tenant.model";
import { Branch } from "./branch.model";

@modelOptions({
  schemaOptions: {
    collection: "tbl_categories",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Category extends CommonTypegooseEntity {
  @prop({ ref: () => Tenant, required: true })
  tenant_id!: Ref<Tenant>;

  @prop({ ref: () => Branch, required: false })
  branch_id?: Ref<Branch>;

  @prop({ type: String, required: true, trim: true })
  name!: string;

  @prop({ type: String, required: false })
  description?: string;

  @prop({ type: String, required: false })
  image_url?: string;

  @prop({ type: String, required: false })
  color?: string;

  @prop({ type: Number, default: 0 })
  sort_order!: number;

  @prop({ type: Boolean, default: true })
  is_active!: boolean;

  @prop({ ref: () => Category, required: false })
  parent_id?: Ref<Category>;
}

export const CategoryModel = getModelForClass(Category);
