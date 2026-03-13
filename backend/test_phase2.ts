import fetch from "node-fetch"; // requires node 18+ global fetch if we prefer
import app from "./src/app.js";
import { Server } from "http";
import prisma from "./src/config/prisma.js";

const PORT = 5005;
const BASE_URL = `http://localhost:${PORT}/api`;

let server: Server;

async function runTests() {
  server = app.listen(PORT);

  // Clear DB
  await prisma.review.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.garage.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log("DB Cleared");

  let customerToken = "";
  let ownerToken = "";

  console.log("1. Register Customer");
  const res1 = await fetch(`${BASE_URL}/auth/register/customer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Test Customer",
      email: "cust@example.com",
      password: "password123",
      role: "CUSTOMER",
      vehicle: {
        make: "Honda",
        model: "Civic",
        year: 2020,
        vehicleNumber: "AB12CD",
        vehicleType: "FOUR_WHEELER"
      }
    })
  });
  const data1 = await res1.json();
  if(!data1.success) throw new Error("Customer register failed");

  console.log("2. Register Duplicate Customer (Expect 400)");
  const res2 = await fetch(`${BASE_URL}/auth/register/customer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Test Customer 2",
      email: "cust@example.com",
      password: "password123",
      role: "CUSTOMER"
    })
  });
  if(res2.status !== 400) throw new Error("Duplicate email should be rejected");

  console.log("3. Register Owner");
  const res3 = await fetch(`${BASE_URL}/auth/register/owner`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Test Owner",
      email: "owner@example.com",
      password: "password123",
      role: "GARAGE_OWNER",
      garage: {
        garageName: "Test Garage",
        address: "123 Test St",
      }
    })
  });
  const data3 = await res3.json();
  if(!data3.success) throw new Error("Owner register failed");

  console.log("4. Login Customer");
  const res4 = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "cust@example.com",
      password: "password123"
    })
  });
  const data4 = await res4.json();
  if(!data4.success) throw new Error("Login failed");
  customerToken = data4.token;

  console.log("5. Login wrong password (Expect 401)");
  const res5 = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "cust@example.com",
      password: "wrong"
    })
  });
  if(res5.status !== 401) throw new Error("Wrong password should be rejected");

  console.log("6. Get /me");
  const res6 = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  const data6 = await res6.json();
  if(!data6.success || data6.user.role !== "CUSTOMER") throw new Error("/me failed");

  console.log("7. Profile update customer");
  const res7 = await fetch(`${BASE_URL}/users/profile/customer`, {
    method: "PUT",
    headers: { 
      Authorization: `Bearer ${customerToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fullName: "New Name" })
  });
  const data7 = await res7.json();
  if(!data7.success || data7.user.fullName !== "New Name") throw new Error("Profile update failed");

  console.log("8. Protected route without token (Expect 401)");
  const res8 = await fetch(`${BASE_URL}/auth/me`);
  if(res8.status !== 401) throw new Error("Auth missing failure expected");

  console.log("ALL TESTS PASSED");
}

runTests().then(() => {
  server.close();
  prisma.$disconnect();
  process.exit(0);
}).catch(err => {
  console.error(err);
  server.close();
  prisma.$disconnect();
  process.exit(1);
});
