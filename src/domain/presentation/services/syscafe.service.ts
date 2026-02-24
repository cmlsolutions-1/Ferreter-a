import { BrandModel } from "../../../data/mongo/models/brand.model";
import { ProductModel } from "../../../data/mongo/models/product.model";
import { SubCategoryModel } from "../../../data/mongo/models/subCategory.model";
import { SyncControlModel } from "../../../data/mongo/models/sync-contro.model";
import { CustomError } from "../../errors/custom.errors";
import { EmailService } from "./email.service";
import { PriceCategoryService } from "./price.category.service";
import { StockService } from "./stock.service";
import mongoose from "mongoose";



export class SysCafeService {

    public constructor(
        private readonly priceCategoryService: PriceCategoryService,
        private readonly stockService: StockService,
        private readonly emailService: EmailService,
    ) {
    }

    public async registerArticles(articles: any[]) {
        try {
            const nuevosDatos = Array.isArray(articles) ? articles : [articles];
            const ahora = new Date();
            const fechaSincronizacion = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

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

                const subCatCode = art.grupo?.codigo || '';
                const subCatName = art.grupo?.nombre || '';

                if (subCatCode) {
                    await SubCategoryModel.findOneAndUpdate(
                        { code: subCatCode },
                        { $set: { code: subCatCode, name: subCatName } },
                        { upsert: true, new: true }
                    );
                }

                const producto: any = {
                    reference: art.referencia,
                    code: art.codigo,
                    description: art.detalle,
                    isActive: art.activo,
                    brand: {
                        code: brandCode,
                        name: brandName,
                    },
                    subCategory: {
                        code: subCatCode,
                        name: subCatName,
                    },
                    prices: pricesWithIds,
                    UpdateDate: fechaSincronizacion
                };

                if (art.cantembala !== null && art.cantembala !== undefined && art.cantembala !== "") {
                    producto.package = [
                        {
                            typePackage: "Master",
                            Mount: Number(art.cantembala)
                        }
                    ];
                }

                await ProductModel.findOneAndUpdate(
                    { reference: producto.reference },
                    { $set: producto },
                    { upsert: true, new: true }
                );
            }

            return { message: '✅ Datos procesados correctamente' };
        } catch (error) {
            console.error('❌ Error al insertar artículos:', error);
            await this.sendEmail("cmlsolutions3@gmail.com", `<h1>Proceso de sincronización de artivulos fallido</h1><p>Error: ${error}</p>`, 'Error al recibir articulos desde SysCafe');
            throw CustomError.internalServer('Error al insertar artículos: ' + error);
        }
    }

    public async processStock(stockItems: { referencia: string; bodega: string; cantidad: number }[]) {

        try {
            const nuevosDatos = Array.isArray(stockItems) ? stockItems : [stockItems];
            const result = await this.stockService.processStock(nuevosDatos);

            return result;

        } catch (error: any) {
            console.error("❌ Error al procesar stock:", error);
            await this.sendEmail("cmlsolutions3@gmail.com", `<h1>Proceso de sincronización de stock fallido</h1><p>Error: ${error.message}</p>`, 'Error al recibir stock desde SysCafe');
            throw CustomError.internalServer(`Error al insertar stock ${error.message}`);
        }
    }

    public async registerFlag() {

        const ahora = new Date();
        const fechaSincronizacion = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

        const ctrl = await SyncControlModel.findOne({ key: "products_finalize" }).lean();
        const yaFinalizoHoy = ctrl?.dateValue && ctrl.dateValue.getTime() === fechaSincronizacion.getTime();

        if (!yaFinalizoHoy) {

            await ProductModel.updateMany(
                { isActive: true, UpdateDate: { $ne: fechaSincronizacion } },
                { $set: { isActive: false } }
            );

            await SyncControlModel.findOneAndUpdate(
                { key: "products_finalize" },
                { $set: { dateValue: fechaSincronizacion } },
                { upsert: true, new: true }
            );
        }
    }


    private sendEmail = async (email: string, html: string, subject: string) => {
        const options = {
            to: email,
            subject,
            htmlBody: html,
        }
        const isSent = await this.emailService.sendEmail(options);
        if (!isSent) console.log('Error sending email');
        return true;
    }
}