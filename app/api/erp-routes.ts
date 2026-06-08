import { Router } from "express";
import erpAuthRoutes from "~/erp/routes/erp-auth.routes";
import erpProductsRoutes from "~/erp/routes/erp-products.routes";
import erpOrdersRoutes from "~/erp/routes/erp-orders.routes";
import erpTablesRoutes from "~/erp/routes/erp-tables.routes";
import erpInventoryRoutes from "~/erp/routes/erp-inventory.routes";
import erpReportsRoutes from "~/erp/routes/erp-reports.routes";

const router = Router();

router.use(erpAuthRoutes);
router.use(erpProductsRoutes);
router.use(erpOrdersRoutes);
router.use(erpTablesRoutes);
router.use(erpInventoryRoutes);
router.use(erpReportsRoutes);

export default router;
