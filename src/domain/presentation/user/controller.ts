import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { UpdateUserDto } from '../../dtos/user/update-user.dto';
import { DeleteUserDto } from '../../dtos/user/delete-user.dto';
import { regularExps } from '../../../config';
import { CustomError } from '../../errors/custom.errors';

export class UserController {
  constructor(private readonly userService: UserService) { }

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

      const { _id } = req.params;
      const [err, dto] = DeleteUserDto.create({ _id });
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
      const role = "SalesPerson";
      const clients = await this.userService.getUsersByRole(role);
      return res.status(200).json(clients);
    } catch (error) {
      next(error);
    }
  };

  getClients = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = "Client";
      const clients = await this.userService.getUsersByRole(role);
      return res.status(200).json(clients);
    } catch (error) {
      next(error);
    }
  };

  getDepartments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const departments = await this.userService.getDepartments();
      return res.status(200).json(departments);
    } catch (error) {
      next(error);
    }
  };

  getCities = async (req: Request, res: Response, next: NextFunction) => {

    try {
      const { departmentId } = req.params;
      const cities = await this.userService.getCities(departmentId);
      return res.status(200).json(cities);
    } catch (error) {
      next(error);
    }
  };

  generateResetNumber = async (req: Request, res: Response, next: NextFunction) => {
    try {

      const { email } = req.body;
      if (!regularExps.email.test(email))
        throw CustomError.badRequest('El correo no es válido');
      const result = await this.userService.generateVerificationNumber(email);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  validateVerificationCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, code } = req.body;
      if (!regularExps.email.test(email))
        throw CustomError.badRequest('El correo no es válido');
      const result = await this.userService.validateVerificationCode(email, code);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {

      const { email, code, newPassword } = req.body;
      if (!regularExps.email.test(email))
        throw CustomError.badRequest('El correo no es válido');
      const result = await this.userService.resetPassword(email, code, newPassword);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
