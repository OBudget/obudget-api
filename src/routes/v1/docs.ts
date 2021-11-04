import express from "express";
import helmet from "helmet";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// Parse Swagger configuration file
import swaggerDocument from "swagger";

const router = express.Router();

// Allow usage of styles and scripts on the docs page
router.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "font-src": ["'self'"],
        "img-src": ["'self'", "data:"],
        "style-src": ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

router.use("/", swaggerUi.serve);
const swaggerSpecs = swaggerJsdoc(swaggerDocument);
router.get(
  "/",
  swaggerUi.setup(swaggerSpecs, {
    explorer: true,
  })
);

export default router;
