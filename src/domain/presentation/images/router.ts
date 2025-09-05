import { Router } from "express";
import multer from "multer";
import { UploadController } from "./controller";
import { UploadService } from "../services/upload.service";


export class UploadRoutes {
    static get routes(): Router {
        const router = Router();
        const uploadService = new UploadService();
        const uploadController = new UploadController(uploadService);

        const upload = multer({ dest: "uploads/" });

        router.post("/:reference", upload.single("file"), uploadController.upload);
        router.delete("/:public_id", uploadController.delete);

        return router;
    }
}
