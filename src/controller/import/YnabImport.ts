import fs from "fs";
import { StatusCodes } from "http-status-codes";
import { UploadedFile } from "express-fileupload";
import extract from "extract-zip";

import { ValidationResponse } from "controller/utils";
import logger from "logging";
import Errors from "Errors";
import BudgetImport from "./BudgetImport";

export default class YnabImport extends BudgetImport {
  unzippedFolder: string;

  constructor(provider: string, file: UploadedFile) {
    super(provider, file);

    this.unzippedFolder = `${this.file.tempFilePath}_unpacked`;
  }

  unzip = async (filePath: string): Promise<void> => {
    logger.debug("Unzipping YNAB import file...");
    await extract(filePath, { dir: this.unzippedFolder });

    logger.debug("Unzipped successfully. File contents: ");
    const files = fs.readdirSync(this.unzippedFolder);
    logger.debug(JSON.stringify(files, null, 2));
  };

  validate = async (): Promise<ValidationResponse> => {
    try {
      logger.debug("Validating a YNAB import file");
      logger.debug(JSON.stringify(this.file, null, 2));

      if (this.file.mimetype !== "application/zip") {
        this.cleanup();

        return {
          status: StatusCodes.BAD_REQUEST,
          error: Errors.BUDGET_IMPORT_YNAB_UNSUPPORTED_FILE,
        };
      }

      await this.unzip(this.file.tempFilePath);

      const files = fs.readdirSync(this.unzippedFolder);
      const allCsv = files.every((name: string) => {
        return name.endsWith(".csv");
      });
      if (files.length !== 2 && allCsv) {
        this.cleanup();
        return {
          status: StatusCodes.BAD_REQUEST,
          error: Errors.BUDGET_IMPORT_YNAB_WRONG_CONTENT,
        };
      }

      return { status: StatusCodes.OK };
    } catch (e) {
      logger.debug("Caught an exception: ");
      logger.debug(JSON.stringify(e, null, 2));
      this.cleanup();

      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        error: Errors.INTERNAL_SERVER_ERROR,
      };
    }
  };

  run = async (): Promise<void> => {
    try {
      logger.debug("Running a YNAB import");

      if (!fs.existsSync(this.unzippedFolder)) {
        await this.unzip(this.file.tempFilePath);
      }

      this.cleanup();
      return Promise.resolve();
    } catch (e) {
      logger.debug("Caught an exception: ");
      logger.debug(JSON.stringify(e, null, 2));
      this.cleanup();
      return Promise.reject();
    }
  };

  cleanup(): void {
    super.cleanup();

    // Delete the folder if the file has been unpacked
    if (fs.existsSync(this.unzippedFolder)) {
      logger.debug(
        `Deleting the unpacked directory ${this.unzippedFolder} and its contents`
      );
      fs.rmSync(this.unzippedFolder, { recursive: true, force: true });
      logger.debug(`Folder ${this.unzippedFolder} has been deleted.`);
    }
  }
}
