import fs from "fs";
import { ValidationResponse } from "controller/utils";
import Errors from "Errors";
import { UploadedFile } from "express-fileupload";
import { StatusCodes } from "http-status-codes";
import logger from "logging";

export default class BudgetImport {
  provider = "";

  file: UploadedFile;

  constructor(provider: string, file: UploadedFile) {
    this.provider = provider;
    this.file = file;
  }

  validate = async (): Promise<ValidationResponse> => {
    return {
      status: StatusCodes.BAD_REQUEST,
      error: Errors.BUDGET_IMPORT_INVALID_PROVIDER,
    };
  };

  run = async (): Promise<void> => {
    return Promise.reject();
  };

  cleanup(): void {
    // Delete the original file if exists
    if (fs.existsSync(this.file.tempFilePath)) {
      logger.debug(
        `Deleting uploaded file ${this.file.tempFilePath}. Original name: ${this.file.name}`
      );
      fs.unlinkSync(this.file.tempFilePath);
      logger.debug(`File ${this.file.tempFilePath} has been deleted.`);
    }
  }
}
