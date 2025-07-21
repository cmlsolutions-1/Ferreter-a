import { UserModel } from '../../../data/mongo/models/user.model';
import { UpdateUserDto } from '../../dtos/user/update-user.dto';
import { CustomError } from '../../errors/custom.errors';
import { DeleteUserDto } from '../../dtos/user/delete-user.dto';
import { GetUserByIdDto } from '../../dtos/user/get-user-by-id.dto';
import { ListUserDto } from '../../dtos/user/list-user.dto';
import { GetClientsBySalesPersonDto } from '../../dtos/user/get-clientes-byvendedor.dto';
import mongoose from 'mongoose';

export class UserService {

    public async updateUser(dto: UpdateUserDto) {

        try {
            const user = await UserModel.findOne({ id: dto.id });
            if (!user) throw CustomError.notFound('Usuario no encontrado');

            if (dto.name !== undefined) user.name = dto.name;
            if (dto.lastName !== undefined) user.lastName = dto.lastName;
            if (dto.email) {
                user.email = new mongoose.Types.DocumentArray(
                    dto.email.map(e => ({
                        EmailAddres: e.EmailAddres,
                        IsPrincipal: e.IsPrincipal,
                    }))
                );
            }

            if (dto.phone) {
                user.phone = new mongoose.Types.DocumentArray(
                    dto.phone.map(p => ({
                        NumberPhone: p.NumberPhone,
                        IsPrincipal: p.IsPrincipal,
                        Indicative: p.Indicative,
                    })))
            }

            if (dto.addres !== undefined) user.addres = dto.addres;
            if (dto.city !== undefined) user.city = new mongoose.Types.ObjectId(dto.city);
            if (dto.role !== undefined) user.role = dto.role;
            if (dto.priceCategory !== undefined) user.priceCategory = new mongoose.Types.ObjectId(dto.priceCategory);

            await user.save();

            return {
                message: 'Usuario actualizado correctamente',
                user,
            };

        } catch (error) {
            throw CustomError.internalServer(`Error al actualizar el usuario: ${error}`);
        }
    }

    public async deleteUser(dto: DeleteUserDto) {

        const user = await UserModel.findOne({ id: dto.id });
        if (!user) throw CustomError.notFound('Usuario no encontrado');

        user.state = dto.state;

        await user.save();

        return {
            message: `Usuario actualizado a estado ${dto.state}`,
            userId: user.id,
        };
    }

    public async getUserById(userId: string): Promise<GetUserByIdDto> {
        const user = await UserModel.findOne({ id: userId })
            .populate('city', '_id') 
            .populate('salesPerson', '_id')
            .populate('clients', '_id')
            .populate('priceCategory', '_id');

        if (!user) throw CustomError.notFound('Usuario no encontrado');

        return GetUserByIdDto.fromModel(user);
    }

    public async getAllUsers(): Promise<ListUserDto[]> {
        const users = await UserModel.find().populate('city', '_id');

        return ListUserDto.fromModelArray(users);
    }

    public async getClientsBySalesPersonId(salesPersonId: string): Promise<GetClientsBySalesPersonDto[]> {
        
        const seller = await UserModel.findOne({ id: salesPersonId, role: 'SalesPerson' });
        if (!seller) throw CustomError.notFound('Vendedor no encontrado');

        const clients = await UserModel.find({ salesPerson: seller._id, role: 'Client' });

        return GetClientsBySalesPersonDto.fromModelArray(clients);
    }



}
