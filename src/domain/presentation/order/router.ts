import { Router } from 'express';
import { OrderController } from './controller';
import { OrderService } from '../services/order.service';



export class OrderRoutes {

    static get routes(): Router {
        const router = Router();
        const orderService = new OrderService();
        const orderController = new OrderController(orderService);

        router.post('/', orderController.createOrder);
        router.put('/:id', orderController.updateOrder);
        router.patch('/paid', orderController.setOrderAsPaid);
        router.get('/:id', orderController.getOrderById);

        return router;
    }
}

export default OrderRoutes;