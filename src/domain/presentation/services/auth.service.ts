import { JwtAdapter, bcryptAdapter, envs } from '../../../config';
import { UserModel } from '../../../data/mongo/models/user.model';
import { CustomError } from '../../errors/custom.errors';
import { LoginUserDto } from '../../dtos/auth/login-user.dto';
import { RegisterUserDto } from '../../dtos/auth/register-user.dto';
import { EmailService } from './email.service';
import mongoose from 'mongoose';




export class AuthService {

    constructor(
        private readonly emailService: EmailService,
    ) { }


    public async registerUser(registerUserDto: RegisterUserDto) {

        const emailAddresses = registerUserDto.email.map(e => e.emailAddres.toLowerCase().trim());

        const existUser = await UserModel.findOne({
            'email.EmailAddres': { $in: emailAddresses }
        });
        if (existUser) throw CustomError.badRequest('Email already exist');

        try {
            const userModelData = this.registerUserDtoToModel(registerUserDto);
            const user = new UserModel(userModelData);

            user.password = bcryptAdapter.hash(registerUserDto.password);

            await user.save();

            const principalEmail = user.email.find((e: any) => e.IsPrincipal)?.EmailAddres;

            await this.sendEmailValidationLink(principalEmail!);

            const token = await JwtAdapter.generateToken({ id: user.id });
            if (!token) throw CustomError.internalServer('Error while creating JWT');

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

        const isMatching = bcryptAdapter.compare(loginUserDto.password, user.password);
        if (!isMatching) throw CustomError.badRequest('Password is not valid');



        const token = await JwtAdapter.generateToken({ id: user.id });
        if (!token) throw CustomError.internalServer('Error while creating JWT');

        return {
            user: user,
            token: token,
        }

    }


    private sendEmailValidationLink = async (email: string) => {

        const token = await JwtAdapter.generateToken({ email });
        if (!token) throw CustomError.internalServer('Error getting token');

        const link = `${envs.WEBSERVICE_URL}/auth/validate-email/${token}`;
        const html = `
      <h1>Validate your email</h1>
      <p>Click on the following link to validate your email</p>
      <a href="${link}">Validate your email: ${email}</a>
    `;

        const options = {
            to: email,
            subject: 'Validate your email',
            htmlBody: html,
        }

        const isSent = await this.emailService.sendEmail(options);
        if (!isSent) throw CustomError.internalServer('Error sending email');

        return true;
    }


    public validateEmail = async (token: string) => {

        const payload = await JwtAdapter.validateToken(token);
        if (!payload) throw CustomError.unauthorized('Invalid token');

        const { email } = payload as { email: string };
        if (!email) throw CustomError.internalServer('Email not in token');

        const user = await UserModel.findOne({ email });
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
                EmailAddres: e.emailAddres,
                IsPrincipal: e.isPrincipal,
            })),
            phone: dto.phone.map(p => ({
                NumberPhone: p.numberPhone,
                IsPrincipal: p.isPrincipal,
                Indicative: p.indicative,
            })),
            addres: dto.address,
            city: new mongoose.Types.ObjectId(dto.city),
            password: dto.password,
            role: dto.role,
            priceCategory: new mongoose.Types.ObjectId(dto.priceCategory),
            salesPerson: dto.salesPerson ? new mongoose.Types.ObjectId(dto.salesPerson) : undefined,
            clients: dto.clients?.map(c => new mongoose.Types.ObjectId(c)) ?? [],
        };
    }

}

