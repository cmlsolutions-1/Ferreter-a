import { NextFunction, Request, Response } from "express";
import { ContainerService } from "../services/container.service";
import { CreateContainerDto } from "../../dtos/container/create-container.dto";
import { UpdateContainerDto } from "../../dtos/container/update-container.dto";


export class ContainerController {

    constructor(
         private readonly containerService: ContainerService,
    ) {}

    createContainer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const [err, dto] = CreateContainerDto.create(req.body);
            if (err) return res.status(400).json({ error: true, message: err });

            const result = await this.containerService.createContainer(dto!);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    listContainers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const containers = await this.containerService.listContainers();
      return res.status(200).json(containers);
    } catch (error) {
      next(error);
    }
  };

  getContainerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const container = await this.containerService.getContainerById(id);
      return res.status(200).json(container);
    } catch (error) {
      next(error);
    }
  };

  updateContainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const [err, dto] = UpdateContainerDto.update(req.body);
      if (err) return res.status(400).json({ error: true, message: err });

      const result = await this.containerService.updateContainer(id, dto!);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}