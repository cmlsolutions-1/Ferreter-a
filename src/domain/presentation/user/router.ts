import { Router } from 'express';
import { UserController } from './controller';
import { UserService } from '../services/user.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { hasRole } from '../middlewares/role.middelware';
import { EmailService } from '../services/email.service';


export class UserRoutes {


  static get routes() : Router {

    const emailService = new EmailService(
                        process.env.MAILER_SERVICE!,
                        process.env.MAILER_EMAIL!,
                        process.env.MAILER_SECRET_KEY!,
                        process.env.SEND_EMAIL === 'true' ? true : false,
            );

    const router = Router();
    const userService = new UserService(emailService);
    const userController = new UserController(userService);
    router.put('/', [AuthMiddleware.validateJWT, hasRole('Admin')], userController.updateUser);
    router.delete('/:_id', [AuthMiddleware.validateJWT, hasRole('Admin')], userController.deleteUser); 
    router.get('/getById/:id', [AuthMiddleware.validateJWT], userController.getUserById); 
    router.get('/', [AuthMiddleware.validateJWT, hasRole('Admin')], userController.getAllUsers );
    router.get('/salesPerson', [AuthMiddleware.validateJWT, hasRole('Admin')], userController.getSalesPersons);
    router.get('/client', [AuthMiddleware.validateJWT, hasRole('Admin')], userController.getClients);
    router.get('/clientsBySalesPerson/:salesPersonId', [AuthMiddleware.validateJWT, hasRole('Admin', 'SalesPerson')], userController.getClientsBySalesPerson);
    router.get('/departments', userController.getDepartments);
    router.get('/cities/:departmentId', userController.getCities);

    return router;
  }
}