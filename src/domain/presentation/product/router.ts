import { Router } from 'express';
import { ProductController } from './controller';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';


export class ProductRoutes {
    
  static get routes(): Router {
    const router = Router();
    const subCategoryService = new CategoryService();
    const productService = new ProductService(subCategoryService);
    const productController = new ProductController(productService);

    router.post('/', productController.createProduct);
    router.put('/:reference', productController.updateProduct);
    router.get('/', productController.listProducts);
    router.get('/filter', productController.filterProducts);
    router.get('/:reference', productController.getProductById);
    router.get('/category/:categoryId', productController.getProductsByCategory);

    return router;
  }
}