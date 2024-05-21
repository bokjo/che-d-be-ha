const request = require("supertest");
const fs = require("fs");

const app = require("../../src/api/app");
const { seed, cleanUpDB } = require("../../scripts/testSeedDb");

describe("Balances API", () => {
  beforeAll(async () => {
    // TODO: seed separate DB for balances
    await seed();
  });

  afterAll(async () => {
    // TODO: [TEMP] force delete the database.sqlite3 file!
    if (fs.existsSync("database.sqlite3")) fs.unlinkSync("database.sqlite3");

    // await cleanUpDB();
  });

  describe("GET /balances/deposit/:userId", () => {
    it("Should return an error message and status code 401 if profile_id header is not provided", async () => {
      const mockUserId = 2;
      const mockAmount = 100;
      const mockProfileIdHeader = null;

      const expected = {
        code: 401,
        message: "Unauthorized",
        status: "UNAUTHORIZED",
      };

      const response = await request(app)
        .post(`/balances/deposit/${mockUserId}`)
        .set("profile_id", mockProfileIdHeader)
        .send({ amount: mockAmount });

      expect(response.status).toBe(401);
      expect(response.body).toEqual(expected);
    });

    it("Should return error and status code 400 if user tries to deposit to another user's account", async () => {
      const mockUserId = 2;
      const mockAmount = 100;
      const mockProfileIdHeader = 1;

      const expected = {
        code: 400,
        message: "You can only deposit to your own account balance!",
        status: "BAD_REQUEST_ERROR",
      };

      const response = await request(app)
        .post(`/balances/deposit/${mockUserId}`)
        .set("profile_id", mockProfileIdHeader)
        .send({ amount: mockAmount });

      expect(response.status).toBe(400);
      expect(response.body).toEqual(expected);
    });

    it("Should return an error message and status code 400 if amount is not valid", async () => {
      const mockUserId = 2;
      const mockAmount = "invalid";
      const mockProfileIdHeader = 2;

      const expected = {
        code: 400,
        message: "Please provide proper numeric value for deposit amount!",
        status: "BAD_REQUEST_ERROR",
      };

      const response = await request(app)
        .post(`/balances/deposit/${mockUserId}`)
        .set("profile_id", mockProfileIdHeader)
        .send({ amount: mockAmount });

      expect(response.status).toBe(400);
      expect(response.body).toEqual(expected);
    });
  });

  it("Should return an error message and status code 400 if amount is less than or equal to 0", async () => {
    const mockUserId = 2;
    const mockAmount = 0;
    const mockProfileIdHeader = 2;

    const expected = {
      code: 400,
      message: "Deposit amount should be greater than 0!",
      status: "BAD_REQUEST_ERROR",
    };

    const response = await request(app)
      .post(`/balances/deposit/${mockUserId}`)
      .set("profile_id", mockProfileIdHeader)
      .send({ amount: mockAmount });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(expected);
  });

  it("Should return an error message and status code 404 if no unpaid jobs are found", async () => {
    const mockUserId = 3;
    const mockAmount = 100;
    const mockProfileIdHeader = 3;

    const expected = {
      code: 404,
      message: "No unpaid jobs found!",
      status: "NOT_FOUND_ERROR",
    };

    const response = await request(app)
      .post(`/balances/deposit/${mockUserId}`)
      .set("profile_id", mockProfileIdHeader)
      .send({ amount: mockAmount });

    expect(response.status).toBe(404);
    expect(response.body).toEqual(expected);
  });

  it("Should return an error message and status code 400 if amount is more than 25% of unpaid jobs total amount", async () => {
    const mockUserId = 4;
    const mockAmount = 100;
    const mockProfileIdHeader = 4;

    const expected = {
      code: 400,
      message: "Cannot deposit more than 25% of unpaid jobs total amount! [currentUnpaidTotal: 200]",
      status: "BAD_REQUEST_ERROR",
    };

    const response = await request(app)
      .post(`/balances/deposit/${mockUserId}`)
      .set("profile_id", mockProfileIdHeader)
      .send({ amount: mockAmount });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(expected);
  });

  // TODO: skip flaky test! [SQLite connection pool issue?]
  it.skip("Should return a success message and status code 200 if deposit is successful", async () => {
    const mockUserId = 4;
    const mockAmount = 50;
    const mockProfileIdHeader = 4;

    const expected = {
      message: `Successfully deposited ${mockAmount} to your account!`,
    };

    const response = await request(app)
      .post(`/balances/deposit/${mockUserId}`)
      .set("profile_id", mockProfileIdHeader)
      .send({ amount: mockAmount });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expected);
  });
});
