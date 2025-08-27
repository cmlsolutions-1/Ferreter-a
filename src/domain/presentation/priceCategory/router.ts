import { Router } from 'express';
import { PriceCategoryService } from '../services/price.category.service';
import { PriceCategoryController } from './controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { hasRole } from '../middlewares/role.middelware';

export class PriceCategoryRoutes {
    
  static get routes(): Router {
    const router = Router();
    const priceCategoryService = new PriceCategoryService();
    const priceCategoryController = new PriceCategoryController(priceCategoryService);

    router.post('/', [AuthMiddleware.validateJWT, hasRole('Admin')], priceCategoryController.createCategory);
    router.get('/', [AuthMiddleware.validateJWT, hasRole('Admin')], priceCategoryController.listProducts);


    return router;
  }
}