/**
 * @openapi
 *  tags:
 *    name: Budget
 *    description: API to manage user's budget.
 */

import express from "express";
import { body } from "express-validator";
import fileUpload from "express-fileupload";

import BudgetController from "controller/Budget";
import Errors from "Errors";

// Router for /budget/ api
const router = express.Router();
const IMPORT_FILE_SIZE_MB = 5;
const IMPORT_FILE_SIZE_BYTES = IMPORT_FILE_SIZE_MB * 1024 * 1024;

router.param("provider", BudgetController.validateImportProvider);

router.use(
  "/import/:provider",
  fileUpload({
    limits: { fileSize: IMPORT_FILE_SIZE_BYTES },
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

router.post(
  "/import/:provider",
  body("file").withMessage(Errors.BUDGET_IMPORT_MISSING_FILE),
  BudgetController.importBudget
);

export default router;
