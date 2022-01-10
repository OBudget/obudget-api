/**
 * @openapi
 *  tags:
 *    name: Authentication
 *    description: API to authenticate users and clients.
 */

/**
 * @openapi
 *  components:
 *    schemas:
 *      Token:
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
import OAuthServer from "express-oauth-server";

import OAuthModel from "model/OAuth";

// Router for /users/ api
const router = express.Router();
const oauth = new OAuthServer({
  model: OAuthModel,
});

// Router for /users/

/**
 * @openapi
 *  paths:
 *    /token:
 *      post:
 *        summary: Request an access token
 *        tags: [Authentication]
 *        responses:
 *          '200':
 *            description: Access token object
 *            content:
 *              application/json:
 *                schema:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Token'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.post("/token", oauth.token());

export default router;
