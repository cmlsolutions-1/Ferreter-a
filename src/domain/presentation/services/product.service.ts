import { ProductModel } from '../../../data/mongo/models/product.model';
import { CreateProductDto } from '../../dtos/product/create-product.dto';
import { UpdateProductDto } from '../../dtos/product/update-product';
import { CustomError } from '../../errors/custom.errors';
import { ListProductDto } from '../../dtos/product/list-product.dto';
import { GetProductByIdDto } from '../../dtos/product/get-by-id-product';
import { ListProductByCategoryDto } from '../../dtos/product/list-producto-category.dto';
import { FilterProductDto } from '../../dtos/product/filter-product.dto';
import mongoose from 'mongoose';
import { CategoryService } from './category.service';


export class ProductService {

    public constructor(
        private readonly categoryService: CategoryService
    ) 
    {   
    }

    public async createProduct(dto: CreateProductDto) {

        const existProduct = await ProductModel.findOne({ reference: dto.reference });
        if (existProduct) throw CustomError.badRequest('Ya existe un producto con esta referencia');

        await this.categoryService.validateSubCategoryExists(dto.subCategory);

        try {
            const newProduct = new ProductModel({
                reference: dto.reference,
                code: dto.code,
                title: dto.title,
                description: dto.description,
                image: dto.image,
                category: dto.subCategory,
                prices: dto.prices,
                package: dto.packagee ?? [],
                stock: dto.stock ?? [],
                subCategory: new mongoose.Types.ObjectId(dto.subCategory),
            });

            await newProduct.save();

            return {
                message: 'Producto creado correctamente',
                product: newProduct.toJSON(),
            };
        } catch (error) {
            throw CustomError.internalServer(`Error al crear producto: ${error}`);
        }
    }

    public async updateProduct(reference: string, dto: UpdateProductDto) {
        const product = await ProductModel.findOne({ reference });

        if (!product) throw CustomError.notFound('Producto no encontrado');

        try {
            if (dto.code !== undefined) product.code = dto.code;
            if (dto.title !== undefined) product.title = dto.title;
            if (dto.description !== undefined) product.description = dto.description;
            if (dto.image !== undefined) product.image = new mongoose.Types.ObjectId(dto.image);
            if (dto.category !== undefined) product.subCategory = new mongoose.Types.ObjectId(dto.category);
            if (dto.prices !== undefined) product.prices = new mongoose.Types.DocumentArray(
                dto.prices.map(p => ({
                    PriceCategory: p.PriceCategory,
                    Value: p.Value,
                    PosValue: p.PosValue,
                })))



            if (dto.packagee !== undefined) product.package = new mongoose.Types.DocumentArray(
                dto.packagee.map(p => ({
                    typePackage: p.typePackage,
                    Mount: p.Mount,

                })))
            if (dto.stock !== undefined) product.stock = new mongoose.Types.DocumentArray(
                dto.stock.map(p => ({
                    Strore: p.Store,
                    Mount: p.Mount,

                })))

            await product.save();

            return {
                message: 'Producto actualizado correctamente',
                product: product.toJSON(),
            };
        } catch (error) {
            throw CustomError.internalServer(`Error al actualizar el producto: ${error}`);
        }
    }


    public async listProducts(): Promise<ListProductDto[]> {
        try {
            const products = await ProductModel.find({}, 'reference code title category image')
                .populate('subCategory', '_id') // Asegura que sea un ObjectId
                .populate('image', '_id');

            return ListProductDto.fromModelArray(products);
        } catch (error) {
            throw CustomError.internalServer(`Error al listar los productos: ${error}`);
        }
    }

    public async getProductById(reference: string): Promise<GetProductByIdDto> {
        try {
            const product = await ProductModel.findOne({ reference })
                .populate('subCategory', '_id')
                .populate('image', '_id');

            if (!product) throw CustomError.notFound('Producto no encontrado');

            return GetProductByIdDto.fromModel(product);
        } catch (error) {
            throw CustomError.internalServer(`Error al obtener el producto: ${error}`);
        }
    }

    public async getProductsByCategory(categoryId: string): Promise<ListProductByCategoryDto[]> {
        try {
            const products = await ProductModel.find({ category: categoryId })
                .populate('image', '_id');

            if (!products || products.length === 0) {
                throw CustomError.notFound('No se encontraron productos para esta categoría');
            }

            return ListProductByCategoryDto.fromModelArray(products);
        } catch (error) {
            throw CustomError.internalServer(`Error al obtener productos por categoría: ${error}`);
        }
    }

    public async filterProducts(dto: FilterProductDto): Promise<ListProductDto[]> {
        const query: any = {};

        if (dto.reference) {
            query.reference = dto.reference.trim();
        }

        if (dto.title) {
            
            query.title = { $regex: dto.title.trim(), $options: 'i' };
        }

        const products = await ProductModel.find(query).populate('image').populate('category');

        return ListProductDto.fromModelArray(products);
    }

}
