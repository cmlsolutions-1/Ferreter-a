import { ContainerModel } from '../../../data/mongo/models/container.model';
import { CreateContainerDto } from '../../dtos/container/create-container.dto';
import { CustomError } from '../../errors/custom.errors';
import { ListContainerDto } from '../../dtos/container/list-container.dto';
import { UpdateContainerDto } from '../../dtos/container/update-container.dto';

export class ContainerService {

    
    public async createContainer(dto: CreateContainerDto) {
        try {
            const exists = await ContainerModel.findOne({ id: dto.id });
            if (exists) throw CustomError.badRequest('Ya existe un contenedor con este ID');

            const container = new ContainerModel({
                id: dto.id,
                name: dto.name,
                Date: dto.date ?? new Date(), 
            });

            await container.save();

            return {
                message: 'Contenedor creado exitosamente',
                container,
            };

        } catch (error) {
            throw CustomError.internalServer(`Error al crear el contenedor: ${error}`);
        }
    }


    public async listContainers(): Promise<ListContainerDto[]> {
        try {
            const containers = await ContainerModel.find().lean();

            return ListContainerDto.fromModelArray(containers);
        } catch (error) {
            throw CustomError.internalServer(`Error al obtener los contenedores: ${error}`);
        }
    }


   
    public async getContainerById(containerId: string): Promise<ListContainerDto> {
        try {
            const container = await ContainerModel.findOne({ id: containerId }).lean();

            if (!container) throw CustomError.notFound('Contenedor no encontrado');

            return ListContainerDto.fromModel(container);

        } catch (error) {
            throw CustomError.internalServer(`Error al buscar el contenedor: ${error}`);
        }
    }


   
    public async updateContainer(containerId: string, dto: UpdateContainerDto) {
    try {
      const container = await ContainerModel.findOne({ id: containerId });
      if (!container) throw CustomError.notFound('Contenedor no encontrado');

      if (dto.name !== undefined) container.name = dto.name;
      if (dto.date !== undefined) container.Date = dto.date;

      await container.save();

      return {
        message: 'Contenedor actualizado correctamente',
        container,
      };

    } catch (error) {
      throw CustomError.internalServer(`Error al actualizar el contenedor: ${error}`);
    }
  }

}
