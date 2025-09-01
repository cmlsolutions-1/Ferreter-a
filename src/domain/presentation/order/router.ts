import { Router } from 'express';
import { OrderController } from './controller';
import { OrderService } from '../services/order.service';
import { UserService } from '../services/user.service';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { PriceCategoryService } from '../services/price.category.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { hasRole } from '../middlewares/role.middelware';
import { EmailService } from '../services/email.service';



export class OrderRoutes {

    static get routes(): Router {

        const emailService = new EmailService(
                    process.env.MAILER_SERVICE!,
                    process.env.MAILER_EMAIL!,
                    process.env.MAILER_SECRET_KEY!,
                    process.env.SEND_EMAIL === 'true' ? true : false,
        );

        const router = Router();
        const userService = new UserService();
        const categoryService = new CategoryService();
        const categoryPriceService = new PriceCategoryService();

        const productoService = new ProductService(categoryService, categoryPriceService);
        const orderService = new OrderService(userService, productoService, emailService);
        const orderController = new OrderController(orderService);

        
        router.post('/', [AuthMiddleware.validateJWT, hasRole('Client')], orderController.createOrder);
        router.patch('/paid', [AuthMiddleware.validateJWT, hasRole('SalesPerson')], orderController.setOrderAsPaid);
        router.get('/getOrdersBySalesPerson/:id', [AuthMiddleware.validateJWT, hasRole('SalesPerson')], orderController.getOrderBySalesPerson);
        router.get('/getOrdersByClient/:id', [AuthMiddleware.validateJWT, hasRole('Client')], orderController.getOrderByClient);
        router.get('/getOrdersById/:id', [AuthMiddleware.validateJWT], orderController.getOrderById);
        router.get('/', [AuthMiddleware.validateJWT, hasRole('Admin')], orderController.getAllOrder);

        return router;
    }
}

export default OrderRoutes;