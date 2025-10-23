import { Router } from "express";
import multer from "multer";
import { UploadController } from "./controller";
import { UploadService } from "../services/upload.service";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { hasRole } from "../middlewares/role.middelware";


export class UploadRoutes {
    static get routes(): Router {
        const router = Router();
        const uploadService = new UploadService();
        const uploadController = new UploadController(uploadService);

        const upload = multer({ dest: "uploads/" });

        router.post("/",[AuthMiddleware.validateJWT, hasRole('Admin')], upload.array("file"), uploadController.upload);
        router.delete("/", uploadController.delete);

        return router;
    }
}
