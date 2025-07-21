import { Router } from 'express';
import { UserController } from './controller';
import { UserService } from '../services/user.service';


export class UserRoutes {


  static get routes() : Router {

    const router = Router();
    const userService = new UserService();
    const userController = new UserController(userService);
    router.put('/', userController.updateUser);
    router.post('/delete', userController.deleteUser); 
    router.get('/:id', userController.getUserById); 
    router.get('/', userController.getAllUsers );
    router.get('/salesperson/:salesPersonId', userController.getClientsBySalesPerson);

    return router;
  }


}