import { Router } from 'express';
import { ProductController } from './controller';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { PriceCategoryService } from '../services/price.category.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';


export class ProductRoutes {
    
  static get routes(): Router {
    const router = Router();
    const subCategoryService = new CategoryService();
    const priceCategoryService = new PriceCategoryService();
    const productService = new ProductService(subCategoryService, priceCategoryService);
    const productController = new ProductController(productService);

    router.post('/', productController.createProduct);
    router.put('/:reference', productController.updateProduct);
    router.put('/update-master/:_id', productController.updateMaster);
    router.put('/favorite/:_id', productController.putLikeFavorite);
    router.get('/list-favorite/',[AuthMiddleware.validateJWT], productController.listFavorites);
    router.get('/', [AuthMiddleware.validateJWT], productController.listProducts);
    router.post('/filter', [AuthMiddleware.validateJWT], productController.filterProducts);
    router.get('/:_id', [AuthMiddleware.validateJWT], productController.getProductById);
    router.get('/category/:categoryId', [AuthMiddleware.validateJWT], productController.getProductsByCategory);
    

    return router;
  }
}