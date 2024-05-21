const request = require("supertest");
const fs = require("fs");

const app = require("../../src/api/app");
const { seed, cleanUpDB } = require("../../scripts/testSeedDb");

// TODO: general remarks
// 1. Add TestContainers with MySQL or Postgres
// 2. Add Nock for integration testing with external API calls
// 3. Move to shared Mock and Fixtures test helpers

describe("Admin API", () => {
  beforeAll(async () => {
    await seed();
  });

  afterAll(async () => {
    // TODO: [TEMP] force delete the database.sqlite3 file!
    if (fs.existsSync("database.sqlite3")) fs.unlinkSync("database.sqlite3");

    // await cleanUpDB();
  });

  describe("GET /admin/best-profession", () => {
    it("Should return null for profession if not found in the given range", async () => {
      const mockStartDate = "2021-01-01";
      const mockEndDate = "2021-12-31";

      const expected = {
        profession: null,
      };

      const response = await request(app).get(`/admin/best-profession?start=${mockStartDate}&end=${mockEndDate}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expected);
    });

    it("Should return Programmer for profession in valid range", async () => {
      const mockStartDate = "2023-01-01";
      const mockEndDate = "2025-01-30";

      const expected = {
        profession: "Programmer",
      };

      const response = await request(app).get(`/admin/best-profession?start=${mockStartDate}&end=${mockEndDate}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expected);
    });

    // should return an error message and status code 400 if start date is greater than end date
    it("Should return an error message and status code 400 if start date is greater than end date", async () => {
      const mockStartDate = "2025-01-01";
      const mockEndDate = "2023-01-30";

      const expected = {
        code: 400,
        message: "'start' date should be before 'end' date!",
        status: "BAD_REQUEST_ERROR",
      };

      const response = await request(app).get(`/admin/best-profession?start=${mockStartDate}&end=${mockEndDate}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(expected);
    });
  });

  describe("GET /admin/best-clients", () => {
    it("Should return empty list if no clients found in a valid given range", async () => {
      const mockStartDate = "2021-01-01";
      const mockEndDate = "2021-12-31";

      const expected = [];

      const response = await request(app).get(`/admin/best-clients?start=${mockStartDate}&end=${mockEndDate}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expected);
    });

    it("Should return list of clients in valid range", async () => {
      const mockStartDate = "2023-01-01";
      const mockEndDate = "2025-01-30";

      const expected = [
        { fullName: "Ash Kethcum", id: 4, paid: 2020 },
        { fullName: "Mr Robot", id: 2, paid: 442 },
      ];

      const response = await request(app).get(`/admin/best-clients?start=${mockStartDate}&end=${mockEndDate}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expected);
    });

    it("Should return an error message and status code 400 if start date is greater than end date", async () => {
      const mockStartDate = "2025-01-01";
      const mockEndDate = "2023-01-30";

      const expected = {
        code: 400,
        message: "'start' date should be before 'end' date!",
        status: "BAD_REQUEST_ERROR",
      };

      const response = await request(app).get(`/admin/best-clients?start=${mockStartDate}&end=${mockEndDate}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(expected);
    });

    it("Should return an error message and status code 400 if start is not valid format", async () => {
      const mockStartDate = "2025.01.01";
      const mockEndDate = "2023-01-30";

      const expected = {
        code: 400,
        message: "Please provide 'start' date as query parameter! [format: YYYY-MM-DD]",
        status: "BAD_REQUEST_ERROR",
      };

      const response = await request(app).get(`/admin/best-clients?start=${mockStartDate}&end=${mockEndDate}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(expected);
    });

    it("Should return an error message and status code 400 if end is not valid format", async () => {
      const mockStartDate = "2025-01-01";
      const mockEndDate = "2023.01.30";

      const expected = {
        code: 400,
        message: "Please provide 'end' date as query parameter! [format: YYYY-MM-DD]",
        status: "BAD_REQUEST_ERROR",
      };

      const response = await request(app).get(`/admin/best-clients?start=${mockStartDate}&end=${mockEndDate}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(expected);
    });
  });
});
