import { envs } from "../config";
import { MongoDatabase } from "../data/mongo-database";
import mongoose from "mongoose";
import { ProductModel } from "../data/mongo/models/product.model";
import { BrandModel } from "../data/mongo/models/brand.model";


(async () => {
    try {
        await MongoDatabase.connect({
            dbName: envs.MONGO_DB_NAME,
            mongoUrl: envs.MONGO_URL,
        });

        const products = await ProductModel.find({}, { "brand.code": 1, "brand.name": 1 });

        const uniqueBrands = new Map<string, { code: string; name: string }>();

        for (const product of products) {
            if (product.brand?.code) {
                uniqueBrands.set(product.brand.code, {
                    code: product.brand.code,
                    name: product.brand.name ?? "",
                });
            }
        }
        const brandDocs = Array.from(uniqueBrands.values());

        for (const brand of brandDocs) {
            await BrandModel.findOneAndUpdate(
                { code: brand.code },
                { $set: brand },
                { upsert: true, new: true }
            );
        }

        console.log(`✅ Migración completada. Se insertaron/actualizaron ${brandDocs.length} marcas.`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error en la migración:", error);
        process.exit(1);
    }
})();