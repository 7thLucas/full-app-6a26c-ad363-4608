import { Router } from "express";
import { ProductModel } from "../models/product.model";
import { CategoryModel } from "../models/category.model";
import { ERPAuthService } from "../services/auth.service";

const router = Router();

function requireERPAuth(req: any, res: any, next: any) {
  const auth = ERPAuthService.getTokenFromRequest(req);
  if (!auth) return res.status(401).json({ success: false, error: "Unauthorized" });
  req.staffAuth = auth;
  next();
}

// GET /api/erp/products - list products
router.get("/erp/products", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    const { category_id, search, page = "1", limit = "50" } = req.query;

    const query: Record<string, any> = {
      tenant_id: staffAuth.tenant_id,
      is_available: true,
    };
    if (staffAuth.branch_id) query.branch_id = staffAuth.branch_id;
    if (category_id) query.category_id = category_id;
    if (search) query.name = { $regex: search, $options: "i" };

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const [products, total] = await Promise.all([
      ProductModel.find(query)
        .populate("category_id", "name color")
        .sort({ sort_order: 1, name: 1 })
        .skip(skip)
        .limit(parseInt(limit as string)),
      ProductModel.countDocuments(query),
    ]);

    return res.json({ success: true, data: products, total, page: parseInt(page as string) });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/erp/categories - list categories
router.get("/erp/categories", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    const query: Record<string, any> = {
      tenant_id: staffAuth.tenant_id,
      is_active: true,
    };

    const categories = await CategoryModel.find(query).sort({ sort_order: 1, name: 1 });
    return res.json({ success: true, data: categories });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/erp/products - create product (manager+)
router.post("/erp/products", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    const product = await ProductModel.create({
      ...req.body,
      tenant_id: staffAuth.tenant_id,
      branch_id: req.body.branch_id ?? staffAuth.branch_id,
    });
    return res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/erp/products/:id - update product
router.put("/erp/products/:id", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    const product = await ProductModel.findOneAndUpdate(
      { _id: req.params.id, tenant_id: staffAuth.tenant_id },
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });
    return res.json({ success: true, data: product });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/erp/products/:id
router.delete("/erp/products/:id", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    await ProductModel.findOneAndDelete({ _id: req.params.id, tenant_id: staffAuth.tenant_id });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/erp/categories
router.post("/erp/categories", requireERPAuth, async (req: any, res) => {
  try {
    const { staffAuth } = req;
    const category = await CategoryModel.create({
      ...req.body,
      tenant_id: staffAuth.tenant_id,
      branch_id: req.body.branch_id ?? staffAuth.branch_id,
    });
    return res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
