import request from 'supertest';
import app from '../index.js';
import mongoose from "mongoose";
import redis from "../config/redis.js";
import { connectDB } from "../db/connectDB.js";

beforeAll(async () => {
  await connectDB();
});

describe("PrimeWheels API Test Suite", () => {

  // ================= ROOT =================
  describe("Root API", () => {
    test("GET /backend → should return 200", async () => {
      const res = await request(app).get("/backend");
      expect(res.statusCode).toBe(200);
    });
  });

  // ================= USER ROUTES =================
  describe("User Routes", () => {

    test("GET /backend/user/analytics", async () => {
      const res = await request(app).get("/backend/user/analytics");
      expect([200, 401, 403]).toContain(res.statusCode);
    });

    test("GET /backend/user/:id", async () => {
      const res = await request(app).get("/backend/user/123");
      expect([200, 401, 403]).toContain(res.statusCode);
    });

    test("PUT /backend/user/update/:id", async () => {
      const res = await request(app)
        .put("/backend/user/update/123")
        .send({ username: "testuser" });

      expect([200, 400, 401, 403]).toContain(res.statusCode);
    });

  });

  // ================= SELL ROUTES =================
  describe("Sell Routes", () => {

    test("POST /backend/sell-car/sell", async () => {
      const res = await request(app)
        .post("/backend/sell-car/sell")
        .send({ title: "Test Car", price: 100000 });

      expect([200, 400, 401, 403]).toContain(res.statusCode);
    });

  });

  // ================= REQUEST ROUTES =================
  describe("Request Routes", () => {

    test("POST /backend/request-car/request", async () => {
      const res = await request(app)
        .post("/backend/request-car/request")
        .send({ carId: "123" });

      expect([200, 400, 401, 403]).toContain(res.statusCode);
    });

    test("GET /backend/request-car/my", async () => {
      const res = await request(app).get("/backend/request-car/my");
      expect([200, 401, 403]).toContain(res.statusCode);
    });

  });

  // ================= INVENTORY ROUTES =================
  describe("Inventory Routes", () => {

    test("GET /backend/cars/inventory", async () => {
      const res = await request(app).get("/backend/cars/inventory");
      expect(res.statusCode).toBe(200);
    });

    test("GET /backend/cars/:id", async () => {
      const res = await request(app).get("/backend/cars/123");
      expect([200, 400, 404]).toContain(res.statusCode);
    });

  });

  // ================= AUTH ROUTES =================
  describe("Auth Routes", () => {

    test("POST /backend/auth/signup", async () => {
      const res = await request(app)
        .post("/backend/auth/signup")
        .send({
          username: "testuser",
          email: "test@test.com",
          password: "123456"
        });

      expect([200, 201, 400]).toContain(res.statusCode);
    });

    test("POST /backend/auth/signin", async () => {
      const res = await request(app)
        .post("/backend/auth/signin")
        .send({
          email: "test@test.com",
          password: "123456"
        });

      expect([200, 400]).toContain(res.statusCode);
    });

    test("POST /backend/auth/google", async () => {
      const res = await request(app)
        .post("/backend/auth/google")
        .send({ token: "fake-token" });

      expect([200, 400, 500]).toContain(res.statusCode);
    });

    test("GET /backend/auth/signout", async () => {
      const res = await request(app).get("/backend/auth/signout");
      expect(res.statusCode).toBe(200);
    });

  });

});

afterAll(async () => {
  // close MongoDB
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }

  // close Redis if exists
  if (redis?.quit) {
    await redis.quit();
  }
});
