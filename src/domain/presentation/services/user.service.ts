import { UserModel } from '../../../data/mongo/models/user.model';
import { UpdateUserDto } from '../../dtos/user/update-user.dto';
import { CustomError } from '../../errors/custom.errors';
import { DeleteUserDto } from '../../dtos/user/delete-user.dto';
import { GetUserByIdDto } from '../../dtos/user/get-user-by-id.dto';
import { ListUserDto } from '../../dtos/user/list-user.dto';
import { GetClientsBySalesPersonDto } from '../../dtos/user/get-clientes-byvendedor.dto';
import mongoose from 'mongoose';
import { ViewUserDto } from '../../dtos/user/get-user-role.dto';

export class UserService {

    public async updateUser(dto: UpdateUserDto) {

        try {
            const user = await UserModel.findOne({ _id: dto._id });
            if (!user) throw CustomError.notFound('Usuario no encontrado');


            if(user.role === 'Client'){
                const salesPerson = await UserModel.findOne({ _id: dto.idSalesPerson });
                if(!salesPerson) throw CustomError.notFound('Vendedor no encontrado');
                if(salesPerson.role !== 'SalesPerson') throw CustomError.badRequest('El usuario no es un vendedor');
                user.salesPerson = new mongoose.Types.ObjectId(dto.idSalesPerson) ;  

            } 

            if (dto.name !== undefined) user.name = dto.name;
            if (dto.lastName !== undefined) user.lastName = dto.lastName;

            if (dto.email) {
                console.log('Updating user email:', dto.email);
                user.set('email', dto.email.map(e => ({
                    EmailAddres: e.EmailAddress,
                    IsPrincipal: e.IsPrincipal,
                })));
            }

            if (dto.phone) {
                user.set('phone', dto.phone.map(p => ({
                    NumberPhone: p.NumberPhone,
                    IsPrincipal: p.IsPrincipal,
                    Indicative: p.Indicative,
                })));
            }

            if (dto.address !== undefined) user.addres = dto.address;
            if (dto.city !== undefined) user.city = new mongoose.Types.ObjectId(dto.city);
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

        const user = await UserModel.findOne({ _id: dto._id });
        if (!user) throw CustomError.notFound('Usuario no encontrado');

        user.state = "Inactive";

        await user.save();

        return {
            message: `Usuario Eliminado correctamente`,
            userId: user._id,
        };
    }

    public async getUserById(userId: string): Promise<GetUserByIdDto> {
        const user = await UserModel.findOne({ _id: userId, state: "Active" })
            // .populate('city', '_id')
            .populate('salesPerson', '_id')
            .populate('clients', '_id')
        // .populate('priceCategory', '_id');

        if (!user) throw CustomError.notFound('Usuario no encontrado');

        return GetUserByIdDto.fromModel(user);
    }

    public async getAllUsers(): Promise<ListUserDto[]> {
        // const users = await UserModel.find().populate('city', '_id');
        const users = await UserModel.find({ state: "Active" });

        return ListUserDto.fromModelArray(users);
    }

    public async getClientsBySalesPersonId(salesPersonId: string): Promise<GetClientsBySalesPersonDto[]> {

        const seller = await UserModel.findOne({ _id: salesPersonId, role: 'SalesPerson',  state: "Active" });
        if (!seller) throw CustomError.notFound('Vendedor no encontrado');

        const clients = await UserModel.find({ salesPerson: seller._id, role: 'Client' });

        return GetClientsBySalesPersonDto.fromModelArray(clients);
    }

    public async getUserRole(userId: string): Promise<string> {
        const user = await UserModel.findOne({ _id: userId, state: "Active" });
        if (!user) throw CustomError.notFound('Usuario no encontrado');

        return user.role;

    } 
    public async getUsersByRole(role: string): Promise<ViewUserDto[]> {
        try {
            // const users = await UserModel.find({ role }).populate('city', '_id');
            console.log(role);
            const users = await UserModel.find({ role , state: "Active" });
            return ViewUserDto.fromModelArray(users);
        } catch (error) {
            throw CustomError.internalServer(`Error al obtener usuarios por rol: ${error}`);
        }
    }

}
