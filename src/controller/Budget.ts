import { NextFunction, Request, Response, RequestHandler } from "express";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";

import Errors from "Errors";

const ALLOWED_IMPORT_PROVIDERS = ["ynab"];

/**
 * Validate that requested import provider.
 * Allowed (either lower case, upper case, or mixed):
 *   - ynab
 * Return status 400 (BAD_REQUEST) if provider is invalid / not in the list
 */
const validateImportProvider: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // We suppose that the requested id parameter is the last
  // parameter in the list
  const params = Object.keys(req.params);
  const requestedParameterName = params[params.length - 1];
  const provider = req.params[requestedParameterName];

  if (!ALLOWED_IMPORT_PROVIDERS.includes(provider.toLowerCase())) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: Errors.BUDGET_IMPORT_INVALID_PROVIDER,
    });
  }

  return next();
};

// POST /budget/import/:provider
const importBudget: RequestHandler = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ errors: Errors.BAD_REQUEST });
  }

  // "file" is the expected name of the uploaded file
  // e.g. <input type="file" name="file" />
  if (!req.files || !req.files.file) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ errors: Errors.BUDGET_IMPORT_MISSING_FILE });
  }

  console.log(req.files.file);
  // const { file } = req.files;
  // console.log(file);

  return 0;
};

export default {
  importBudget,
  validateImportProvider,
};
