import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export enum BusinessType {
  Restaurant = "restaurant",
  Cafe = "cafe",
  Hotel = "hotel",
  Bakery = "bakery",
  Bar = "bar",
  FastFood = "fast_food",
  FoodCourt = "food_court",
  Lounge = "lounge",
}

export enum SubscriptionPlan {
  Free = "free",
  Starter = "starter",
  Professional = "professional",
  Enterprise = "enterprise",
}

export enum TenantStatus {
  Active = "active",
  Suspended = "suspended",
  Trial = "trial",
  Cancelled = "cancelled",
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_tenants",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Tenant extends CommonTypegooseEntity {
  @prop({ type: String, required: true, trim: true })
  name!: string;

  @prop({ type: String, required: true, unique: true, trim: true, lowercase: true })
  slug!: string;

  @prop({ type: String, enum: BusinessType, default: BusinessType.Restaurant })
  business_type!: BusinessType;

  @prop({ type: String, enum: TenantStatus, default: TenantStatus.Trial })
  status!: TenantStatus;

  @prop({ type: String, enum: SubscriptionPlan, default: SubscriptionPlan.Free })
  subscription_plan!: SubscriptionPlan;

  @prop({ type: Date, required: false })
  subscription_expires_at?: Date;

  @prop({ type: String, required: false })
  contact_email?: string;

  @prop({ type: String, required: false })
  contact_phone?: string;

  @prop({ type: String, required: false })
  logo_url?: string;

  @prop({ type: String, required: false })
  address?: string;

  @prop({ type: String, required: false })
  timezone?: string;

  @prop({ type: String, required: false, default: "USD" })
  currency!: string;
}

export const TenantModel = getModelForClass(Tenant);
