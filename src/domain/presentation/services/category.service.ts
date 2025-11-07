import mongoose from "mongoose";
import { CategoryModel } from "../../../data/mongo/models/category.model";
import { SubCategoryModel } from "../../../data/mongo/models/subCategory.model";
import { CreateSubCategoryDto } from "../../dtos/category/create-sub-category.dto";
import { CustomError } from "../../errors/custom.errors";
import { ListCategoryDto } from "../../dtos/category/get-categories.dto";




export class CategoryService {

    public async createCategoryService(dto: CreateSubCategoryDto) {

        const existProduct = await SubCategoryModel.findOne({
            $or: [
                { name: dto.name }
            ]
        });

        if (existProduct) throw CustomError.badRequest('Ya existe una subcategoria con este nombre');

        try {
            const newSubCategory = new SubCategoryModel({
                name: dto.name,
            });

            await newSubCategory.save();

            return {
                message: 'Sub categoría creada correctamente',
                product: newSubCategory.toJSON(),
            };
        } catch (error) {
            throw CustomError.internalServer(`Error al crear categoria: ${error}`);
        }
    }

    public async listCategories(): Promise<ListCategoryDto[]> {
        try {
            const categories = await SubCategoryModel.find({})
            return ListCategoryDto.fromModelArray(categories);
        } catch (error) {
            throw CustomError.internalServer(`Error al listar las categorias: ${error}`);
        }
    }

    private async validateCategoryExists(idCategory: string): Promise<void> {
        const category = await CategoryModel.findById(new mongoose.Types.ObjectId(new mongoose.Types.ObjectId(idCategory)));
        if (!category) {
            throw CustomError.notFound('Categoria no encontrada');
        }
    }

    public async validateSubCategoryExists(idSubCategory: string): Promise<void> {
        const subCategory = await SubCategoryModel.findById(new mongoose.Types.ObjectId(new mongoose.Types.ObjectId(idSubCategory)));
        if (!subCategory) {
            throw CustomError.notFound('Subcategoria no encontrada');
        }
    }
}