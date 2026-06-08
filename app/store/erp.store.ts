/**
 * ERP Global State Store (uses React Context + useReducer for now; Zustand-compatible shape)
 */

export interface StaffSession {
  id: string;
  name: string;
  role: string;
  tenant_id: string;
  branch_id: string | null;
  token: string;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  modifiers?: Array<{ group_name: string; modifier_name: string; price: number }>;
}

export interface ActiveOrder {
  id: string;
  order_number: string;
  table_id?: string;
  table_number?: string;
  status: string;
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_status: string;
}

// Simple localStorage-based session management
const SESSION_KEY = "erp_staff_session";
const TENANT_KEY = "erp_tenant_slug";

export function saveSession(session: StaffSession): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function loadSession(): StaffSession | null {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function clearSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function saveTenantSlug(slug: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TENANT_KEY, slug);
  }
}

export function loadTenantSlug(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TENANT_KEY) ?? "demo-restaurant";
  }
  return "demo-restaurant";
}
