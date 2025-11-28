import mongoose from "mongoose";
import { CustomError } from "../../errors/custom.errors";
import { StockModel } from "../../../data/mongo/models/stock.model";
import { ProductModel } from "../../../data/mongo/models/product.model";

export class StockService {
  public async processStock(stockItems: { referencia: string; bodega: string; cantidad: number }[]) {
    if (!Array.isArray(stockItems) || stockItems.length === 0) {
      console.warn("⚠️ El stock debe ser un arreglo con al menos un elemento");
      return { message: "No se procesó ningún stock", count: 0 };
    }

    try {
      const totalsMap = new Map<string, number>();
      
      for (const item of stockItems) {
        const ref = item.referencia;
        const current = totalsMap.get(ref) || 0;
        totalsMap.set(ref, current + item.cantidad);
      }

      const bulkOps: any[] = [];

      for (const [reference, newStock] of totalsMap.entries()) {
        const product = await ProductModel.findOne({ reference });

        if (!product) continue;

        const previousStock = product.stock ?? 0;
        const previousPlatformStock = product.platformStock ?? 0;

        let newPlatformStock = previousPlatformStock;

        if (previousPlatformStock === 0) {
          newPlatformStock = newStock;
        }
        else if (previousStock !== newStock) {
          newPlatformStock = newStock;
        }

        bulkOps.push({
          updateOne: {
            filter: { reference },
            update: {
              $set: {
                stock: newStock,
                platformStock: newPlatformStock
              }
            }
          }
        });
      }
      if (bulkOps.length > 0) {
        await ProductModel.bulkWrite(bulkOps);
      }

      return {
        message: "✅ Stock actualizado correctamente",
        processedProducts: bulkOps.length
      };

    } catch (error) {
      throw new Error(`❌ Error procesando stock: ${error}`);
    }
  }
}