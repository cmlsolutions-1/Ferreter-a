import { Router } from 'express';

import { StockService } from '../services/stock.service';
import {  SyscafeController } from './controller';
import { SysCafeService } from '../services/syscafe.service';
import { PriceCategoryService } from '../services/price.category.service';
import { EmailService } from '../services/email.service';

export class SyscafeRoutes {
    
  static get routes(): Router {

    const emailService = new EmailService(
                        process.env.MAILER_SERVICE!,
                        process.env.MAILER_EMAIL!,
                        process.env.MAILER_SECRET_KEY!,
                        process.env.SEND_EMAIL === 'true' ? true : false,
            );


    const router = Router();
    const priceCategoryService = new PriceCategoryService();
    const stockService = new StockService();
    const syscafeService = new SysCafeService(priceCategoryService, stockService, emailService);
    const syscafeController = new SyscafeController(syscafeService);

    router.put('/SendStock', syscafeController.processStock);
    router.put('/SendArticulos', syscafeController.registerArticles);
    router.put('/SendCliente', syscafeController.registerFlag);

    return router;
  }
}