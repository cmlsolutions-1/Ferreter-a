import { Router } from 'express';
import { OfferController } from './controller';
import { OfferService } from '../services/offer.service';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { PriceCategoryService } from '../services/price.category.service';

export class OfferRoutes {


    static get routes(): Router {

        const router = Router();
        const subCategoryService = new CategoryService();
        const priceCategoryService = new PriceCategoryService();
        const productService = new ProductService(subCategoryService, priceCategoryService);
        const offerController = new OfferController(new OfferService(productService));

        router.post('/', offerController.createOffer);
        router.put('/:id', offerController.updateOffer);
        router.get('/', offerController.listOffers);
        router.get('/:id', offerController.getOfferById);
        router.post('/inactive/:id', offerController.inactivateOffer);

        return router;
    }
}
