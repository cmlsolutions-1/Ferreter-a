// scripts/bulk-upload.ts
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { MongoDatabase } from "../data/mongo-database";
import { envs } from "../config";
import { UploadService } from "../domain/presentation/services/upload.service";

(async () => {
    try {
        await MongoDatabase.connect({
            dbName: envs.MONGO_DB_NAME,
            mongoUrl: envs.MONGO_URL,
        });

        const uploadService = new UploadService();
        const dir = path.join(__dirname, "imagenes");

        const files = fs.readdirSync(dir);

        for (const file of files) {
            const reference = path.parse(file).name; 
            const filePath = path.join(dir, file);

            const result = await uploadService.uploadAndAssign(filePath, reference);
            console.log("Resultado:", result);
        }

        await mongoose.disconnect();
    } catch (err) {
    }
})();