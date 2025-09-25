import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { StockService } from "../domain/presentation/services/stock.service";

const app = express();
app.use(express.json({ limit: "10mb", type: "application/json" }));

const stockService = new StockService();

console.log("🔄 Iniciando proceso de recepción de stock...");
app.put("/SendStock", async (req: Request, res: Response) => {
  try {
    const nuevosDatos = Array.isArray(req.body) ? req.body : [req.body];

    const result = await stockService.processStock(nuevosDatos);

    res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ Error al procesar stock:", error);
    res.status(500).json({ error: "Error al procesar stock", detalle: error.message });
  }
});

app.listen(3000, () => {
  console.log("🚀 Servidor corriendo en http://localhost:3000");
});
