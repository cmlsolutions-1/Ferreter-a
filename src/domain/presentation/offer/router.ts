import { Router } from 'express';
import { OfferController } from './controller';
import { OfferService } from '../services/offer.service';

export class OfferRoutes {


    static get routes(): Router {

        const router = Router();
        const offerController = new OfferController(new OfferService());

        router.post('/', offerController.createOffer);
        router.put('/:id', offerController.updateOffer);
        router.get('/', offerController.listOffers);
        router.get('/:id', offerController.getOfferById);
        router.post('/inactive/:id', offerController.inactivateOffer);

        return router;
    }
}
