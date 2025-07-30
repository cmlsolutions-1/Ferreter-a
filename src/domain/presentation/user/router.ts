import { Router } from 'express';
import { UserController } from './controller';
import { UserService } from '../services/user.service';


export class UserRoutes {


  static get routes() : Router {

    const router = Router();
    const userService = new UserService();
    const userController = new UserController(userService);
    router.put('/', userController.updateUser);
    router.delete('/:_id', userController.deleteUser); 
    router.get('/getById/:id', userController.getUserById); 
    router.get('/', userController.getAllUsers );
    router.get('/salesPerson', userController.getSalesPersons);
    router.get('/client', userController.getClients);
    router.get('/clientsBySalesPerson/:salesPersonId', userController.getClientsBySalesPerson);

    return router;
  }


}