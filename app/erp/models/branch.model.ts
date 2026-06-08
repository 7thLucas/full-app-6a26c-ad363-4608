import { prop, getModelForClass, modelOptions, Ref } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";
import { Tenant } from "./tenant.model";

export enum BranchStatus {
  Active = "active",
  Closed = "closed",
  Maintenance = "maintenance",
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_branches",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Branch extends CommonTypegooseEntity {
  @prop({ ref: () => Tenant, required: true })
  tenant_id!: Ref<Tenant>;

  @prop({ type: String, required: true, trim: true })
  name!: string;

  @prop({ type: String, required: false })
  address?: string;

  @prop({ type: String, required: false })
  phone?: string;

  @prop({ type: String, required: false })
  email?: string;

  @prop({ type: String, enum: BranchStatus, default: BranchStatus.Active })
  status!: BranchStatus;

  @prop({ type: Boolean, default: false })
  is_headquarters!: boolean;

  @prop({ type: String, required: false })
  timezone?: string;

  @prop({ type: String, required: false })
  opening_hours?: string;
}

export const BranchModel = getModelForClass(Branch);
