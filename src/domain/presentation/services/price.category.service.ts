import mongoose from "mongoose";
import { PriceCategoryModel } from "../../../data/mongo/models/priceCategory.model";
import { CustomError } from "../../errors/custom.errors";

export class PriceCategoryService {

    public constructor(
    ) {
    }

    public async createPriceCategory(name: string, code: string): Promise<any> {

        const existProduct = await PriceCategoryModel.findOne({ name, code });
        if (existProduct) throw CustomError.badRequest('Ya existe una categoría con este nombre o este codigo');

        try {
            const newCategory = new PriceCategoryModel({
                name,
                code,
            });

            await newCategory.save();

            return {
                message: 'Categoría creada correctamente',
                product: newCategory.toJSON(),
            };
        } catch (error) {
            throw CustomError.internalServer(`Error al crear la categoría: ${error}`);
        }
    }

    public async listPriceCategories(): Promise<any[]> {
        try {
            const categories = await PriceCategoryModel.find();
            return categories;
        } catch (error) {
            throw CustomError.internalServer(`Error al listar los productos: ${error}`);
        }
    }

    public async getPriceCategoryIdByCode(code: string) {
        const category = await PriceCategoryModel.findOne({ code }).lean();
        if (!category) throw CustomError.notFound('Categoría no encontrada');

         
        return category._id.toString();
    }

    public async getPriceCategoryById(id?: string): Promise<any> {

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw CustomError.badRequest('ID inválido');
        }
        const category = await PriceCategoryModel.findById(id);

        if (!category) throw CustomError.badRequest('Categoría no encontrada');

        return category;
    }

}