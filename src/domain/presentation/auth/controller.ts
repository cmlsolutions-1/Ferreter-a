import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterUserDto } from '../../dtos/auth/register-user.dto';
import { LoginUserDto } from '../../dtos/auth/login-user.dto';

export class AuthController {
    
  constructor(
    private readonly authService: AuthService
) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [err, dto] = RegisterUserDto.create(req.body);
      if (err) return res.status(400).json({ error: true, message: err });

      const result = await this.authService.registerUser(dto!);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [err, dto] = LoginUserDto.create(req.body);
      if (err) return res.status(400).json({ error: true, message: err });

      const result = await this.authService.loginUser(dto!);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  validateEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;

      const result = await this.authService.validateEmail(token);
      return res.status(200).json({ success: true, validated: result });
    } catch (error) {
      next(error);
    }
  };
}
