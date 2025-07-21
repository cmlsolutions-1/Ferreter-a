import { OfferModel } from '../../../data/mongo/models/offer.model';
import { offerProductModel } from '../../../data/mongo/models/offerProduct.model';
import { CustomError } from '../../errors/custom.errors';
import { CreateOfferDto } from '../../dtos/offer/create-offer.dto';
import { UpdateOfferDto } from '../../dtos/offer/update-offer.dto';
import { ListOfferDto } from '../../dtos/offer/list-offer-by-id';
import { GetOfferByIdDto } from '../../dtos/offer/get-offer-by-id';
import { InactivateOfferDto } from '../../dtos/offer/inactive-offer.dto';
import mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';

export class OfferService {

    public async createOffer(createOfferDto: CreateOfferDto) {
        const {
            id,
            percentage,
            minimumQuantity,
            startDate,
            endDate,
            typePackage,
            isAll,
            finishDate,
            state = 'Active',
            productIds = [],
        } = createOfferDto;


        const existOffer = await OfferModel.findOne({ id });
        if (existOffer) throw CustomError.badRequest('Ya existe una oferta con ese ID');

        const session = await mongoose.startSession();
        session.startTransaction();

        try {

            const offer = new OfferModel({
                id,
                percentage,
                minimumQuantity,
                startDate,
                endDate,
                finishDate,
                typePackage,
                isAll,
                state,
            });

            await offer.save({ session });


            if (!isAll) {
                const offerProductDocs = productIds.map(productId => ({
                    id: uuid(),
                    idOffer: offer._id,
                    idProduct: productId,
                }));

                await offerProductModel.insertMany(offerProductDocs, { session });
            }

            await session.commitTransaction();
            session.endSession();

            return {
                message: 'Oferta creada correctamente',
                offer,
            };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw CustomError.internalServer(`Error al crear la oferta: ${error}`);
        }
    }

    public async updateOffer(offerId: string, updateOfferDto: UpdateOfferDto) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const offer = await OfferModel.findOne({ id: offerId }).session(session);
            if (!offer) throw CustomError.notFound('Oferta no encontrada');


            const updatableFields: (keyof UpdateOfferDto)[] = [
                'percentage', 'minimumQuantity', 'startDate',
                'endDate', 'typePackage', 'state', 'isAll'
            ];

            for (const field of updatableFields) {
                if (updateOfferDto[field] !== undefined) {
                    (offer as any)[field] = updateOfferDto[field];
                }
            }

            await offer.save({ session });


            if (updateOfferDto.isAll === false) {

                await offerProductModel.deleteMany({ idOffer: offer._id }).session(session);


                const newProducts = updateOfferDto.productIds!.map(productId => ({
                    id: uuid(),
                    idOffer: offer._id,
                    idProduct: productId,
                }));

                await offerProductModel.insertMany(newProducts, { session });
            }

            await session.commitTransaction();
            session.endSession();

            return {
                message: 'Oferta actualizada exitosamente',
                offer,
            };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw CustomError.internalServer(`Error al actualizar la oferta: ${error}`);
        }
    }

    public async listOffers(): Promise<ListOfferDto[]> {
        try {
            const offers = await OfferModel.find().lean();

            return ListOfferDto.fromModelArray(offers);

        } catch (error) {
            throw CustomError.internalServer(`Error al obtener las ofertas: ${error}`);
        }
    }

    public async getOfferById(offerId: string): Promise<GetOfferByIdDto> {
        try {
            const offer = await OfferModel.findOne({ id: offerId }).lean();
            if (!offer) throw CustomError.notFound('La oferta no existe');

            let offerProducts: any[] = [];
            if (!offer.isAll) {
                offerProducts = await offerProductModel
                    .find({ idOffer: offer._id })
                    .populate('idProduct')
                    .lean();
            }

            return GetOfferByIdDto.fromModel(offer, offerProducts);

        } catch (error) {
            throw CustomError.internalServer(`Error al obtener la oferta: ${error}`);
        }
    }

    public async inactivateOffer(offerId: string, dto: InactivateOfferDto) {
        try {
            const offer = await OfferModel.findOne({ id: offerId });
            if (!offer) throw CustomError.notFound('La oferta no existe');
            if (offer.state === dto.state) {
                return {
                    message: `La oferta ya se encuentra en estado "${dto.state}"`,
                };
            }

            offer.state = dto.state;
            await offer.save();

            return {
                message: `Oferta ${dto.state === 'Inactive' ? 'inactivada' : 'activada'} correctamente`,
                offer,
            };

        } catch (error) {
            throw CustomError.internalServer(`Error al actualizar el estado de la oferta: ${error}`);
        }
    }

}
