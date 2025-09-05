import { Router } from 'express';

import { CategoryRoutes } from './category/router';
import { AuthRoutes } from './auth/router';
import { UserRoutes } from './user/router';
import { ContainerRoutes } from './container/router';
import { OfferRoutes } from './offer/router';
import { ProductRoutes } from './product/router';
import OrderRoutes from './order/router';
import { PriceCategoryRoutes } from './priceCategory/router';
import { StockController } from './stock/controller';
import { StockRoutes } from './stock/router';
import { UploadRoutes } from './images/router';



export class AppRoutes {

  static get routes(): Router {

    const router = Router();

    router.use('/api/auth', AuthRoutes.routes);
    router.use('/api/category', CategoryRoutes.routes);
    router.use('/api/users', UserRoutes.routes);
    router.use('/api/container', ContainerRoutes.routes);
    router.use('/api/offer', OfferRoutes.routes);
    router.use('/api/products', ProductRoutes.routes);
    router.use('/api/order', OrderRoutes.routes);
    router.use('/api/price-category', PriceCategoryRoutes.routes);
    router.use('/api/stock', StockRoutes.routes);
    router.use("/api/upload", UploadRoutes.routes);
    return router;
  }
}