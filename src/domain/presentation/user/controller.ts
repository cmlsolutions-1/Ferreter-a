import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { UpdateUserDto } from '../../dtos/user/update-user.dto';
import { DeleteUserDto } from '../../dtos/user/delete-user.dto';

export class UserController {
  constructor(private readonly userService: UserService) {}

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [err, dto] = UpdateUserDto.create(req.body);
      if (err) return res.status(400).json({ error: true, message: err });

      const result = await this.userService.updateUser(dto!);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [err, dto] = DeleteUserDto.create(req.body);
      if (err) return res.status(400).json({ error: true, message: err });

      const result = await this.userService.deleteUser(dto!);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      console.log(`Fetching user with ID: ${id}`);
      const user = await this.userService.getUserById(id);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getAllUsers();
      return res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };

  getClientsBySalesPerson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { salesPersonId } = req.params;
      const clients = await this.userService.getClientsBySalesPersonId(salesPersonId);
      return res.status(200).json(clients);
    } catch (error) {
      next(error);
    }
  };

  getSalesPersons = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('Fetching SalesPersons');
      const role = "SalesPerson";
      const clients = await this.userService.getUsersByRole(role);
      return res.status(200).json(clients);
    } catch (error) {
      next(error);
    }
  };
}
