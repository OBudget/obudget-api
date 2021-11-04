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

export default {
  getAll,
};
