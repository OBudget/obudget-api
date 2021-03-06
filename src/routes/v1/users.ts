/**
 * @openapi
 *  tags:
 *    name: Users
 *    description: API to manage users.
 */

/**
 * @openapi
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          - name
 *        properties:
 *          name:
 *            type: string
 *            description: User name
 *          createdAt:
 *            type: string
 *            format: date
 *            description: The date of the record creation.
 *          updatedAt:
 *            type: string
 *            format: date
 *            description: The date when the record was last updated.
 *        example:
 *          _id: 1
 *          name: "John"
 *          createdAt: "2019-09-22T06:00:00.000Z"
 *          updatedAt: "2019-09-22T06:00:00.000Z"
 */

import express from "express";
import { body } from "express-validator";
import OAuthServer from "express-oauth-server";

import OAuthModel from "model/OAuth";
import UserController from "controller/User";

// Router for /users/ api
const router = express.Router();
const oauth = new OAuthServer({
  model: OAuthModel,
});

// Router for /users/

/**
 * @openapi
 *  paths:
 *    /users:
 *      get:
 *        summary: Get a list of users.
 *        tags: [Users]
 *        responses:
 *          '200':
 *            description: A JSON array of all users
 *            content:
 *              application/json:
 *                schema:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/User'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.get("/", oauth.authenticate(), UserController.getAll);

router.post(
  "/",
  body("email").isEmail().normalizeEmail(),
  body("password").isString().notEmpty(),
  body("name").optional().isString(),
  UserController.create
);

export default router;
