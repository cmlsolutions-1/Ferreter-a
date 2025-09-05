import { NextFunction, Request, Response } from "express";
import { UploadService } from "../services/upload.service";

export class UploadController {

    constructor(private readonly uploadService: UploadService) { }

    upload = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { reference } = req.params;
            if (!req.file) return res.status(400).json({ error: "No file uploaded" });
            if (!reference) return res.status(400).json({ error: "Reference is required" });

            const { image, product } = await this.uploadService.uploadAndAssign(
                req.file.path,
                reference,
                "Ferreteria/Productos"
            );

            if (!product) {
                return res.status(404).json({ error: "Product not found" });
            }
            res.json({ image, product });
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { public_id } = req.params;
            const result = await this.uploadService.deleteFile(public_id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };
}
