import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import helmet from "helmet";

import V1Router from "routes/v1";

const app = express();

app.use(cors({ origin: true }));

// Configure helmet security best practices
app.use(helmet());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set the API version to v1 by default
app.use("/v1", V1Router);

export default app;
