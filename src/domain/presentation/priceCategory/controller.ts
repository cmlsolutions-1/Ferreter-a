import { PriceCategoryService } from "../services/price.category.service";
import { Request, Response, NextFunction } from 'express';

export class PriceCategoryController {

    constructor(
         private readonly priceCategoryService: PriceCategoryService,
    ) {}

    createCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.body.name) {
                return res.status(400).json({ error: true, message: 'Name is required' });
            }
            const result = await this.priceCategoryService.createPriceCategory(req.body.name, req.body.code);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    listProducts = async (req: Request, res: Response, next: NextFunction) => {
        try {
          const categories = await this.priceCategoryService.listPriceCategories();
          return res.status(200).json(categories);
        } catch (error) {
          next(error);
        }
      };
}