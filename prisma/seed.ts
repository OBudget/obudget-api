import { PrismaClient } from "@prisma/client";

import logger from "logging";
import UserController from "controller/User";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      {
        email: "mail@mail.com",
        password: UserController.hashPassword("12345", "pass_salt"),
        salt: "pass_salt",
      },
    ],
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
      {
        clientId: "client-id-3",
        grants: ["refresh_token"],
      },
      {
        clientId: "webclientid",
        grants: ["password"],
      },
    ],
  });

  logger.info("✨ 4 OAuth clients successfully created!");

  await prisma.oAuthAccessToken.create({
    data: {
      accessToken: "e63ea45bd4f897c4e4206a413f86d668e639bb5d",
      refreshToken: "8aa4307dde8737745ba1fa0923feddd0df3fc5df",
      scope: ["videos"],
      client: { connect: { clientId: "client-id-3" } },
      user: { connect: { email: "mail@mail.com" } },
    },
  });

  logger.info("✨ 1 OAuth token successfully created!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
