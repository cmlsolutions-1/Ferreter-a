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
import { PriceCategoryModel } from '../../../data/mongo/models/priceCategory.model';
import { privateDecrypt } from 'crypto';
import { PriceCategoryService } from './price.category.service';


export class ProductService {

    public constructor(
        private readonly categoryService: CategoryService,
        private readonly priceCategoryService: PriceCategoryService,
    ) {
    }

    public async createProduct(dto: CreateProductDto) {

        const existProduct = await ProductModel.findOne({ reference: dto.reference });
        if (existProduct) throw CustomError.badRequest('Ya existe un producto con esta referencia');

        await this.categoryService.validateSubCategoryExists(dto.subCategory);

        const pricesWithIds = [];
        for (const price of dto.prices) {
            const category = await this.priceCategoryService.getPriceCategoryIdByCode(price.precio);

            pricesWithIds.push({
                PriceCategory: category,
                Value: price.valor,
                PosValue: price.valorpos,
            });
        }

        try {
            const newProduct = new ProductModel({
                reference: dto.reference,
                code: dto.code,
                description: dto.description,
                image: dto.image,
                category: dto.subCategory,
                prices: pricesWithIds,
                package: dto.packagee ?? [],
                // stock: dto.stock ?? [],
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
            if (dto.description !== undefined) product.description = dto.description;
            if (dto.image !== undefined) product.image = new mongoose.Types.ObjectId(dto.image);
            if (dto.category !== undefined) product.subCategory = new mongoose.Types.ObjectId(dto.category);
            if (dto.prices !== undefined) product.prices = new mongoose.Types.DocumentArray(
                dto.prices.map(p => ({
                    PriceCategory: p.precio,
                    Value: p.valor,
                    PosValue: p.valorpos,
                })))



            if (dto.packagee !== undefined) product.package = new mongoose.Types.DocumentArray(
                dto.packagee.map(p => ({
                    typePackage: p.typePackage,
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
            const products = await ProductModel.find({}, '_id reference description code title subCategory image')
            // .populate('subCategory', '_id') // Asegura que sea un ObjectId
            // .populate('image', '_id');

            return ListProductDto.fromModelArray(products);
        } catch (error) {
            throw CustomError.internalServer(`Error al listar los productos: ${error}`);
        }
    }

    public async getProductById(_id: string): Promise<GetProductByIdDto> {
        try {
            const product = await ProductModel.findOne({ _id })
                .populate('prices.PriceCategory', 'code') 
                .populate('image', '_id')
                .populate('subCategory', '_id');

            if (!product) throw CustomError.notFound('Producto no encontrado');

            return GetProductByIdDto.fromModel(product);
        } catch (error) {
            throw CustomError.internalServer(`Error al obtener el producto: ${error}`);
        }
    }

    public async getProductsByCategory(categoryId: string): Promise<ListProductByCategoryDto[]> {
        try {
            const products = await ProductModel.find({ subCategory: categoryId })

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

        if (dto.description) {
            query.description = { $regex: dto.description.trim(), $options: 'i' };
        }
        const products = await ProductModel.find(query);

        return ListProductDto.fromModelArray(products);
    }

    public async getPriceByCategory(productId: string, priceCategoryId: string) {
        const product = await ProductModel.findById(productId)
            .select('prices')
            .lean();
        if (!product) {
            throw CustomError.notFound('Producto no encontrado');
        }
        const priceObj = product.prices.find(
            p => p.PriceCategory.toString() === priceCategoryId
        );
        return priceObj ? priceObj.PosValue : null;
    }
}
