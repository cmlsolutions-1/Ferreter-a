import { BrandModel } from "../../../data/mongo/models/brand.model";
import { ProductModel } from "../../../data/mongo/models/product.model";
import { CustomError } from "../../errors/custom.errors";
import { PriceCategoryService } from "./price.category.service";
import { StockService } from "./stock.service";
import mongoose from "mongoose";



export class SysCafeService {

    public constructor(
        private readonly priceCategoryService: PriceCategoryService,
        private readonly stockService: StockService
    ) {
    }

    public async registerArticles(articles: any[]) {
        try {
            const nuevosDatos = Array.isArray(articles) ? articles : [articles];

            for (const art of nuevosDatos) {
                const pricesWithIds = [];
                for (const price of art.precios) {
                    const categoryId = await this.priceCategoryService.getPriceCategoryIdByCode(price.precio);
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

                const brandCode = art.marca?.codigo || '';
                const brandName = art.marca?.nombre || '';

                if (brandCode) {
                    await BrandModel.findOneAndUpdate(
                        { code: brandCode },
                        { $set: { code: brandCode, name: brandName } },
                        { upsert: true, new: true }
                    );
                }
                const producto = {
                    reference: art.referencia,
                    code: art.codigo,
                    description: art.detalle,
                    isActive: art.activo,
                    brand: {
                        code: brandCode,
                        name: brandName,
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

            return { message: '✅ Datos procesados correctamente' };
        } catch (error) {
            console.error('❌ Error al insertar artículos:', error);
            throw CustomError.internalServer('Error al insertar artículos');
        }
    }

    public async processStock(stockItems: { referencia: string; bodega: string; cantidad: number }[]) {

        try {

            const nuevosDatos = Array.isArray(stockItems) ? stockItems : [stockItems];
            const result = await this.stockService.processStock(nuevosDatos);
            return result;

        } catch (error: any) {
            console.error("❌ Error al procesar stock:", error);
            throw CustomError.internalServer(`Error al insertar artículos ${error.message}`);
        }
    }
}