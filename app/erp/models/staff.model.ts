import { prop, getModelForClass, modelOptions, Ref } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";
import { Tenant } from "./tenant.model";
import { Branch } from "./branch.model";

export enum StaffRole {
  SuperAdmin = "super_admin",
  Owner = "owner",
  Manager = "manager",
  Cashier = "cashier",
  Waiter = "waiter",
  KitchenStaff = "kitchen_staff",
  Accountant = "accountant",
  Receptionist = "receptionist",
  Housekeeping = "housekeeping",
}

export enum StaffStatus {
  Active = "active",
  Inactive = "inactive",
  OnLeave = "on_leave",
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_staff",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    indexes: [{ fields: { tenant_id: 1, pin_hash: 1 } }],
  },
})
export class Staff extends CommonTypegooseEntity {
  @prop({ ref: () => Tenant, required: true })
  tenant_id!: Ref<Tenant>;

  @prop({ ref: () => Branch, required: false })
  branch_id?: Ref<Branch>;

  @prop({ type: String, required: true, trim: true })
  name!: string;

  @prop({ type: String, required: false, trim: true })
  email?: string;

  @prop({ type: String, required: false })
  phone?: string;

  @prop({ type: String, enum: StaffRole, default: StaffRole.Cashier })
  role!: StaffRole;

  @prop({ type: String, required: true })
  pin_hash!: string;

  @prop({ type: String, enum: StaffStatus, default: StaffStatus.Active })
  status!: StaffStatus;

  @prop({ type: String, required: false })
  avatar_url?: string;

  @prop({ type: Date, required: false })
  last_login?: Date;

  @prop({ type: Number, default: 0 })
  failed_pin_attempts!: number;

  @prop({ type: Date, required: false })
  locked_until?: Date;
}

export const StaffModel = getModelForClass(Staff);
