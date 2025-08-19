import { Router } from 'express';
import { OrderController } from './controller';
import { OrderService } from '../services/order.service';
import { UserService } from '../services/user.service';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { PriceCategoryService } from '../services/price.category.service';



export class OrderRoutes {

    static get routes(): Router {
        const router = Router();
        const userService = new UserService();
        const categoryService = new CategoryService();
        const categoryPriceService = new PriceCategoryService();

        const productoService = new ProductService(categoryService, categoryPriceService);
        const orderService = new OrderService(userService, productoService);
        const orderController = new OrderController(orderService);

        router.post('/', orderController.createOrder);
        // router.put('/:id', orderController.updateOrder);
        router.patch('/paid', orderController.setOrderAsPaid);
        router.get('/getOrdersBySalesPerson/:id', orderController.getOrderBySalesPerson);
        router.get('/getOrdersByClient/:id', orderController.getOrderByClient);
        router.get('/', orderController.getAllOrder);

        return router;
    }
}

export default OrderRoutes;