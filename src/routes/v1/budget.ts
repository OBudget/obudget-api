/**
 * @openapi
 *  tags:
 *    name: Budget
 *    description: API to manage user's budget.
 */

import express from "express";
import fileUpload from "express-fileupload";

import BudgetController from "controller/Budget";

// Router for /budget/ api
const router = express.Router();
const IMPORT_FILE_SIZE_MB = 5;
const IMPORT_FILE_SIZE_BYTES = IMPORT_FILE_SIZE_MB * 1024 * 1024;

router.param("provider", BudgetController.validateImportProvider);

router.use(
  "/import/:provider",
  fileUpload({
    limits: { fileSize: IMPORT_FILE_SIZE_BYTES },
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: "/tmp/",
    safeFileNames: true,
    debug: process.env.NODE_ENV === "development",
  })
);

router.post("/import/:provider", BudgetController.importBudget);

export default router;
