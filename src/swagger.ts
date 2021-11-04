export default {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "OBudget API Documentation",
      version: "1.0.0",
      description: "REST API for free and open source budgeting",
      license: {
        name: "MIT",
        url: "https://github.com/OBudget/obudget-api/blob/main/LICENSE",
      },
      contact: {
        name: "OBudget",
        url: "https://github.com/OBudget/obudget-api",
      },
    },
    servers: [
      {
        url: "http://localhost:8080/v1/",
        description: "OBudget API server version 1.x",
      },
    ],
  },
  apis: ["./src/routes/**/*.ts"],
};
