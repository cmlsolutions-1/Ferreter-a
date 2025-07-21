import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../../dtos/product/create-product.dto';
import { UpdateProductDto } from '../../dtos/product/update-product';
import { FilterProductDto } from '../../dtos/product/filter-product.dto';

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [err, dto] = CreateProductDto.create(req.body);
      if (err) return res.status(400).json({ error: true, message: err });

      const result = await this.productService.createProduct(dto!);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reference } = req.params;
      const [err, dto] = UpdateProductDto.create(req.body);
      if (err) return res.status(400).json({ error: true, message: err });

      const result = await this.productService.updateProduct(reference, dto!);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await this.productService.listProducts();
      return res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reference } = req.params;
      const product = await this.productService.getProductById(reference);
      return res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  };

  getProductsByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId } = req.params;
      const products = await this.productService.getProductsByCategory(categoryId);
      return res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  };

  filterProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [err, dto] = FilterProductDto.create(req.query);
      if (err) return res.status(400).json({ error: true, message: err });

      const products = await this.productService.filterProducts(dto!);
      return res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  };
}
