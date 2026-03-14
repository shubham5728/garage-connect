import { testApi } from "./test_phase2";

async function runOwnerTests() {
  console.log("\n--- STARTING GARAGE OWNER API TESTS (LIVE PRODUCTION) ---");
  const baseUrl = "https://garage-connect-api.onrender.com/api";

  console.log("\n1) Authenticating as Garage Owner...");
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "owner@fastfix.com", password: "password123" })
  });
  
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.success || loginData.user.role !== "GARAGE_OWNER") {
    console.error("❌ Failed to login as OWNER.", loginData);
    return;
  }
  const token = loginData.token;
  const userId = loginData.user.id;
  console.log("✅ Owner Login successful");

  console.log("\n2) Finding Owner's Garage...");
  const garagesRes = await fetch(`${baseUrl}/garages`);
  const garagesData = await garagesRes.json();
  const myGarage = garagesData.garages.find((g: any) => g.userId === userId);
  
  if (!myGarage) {
    console.error("❌ No garage found for this owner.");
    return;
  }
  console.log("✅ Found Garage:", myGarage.garageName, myGarage.id);

  console.log("\n3) Testing Service Creation...");
  const createSvcRes = await fetch(`${baseUrl}/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ name: "API Test Service", basePrice: 999, vehicleTypes: ["FOUR_WHEELER"] })
  });
  const createSvcData = await createSvcRes.json();
  let testServiceId = null;
  if (createSvcData.success) {
    console.log("✅ Service created successfully");
    testServiceId = createSvcData.service.id;
  } else {
    console.error("❌ Failed to create service:", createSvcData);
  }

  if (testServiceId) {
    console.log("\n4) Testing Service Update...");
    const updateSvcRes = await fetch(`${baseUrl}/services/${testServiceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ name: "API Test Service Updated", basePrice: 1099, vehicleTypes: ["FOUR_WHEELER", "TWO_WHEELER"] })
    });
    const updateData = await updateSvcRes.json();
    if (updateData.success && updateData.service.basePrice === 1099) {
      console.log("✅ Service updated successfully");
    } else {
      console.error("❌ Failed to update service:", updateData);
    }

    console.log("\n5) Testing Service Deletion...");
    const delRes = await fetch(`${baseUrl}/services/${testServiceId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    const delData = await delRes.json();
    if (delData.success) {
      console.log("✅ Service deleted successfully");
    } else {
      console.error("❌ Failed to delete service:", delData);
    }
  }

  console.log("\n6) Checking Bookings Lifecycle...");
  const bookingsRes = await fetch(`${baseUrl}/bookings/garage/${myGarage.id}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const bookingsData = await bookingsRes.json();
  
  if (bookingsData.success && bookingsData.bookings.length > 0) {
    const pendingBooking = bookingsData.bookings.find((b:any) => b.status === "PENDING" || b.status === "APPROVED" || b.status === "IN_PROGRESS");
    if (pendingBooking) {
        console.log(`✅ Found active booking ${pendingBooking.id} in status ${pendingBooking.status}`);
        
        // Progress to COMPLETED
        let currentStatus = pendingBooking.status;
        const targetStatuses = ["APPROVED", "IN_PROGRESS", "COMPLETED"];
        const startIndex = targetStatuses.indexOf(currentStatus);
        
        if (startIndex !== -1) {
            for (let i = startIndex; i < targetStatuses.length; i++) {
                const nextStatus = targetStatuses[i];
                if (currentStatus === nextStatus && nextStatus !== "PENDING") continue; // PENDING not in targetStatuses array logic, handled implicitly
                
                let target = nextStatus;
                if (currentStatus === "PENDING") target = "APPROVED";
                if (currentStatus === "APPROVED") target = "IN_PROGRESS";
                if (currentStatus === "IN_PROGRESS") target = "COMPLETED";

                console.log(`   -> Transitioning to ${target}...`);
                const transitionRes = await fetch(`${baseUrl}/bookings/${pendingBooking.id}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ status: target })
                });
                const transitionData = await transitionRes.json();
                if (transitionData.success) {
                    console.log(`   ✅ Successfully transitioned to ${target}`);
                    currentStatus = target;
                } else {
                    console.error(`   ❌ Failed transition:`, transitionData);
                    break;
                }
            }
        }
    } else {
      console.log("✅ No active bookings found to progress. All are completed or cancelled.");
    }
  } else {
    console.log("✅ No bookings found for this garage.");
  }

  console.log("\n--- GARAGE OWNER API TESTS COMPLETE ---");
}

runOwnerTests().catch(console.error);
