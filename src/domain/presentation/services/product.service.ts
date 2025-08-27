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
            const products = await ProductModel.find()
                .populate('prices.PriceCategory');
            // .populate('subCategory', '_id') // Asegura que sea un ObjectId
            // .populate('image', '_id');

            const filteredProductos = this.filterByPriceCategory(products, null);
            console.log(filteredProductos);

            return ListProductDto.fromModelArray(filteredProductos);
        } catch (error) {
            throw CustomError.internalServer(`Error al listar los productos: ${error}`);
        }
    }

    public async getProductById(_id: string, info: any): Promise<GetProductByIdDto> {
        try {
            const product = await ProductModel.findOne({ _id })
                .populate('prices.PriceCategory', 'code')
                // .populate('image', '_id')
                .populate('subCategory', '_id');

            if (!product) throw CustomError.notFound('Producto no encontrado');

            const filteredProductos = this.filterByPriceCategory(product, info);

            return GetProductByIdDto.fromModel(filteredProductos);
        } catch (error) {
            throw CustomError.internalServer(`Error al obtener el producto: ${error}`);
        }
    }

    public async getProductsByCategory(categoryId: string, info: any): Promise<ListProductByCategoryDto[]> {
        try {
            const products = await ProductModel.find({ subCategory: categoryId })
                .populate('prices.PriceCategory');

            if (!products || products.length === 0) {
                throw CustomError.notFound('No se encontraron productos para esta categoría');
            }

            const filteredProductos = this.filterByPriceCategory(products, info);

            return ListProductByCategoryDto.fromModelArray(products);
        } catch (error) {
            throw CustomError.internalServer(`Error al obtener productos por categoría: ${error}`);
        }
    }

    public async filterProducts(dto: FilterProductDto, info: any): Promise<ListProductDto[]> {
        const query: any = {};

        if (dto.reference) {
            query.reference = dto.reference.trim();
        }

        if (dto.description) {
            query.description = { $regex: dto.description.trim(), $options: 'i' };
        }
        let products = await ProductModel.find(query).populate('prices.PriceCategory');

        const filteredProductos = this.filterByPriceCategory(products, info);

        return ListProductDto.fromModelArray(filteredProductos);
    }

    public async getPriceByCategory(productId: string, priceCategoryId: string) {
        const product = await ProductModel.findById(productId)
            .select('prices')
            .lean();
        if (!product) {
            throw CustomError.notFound('Producto no encontrado');
        }
        console.log('Product:', product);
        console.log('Price Category ID:', priceCategoryId);
        const priceObj = product.prices.find(
            p => p.PriceCategory.toString() == priceCategoryId
        );
        console.log(priceObj);
        return priceObj ? priceObj.PosValue : null;
    }

    public async validateProductsExist(productIds: string[]) {
        const products = await ProductModel.find({ _id: { $in: productIds } }).select('_id').lean();
        const foundProductIds = products.map(p => p._id.toString());

        const missingProductIds = productIds.filter(id => !foundProductIds.includes(id));
        if (missingProductIds.length > 0) {
            throw CustomError.badRequest(`Los siguientes productos no existen: ${missingProductIds.join(', ')}`);
        }
    }

    private filterByPriceCategory(products: any | any[], info: any): any | any[] {
        const isArray = Array.isArray(products);
        let productsList = isArray ? products : [products]; // convierto a lista para reutilizar lógica

        let productsReturn: any[] = products;

        if (!info || !info.role) {
            productsReturn = productsList.map(prod => {
                const prices = prod.prices.filter(
                    (p: any) => p.PriceCategory.code.toString() == "FER"
                );

                return {
                    ...prod.toObject(),
                    prices
                };
            });
        }
        else if (info.role == 'Client') {
            productsReturn = productsList.map(prod => {
                const prices = prod.prices.filter(
                    (p: any) => p.PriceCategory._id.toString() === info.priceCategory
                );

                return {
                    ...prod.toObject(),
                    prices
                };
            });
        }
        else if (info.role == 'SalesPerson') {
            productsReturn = productsList.map(prod => {
                const prices = prod.prices.filter(
                    (p: any) =>
                        p.PriceCategory.code.toString() == "001" ||
                        p.PriceCategory.code.toString() == "FER"
                );

                return {
                    ...prod.toObject(),
                    prices
                };
            });
        }

        return isArray ? productsReturn : productsReturn[0]; // devuelvo array o un único objeto
    }

}
