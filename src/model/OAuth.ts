import {
  PrismaClient,
  OAuthClient,
  OAuthAccessToken,
  OAuthAuthorizationCode,
  User as OAuthUser,
} from "@prisma/client";

import UserController from "controller/User";

const prisma = new PrismaClient();

/**
 * An interface representing the user.
 * A user object is completely transparent to oauth2-server
 * and is simply used as input to model functions.
 */
interface User {
  [key: string]: any;
}

/**
 * An interface representing the client and associated data
 */
interface Client {
  id: string;
  clientSecret?: string;
  redirectUris?: string | string[] | undefined;
  grants: string | string[];
  accessTokenLifetime?: number | undefined;
  refreshTokenLifetime?: number | undefined;
  [key: string]: any;
}

/**
 * An interface representing the authorization code and associated data.
 */
interface AuthorizationCode {
  authorizationCode: string;
  expiresAt: Date;
  redirectUri: string;
  scope?: string | string[] | undefined;
  client: Client;
  user: User;
  [key: string]: any;
}

/**
 * An interface representing the token(s) and associated data.
 */
interface Token {
  accessToken: string;
  accessTokenExpiresAt?: Date | undefined;
  refreshToken?: string | undefined;
  refreshTokenExpiresAt?: Date | undefined;
  scope?: string | string[] | undefined;
  client: Client;
  user: User;
  [key: string]: any;
}

/**
 * An interface representing the refresh token and associated data.
 */
interface RefreshToken {
  refreshToken: string;
  refreshTokenExpiresAt?: Date | undefined;
  scope?: string | string[] | undefined;
  client: Client;
  user: User;
  [key: string]: any;
}

type Falsey = "" | 0 | false | null | undefined;
type OAuthAccessTokenType = OAuthAccessToken & {
  client: OAuthClient;
  user: OAuthUser | null;
};
type OAuthAuthorizationCodeType = OAuthAuthorizationCode & {
  client: OAuthClient;
  user: OAuthUser;
};

const convertDbClient = (client: OAuthClient): Client => {
  const result: Client = {
    id: client.clientId,
    redirectUris: client.redirectUris,
    grants: client.grants,
  };

  // Add missing keys from the original object
  Object.entries(client).forEach(([key, value]) => {
    if (!(key in result)) {
      result[key] = value;
    }
  });

  return result;
};

const convertDbAccessToken = (token: OAuthAccessTokenType): Token | Falsey => {
  const result: Token = {
    accessToken: token.accessToken,
    user: token.user || {},
    client: convertDbClient(token.client),
  };

  // Add missing keys from the original object
  Object.entries(token).forEach(([key, value]) => {
    if (!(key in result)) {
      result[key] = value;
    }
  });

  return result;
};

const convertDbRefreshToken = (
  token: OAuthAccessTokenType
): RefreshToken | Falsey => {
  if (!token.refreshToken) {
    return false;
  }

  const result: RefreshToken = {
    refreshToken: token.refreshToken,
    user: token.user || {},
    client: convertDbClient(token.client),
  };

  // Add missing keys from the original object
  Object.entries(token).forEach(([key, value]) => {
    if (!(key in result)) {
      result[key] = value;
    }
  });

  return result;
};

const convertDbAuthCode = (
  code: OAuthAuthorizationCodeType
): AuthorizationCode | Falsey => {
  const result: AuthorizationCode = {
    authorizationCode: code.authorizationCode,
    expiresAt: code.expiresAt,
    redirectUri: code.redirectUri,
    user: code.user,
    client: convertDbClient(code.client),
  };

  // Add missing keys from the original object
  Object.entries(code).forEach(([key, value]) => {
    if (!(key in result)) {
      result[key] = value;
    }
  });
  return result;
};

interface ClientParameters {
  clientId: string;
  clientSecret?: string;
}

export default {
  getAccessToken: async (accessToken: string): Promise<Token | Falsey> => {
    const token = await prisma.oAuthAccessToken.findFirst({
      where: { accessToken },
      include: { user: true, client: true },
    });

    if (!token) {
      return false;
    }

    return convertDbAccessToken(token);
  },

  getRefreshToken: async (
    refreshToken: string
  ): Promise<RefreshToken | Falsey> => {
    const token = await prisma.oAuthAccessToken.findFirst({
      where: { refreshToken },
      include: { user: true, client: true },
    });

    if (!token) {
      return false;
    }

    return convertDbRefreshToken(token);
  },

  getAuthorizationCode: async (
    authorizationCode: string
  ): Promise<AuthorizationCode | Falsey> => {
    const code = await prisma.oAuthAuthorizationCode.findFirst({
      where: { authorizationCode },
      include: { user: true, client: true },
    });

    if (!code) {
      return false;
    }

    return convertDbAuthCode(code);
  },

  getClient: async (
    clientId: string,
    clientSecret: string
  ): Promise<Client | Falsey> => {
    const params: ClientParameters = { clientId };

    if (clientSecret) {
      params.clientSecret = clientSecret;
    }

    const client: OAuthClient | null = await prisma.oAuthClient.findUnique({
      where: params,
    });

    if (!client) {
      return false;
    }

    return convertDbClient(client);
  },

  getUser: async (
    username: string,
    password: string
  ): Promise<User | Falsey> => {
    const user: OAuthUser | null = await prisma.user.findUnique({
      where: { email: username },
    });

    if (!user) {
      return false;
    }

    const { salt } = user;
    const hashedPassword: string = UserController.hashPassword(password, salt);

    if (hashedPassword !== user.password) {
      return false;
    }

    return user;
  },

  /**
   * Only used on client credentials grant and we return empty object.
   * This is so when securing a route like user registration, forgot-password,
   * and etc. we don’t get any user from the request and think someone has
   * actually logged in. For resources like account profile where we need
   * a user to login, we user authorization grant or password grant.
   */
  getUserFromClient: (_client: Client): Promise<User | Falsey> => {
    return new Promise<User>((resolve) => {
      resolve({});
    });
  },

  saveAuthorizationCode: async (
    code: Pick<
      AuthorizationCode,
      "authorizationCode" | "expiresAt" | "redirectUri" | "scope"
    >,
    client: Client,
    user: User
  ): Promise<AuthorizationCode | Falsey> => {
    const authCode: OAuthAuthorizationCodeType | null =
      await prisma.oAuthAuthorizationCode.create({
        data: {
          authorizationCode: code.authorizationCode,
          user: { connect: user.id },
          client: { connect: { clientId: client.id } },
          redirectUri: code.redirectUri,
          expiresAt: code.expiresAt,
          scope: code.scope,
        },
        include: { user: true, client: true },
      });

    if (!authCode) {
      return false;
    }

    return convertDbAuthCode(authCode);
  },

  saveToken: async (
    token: Token,
    client: Client,
    user: User
  ): Promise<Token | Falsey> => {
    const accessToken: OAuthAccessTokenType | null =
      await prisma.oAuthAccessToken.create({
        data: {
          accessToken: token.accessToken,
          accessTokenExpiresAt: token.accessTokenExpiresAt,
          refreshToken: token.refreshToken,
          refreshTokenExpiresAt: token.refreshTokenExpiresAt,
          scope: token.scope,
          client: { connect: { clientId: client.id } },
          user: { connect: { id: user.id } },
        },
        include: { user: true, client: true },
      });

    if (!accessToken) {
      return false;
    }

    return convertDbAccessToken(accessToken);
  },

  revokeAuthorizationCode: async (
    code: AuthorizationCode
  ): Promise<boolean> => {
    const deletedCodes = await prisma.oAuthAuthorizationCode.deleteMany({
      where: {
        authorizationCode: code.authorizationCode,
      },
    });

    return deletedCodes.count > 0;
  },

  revokeToken: async (token: RefreshToken | Token): Promise<boolean> => {
    const deletedTokens = await prisma.oAuthAccessToken.deleteMany({
      where: {
        refreshToken: token.refreshToken,
      },
    });

    return deletedTokens.count > 0;
  },

  verifyScope: async (
    token: Token,
    scope: string | string[]
  ): Promise<boolean> => {
    if (token.scope && scope) {
      return token.scope === scope;
    }

    return true;
  },
};
