import { envs } from "../config";
import { MongoDatabase } from "../data/mongo-database";
import mongoose from "mongoose";
import { OfferModel } from "../data/mongo/models/offer.model";


(async () => {
    try {
        await MongoDatabase.connect({
            dbName: envs.MONGO_DB_NAME,
            mongoUrl: envs.MONGO_URL,
        });

        const now = new Date();

        const expired = await OfferModel.updateMany(
            {
                state: { $ne: "Expired" },
                endDate: { $lt: now },
            },
            {
                $set: { state: "Expired", finishDate: now },
            }
        );

        await mongoose.disconnect();
        console.log(`🔄 Ofertas actualizadas: ${expired.modifiedCount}`);
    } catch (err) {

        console.error("❌ Error al expirar ofertas:", err);
    }
})();