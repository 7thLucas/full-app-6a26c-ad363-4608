import bcrypt from "bcryptjs";
import { TenantModel, BusinessType, SubscriptionPlan, TenantStatus } from "../models/tenant.model";
import { BranchModel, BranchStatus } from "../models/branch.model";
import { StaffModel, StaffRole, StaffStatus } from "../models/staff.model";
import { CategoryModel } from "../models/category.model";
import { ProductModel, ProductStatus } from "../models/product.model";
import { TableModel, TableStatus } from "../models/table.model";
import { InventoryItemModel, StockUnit } from "../models/inventory.model";
import { createLogger } from "~/lib/logger";

const logger = createLogger("ERPDemoSeed");

export async function seedERPDemo(): Promise<void> {
  // Check if demo data already exists
  const existingTenant = await TenantModel.findOne({ slug: "demo-restaurant" });
  if (existingTenant) {
    logger.info("ERP demo data already seeded — skipping");
    return;
  }

  logger.info("Seeding ERP demo data...");

  // Create demo tenant
  const tenant = await TenantModel.create({
    name: "The Grand Bistro",
    slug: "demo-restaurant",
    business_type: BusinessType.Restaurant,
    status: TenantStatus.Active,
    subscription_plan: SubscriptionPlan.Professional,
    contact_email: "admin@grandbistro.com",
    contact_phone: "+1 (555) 123-4567",
    address: "123 Main Street, New York, NY 10001",
    timezone: "America/New_York",
    currency: "USD",
  });

  // Create branches
  const mainBranch = await BranchModel.create({
    tenant_id: tenant._id,
    name: "Main Branch",
    address: "123 Main Street, New York, NY 10001",
    phone: "+1 (555) 123-4567",
    email: "main@grandbistro.com",
    status: BranchStatus.Active,
    is_headquarters: true,
    timezone: "America/New_York",
    opening_hours: "Mon-Sun: 8:00 AM - 11:00 PM",
  });

  const downtownBranch = await BranchModel.create({
    tenant_id: tenant._id,
    name: "Downtown Branch",
    address: "456 5th Avenue, New York, NY 10018",
    phone: "+1 (555) 234-5678",
    email: "downtown@grandbistro.com",
    status: BranchStatus.Active,
    is_headquarters: false,
    timezone: "America/New_York",
    opening_hours: "Mon-Fri: 7:00 AM - 10:00 PM",
  });

  // Create staff for all roles (PIN: 1234 for all demo staff)
  const pin1234 = await bcrypt.hash("1234", 12);
  const pin5678 = await bcrypt.hash("5678", 12);
  const pin9999 = await bcrypt.hash("9999", 12);

  const staffData = [
    { name: "Alex Johnson", role: StaffRole.Owner, pin: pin9999, email: "alex@grandbistro.com" },
    { name: "Maria Garcia", role: StaffRole.Manager, pin: pin1234, email: "maria@grandbistro.com" },
    { name: "James Smith", role: StaffRole.Cashier, pin: pin1234, email: "james@grandbistro.com" },
    { name: "Sarah Lee", role: StaffRole.Waiter, pin: pin1234, email: "sarah@grandbistro.com" },
    { name: "Tom Wilson", role: StaffRole.Waiter, pin: pin5678, email: "tom@grandbistro.com" },
    { name: "Chef Carlos", role: StaffRole.KitchenStaff, pin: pin1234, email: "carlos@grandbistro.com" },
    { name: "Lisa Chen", role: StaffRole.Accountant, pin: pin1234, email: "lisa@grandbistro.com" },
    { name: "Mike Brown", role: StaffRole.Receptionist, pin: pin5678, email: "mike@grandbistro.com" },
    { name: "Emma Davis", role: StaffRole.Housekeeping, pin: pin5678, email: "emma@grandbistro.com" },
  ];

  for (const data of staffData) {
    await StaffModel.create({
      tenant_id: tenant._id,
      branch_id: mainBranch._id,
      name: data.name,
      email: data.email,
      role: data.role,
      pin_hash: data.pin,
      status: StaffStatus.Active,
    });
  }

  // Create categories
  const appetizersCategory = await CategoryModel.create({
    tenant_id: tenant._id,
    branch_id: mainBranch._id,
    name: "Appetizers",
    color: "#F59E0B",
    sort_order: 1,
    is_active: true,
  });

  const mainCoursesCategory = await CategoryModel.create({
    tenant_id: tenant._id,
    branch_id: mainBranch._id,
    name: "Main Courses",
    color: "#1E3A5F",
    sort_order: 2,
    is_active: true,
  });

  const pizzaCategory = await CategoryModel.create({
    tenant_id: tenant._id,
    branch_id: mainBranch._id,
    name: "Pizza",
    color: "#EF4444",
    sort_order: 3,
    is_active: true,
  });

  const pastaCategory = await CategoryModel.create({
    tenant_id: tenant._id,
    branch_id: mainBranch._id,
    name: "Pasta",
    color: "#F97316",
    sort_order: 4,
    is_active: true,
  });

  const drinksCategory = await CategoryModel.create({
    tenant_id: tenant._id,
    branch_id: mainBranch._id,
    name: "Drinks",
    color: "#10B981",
    sort_order: 5,
    is_active: true,
  });

  const dessertsCategory = await CategoryModel.create({
    tenant_id: tenant._id,
    branch_id: mainBranch._id,
    name: "Desserts",
    color: "#8B5CF6",
    sort_order: 6,
    is_active: true,
  });

  // Create products
  const products = [
    // Appetizers
    { name: "Bruschetta", price: 8.99, cost_price: 3.00, category_id: appetizersCategory._id, description: "Toasted bread with tomatoes, basil, and olive oil", preparation_time: 8 },
    { name: "Calamari Fritti", price: 12.99, cost_price: 5.00, category_id: appetizersCategory._id, description: "Crispy fried calamari with marinara sauce", preparation_time: 12 },
    { name: "Caesar Salad", price: 10.99, cost_price: 4.00, category_id: appetizersCategory._id, description: "Romaine lettuce, croutons, parmesan, Caesar dressing", preparation_time: 10 },
    // Main Courses
    { name: "Grilled Salmon", price: 24.99, cost_price: 12.00, category_id: mainCoursesCategory._id, description: "Atlantic salmon with lemon butter and vegetables", preparation_time: 20 },
    { name: "NY Strip Steak", price: 34.99, cost_price: 18.00, category_id: mainCoursesCategory._id, description: "12oz strip steak with choice of sides", preparation_time: 25 },
    { name: "Chicken Marsala", price: 18.99, cost_price: 8.00, category_id: mainCoursesCategory._id, description: "Pan-seared chicken in Marsala wine sauce", preparation_time: 22 },
    { name: "Vegetable Risotto", price: 16.99, cost_price: 6.00, category_id: mainCoursesCategory._id, description: "Arborio rice with seasonal vegetables and parmesan", preparation_time: 18 },
    // Pizza
    { name: "Margherita Pizza", price: 14.99, cost_price: 5.50, category_id: pizzaCategory._id, description: "Fresh mozzarella, tomato sauce, basil", preparation_time: 15 },
    { name: "Pepperoni Pizza", price: 16.99, cost_price: 6.50, category_id: pizzaCategory._id, description: "Classic pepperoni with mozzarella", preparation_time: 15 },
    { name: "BBQ Chicken Pizza", price: 17.99, cost_price: 7.00, category_id: pizzaCategory._id, description: "Grilled chicken, BBQ sauce, red onions", preparation_time: 18 },
    { name: "Quattro Stagioni", price: 18.99, cost_price: 7.50, category_id: pizzaCategory._id, description: "Four seasons — ham, artichoke, mushroom, olives", preparation_time: 18 },
    // Pasta
    { name: "Spaghetti Carbonara", price: 14.99, cost_price: 5.00, category_id: pastaCategory._id, description: "Pancetta, eggs, pecorino, black pepper", preparation_time: 14 },
    { name: "Penne Arrabbiata", price: 12.99, cost_price: 4.00, category_id: pastaCategory._id, description: "Spicy tomato sauce with garlic", preparation_time: 12 },
    { name: "Fettuccine Alfredo", price: 13.99, cost_price: 4.50, category_id: pastaCategory._id, description: "Creamy Alfredo sauce with parmesan", preparation_time: 12 },
    { name: "Lasagna", price: 15.99, cost_price: 6.00, category_id: pastaCategory._id, description: "Layers of pasta, beef ragù, béchamel", preparation_time: 15 },
    // Drinks
    { name: "Coca-Cola", price: 2.99, cost_price: 0.75, category_id: drinksCategory._id, description: "330ml", preparation_time: 2 },
    { name: "Fresh Orange Juice", price: 4.99, cost_price: 1.50, category_id: drinksCategory._id, description: "Freshly squeezed", preparation_time: 5 },
    { name: "Sparkling Water", price: 2.49, cost_price: 0.60, category_id: drinksCategory._id, description: "500ml bottle", preparation_time: 1 },
    { name: "House Red Wine", price: 7.99, cost_price: 3.00, category_id: drinksCategory._id, description: "Glass of house red", preparation_time: 2 },
    { name: "Espresso", price: 3.49, cost_price: 0.80, category_id: drinksCategory._id, description: "Double shot espresso", preparation_time: 4 },
    { name: "Cappuccino", price: 4.49, cost_price: 1.20, category_id: drinksCategory._id, description: "Espresso with steamed milk foam", preparation_time: 5 },
    // Desserts
    { name: "Tiramisu", price: 7.99, cost_price: 3.00, category_id: dessertsCategory._id, description: "Classic Italian tiramisu", preparation_time: 5 },
    { name: "Panna Cotta", price: 6.99, cost_price: 2.50, category_id: dessertsCategory._id, description: "With berry coulis", preparation_time: 5 },
    { name: "Chocolate Lava Cake", price: 8.99, cost_price: 3.50, category_id: dessertsCategory._id, description: "Warm chocolate cake with ice cream", preparation_time: 12 },
  ];

  for (const p of products) {
    await ProductModel.create({
      tenant_id: tenant._id,
      branch_id: mainBranch._id,
      category_id: p.category_id,
      name: p.name,
      description: p.description,
      price: p.price,
      cost_price: p.cost_price,
      tax_rate: 10,
      status: ProductStatus.Active,
      is_available: true,
      preparation_time: p.preparation_time,
      variants: [],
      modifier_groups: [],
      track_inventory: false,
    });
  }

  // Create tables
  const tableData = [
    { number: "T1", name: "Table 1", capacity: 2, floor: "Main Floor", pos_x: 60, pos_y: 60, shape: "circle" },
    { number: "T2", name: "Table 2", capacity: 4, floor: "Main Floor", pos_x: 180, pos_y: 60, shape: "rect" },
    { number: "T3", name: "Table 3", capacity: 4, floor: "Main Floor", pos_x: 300, pos_y: 60, shape: "rect" },
    { number: "T4", name: "Table 4", capacity: 6, floor: "Main Floor", pos_x: 60, pos_y: 200, shape: "rect", width: 120 },
    { number: "T5", name: "Table 5", capacity: 4, floor: "Main Floor", pos_x: 240, pos_y: 200, shape: "rect" },
    { number: "T6", name: "Table 6", capacity: 2, floor: "Main Floor", pos_x: 360, pos_y: 200, shape: "circle" },
    { number: "T7", name: "Table 7", capacity: 8, floor: "Main Floor", pos_x: 120, pos_y: 330, shape: "rect", width: 160 },
    { number: "T8", name: "Table 8", capacity: 4, floor: "Main Floor", pos_x: 360, pos_y: 330, shape: "rect" },
    { number: "V1", name: "VIP 1", capacity: 8, floor: "VIP Room", pos_x: 100, pos_y: 80, shape: "rect", width: 160 },
    { number: "V2", name: "VIP 2", capacity: 6, floor: "VIP Room", pos_x: 100, pos_y: 250, shape: "rect" },
    { number: "B1", name: "Bar 1", capacity: 2, floor: "Bar Area", pos_x: 60, pos_y: 60, shape: "circle" },
    { number: "B2", name: "Bar 2", capacity: 2, floor: "Bar Area", pos_x: 160, pos_y: 60, shape: "circle" },
  ];

  for (const t of tableData) {
    await TableModel.create({
      tenant_id: tenant._id,
      branch_id: mainBranch._id,
      number: t.number,
      name: t.name,
      capacity: t.capacity,
      status: TableStatus.Available,
      floor: t.floor,
      pos_x: t.pos_x,
      pos_y: t.pos_y,
      width: (t as any).width ?? 80,
      height: 80,
      shape: t.shape,
      is_active: true,
    });
  }

  // Create inventory items
  const inventoryItems = [
    { name: "All-Purpose Flour", unit: StockUnit.Kg, current_stock: 50, minimum_stock: 10, cost_per_unit: 1.20 },
    { name: "Tomato Sauce", unit: StockUnit.Liters, current_stock: 30, minimum_stock: 5, cost_per_unit: 2.50 },
    { name: "Mozzarella Cheese", unit: StockUnit.Kg, current_stock: 15, minimum_stock: 3, cost_per_unit: 8.00 },
    { name: "Chicken Breast", unit: StockUnit.Kg, current_stock: 25, minimum_stock: 5, cost_per_unit: 6.50 },
    { name: "Salmon Fillet", unit: StockUnit.Kg, current_stock: 8, minimum_stock: 3, cost_per_unit: 15.00 },
    { name: "Pasta (Penne)", unit: StockUnit.Kg, current_stock: 20, minimum_stock: 5, cost_per_unit: 1.80 },
    { name: "Olive Oil", unit: StockUnit.Liters, current_stock: 12, minimum_stock: 2, cost_per_unit: 5.00 },
    { name: "Fresh Eggs", unit: StockUnit.Units, current_stock: 200, minimum_stock: 30, cost_per_unit: 0.25 },
    { name: "Heavy Cream", unit: StockUnit.Liters, current_stock: 10, minimum_stock: 2, cost_per_unit: 3.50 },
    { name: "Parmesan (block)", unit: StockUnit.Kg, current_stock: 5, minimum_stock: 1, cost_per_unit: 20.00 },
    { name: "Coca-Cola Cans", unit: StockUnit.Units, current_stock: 8, minimum_stock: 24, cost_per_unit: 0.75 }, // deliberately low stock
    { name: "Coffee Beans", unit: StockUnit.Kg, current_stock: 3, minimum_stock: 2, cost_per_unit: 12.00 },
    { name: "Beef Strip Loin", unit: StockUnit.Kg, current_stock: 10, minimum_stock: 4, cost_per_unit: 22.00 },
    { name: "Pancetta", unit: StockUnit.Kg, current_stock: 2, minimum_stock: 1, cost_per_unit: 18.00 },
    { name: "Fresh Basil", unit: StockUnit.Grams, current_stock: 500, minimum_stock: 100, cost_per_unit: 0.03 },
  ];

  for (const item of inventoryItems) {
    await InventoryItemModel.create({
      tenant_id: tenant._id,
      branch_id: mainBranch._id,
      ...item,
      is_active: true,
    });
  }

  logger.info("ERP demo data seeded successfully");
  logger.info("Demo credentials:");
  logger.info("  Tenant slug: demo-restaurant");
  logger.info("  Owner PIN: 9999 (Alex Johnson)");
  logger.info("  Manager PIN: 1234 (Maria Garcia)");
  logger.info("  Cashier PIN: 1234 (James Smith)");
  logger.info("  Waiter PIN: 5678 (Tom Wilson)");
  logger.info("  Kitchen PIN: 1234 (Chef Carlos)");
}
