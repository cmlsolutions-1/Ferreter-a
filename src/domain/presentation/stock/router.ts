import { Router } from 'express';

import { StockService } from '../services/stock.service';
import { StockController } from './controller';

export class StockRoutes {
    
  static get routes(): Router {
    const router = Router();
    const stockService = new StockService();
    const stockController = new StockController(stockService);

    router.post('/', stockController.processStock);

    return router;
  }
}