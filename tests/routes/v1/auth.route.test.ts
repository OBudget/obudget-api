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

  await prisma.oAuthClient.create({
    data: {
      clientId: "client-id",
      clientSecret: "client-secret",
      grants: ["password"],
    },
  });

  logger.info("✨ 1 OAuth client successfully created!");
});

afterAll(async () => {
  const deleteUsers = prisma.user.deleteMany();
  const deleteOAuthClients = prisma.oAuthClient.deleteMany();
  const deleteOAuthCodes = prisma.oAuthAuthorizationCode.deleteMany();
  const deleteOAuthTokens = prisma.oAuthAccessToken.deleteMany();

  await prisma.$transaction([
    deleteUsers,
    deleteOAuthClients,
    deleteOAuthCodes,
    deleteOAuthTokens,
  ]);

  await prisma.$disconnect();
});

describe("OAuth authentication", () => {
  it("Should authenticate a user by valid username/password", async () => {
    const res = await request(app).post("/v1/auth/token").send({
      grant_type: "password",
      username: "mail@mail.com",
      password: "12345",
      client_id: "client-id",
    });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    logger.debug(res.body);
    expect(res.body).toMatchObject({});
  });
});
