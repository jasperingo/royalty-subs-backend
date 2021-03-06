import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import passport from 'passport';
import { InternalServerError } from '../../errors/server-error-handler';

export default function PasswordAuthMiddleware(req: Request, res: Response, next: NextFunction) { 
  passport.authenticate(
    'local', 
    (err, user) => {
      if (err !== null) {
        next(InternalServerError(err));
      } else if (user === false) { 
        next(new createHttpError.Unauthorized()); 
      } else {
        req.user = user;
        next();
      }
    }
  )(req, res, next);
}
