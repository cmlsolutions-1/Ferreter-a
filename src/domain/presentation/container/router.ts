import { Router } from 'express';
import {  ContainerController } from './controller';
import { ContainerService } from '../services/container.service';


export class ContainerRoutes {


  static get routes() : Router {

    const router = Router();
    const containerService = new ContainerService();
    const containerController = new ContainerController(containerService);
    router.post('/', containerController.createContainer );
    router.put('/:id', containerController.updateContainer );
    router.get('/', containerController.listContainers );
    router.get('/:id', containerController.getContainerById );

    return router;
  }

}