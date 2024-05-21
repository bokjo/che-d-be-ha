const request = require("supertest");
const fs = require("fs");

const app = require("../../src/api/app");
const { seed, cleanUpDB } = require("../../scripts/testSeedDb");

describe("Contracts API", () => {
  beforeAll(async () => {
    // TODO: seed separate DB for contracts
    await seed();
  });

  afterAll(async () => {
    // TODO: [TEMP] force delete the database.sqlite3 file!
    if (fs.existsSync("database.sqlite3")) fs.unlinkSync("database.sqlite3");

    // await cleanUpDB();
  });

  describe("GET /contracts [List Contract]", () => {
    it("Should return all contracts for a given client", async () => {
      const mockProfileIdHeader = 1;

      const expected = [
        {
          id: 2,
          terms: "bla bla bla",
          status: "in_progress",
          ContractorId: 6,
          ClientId: 1,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ];

      const response = await request(app).get("/contracts").set("profile_id", mockProfileIdHeader);

      console.log("response.body", response.body);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expected);
    });

    it("Should return an empty list if no contracts are found", async () => {
      const mockProfileIdHeader = 5;

      const expected = [];

      const response = await request(app).get("/contracts").set("profile_id", mockProfileIdHeader);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expected);
    });

    it("Should return an error message and status code 401 if profile_id header is not provided", async () => {
      const expected = {
        code: 401,
        message: "Unauthorized",
        status: "UNAUTHORIZED",
      };

      const response = await request(app).get("/contracts");

      expect(response.status).toBe(401);
      expect(response.body).toEqual(expected);
    });
  });

  describe("GET /contracts/:id [getContractById]", () => {
    it("Should return a contract by id if found", async () => {
      const mockProfileIdHeader = 1;
      const mockContractId = 2;

      const expected = {
        id: 2,
        terms: "bla bla bla",
        status: "in_progress",
        ContractorId: 6,
        ClientId: 1,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      };

      const response = await request(app).get(`/contracts/${mockContractId}`).set("profile_id", mockProfileIdHeader);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expected);
    });

    it("Should return an error message and status code 404 if contract is not found", async () => {
      const mockProfileIdHeader = 1;
      const mockContractId = 999;

      const expected = {
        code: 404,
        message: `Contract with id: ${mockContractId} not found!`,
        status: "NOT_FOUND_ERROR",
      };

      const response = await request(app).get(`/contracts/${mockContractId}`).set("profile_id", mockProfileIdHeader);

      expect(response.status).toBe(404);
      expect(response.body).toEqual(expected);
    });

    it("Should return status code 404 if different user tries to access contract of another user", async () => {
      const mockProfileIdHeader = 2;
      const mockContractId = 2;

      const expected = {
        code: 404,
        message: `Contract with id: ${mockContractId} not found!`,
        status: "NOT_FOUND_ERROR",
      };

      const response = await request(app).get(`/contracts/${mockContractId}`).set("profile_id", mockProfileIdHeader);

      expect(response.status).toBe(404);
      expect(response.body).toEqual(expected);
    });

    it("Should return an error message and status code 401 if profile_id header is not provided", async () => {
      const mockContractId = 2;

      const expected = {
        code: 401,
        message: "Unauthorized",
        status: "UNAUTHORIZED",
      };

      const response = await request(app).get(`/contracts/${mockContractId}`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual(expected);
    });
  });
});
