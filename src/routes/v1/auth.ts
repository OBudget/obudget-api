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
 *        properties:
 *          access_token:
 *            type: string
 *            description: Access token
 *          token_type:
 *            type: string
 *            description: Token type, for example "Bearer"
 *          expires_in:
 *            type: number
 *            description: Amount of seconds after each the token will expire
 *          refresh_token:
 *            type: string
 *            description: Refresh token, optional
 *          scope:
 *            type: array
 *            description: Requested scope which a user/client will get access to
 *        example:
 *          access_token: RsT5OjbzRn430zqMLgV3Ia
 *          token_type: Bearer
 *          expires_in: 3600
 *          scope: ["profile", "photos"]
 *
 *      AuthCode:
 *        type: object
 *        properties:
 *          code:
 *            type: string
 *            description: Authorization code
 *          state:
 *            type: string
 *            description: State, usually a random string generated by client.
 *                         Should be compared against the client's request
 *        example:
 *          code: abc24cb24b52e02721df
 *          state: 1234zyx
 */

import express, { Request, Response } from "express";
import OAuthServer from "express-oauth-server";

import OAuthController from "controller/OAuth";
import OAuthModel from "model/OAuth";

// Router for /auth/ endpoint
const router = express.Router();
const oauth = new OAuthServer({
  model: OAuthModel,
});

/**
 * @openapi
 *  paths:
 *    /auth:
 *      post:
 *        summary: Request an authorization code
 *        tags: [Authentication]
 *        responses:
 *          '200':
 *            description: Authorization code object
 *            content:
 *              application/json:
 *                schema:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/AuthCode'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.post(
  "/",
  OAuthController.authorize,
  oauth.authorize({
    authenticateHandler: {
      handle: (req: Request, _res: Response) => {
        return req.body.user;
      },
    },
  })
);

/**
 * @openapi
 *  paths:
 *    /auth/token:
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
router.post(
  "/token",
  oauth.token({
    requireClientAuthentication: {
      authorization_code: false,
      refresh_token: false,
      password: false,
    },
  })
);

export default router;
