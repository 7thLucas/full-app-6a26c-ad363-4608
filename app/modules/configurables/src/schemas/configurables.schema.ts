/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};

export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
      minLength: 1,
      maxLength: 100,
    },
    {
      fieldName: "appTagline",
      type: "string",
      required: false,
      label: "App Tagline",
      maxLength: 200,
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "faviconUrl",
      type: "url",
      required: false,
      label: "Favicon URL",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        {
          fieldName: "primary",
          type: "color",
          required: true,
          label: "Primary (Deep Blue)",
        },
        {
          fieldName: "secondary",
          type: "color",
          required: true,
          label: "Secondary",
        },
        {
          fieldName: "accent",
          type: "color",
          required: true,
          label: "Accent (Amber)",
        },
      ],
    },
    {
      fieldName: "currency",
      type: "object",
      required: false,
      label: "Currency",
      fields: [
        { fieldName: "code", type: "string", required: true, label: "Currency Code (e.g. USD)" },
        { fieldName: "symbol", type: "string", required: true, label: "Currency Symbol (e.g. $)" },
        { fieldName: "position", type: "enum", required: true, label: "Symbol Position", options: ["before", "after"] },
      ],
    },
    {
      fieldName: "pinLength",
      type: "number",
      required: false,
      label: "PIN Length",
      min: 4,
      max: 6,
    },
    {
      fieldName: "defaultTheme",
      type: "enum",
      required: false,
      label: "Default Theme",
      options: ["dark", "light", "system"],
    },
    {
      fieldName: "businessTypes",
      type: "array",
      required: false,
      label: "Supported Business Types",
      item: { type: "string", required: true },
    },
    {
      fieldName: "taxRate",
      type: "number",
      required: false,
      label: "Default Tax Rate (%)",
      min: 0,
      max: 100,
    },
    {
      fieldName: "lowStockThreshold",
      type: "number",
      required: false,
      label: "Low Stock Alert Threshold",
      min: 1,
    },
    {
      fieldName: "enableHotelModule",
      type: "boolean",
      required: false,
      label: "Enable Hotel Module",
    },
    {
      fieldName: "enableKDS",
      type: "boolean",
      required: false,
      label: "Enable Kitchen Display System",
    },
    {
      fieldName: "enableInventory",
      type: "boolean",
      required: false,
      label: "Enable Inventory Management",
    },
    {
      fieldName: "enableCRM",
      type: "boolean",
      required: false,
      label: "Enable CRM / Loyalty",
    },
    {
      fieldName: "receiptFooter",
      type: "string",
      required: false,
      label: "Receipt Footer Text",
      maxLength: 200,
    },
    {
      fieldName: "supportEmail",
      type: "string",
      required: false,
      label: "Support Email",
    },
    {
      fieldName: "supportPhone",
      type: "string",
      required: false,
      label: "Support Phone",
    },
  ],
};
