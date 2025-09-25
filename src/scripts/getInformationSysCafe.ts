import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { ProductModel } from "../data/mongo/models/product.model";
import { MongoDatabase } from "../data/mongo-database";
import { envs } from "../config";
import { PriceCategoryService } from "../domain/presentation/services/price.category.service";
import { StockService } from "../domain/presentation/services/stock.service";

const app = express();
app.use(express.json({ limit: "10mb", type: "application/json" }));

const priceCategoryService = new PriceCategoryService();
const stockService = new StockService();
console.log("🔄 Iniciando proceso de recepción de artículos...");



app.put("/SendArticulos", async (req: Request, res: Response) => {
  try {
    const nuevosDatos = Array.isArray(req.body) ? req.body : [req.body];

    for (const art of nuevosDatos) {
      const pricesWithIds = [];
      for (const price of art.precios) {
        const categoryId = await priceCategoryService.getPriceCategoryIdByCode(price.precio);
        if (!categoryId) {
          console.warn(`⚠️ No se encontró PriceCategory con código ${price.precio}`);
          continue;
        }
        pricesWithIds.push({
          PriceCategory: categoryId,
          Value: price.valor,
          PosValue: price.valorpos,
        });
      }

      const producto = {
        reference: art.referencia,
        code: art.codigo,
        description: art.detalle,
        isActive: art.activo,
        brand: {
          code: art.marca?.codigo || "",
          name: art.marca?.nombre || "",
        },
        prices: pricesWithIds,
        subCategory: new mongoose.Types.ObjectId(art.subCategory ?? undefined),
      };

      await ProductModel.findOneAndUpdate(
        { reference: producto.reference },
        { $set: producto },
        { upsert: true, new: true }
      );
    }

    res.status(200).send("✅ Datos procesados correctamente");
  } catch (error) {
    console.error("❌ Error al insertar artículos:", error);
    res.status(500).send("Error al insertar artículos");
  }
});

app.put("/SendStock", async (req: Request, res: Response) => {
  try {
    const nuevosDatos = Array.isArray(req.body) ? req.body : [req.body];

    const result = await stockService.processStock(nuevosDatos);

    res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ Error al procesar stock:", error);
    res.status(500).json({ error: "Error al procesar stock", detalle: error.message });
  }
});


(async () => {
  try {
    await MongoDatabase.connect({
      dbName: envs.MONGO_DB_NAME,
      mongoUrl: envs.MONGO_URL,
    });

    app.listen(3000, () => {
      console.log("🚀 Servidor corriendo en http://localhost:3000");
    });
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    process.exit(1); // salimos si falla la conexión
  }
})();
