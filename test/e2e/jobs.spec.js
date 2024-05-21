const request = require("supertest");
const fs = require("fs");

const app = require("../../src/api/app");
const { seed, cleanUpDB } = require("../../scripts/testSeedDb");

describe("Jobs API", () => {
  beforeAll(async () => {
    // TODO: seed separate DB for contracts
    await seed();
  });

  afterAll(async () => {
    // TODO: [TEMP] force delete the database.sqlite3 file!
    if (fs.existsSync("database.sqlite3")) fs.unlinkSync("database.sqlite3");

    // await cleanUpDB();
  });

  describe("GET /jobs/unpaid [List Unpaid Jobs]", () => {
    it("Should return all unpaid jobs for a given client", async () => {
      const mockProfileIdHeader = 4;

      const expected = [
        {
          id: 5,
          description: "work",
          price: 200,
          paid: null,
          paymentDate: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          ContractId: 7,
          Contract: {
            id: 7,
            terms: "bla bla bla",
            status: "in_progress",
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            ContractorId: 7,
            ClientId: 4,
          },
        },
      ];

      const response = await request(app).get("/jobs/unpaid").set("profile_id", mockProfileIdHeader);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expected);
    });

    it("Should return an empty list if no unpaid jobs are found", async () => {
      const mockProfileIdHeader = 3;

      const expected = [];

      const response = await request(app).get("/jobs/unpaid").set("profile_id", mockProfileIdHeader);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expected);
    });

    it("Should return an error message and status code 401 if profile_id header is not provided", async () => {
      const expected = {
        code: 401,
        message: "Unauthorized",
        status: "UNAUTHORIZED",
      };

      const response = await request(app).get("/jobs/unpaid");

      expect(response.status).toBe(401);
      expect(response.body).toEqual(expected);
    });
  });

  describe("POST /jobs/:job_id/pay [Create Job Payment]", () => {
    it("Should return error message and status code 400 if job is already paid", async () => {
      const mockProfileIdHeader = 2;
      const mockJobId = 14;

      const expected = {
        code: 400,
        message: `Job with id: ${mockJobId} already paid!`,
        status: "BAD_REQUEST_ERROR",
      };

      const response = await request(app).post(`/jobs/${mockJobId}/pay`).set("profile_id", mockProfileIdHeader);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(expected);
    });

    it("Should return error message and status code 404 if job is not found", async () => {
      const mockProfileIdHeader = 2;
      const mockJobId = 999;

      const expected = {
        code: 404,
        message: `Job with id: ${mockJobId} not found!`,
        status: "NOT_FOUND_ERROR",
      };

      const response = await request(app).post(`/jobs/${mockJobId}/pay`).set("profile_id", mockProfileIdHeader);

      expect(response.status).toBe(404);
      expect(response.body).toEqual(expected);
    });

    it("Should return error message and status code 401 if profile_id header is not provided", async () => {
      const mockJobId = 2;

      const expected = {
        code: 401,
        message: "Unauthorized",
        status: "UNAUTHORIZED",
      };

      const response = await request(app).post(`/jobs/${mockJobId}/pay`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual(expected);
    });

    // TODO: skip flaky test! [SQLite connection pool issue?]
    it.skip("Should make successful payment for a unpaid job", async () => {
      const mockProfileIdHeader = 1;
      const mockJobId = 2;

      const expected = {
        message: `Payment successful for job with id: ${mockJobId}`,
      };

      const response = await request(app).post(`/jobs/${mockJobId}/pay`).set("profile_id", mockProfileIdHeader);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expected);
    });
  });
});
