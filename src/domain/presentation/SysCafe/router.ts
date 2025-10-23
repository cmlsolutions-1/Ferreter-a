import { Router } from 'express';

import { StockService } from '../services/stock.service';
import {  SyscafeController } from './controller';
import { SysCafeService } from '../services/syscafe.service';
import { PriceCategoryService } from '../services/price.category.service';

export class SyscafeRoutes {
    
  static get routes(): Router {
    const router = Router();
    const priceCategoryService = new PriceCategoryService();
    const stockService = new StockService();
    const syscafeService = new SysCafeService(priceCategoryService, stockService);
    const syscafeController = new SyscafeController(syscafeService);

    router.put('/SendStock', syscafeController.processStock);
    router.put('/SendArticulos', syscafeController.registerArticles);

    return router;
  }
}