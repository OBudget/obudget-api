import crypto from "crypto";
import { Request, Response, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

// GET /users/
const getAll: RequestHandler = async (_: Request, res: Response) => {
  res.status(StatusCodes.OK).json([
    {
      id: 1,
      name: "John",
    },
    {
      id: 2,
      name: "James",
    },
  ]);
};

const hashPassword = (password: string, salt: string): string => {
  return crypto
    .pbkdf2Sync(password, salt, 100000, 32, "sha512")
    .toString("hex");
};

export default {
  getAll,
  hashPassword,
};
