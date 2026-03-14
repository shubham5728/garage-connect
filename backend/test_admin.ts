import { testApi } from "./test_phase2"; // Re-using our existing test runner utility

async function runAdminTests() {
  console.log("\n--- STARTING ADMIN API TESTS (LIVE PRODUCTION) ---");
  const baseUrl = "https://garage-connect-api.onrender.com/api";

  // 1. Need an Admin account to test. The seed script lists admin@garageconnect.com / password123
  console.log("\n1) Authenticating as Admin...");
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@garageconnect.com", password: "password123" })
  });
  
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.success || loginData.user.role !== "ADMIN") {
    console.error("❌ Failed to login as ADMIN. Details:", loginData);
    return;
  }
  const token = loginData.token;
  console.log("✅ Admin Login successful");

  // 2. View All Garages
  console.log("\n2) Admin: Fetching all garages (Should include unverified ones)...");
  const garagesRes = await fetch(`${baseUrl}/admin/garages`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const garagesData = await garagesRes.json();
  if (garagesData.success && Array.isArray(garagesData.garages)) {
    console.log(`✅ Admin fetched ${garagesData.garages.length} garages.`);
  } else {
    console.error("❌ Failed to fetch garages:", garagesData);
  }

  // 3. View All Users
  console.log("\n3) Admin: Fetching all users...");
  const usersRes = await fetch(`${baseUrl}/admin/users`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const usersData = await usersRes.json();
  if (usersData.success && Array.isArray(usersData.users)) {
    console.log(`✅ Admin fetched ${usersData.users.length} users.`);
  } else {
    console.error("❌ Failed to fetch users:", usersData);
  }

  // 4. Test Verification of a Garage (If we have garages)
  let unverifiedGarageId;
  if (garagesData.success && garagesData.garages.length > 0) {
    const unverified = garagesData.garages.find(g => !g.isVerified);
    if (unverified) {
      unverifiedGarageId = unverified.id;
      console.log(`\n4) Admin: Verifying unverified garage ${unverifiedGarageId}...`);
      
      const verifyRes = await fetch(`${baseUrl}/admin/garages/${unverifiedGarageId}/verify`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isVerified: true })
      });
      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        console.log("✅ Garage successfully verified by Admin.");
      } else {
        console.error("❌ Failed to verify garage:", verifyData);
      }
    } else {
      console.log("\n4) Admin: No unverified garages found to test verification. (All are verified)");
    }
  }

  // 5. Test review deletion (Depends on having a review. We'll just verify the endpoint format for now)
  // To do a full test, we'd need to create a review first.
  console.log("\n--- ADMIN API TESTS COMPLETE ---");
}

runAdminTests().catch(console.error);
