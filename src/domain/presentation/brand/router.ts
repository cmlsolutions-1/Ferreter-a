import { Router } from 'express';
import { BrandService } from '../services/brand.service';
import { BrandController } from './controller';


export class BrandRoutes {


  static get routes() : Router {

    const router = Router();
    const brandService = new BrandService();
    const brandController = new BrandController(brandService);
    router.get('/', brandController.listBrands );
    return router;
  }


}