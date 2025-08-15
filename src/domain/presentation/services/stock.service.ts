import mongoose from "mongoose";
import { CustomError } from "../../errors/custom.errors";
import { StockModel } from "../../../data/mongo/models/stock.model";
import { ProductModel } from "../../../data/mongo/models/product.model";

export class StockService {

    public constructor(
    ) {
    }

    public async processStock(stockItems: { referencia: string; bodega: string; cantidad: number }[]) {
        if (!Array.isArray(stockItems) || stockItems.length === 0) {
            throw CustomError.internalServer('El stock debe ser un arreglo con al menos un elemento');
        }

        const mappedStock = stockItems.map(item => ({
            reference: item.referencia,
            store: item.bodega || 'N/A', // Evita que store sea vacío
            mount: item.cantidad
        }));

        try {
            await StockModel.deleteMany({});


            await StockModel.insertMany(mappedStock);

            const totals = await StockModel.aggregate([
                {
                    $group: {
                        _id: "$reference",
                        totalMount: { $sum: "$mount" }
                    }
                }
            ]);

            const bulkOps = totals.map(t => ({
                updateOne: {
                    filter: { reference: t._id },
                    update: { $set: { stock: t.totalMount } }
                }
            }));

            if (bulkOps.length > 0) {
                await ProductModel.bulkWrite(bulkOps);
            }

            return { message: 'Stock procesado correctamente', count: stockItems.length };
        } catch (error) {
            throw new Error(`Error procesando stock: ${error}`);
        }
    }

}