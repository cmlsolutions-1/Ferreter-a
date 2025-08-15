import { PriceCategoryService } from "../services/price.category.service";
import { Request, Response, NextFunction } from 'express';
import { StockService } from "../services/stock.service";

export class StockController {

    constructor(
         private readonly stockService: StockService,
    ) {}

    processStock = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.body.stock) {
                return res.status(400).json({ error: true, message: 'stock is required' });
            }
            const result = await this.stockService.processStock(req.body.stock);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}