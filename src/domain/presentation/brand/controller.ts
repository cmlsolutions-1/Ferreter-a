import { Request, Response, NextFunction } from 'express';
import { BrandService } from '../services/brand.service';



export class BrandController {

    constructor(
        private readonly categoryService: BrandService,
    ) { }

    listBrands = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const categories = await this.categoryService.listBrands();
            return res.json(categories);
        } catch (error) {
            next(error);
        }
    }
}