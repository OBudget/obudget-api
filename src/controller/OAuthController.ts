import { Request, Response, RequestHandler, NextFunction } from "express";

import OAuthModel from "model/OAuth";

// GET /users/
const authorize: RequestHandler = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  const user = await OAuthModel.getUser(req.body.username, req.body.password);

  req.body.user = user;
  delete req.body.username;
  delete req.body.password;

  return next();
};

export default {
  authorize,
};
