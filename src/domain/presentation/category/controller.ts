import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service';
import { CreateSubCategoryDto } from '../../dtos/category/create-sub-category.dto';


export class CategoryController {

    constructor(
         private readonly categoryService: CategoryService,
    ) {}

    createCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const [err, dto] = CreateSubCategoryDto.create(req.body);
            if (err) return res.status(400).json({ error: true, message: err });

            const result = await this.categoryService.createCategoryService(dto!);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    listCategories = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const categories = await this.categoryService.listCategories();
            return res.json(categories);
        } catch (error) {
            next(error);
        }
    }
}