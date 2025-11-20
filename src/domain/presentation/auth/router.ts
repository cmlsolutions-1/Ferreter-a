import { Router } from 'express';

import { AuthService } from '../services/auth.service';
import { EmailService } from '../services/email.service';
import { AuthController } from './controller';
import { PriceCategoryService } from '../services/price.category.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { hasRole } from '../middlewares/role.middelware';


export class AuthRoutes {

    static get routes(): Router {
        const router = Router();
        const emailService = new EmailService(
            process.env.MAILER_SERVICE!,
            process.env.MAILER_EMAIL!,
            process.env.MAILER_SECRET_KEY!,
            process.env.SEND_EMAIL === 'true' ? true : false,
        );
        
        const priceCategoryService = new PriceCategoryService();
        const authService = new AuthService(emailService, priceCategoryService);
        const authController = new AuthController(authService);

        router.post('/register', [AuthMiddleware.validateJWT, hasRole('Admin')], authController.register);
        router.post('/login', authController.login);
        router.get('/validate-email/:token', authController.validateEmail);
        router.post('/recove', authController.generateResetNumber);
        router.post('/validate-code', authController.validateVerificationCode);
        router.post('/reset-password', authController.resetPassword);

        return router;
    }
}
