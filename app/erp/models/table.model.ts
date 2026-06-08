import { prop, getModelForClass, modelOptions, Ref } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";
import { Tenant } from "./tenant.model";
import { Branch } from "./branch.model";

export enum TableStatus {
  Available = "available",
  Occupied = "occupied",
  Reserved = "reserved",
  Cleaning = "cleaning",
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_tables",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Table extends CommonTypegooseEntity {
  @prop({ ref: () => Tenant, required: true })
  tenant_id!: Ref<Tenant>;

  @prop({ ref: () => Branch, required: true })
  branch_id!: Ref<Branch>;

  @prop({ type: String, required: true })
  number!: string;

  @prop({ type: String, required: false })
  name?: string;

  @prop({ type: Number, default: 4 })
  capacity!: number;

  @prop({ type: String, enum: TableStatus, default: TableStatus.Available })
  status!: TableStatus;

  @prop({ type: String, required: false, default: "main" })
  floor?: string;

  // Floor plan position
  @prop({ type: Number, default: 0 })
  pos_x!: number;

  @prop({ type: Number, default: 0 })
  pos_y!: number;

  @prop({ type: Number, default: 80 })
  width!: number;

  @prop({ type: Number, default: 80 })
  height!: number;

  @prop({ type: String, default: "rect" })
  shape!: string; // rect | circle

  @prop({ type: Boolean, default: true })
  is_active!: boolean;

  @prop({ type: String, required: false })
  current_order_id?: string;
}

export const TableModel = getModelForClass(Table);
