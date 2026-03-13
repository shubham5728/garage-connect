document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth & Session check
    const user = await window.gcApi.checkAuth();
    if (!user || user.role !== 'GARAGE_OWNER') {
        window.gcApi.logout();
        return;
    }

    // 2. Fetch Garage Data
    let garage = null;
    try {
        const garagesData = await window.gcApi.fetch('/garages'); // Assuming filter for own garage or similar
        // For now, let's just get the first one where owner is this user
        // Better: Backend should have /api/garages/mine
        // I'll fetch /api/garages/mine if it exists, otherwise find from list
        const allGarages = garagesData.garages;
        garage = allGarages.find(g => g.ownerId === user.id);
        
        if (!garage) {
            // If they are owner but have no garage, they shouldn't be here or need to create one
            console.error("No garage found for owner");
        }
    } catch (err) {
        console.error("Could not fetch garage info", err);
    }

    if (garage) {
        document.querySelector('header h2').innerText = `Welcome, ${garage.garageName}!`;
        // Populate stats (mock for now or real if available)
        document.querySelector('.stat-card:nth-child(3) p').innerText = `${garage.rating.toFixed(1)} / 5`;
        
        // Fill profile tab
        const profileForm = document.querySelector('.profile-form');
        if (profileForm) {
            profileForm.querySelector('input:nth-of-type(1)').value = garage.garageName;
            profileForm.querySelector('input:nth-of-type(2)').value = user.fullName;
            profileForm.querySelector('input:nth-of-type(3)').value = garage.contactNo || '';
            profileForm.querySelector('input:nth-of-type(4)').value = garage.address;
            profileForm.querySelector('textarea').value = garage.description || '';
        }

        // Load Services
        const loadServices = () => {
            const container = document.getElementById('services');
            const list = container.querySelector('.service-card')?.parentElement || container;
            const h2 = container.querySelector('h2');
            const addBtn = container.querySelector('.add-btn');
            
            list.innerHTML = '';
            if (h2) list.appendChild(h2);

            garage.services.forEach(s => {
                list.innerHTML += `
                    <div class="service-card">
                        <h4>${s.name}</h4>
                        <p><strong>Price:</strong> Rs. ${s.basePrice}</p>
                        <p><strong>Vehicle Types:</strong> ${s.vehicleTypes.join(', ')}</p>
                        <button>Edit</button>
                    </div>
                `;
            });
            if (addBtn) list.appendChild(addBtn);
        };
        loadServices();

        // Load Bookings
        const loadBookings = async () => {
            const container = document.getElementById('bookings');
            container.innerHTML = '<h2>All Bookings</h2>';
            try {
                const data = await window.gcApi.fetch(`/bookings/garage/${garage.id}`);
                if (data.success) {
                    if (data.bookings.length === 0) {
                        container.innerHTML += '<p>No bookings yet.</p>';
                    } else {
                        data.bookings.forEach(b => {
                            const date = new Date(b.scheduledDate).toLocaleDateString();
                            container.innerHTML += `
                                <div class="booking-card">
                                    <h4>${b.services.map(s => s.service.name).join(', ')}</h4>
                                    <p><strong>Customer:</strong> ${b.customer.user.fullName}</p>
                                    <p><i class="fas fa-calendar-alt"></i> Date: ${date}</p>
                                    <p><span class="status ${b.status.toLowerCase()}">${b.status}</span></p>
                                    ${b.status === 'PENDING' ? `
                                        <div style="margin-top:10px">
                                            <button class="approve-btn" onclick="updateBookingStatus('${b.id}', 'APPROVED')">Approve</button>
                                            <button class="decline-btn" onclick="updateBookingStatus('${b.id}', 'CANCELLED')">Decline</button>
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        });
                    }
                }
            } catch (err) {
                container.innerHTML += `<p>Error: ${err.message}</p>`;
            }
        };
        loadBookings();

        window.updateBookingStatus = async (id, status) => {
            try {
                const data = await window.gcApi.fetch(`/bookings/${id}/status`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status })
                });
                if (data.success) {
                    loadBookings();
                }
            } catch (err) {
                alert(err.message);
            }
        };

        // 5. Manage Services Modal & Logic
        const addServiceModal = document.getElementById('addServiceModal');
        const addServiceBtn = document.querySelector('.add-btn');
        const closeBtn = document.querySelector('.close-btn');
        const addServiceForm = document.getElementById('addServiceForm');

        addServiceBtn?.addEventListener('click', () => addServiceModal.classList.add('active'));
        closeBtn?.addEventListener('click', () => addServiceModal.classList.remove('active'));
        window.addEventListener('click', (e) => { if (e.target === addServiceModal) addServiceModal.classList.remove('active'); });

        addServiceForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = addServiceForm.querySelector('button');
            const vehicleTypes = [];
            if (document.getElementById('vType4').checked) vehicleTypes.push('FOUR_WHEELER');
            if (document.getElementById('vType2').checked) vehicleTypes.push('TWO_WHEELER');

            const payload = {
                name: document.getElementById('sName').value,
                basePrice: parseFloat(document.getElementById('sPrice').value),
                vehicleTypes
            };

            try {
                btn.disabled = true;
                btn.innerText = 'Adding...';
                const data = await window.gcApi.fetch('/services', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                if (data.success) {
                    alert('Service added!');
                    addServiceModal.classList.remove('active');
                    addServiceForm.reset();
                    // Refresh garage data to show new service
                    window.location.reload(); 
                }
            } catch (err) {
                alert(err.message);
            } finally {
                btn.disabled = false;
                btn.innerText = 'Add Service';
            }
        });

        // 6. Profile Update
        profileForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = profileForm.querySelector('button');
            const payload = {
                fullName: profileForm.querySelector('input:nth-of-type(2)').value,
                garage: {
                    garageName: profileForm.querySelector('input:nth-of-type(1)').value,
                    contactNo: profileForm.querySelector('input:nth-of-type(3)').value,
                    address: profileForm.querySelector('input:nth-of-type(4)').value,
                    description: profileForm.querySelector('textarea').value
                }
            };

            try {
                btn.disabled = true;
                const data = await window.gcApi.fetch('/users/profile/garage', {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
                if (data.success) {
                    alert('Garage profile updated!');
                }
            } catch (err) {
                alert(err.message);
            } finally {
                btn.disabled = false;
            }
        });
    }
});
