import { Router } from 'express';
import { PriceCategoryService } from '../services/price.category.service';
import { PriceCategoryController } from './controller';

export class PriceCategoryRoutes {
    
  static get routes(): Router {
    const router = Router();
    const priceCategoryService = new PriceCategoryService();
    const priceCategoryController = new PriceCategoryController(priceCategoryService);

    router.post('/', priceCategoryController.createCategory);
    router.get('/', priceCategoryController.listProducts);


    return router;
  }
}