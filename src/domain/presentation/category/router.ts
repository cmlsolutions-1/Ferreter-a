import { Router } from 'express';
import { CategoryService } from '../services/category.service';
import { CategoryController } from './controller';


export class CategoryRoutes {


  static get routes() : Router {

    const router = Router();
    const categoryService = new CategoryService();
    const categoryController = new CategoryController(categoryService);
    router.post('/category', categoryController.createCategory );
    router.get('/categories', categoryController.listCategories );

    return router;
  }


}