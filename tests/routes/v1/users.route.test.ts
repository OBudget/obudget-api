import request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "server";

describe("User endpoints", () => {
  // GET methods
  it("Should return a list of all users", async () => {
    const res = await request(app).get("/v1/users/");

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body[0]).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
    });
  });
});
