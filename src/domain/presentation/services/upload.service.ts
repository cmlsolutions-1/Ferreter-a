import { envs } from "../../../config";
import { ImageModel } from "../../../data/mongo/models/image.model";
import { ProductModel } from "../../../data/mongo/models/product.model";
import { CustomError } from "../../errors/custom.errors";
import fs from "fs";
import path from "path";
import { Upload } from "@aws-sdk/lib-storage";
import { spacesClient } from "../../../config/digitalocean";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export class UploadService {
  async uploadAndAssign(
    filePath: string,
    reference: string,
    folder: string = "Ferreteria/Productos"
  ) {
    try {
      const fileStats = fs.statSync(filePath);
      const fileDate = fileStats.mtime;

      const product = await ProductModel.findOne({ reference }).populate("image");
      if (!product) {
        console.warn(`No existe producto con referencia ${reference}, se omite la imagen.`);
        return null;
      }
      if (product.image) {
        const existing: any = product.image;

        if (existing.lastUpdated?.getTime() === fileDate.getTime()) {
          return { image: existing, product };
        }

        if (existing.idCloud) {
          await this.deleteFile(existing.idCloud);
        }
      }

      const uploadResult = await this.uploadToSpaces(filePath, folder);

      const image = await ImageModel.create({
        idCloud: uploadResult.key,
        url: uploadResult.url,
        name: reference,
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

  async uploadToSpaces(filePath: string, folder = "") {
    const fileStream = fs.createReadStream(filePath);
    const fileName = path.basename(filePath);

    const key = folder ? `${folder}/${fileName}` : fileName;

    const upload = new Upload({
      client: spacesClient,
      params: {
        Bucket: envs.SPACES_BUCKET!,
        Key: key,
        Body: fileStream,
        ACL: "public-read",
      },
    });

    await upload.done();

    const fileUrl = `${envs.SPACES_ENDPOINT}/${envs.SPACES_BUCKET}/${key}`;

    return { key, url: fileUrl };
  }

  async deleteFile(publicId: string) {
    try {

      await spacesClient.send(
        new DeleteObjectCommand({
          Bucket: process.env.SPACES_BUCKET!,
          Key: publicId,
        })
      );
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
      throw CustomError.internalServer(`Error al eliminar la imagen: ${error}`);
    }
  }
}
