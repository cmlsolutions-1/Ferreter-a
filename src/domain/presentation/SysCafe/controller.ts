import { PriceCategoryService } from "../services/price.category.service";
import { Request, Response, NextFunction } from 'express';
import { SysCafeService } from "../services/syscafe.service";

export class SyscafeController {

    constructor(
         private readonly syscafeService: SysCafeService,
    ) {}

    processStock = async (req: Request, res: Response, next: NextFunction) => {
        try {
            
            const result = await this.syscafeService.processStock(req.body);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    registerArticles = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const result = await this.syscafeService.registerArticles(req.body);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }   
    }
}