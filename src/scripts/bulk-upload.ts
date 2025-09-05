// scripts/bulk-upload.ts
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { MongoDatabase } from "../data/mongo-database";
import { envs } from "../config";
import { UploadService } from "../domain/presentation/services/upload.service";

// Conectar a Mongo con la misma config
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
            const reference = path.parse(file).name; // nombre del archivo sin extensión
            const filePath = path.join(dir, file);

            console.log(`Subiendo imagen ${file} con referencia ${reference}`);

            const result = await uploadService.uploadAndAssign(filePath, reference);
            console.log("Resultado:", result);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error en carga masiva:", err);
    }
})();