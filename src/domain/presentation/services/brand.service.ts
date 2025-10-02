import { BrandModel } from "../../../data/mongo/models/brand.model";
import { CustomError } from "../../errors/custom.errors";



export class BrandService {

    public async listBrands(): Promise<any []> {
        try {
            const brands = await BrandModel.find({}).sort({ name: 1 });
            return brands;
        } catch (error) {
            throw CustomError.internalServer(`Error al listar las marcas: ${error}`);
        }
    }
}