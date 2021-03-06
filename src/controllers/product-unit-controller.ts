import { NextFunction, Request, Response } from 'express';
import statusCode from 'http-status';
import ResponseDTO from '../dtos/response-dto';
import { InternalServerError } from '../errors/server-error-handler';
import ProductUnitRepository from '../repositories/product-unit-repository';

const ProductUnitController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductUnitRepository.create(req.body);

      const productUnit = await ProductUnitRepository.findById(result.id);

      res.status(statusCode.CREATED)
        .send(ResponseDTO.success('Product unit created', productUnit));
    } catch(error) {
      next(InternalServerError(error));
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.data.productUnit;

      req.body.id = id;

      await ProductUnitRepository.update(req.body);

      const productUnit = await ProductUnitRepository.findById(id);

      res.status(statusCode.OK)
        .send(ResponseDTO.success('Product unit updated', productUnit));
    } catch(error) {
      next(InternalServerError(error));
    }
  },

  readOne(req: Request, res: Response) {
    res.status(statusCode.OK)
      .send(ResponseDTO.success('Product unit fetched', req.data.productUnit));
  },
};

export default ProductUnitController;
