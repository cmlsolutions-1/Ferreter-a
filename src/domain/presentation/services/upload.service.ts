import cloudinary from "../../../config/cloudinary";
import { ImageModel } from "../../../data/mongo/models/image.model";
import { ProductModel } from "../../../data/mongo/models/product.model";
import { CustomError } from "../../errors/custom.errors";

export class UploadService {
  async uploadAndAssign(filePath: string, reference: string, folder: string = "Ferreteria/Productos") {

    try {
      const result = await cloudinary.uploader.upload(filePath, { folder });

      const image = await ImageModel.create({
        idCloud: result.public_id,
        url: result.secure_url,
        name: result.original_filename,
      });

      const product = await ProductModel.findOneAndUpdate(
        { reference },
        { image: image._id },
        { new: true }
      );

      return { image, product };
    } catch (error) {
      throw CustomError.internalServer(`Error al procesar la imagen: ${error}`);
    }
  }

  async deleteFile(publicId: string) {
    try {
      await cloudinary.uploader.destroy(publicId);

      const image = await ImageModel.findOne({ idCloud: publicId });

      if (image) {
        await ImageModel.deleteOne({ _id: image._id });

        await ProductModel.updateOne(
          { image: image._id },
          { $unset: { image: "" } }
        );
      }
    } catch (error) {
      throw CustomError.internalServer(`Error al procesar la imagen: ${error}`);
    }
  }
}
