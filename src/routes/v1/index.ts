/**
 * Generic API schemas, such as errors
 * @openapi
 *  components:
 *    responses:
 *      BadRequest:
 *        description: Bad request. Invalid request data.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *            example:
 *              error: "Bad request. Check your request data."
 *      NotFound:
 *        description: The specified resource was not found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *            example:
 *              error: "Resource not found."
 *      Unauthorized:
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *            example:
 *              error: "Not authorized."
 *    schemas:
 *      Error:
 *        type: object
 *        properties:
 *          error:
 *            type: string
 *        required:
 *          - error
 */

import express from "express";

import DocsRouter from "routes/v1/docs";
import OAuthRouter from "routes/v1/auth";
import UserRouter from "routes/v1/users";

// Router for /v1/ api
const router = express.Router();

// Define API routes
router.use("/docs", DocsRouter);
router.use("/auth", OAuthRouter);
router.use("/users", UserRouter);

export default router;
