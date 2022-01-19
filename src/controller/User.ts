import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { Request, Response, RequestHandler } from "express";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";

import Errors from "Errors";
import utils from "utils";
import logger from "logging";

const prisma = new PrismaClient();

const hashPassword = (password: string, salt: string): string => {
  return crypto
    .pbkdf2Sync(password, salt, 100000, 32, "sha512")
    .toString("hex");
};

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

// POST /users/
const create: RequestHandler = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ errors: Errors.BAD_REQUEST });
  }

  const data = req.body;
  const version = utils.extractVersionFromUrl(req.originalUrl);

  try {
    const salt = crypto.randomBytes(16).toString("hex");

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashPassword(data.password, salt),
        salt,
      },
    });

    logger.debug("User has been created: ");
    logger.debug(JSON.stringify(user, null, 2));

    return res
      .status(StatusCodes.CREATED)
      .set("Location", `/${version}/users/${user.id}`)
      .json(user);
  } catch (error) {
    logger.debug("Cannot create a user");
    logger.debug(error);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: Errors.USERS_COULD_NOT_CREATE });
  }
};

export default {
  getAll,
  create,
  hashPassword,
};
