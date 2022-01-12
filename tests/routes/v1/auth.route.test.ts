import request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "server";
import { PrismaClient } from "@prisma/client";

import logger from "logging";
import UserController from "controller/User";

const prisma = new PrismaClient();

beforeAll(async () => {
  // create product categories
  await prisma.user.create({
    data: {
      email: "mail@mail.com",
      password: UserController.hashPassword("12345", "pass_salt"),
      salt: "pass_salt",
    },
  });

  logger.info("✨ 1 user successfully created!");

  await prisma.oAuthClient.createMany({
    data: [
      {
        clientId: "client-id",
        clientSecret: "client-secret",
        grants: ["password"],
      },
      {
        clientId: "client-id-2",
        clientSecret: "client-secret-2",
        grants: ["authorization_code", "client_credentials"],
        redirectUris: ["https://localohost:12345/callback"],
      },
    ],
  });

  logger.info("✨ 2 OAuth clients successfully created!");
});

afterAll(async () => {
  const deleteUsers = prisma.user.deleteMany();
  const deleteOAuthClients = prisma.oAuthClient.deleteMany();
  const deleteOAuthCodes = prisma.oAuthAuthorizationCode.deleteMany();
  const deleteOAuthTokens = prisma.oAuthAccessToken.deleteMany();

  await prisma.$transaction([
    deleteOAuthTokens,
    deleteOAuthCodes,
    deleteOAuthClients,
    deleteUsers,
  ]);

  await prisma.$disconnect();
});

describe("OAuth authentication", () => {
  it("Should authenticate a user using authorization code flow", async () => {
    const res = await request(app).post("/v1/auth").type("form").send({
      response_type: "code",
      client_id: "client-id-2",
      scope: "profile, photos",
      state: "state-hash",
      username: "mail@mail.com",
      password: "12345",
    });

    // Firstly, the auth code is redirected to a callback url
    expect(res.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
    expect(res.type).toBe("text/plain");

    const { location } = res.header;
    expect(location).toMatch(
      /.*(\/callback\?code=)([a-f\d]{40})&state=state-hash$/
    );

    const codeStart = location.indexOf("code=") + 5;
    const codeEnd = location.indexOf("&state=");
    const code: string = res.headers.location.slice(codeStart, codeEnd);

    // Secondly, use the code to make a token request
    const resToken = await request(app)
      .post("/v1/auth/token")
      .type("form")
      .send({
        grant_type: "authorization_code",
        code,
        redirect_uri: "https://localohost:12345/callback",
        client_id: "client-id-2",
        client_secret: "client-secret-2",
      });

    expect(resToken.body).toMatchObject({
      access_token: expect.any(String),
      token_type: "Bearer",
      expires_in: expect.any(Number),
      refresh_token: expect.any(String),
      scope: ["profile", "photos"],
    });
  });

  it("Should authenticate a user by valid username/password", async () => {
    const res = await request(app).post("/v1/auth/token").type("form").send({
      grant_type: "password",
      username: "mail@mail.com",
      password: "12345",
      client_id: "client-id",
    });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      access_token: expect.any(String),
      token_type: "Bearer",
      expires_in: expect.any(Number),
      refresh_token: expect.any(String),
      scope: expect.any(Array),
    });
  });

  it("Should fail authentication if grant type is not allowed", async () => {
    const res = await request(app).post("/v1/auth/token").type("form").send({
      grant_type: "password",
      username: "mail@mail.com",
      password: "12345",
      client_id: "client-id-2",
    });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "unauthorized_client",
      error_description: "Unauthorized client: `grant_type` is invalid",
    });
  });

  it("Should authenticate a client by client credentials", async () => {
    const res = await request(app).post("/v1/auth/token").type("form").send({
      grant_type: "client_credentials",
      client_id: "client-id-2",
      client_secret: "client-secret-2",
    });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      access_token: expect.any(String),
      token_type: "Bearer",
      expires_in: expect.any(Number),
      scope: expect.any(Array),
    });
  });
});
