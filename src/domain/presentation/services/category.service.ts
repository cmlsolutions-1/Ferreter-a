import mongoose from "mongoose";
import { CategoryModel } from "../../../data/mongo/models/category.model";
import { SubCategoryModel } from "../../../data/mongo/models/subCategory.model";
import { CreateCategoryDto } from "../../dtos/category/create-category.dto";
import { CreateSubCategoryDto } from "../../dtos/category/create-sub-category.dto";
import { CustomError } from "../../errors/custom.errors";
import { ListCategoryDto } from "../../dtos/category/get-categories.dto";
import { ListSubCategoryDto } from "../../dtos/category/get-subcategories-by-category.dto";




export class CategoryService {

    public async createCategoryService(dto: CreateCategoryDto) {

        const existsCategory = await CategoryModel.findOne({
            name: dto.name
        });

        if (existsCategory) throw CustomError.badRequest('Ya existe una categoria con esta información');

        try {
            const newCategory = new CategoryModel({
                name: dto.name,
            });

            await newCategory.save();

            return {
                message: 'Categoria creada correctamente',
                product: newCategory.toJSON(),
            };
        } catch (error) {
            throw CustomError.internalServer(`Error al crear categoria: ${error}`);
        }
    }


    public async createSubCategoryService(dto: CreateSubCategoryDto) {

        const existProduct = await SubCategoryModel.findOne({
            $or: [
                { idCategory: new mongoose.Types.ObjectId(dto.idCategory) },
                { name: dto.name }
            ]
        });

        if (existProduct) throw CustomError.badRequest('Ya existe una subcategoria con este nombre');

        try {
            const newSubCategory = new SubCategoryModel({
                idCategory: new mongoose.Types.ObjectId(dto.idCategory),
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
            const categories = await CategoryModel.find({})
            return ListCategoryDto.fromModelArray(categories);
        } catch (error) {
            throw CustomError.internalServer(`Error al listar las categorias: ${error}`);
        }
    }

    public async listSubcategoriesByCategory(idCategory: string): Promise<ListSubCategoryDto[]> {
        try {
            const subCategories = await SubCategoryModel.find({ idCategory: new mongoose.Types.ObjectId(new mongoose.Types.ObjectId(idCategory) )});

            if (!subCategories) throw CustomError.notFound('Esta categoria no tiene subcategorias asociadas');

            return ListSubCategoryDto.fromModelArray(subCategories);
        } catch (error) {
            throw CustomError.internalServer(`Error al obtener el producto: ${error}`);
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