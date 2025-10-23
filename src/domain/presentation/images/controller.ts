import { NextFunction, Request, Response } from "express";
import { UploadService } from "../services/upload.service";

export class UploadController {

    constructor(private readonly uploadService: UploadService) { }

    upload = async (req: Request, res: Response, next: NextFunction) => {
        try {
            
            const files = req.files as Express.Multer.File[];

            if (!files || files.length === 0)
                return res.status(400).json({ error: "No files uploaded" });

            const uploadedResults = [];

            for (const file of files) {

                const reference = file.originalname.split(".")[0].trim();
                
                const result = await this.uploadService.uploadAndAssign(
                    file.path,
                    reference,
                    "Ferreteria/Productos"
                );

                if (result) uploadedResults.push(result);
            }

            if (uploadedResults.length === 0)
                return res.status(404).json({ error: "Product not found" });

            res.status(200).json({ uploads: uploadedResults });
        } catch (error) {
            console.log("Euuu");
            next(error);
        }
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
