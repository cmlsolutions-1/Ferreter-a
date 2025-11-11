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
import { UpdateMasterDto } from '../../dtos/product/update-master.dto';
import { UpdateCategoryDto } from '../../dtos/product/update-category.dto';


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

    public async updateMaster(_id: string, dto: UpdateMasterDto) {

        try {

            const product = await ProductModel.findOne({ _id, isActive: true });

            if (!product) {
                throw CustomError.notFound('Producto no encontrado');
            }

            const masterPackage = product.package.find(p => p.typePackage === 'Master');

            if (masterPackage) {

                masterPackage.Mount = dto.mount!;
            } else {
                product.package.push({ typePackage: 'Master', Mount: dto.mount });
            }
            await product.save();
            return {
                message: 'Producto actualizado correctamente',
                product: product.toJSON(),
            };
        } catch (err) {
            console.error(err);
            throw CustomError.internalServer(`Error al actualizar el paquete master: ${err}`);
        }
    }

    public async updateCategory(_id: string, dto: UpdateCategoryDto) {

        try {
            const product = await ProductModel.findByIdAndUpdate(
                {_id, isActive: true},
                { $set: { subCategory: dto.category } },
                { new: true }
            ).populate('subCategory');

            if (!product) {
                throw CustomError.notFound('Producto no encontrado');
            }

            return {
                message: 'Producto actualizado correctamente',
                product: product,
            };
        } catch (err) {
            console.error(err);
            throw CustomError.internalServer(`Error al actualizar el paquete master: ${err}`);
        }
    }


    public async listProducts(info: any): Promise<ListProductDto[]> {
        try {
            const products = await ProductModel.find({ isActive: true })
                .populate('prices.PriceCategory', 'code')
                .populate('image', '_id url name idCloud')
                .populate('subCategory', '_id');

            if (!products || products.length === 0) {
                throw CustomError.notFound('No se encontraron productos');
            }

            const safeProducts = products.map(product => ({
                ...product.toObject(),
                image: product.image ?? null,
            }));

            const filteredProductos = this.filterByPriceCategory(safeProducts, info);

            return ListProductDto.fromModelArray(filteredProductos);
        } catch (error) {
            throw CustomError.internalServer(`Error al listar los productos: ${error}`);
        }
    }



    public async getProductById(_id: string, info: any): Promise<GetProductByIdDto> {
        try {
            const product = await ProductModel.findOne({ _id, isActive: true })
                .populate('prices.PriceCategory', 'code')
                .populate('image', '_id url name idCloud')
                .populate('subCategory', '_id');

            if (!product) throw CustomError.notFound('Producto no encontrado');

            const safeProduct = {
                ...product.toObject(),
                image: product.image ?? null,
            };



            const filteredProductos = this.filterByPriceCategory(safeProduct, info);
            return GetProductByIdDto.fromModel(filteredProductos);
        } catch (error) {
            throw CustomError.internalServer(`Error al obtener el producto: ${error}`);
        }
    }


    public async getProductsByCategory(categoryId: string, info: any): Promise<ListProductByCategoryDto[]> {
        try {
            const products = await ProductModel.find({ subCategory: categoryId, isActive: true })
                .populate('prices.PriceCategory', 'code')
                .populate('image', '_id url name idCloud')
                .populate('subCategory', '_id');

            if (!products || products.length === 0) {
                throw CustomError.notFound('No se encontraron productos para esta categoría');
            }

            const safeProducts = products.map(product => ({
                ...product.toObject(),
                image: product.image ?? null,
            }));

            const filteredProductos = this.filterByPriceCategory(safeProducts, info);

            return ListProductByCategoryDto.fromModelArray(filteredProductos);
        } catch (error) {
            throw CustomError.internalServer(`Error al obtener productos por categoría: ${error}`);
        }
    }


    public async filterProducts(dto: FilterProductDto, info: any): Promise<{ products: ListProductDto[], total: number }> {
        try {
            const query: any = { isActive: true };

            if (dto.search) {
                query.$or = [
                    { reference: { $regex: dto.search.trim(), $options: 'i' } },
                    { description: { $regex: dto.search.trim(), $options: 'i' } }
                ];
            }

            if (dto.categories && dto.categories.length > 0) {
                query["subCategory"]  = { $in: dto.categories };
            }

            if (dto.brands && dto.brands.length > 0) {
                console.log('Filtrando por marcas:', dto.brands);
                query["brand.code"] = { $in: dto.brands };
            }

            const total = await ProductModel.countDocuments(query);

            const products = await ProductModel.find(query)
                .populate('prices.PriceCategory', 'code')
                .populate('image', '_id url name idCloud')
                .populate('subCategory', '_id')
                .skip((dto.page - 1) * dto.limit)
                .sort({ description: 1 })
                .limit(dto.limit);

            const safeProducts = products.map(product => ({
                ...product.toObject(),
                image: product.image ?? null,
            }));

            const filteredProductos = this.filterByPriceCategory(safeProducts, info);

            return {
                products: ListProductDto.fromModelArray(filteredProductos),
                total
            };
        } catch (error) {
            throw CustomError.internalServer(`Error al filtrar los productos: ${error}`);
        }
    }
    public async getPriceByCategory(productId: string, priceCategoryId: string) {
        const product = await ProductModel.findById(productId)
            .select('prices')
            .lean();
        if (!product) {
            throw CustomError.notFound('Producto no encontrado');
        }
        const priceObj = product.prices.find(
            p => p.PriceCategory.toString() == priceCategoryId
        );
        return priceObj ? priceObj.PosValue : null;
    }

    public async validateProductsExist(productIds: string[]) {
        const products = await ProductModel.find({ _id: { $in: productIds }, isActive: true }).select('_id').lean();
        const foundProductIds = products.map(p => p._id.toString());

        const missingProductIds = productIds.filter(id => !foundProductIds.includes(id));
        if (missingProductIds.length > 0) {
            throw CustomError.badRequest(`Los siguientes productos no existen: ${missingProductIds.join(', ')}`);
        }
    }

    private filterByPriceCategory(products: any | any[], info: any): any | any[] {
        const isArray = Array.isArray(products);
        let productsList = isArray ? products : [products];

        let productsReturn: any[] = products;

        if (!info || !info.role) {
            productsReturn = productsList.map(prod => {
                const prices = prod.prices.filter(
                    (p: any) => p.PriceCategory.code.toString() == "FER"
                );

                return {
                    ...prod,
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
                    ...prod,
                    prices
                };
            });
        }
        else if (info.role == 'SalesPerson' || info.role == 'Admin') {
            productsReturn = productsList.map(prod => {
                const prices = prod.prices.filter(
                    (p: any) =>
                        p.PriceCategory.code.toString() == "001" ||
                        p.PriceCategory.code.toString() == "FER"
                );

                return {
                    ...prod,
                    prices
                };
            });
        }
        return isArray ? productsReturn : productsReturn[0];
    }

}
