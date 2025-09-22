import { Router } from 'express';
import { OfferController } from './controller';
import { OfferService } from '../services/offer.service';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { PriceCategoryService } from '../services/price.category.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { hasRole } from '../middlewares/role.middelware';

export class OfferRoutes {


    static get routes(): Router {

        const router = Router();
        const subCategoryService = new CategoryService();
        const priceCategoryService = new PriceCategoryService();
        const productService = new ProductService(subCategoryService, priceCategoryService);
        const offerController = new OfferController(new OfferService(productService));

        router.post('/', [AuthMiddleware.validateJWT, hasRole('Admin')], offerController.createOffer);
        router.put('/:id', [AuthMiddleware.validateJWT, hasRole('Admin')], offerController.updateOffer);
        router.get('/', [AuthMiddleware.validateJWT, hasRole('Admin')], offerController.listOffers);
        router.get('/:id', [AuthMiddleware.validateJWT, hasRole('Admin')], offerController.getOfferById);
        router.post('/inactive/:id', [AuthMiddleware.validateJWT, hasRole('Admin')], offerController.inactivateOffer);

        return router;
    }
}
