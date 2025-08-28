import { Router } from 'express';
import { OrderController } from './controller';
import { OrderService } from '../services/order.service';
import { UserService } from '../services/user.service';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { PriceCategoryService } from '../services/price.category.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { hasRole } from '../middlewares/role.middelware';



export class OrderRoutes {

    static get routes(): Router {
        const router = Router();
        const userService = new UserService();
        const categoryService = new CategoryService();
        const categoryPriceService = new PriceCategoryService();

        const productoService = new ProductService(categoryService, categoryPriceService);
        const orderService = new OrderService(userService, productoService);
        const orderController = new OrderController(orderService);

        
        router.post('/', [AuthMiddleware.validateJWT, hasRole('Client')], orderController.createOrder);
        router.patch('/paid', orderController.setOrderAsPaid);
        router.get('/getOrdersBySalesPerson/:id', [AuthMiddleware.validateJWT, hasRole('SalesPerson')], orderController.getOrderBySalesPerson);
        router.get('/getOrdersByClient/:id', [AuthMiddleware.validateJWT, hasRole('Client')], orderController.getOrderByClient);
        router.get('/getOrdersById/:id', [AuthMiddleware.validateJWT], orderController.getOrderById);
        router.get('/', [AuthMiddleware.validateJWT, hasRole('Admin')], orderController.getAllOrder);

        return router;
    }
}

export default OrderRoutes;