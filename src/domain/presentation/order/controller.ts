import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../../dtos/order/create-order.dto';
import { UpdateOrderDto } from '../../dtos/order/update-order.dto';
import { UpdateOrderPaidDto } from '../../dtos/order/Update-order-paid.dto';

export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [err, dto] = CreateOrderDto.create(req.body);
      if (err) return res.status(400).json({ error: true, message: err });

      await this.orderService.createOrder(dto!);
      return res.status(201).json({ message: 'Orden creada correctamente' });
    } catch (error) {
      next(error);
    }
  };

  // updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const [err, dto] = UpdateOrderDto.update(req.body);
  //     if (err) return res.status(400).json({ error: true, message: err });

  //     await this.orderService.updateOrder(dto!);
  //     return res.status(200).json({ message: 'Orden actualizada correctamente' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  setOrderAsPaid = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [err, dto] = UpdateOrderPaidDto.update(req.body);
      if (err) return res.status(400).json({ error: true, message: err });

      await this.orderService.setOrderAsPaid(dto!);
      return res.status(200).json({ message: 'Orden marcada como pagada correctamente' });
    } catch (error) {
      next(error);
    }
  };

  getOrderBySalesPerson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderBySalesPerson(id);
      return res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }

  getOrderByClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderByClient(id);
      return res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }
  getAllOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await this.orderService.getAllOrder();
      return res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }
}
