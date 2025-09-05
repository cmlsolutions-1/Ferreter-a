import cloudinary from "../../../config/cloudinary";
import { ImageModel } from "../../../data/mongo/models/image.model";
import { ProductModel } from "../../../data/mongo/models/product.model";
import { CustomError } from "../../errors/custom.errors";
import fs from "fs";

export class UploadService {
  async uploadAndAssign(filePath: string, reference: string, folder: string = "Ferreteria/Productos") {
    try {
      const fileStats = fs.statSync(filePath);
      const fileDate = fileStats.mtime;

      const product = await ProductModel.findOne({ reference }).populate("image");

      if (product?.image) {
        const existingImage: any = product.image;

        if (existingImage.lastUpdated?.getTime() !== fileDate.getTime()) {
          await this.deleteFile(existingImage.idCloud);
        } else {
          return { image: existingImage, product };
        }
      }
      const result = await cloudinary.uploader.upload(filePath, { folder });

      const image = await ImageModel.create({
        idCloud: result.public_id,
        url: result.secure_url,
        name: result.original_filename,
        lastUpdated: fileDate,
      });

      const updatedProduct = await ProductModel.findOneAndUpdate(
        { reference },
        { image: image._id },
        { new: true }
      );

      return { image, product: updatedProduct };
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

      return { message: "Imagen eliminada correctamente" };
    } catch (error) {
      throw CustomError.internalServer(`Error al procesar la imagen: ${error}`);
    }
  }
}
