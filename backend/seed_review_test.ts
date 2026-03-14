const baseUrl = "https://garage-connect-api.onrender.com/api";

async function createAndCompleteBooking() {
  console.log("0. Waking up API...");
  for(let i=0; i<30; i++) {
     try {
         const ping = await fetch(`${baseUrl}/garages`);
         if(ping.ok) break;
     } catch(e) {}
     await new Promise(r => setTimeout(r, 2000));
  }

  const randomEmail = `test_review_${Date.now()}@test.com`;
  console.log(`1. Signing up NEW CUSTOMER: ${randomEmail} ...`);
  const custRes = await fetch(`${baseUrl}/auth/register/customer`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName: "Review Tester", email: randomEmail, password: "password123", role: "CUSTOMER" })
  });
  if (!custRes.ok) return console.error("Signup failed:", await custRes.text());
  const custData = await custRes.json();
  const custToken = custData.token;

  console.log("2. Adding Vehicle...");
  const vehRes = await fetch(`${baseUrl}/users/vehicles`, {
      method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${custToken}` },
      body: JSON.stringify({ make: "Toyota", model: "Corolla", year: 2020, vehicleNumber: `TEST-${Date.now().toString().slice(-4)}`, vehicleType: "FOUR_WHEELER" })
  });
  if (!vehRes.ok) return console.error("Vehicle addition failed:", await vehRes.text());
  const vehData = await vehRes.json();
  const vehicleId = vehData.vehicle.id;

  console.log("3. Fetching Garage & Services...");
  const garRes = await fetch(`${baseUrl}/garages`);
  const garData = await garRes.json();
  const garage = garData.garages.find(g => g.garageName === "FastFix Auto Repair");

  console.log("4. Creating Booking...");
  const bRes = await fetch(`${baseUrl}/bookings`, {
    method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${custToken}` },
    body: JSON.stringify({
      garageId: garage.id, vehicleId: vehicleId,
      scheduledDate: new Date().toISOString(), serviceIds: [garage.services[0].id],
      customerIssue: "Need oil change"
    })
  });
  if (!bRes.ok) return console.error("Booking Creation failed:", await bRes.text());
  const bData = await bRes.json();
  const bookingId = bData.booking.id;

  console.log(`✅ Booking Created: ${bookingId}`);

  console.log("4. Logging in as OWNER...");
  const ownRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "owner@fastfix.com", password: "password123" })
  });
  const ownData = await ownRes.json();
  const ownToken = ownData.token;

  console.log("5. Completing Booking...");
  for (const target of ["APPROVED", "IN_PROGRESS", "COMPLETED"]) {
    await fetch(`${baseUrl}/bookings/${bookingId}/status`, {
      method: "PATCH", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${ownToken}` },
      body: JSON.stringify({ status: target })
    });
    console.log(`   -> ${target}`);
  }

  console.log(`✅ Ready for Review Tester: demo@test.com !`);
}

createAndCompleteBooking().catch(console.error);
