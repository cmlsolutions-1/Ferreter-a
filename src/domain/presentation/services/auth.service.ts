import { JwtAdapter, bcryptAdapter, envs } from '../../../config';
import { UserModel } from '../../../data/mongo/models/user.model';
import { CustomError } from '../../errors/custom.errors';
import { LoginUserDto } from '../../dtos/auth/login-user.dto';
import { RegisterUserDto } from '../../dtos/auth/register-user.dto';
import { EmailService } from './email.service';
import mongoose from 'mongoose';
import { PriceCategoryService } from './price.category.service';




export class AuthService {

    constructor(
        private readonly emailService: EmailService,
        private readonly priceCategoryService: PriceCategoryService
    ) { }


    public async registerUser(registerUserDto: RegisterUserDto) {

        const emailAddresses = registerUserDto.email.map(e => e.EmailAddres.toLowerCase().trim());

        const existUser = await UserModel.findOne({
            'email.EmailAddres': { $in: emailAddresses }
        });

        if (existUser) throw CustomError.badRequest('Email ya existe');

        if (registerUserDto.role === 'Client'){
            await this.priceCategoryService.getPriceCategoryById(registerUserDto.priceCategory);
            const existeSalesPerson = await UserModel.findById(registerUserDto.salesPerson);
            if (!existeSalesPerson) throw CustomError.notFound('Vendedor no encontrado');
        }
        else{
            registerUserDto.salesPerson = undefined;
            registerUserDto.priceCategory = undefined;
        }

        try {
            const userModelData = this.registerUserDtoToModel(registerUserDto);
            const user = new UserModel(userModelData);

            user.password = bcryptAdapter.hash(registerUserDto.password);

            await user.save();

            const principalEmail = user.email.find((e: any) => e.IsPrincipal)?.EmailAddres;

            await this.sendEmailValidationLink(principalEmail!);

            const token = await JwtAdapter.generateToken({ _id: user._id, role: user.role, priceCategoryService: user.priceCategory, email: principalEmail, name: user.name, id: user.id });
            if (!token) throw CustomError.internalServer('Error Mientras se crea el JWT');

            return {
                user: user,
                token: token,
            };

        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }

    }


    public async loginUser(loginUserDto: LoginUserDto) {

        const user = await UserModel.findOne({
            email: {
                $elemMatch: {
                    EmailAddres: loginUserDto.email,
                    IsPrincipal: true
                }
            }
        });


        if (!user) throw CustomError.badRequest('Email not exist');

        if(user.emailValidated === false) throw CustomError.unauthorized('El usuario no ha validado su correo');

        const isMatching = bcryptAdapter.compare(loginUserDto.password, user.password);
        if (!isMatching) throw CustomError.badRequest('Password is not valid');



        const token = await JwtAdapter.generateToken({ _id: user._id, role: user.role, priceCategory: user.priceCategory, email: loginUserDto.email, name: user.name, id: user.id });
        if (!token) throw CustomError.internalServer('Error while creating JWT');

        return {
            user: user,
            token: token,
        }

    }


    private sendEmailValidationLink = async (email: string) => {

        console.log('Sending email to:', email);
        const token = await JwtAdapter.generateToken({ email });
        if (!token) throw CustomError.internalServer('Error getting token');

        const link = `${envs.WEBSERVICE_URL}/auth/validate-email/${token}`;
        const html = `
      <h1>Validar tu correo</h1>
      <p>Presiona click en el siguiente enlace para validar tu correo</p>
      <a href="${link}">Validate your email: ${email}</a>
    `;

        const options = {
            to: email,
            subject: 'Validate your email',
            htmlBody: html,
        }

        const isSent = await this.emailService.sendEmail(options);
        console.log('Email sent status:', isSent);
        if (!isSent) throw CustomError.internalServer('Error sending email');

        return true;
    }


    public validateEmail = async (token: string) => {

        const payload = await JwtAdapter.validateToken(token);
        if (!payload) throw CustomError.unauthorized('Invalid token');

        const { email } = payload as { email: string };
        if (!email) throw CustomError.internalServer('Email not in token');

        const user = await UserModel.findOne({
            email: {
                $elemMatch: {
                    EmailAddres: email,
                    IsPrincipal: true
                }
            }
        });
        if (!user) throw CustomError.internalServer('Email not exists');

        user.emailValidated = true;
        await user.save();

        return true;
    }

    private registerUserDtoToModel(dto: RegisterUserDto): any {
        return {
            id: dto.id,
            name: dto.name,
            lastName: dto.lastName,
            email: dto.email.map(e => ({
                EmailAddres: e.EmailAddres,
                IsPrincipal: e.IsPrincipal,
            })),
            phone: dto.phone.map(p => ({
                NumberPhone: p.NumberPhone,
                IsPrincipal: p.IsPrincipal,
                Indicative: p.Indicative,
            })),
            addres: dto.address,
            city: new mongoose.Types.ObjectId(dto.city),
            password: dto.password,
            role: dto.role,
            priceCategory: dto.priceCategory ? new mongoose.Types.ObjectId(dto.priceCategory): undefined,
            salesPerson: dto.salesPerson ? new mongoose.Types.ObjectId(dto.salesPerson) : undefined,
            // clients: dto.clients?.map(c => new mongoose.Types.ObjectId(c)) ?? [],
        };
    }

}

