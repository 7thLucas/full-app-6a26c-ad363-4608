/*
 * Default Configurable Data — seeded into Mongo on first boot.
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TCurrency = {
  code: string;
  symbol: string;
  position: "before" | "after";
};

export type TDefaultConfigurableData = {
  appName: string;
  appTagline?: string;
  logoUrl: string;
  faviconUrl?: string;
  brandColor: TBrandColor;
  currency?: TCurrency;
  pinLength?: number;
  defaultTheme?: "dark" | "light" | "system";
  businessTypes?: string[];
  taxRate?: number;
  lowStockThreshold?: number;
  enableHotelModule?: boolean;
  enableKDS?: boolean;
  enableInventory?: boolean;
  enableCRM?: boolean;
  receiptFooter?: string;
  supportEmail?: string;
  supportPhone?: string;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "HospitalityHub ERP",
  appTagline: "Enterprise-grade hospitality management",
  logoUrl: "FILL_LOGO_URL_HERE",
  faviconUrl: "",
  brandColor: {
    primary: "#1E3A5F",
    secondary: "#F1F5F9",
    accent: "#F59E0B",
  },
  currency: {
    code: "USD",
    symbol: "$",
    position: "before",
  },
  pinLength: 4,
  defaultTheme: "dark",
  businessTypes: ["Restaurant", "Café", "Hotel", "Bakery", "Bar", "Fast Food", "Food Court", "Lounge"],
  taxRate: 10,
  lowStockThreshold: 10,
  enableHotelModule: true,
  enableKDS: true,
  enableInventory: true,
  enableCRM: true,
  receiptFooter: "Thank you for your business!",
  supportEmail: "support@hospitalityhub.com",
  supportPhone: "+1 (800) 555-0199",
};
