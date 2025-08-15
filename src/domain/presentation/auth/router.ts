import { Router } from 'express';

import { AuthService } from '../services/auth.service';
import { EmailService } from '../services/email.service';
import { AuthController } from './controller';
import { PriceCategoryService } from '../services/price.category.service';


export class AuthRoutes {

    static get routes(): Router {
        const router = Router();
        const emailService = new EmailService(
            process.env.MAILER_SERVICE!,
            process.env.MAILER_EMAIL!,
            process.env.SENDER_EMAIL_PASSWORD!,
            process.env.SEND_EMAIL !== 'true' ? true : false,
        );
        const priceCategoryService = new PriceCategoryService();
        const authService = new AuthService(emailService, priceCategoryService);
        const authController = new AuthController(authService);

        router.post('/register', authController.register);
        router.post('/login', authController.login);
        router.get('/validate-email/:token', authController.validateEmail);

        return router;
    }
}
