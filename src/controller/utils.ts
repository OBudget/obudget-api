import { StatusCodes } from "http-status-codes";

export interface ValidationResponse {
  status: StatusCodes;
  error?: string;
}
