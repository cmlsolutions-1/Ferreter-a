import { Request, Response, NextFunction } from 'express';
import { OfferService } from '../services/offer.service';
import { CreateOfferDto } from '../../dtos/offer/create-offer.dto';
import { UpdateOfferDto } from '../../dtos/offer/update-offer.dto';
import { InactivateOfferDto } from '../../dtos/offer/inactive-offer.dto';

export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  createOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [err, dto] = CreateOfferDto.create(req.body);
      if (err) return res.status(400).json({ error: true, message: err });

      const result = await this.offerService.createOffer(dto!);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const [err, dto] = UpdateOfferDto.create(req.body);
      if (err) return res.status(400).json({ error: true, message: err });

      const result = await this.offerService.updateOffer(id, dto!);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listOffers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const offers = await this.offerService.listOffers();
      return res.status(200).json(offers);
    } catch (error) {
      next(error);
    }
  };

  getOfferById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const offer = await this.offerService.getOfferById(id);
      return res.status(200).json(offer);
    } catch (error) {
      next(error);
    }
  };

  inactivateOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const [err, dto] = InactivateOfferDto.create(req.body);
      if (err) return res.status(400).json({ error: true, message: err });

      const result = await this.offerService.inactivateOffer(id, dto!);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  offersExpired = async (req: Request, res: Response, next: NextFunction) => {
    try {
      
      const result = await this.offerService.expireOffers();

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
