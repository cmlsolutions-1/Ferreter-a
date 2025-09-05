import { NextFunction, Request, Response } from "express";
import { UploadService } from "../services/upload.service";

export class UploadController {

    constructor(private readonly uploadService: UploadService) { }

    upload = async (req: Request, res: Response, next: NextFunction) => {
        // try {
        //     const { reference } = req.params;
        //     if (!req.file) return res.status(400).json({ error: "No file uploaded" });
        //     if (!reference) return res.status(400).json({ error: "Reference is required" });

        //     const { image, product } = await this.uploadService.uploadAndAssign(
        //         req.file.path,
        //         reference,
        //         "Ferreteria/Productos"
        //     );

        //     if (!product) {
        //         return res.status(404).json({ error: "Product not found" });
        //     }
        //     res.status(200).json({ image, product });
        // } catch (error) {
        //     next(error);
        // }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { idCloud } = req.body
            const result = await this.uploadService.deleteFile(idCloud);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}
