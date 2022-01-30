import { UploadedFile } from "express-fileupload";

import BudgetImport from "./BudgetImport";
import YnabImport from "./YnabImport";

const getBudgetImportController = (
  provider: string,
  file: UploadedFile
): BudgetImport => {
  if (provider === "ynab") {
    return new YnabImport(provider, file);
  }

  return new BudgetImport(provider, file);
};

export default {
  getBudgetImportController,
};
