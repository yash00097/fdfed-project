import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 20,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<300"],
    checks: ["rate>0.99"],
  },
};

const baseUrl = __ENV.BASE_URL || "http://localhost:3000";
const inventoryUrl = `${baseUrl}/backend/cars/inventory`;

export default function () {
  const response = http.get(inventoryUrl);

  check(response, {
    "inventory returns 200": (res) => res.status === 200,
    "response is JSON": (res) =>
      String(res.headers["Content-Type"] || "").includes("application/json"),
  });

  sleep(1);
}
