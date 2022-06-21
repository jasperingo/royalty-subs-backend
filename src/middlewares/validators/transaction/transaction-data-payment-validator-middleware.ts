import { NextFunction, Request, Response } from 'express';
import { checkSchema, Schema, validationResult } from 'express-validator';
import { ValidationBadRequest } from '../../../errors/validation-error-handler';
import ProductUnitRepository from '../../../repositories/product-unit-repository';
import TransactionRepository from '../../../repositories/transaction-repository';
import { notEmpty, isNumeric, isMobilePhone, isMobilePhoneLength } from '../validation-contraints';

const schema: Schema = {
  productUnitId: { 
    notEmpty,

    isNumeric,

    custom: {
      async options(value, { req }) {
        const unit = await ProductUnitRepository.findById(value);

        if (unit === null) 
          throw 'Field is invalid';
        else if (!unit.available)
          throw 'Field is unavailable';

        const balance = await TransactionRepository.sumAmountByUserIdAndStatus(req.user.id);
        
        if (unit.price > balance) 
          throw 'Field price is above transactions balance';

        req.data.productUnit = unit;
      }
    }
  },

  phoneNumber: {
    notEmpty,

    isMobilePhone,

    isLength: isMobilePhoneLength,
  }
};

export default async function TransactionDataPaymentValidatorMiddleware(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  try {

    await checkSchema(schema).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw ValidationBadRequest(errors);
    }

    next();
  } catch(error) {
    next(error);
  }
}
