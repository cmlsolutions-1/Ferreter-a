import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { DepartmentModel } from "../data/mongo/models/department.model";
import { CityModel } from "../data/mongo/models/city.model";
import { MongoDatabase } from "../data/mongo-database";
import { envs } from "../config";


interface DepartamentoData {
    departamento: string;
    ciudades: string[];
}

async function seedDatabase(): Promise<void> {
    try {

        await MongoDatabase.connect({
            dbName: envs.MONGO_DB_NAME,
            mongoUrl: envs.MONGO_URL,
        });

        console.log("✅ Conectado a MongoDB");

        const filePath = path.resolve(__dirname, "data", "departamentos.json");
        const rawData = fs.readFileSync(filePath, "utf8");
        const departamentos: DepartamentoData[] = JSON.parse(rawData);

        await DepartmentModel.deleteMany({});
        await CityModel.deleteMany({});
        console.log("🧹 Colecciones limpiadas");
        for (const d of departamentos) {
            const dept = await DepartmentModel.create({ name: d.departamento });

            const cityDocs = d.ciudades.map((cityName) => ({
                name: cityName,
                department: dept._id,
                postalCode: "00000", 
            }));

            await CityModel.insertMany(cityDocs);
            console.log(`📍 Insertado: ${d.departamento} (${d.ciudades.length} ciudades)`);
        }

        console.log("🎉 Inserción completada correctamente");
    } catch (error) {
        console.error("❌ Error al insertar datos:", error);
    } finally {
        await mongoose.connection.close();
    }
}

seedDatabase();
