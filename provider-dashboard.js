// Provider Dashboard Script
const API_BASE = 'http://localhost:5000/api';

const addRouteForm = document.getElementById('add-route-form');
const routesList = document.getElementById('routes-list');
const bookingsList = document.getElementById('bookings-list');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const submitRouteBtn = document.getElementById('submit-route-btn');
let editingRouteId = null;

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProviderRoutes();
    loadProviderBookings();
});

function resetEditMode() {
    editingRouteId = null;
    addRouteForm.reset();
    if (submitRouteBtn) submitRouteBtn.textContent = 'Add Route';
    if (cancelEditBtn) cancelEditBtn.classList.add('hidden');
}

function startEditRoute(route) {
    editingRouteId = route._id;
    document.getElementById('start').value = route.start;
    document.getElementById('end').value = route.end;
    document.getElementById('price').value = route.price;
    if (submitRouteBtn) submitRouteBtn.textContent = 'Save Changes';
    if (cancelEditBtn) cancelEditBtn.classList.remove('hidden');
}

if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
        resetEditMode();
    });
}

// Get token helper
function getToken() {
    return localStorage.getItem('salama-token');
}

// Load provider's routes
async function loadProviderRoutes() {
    const token = getToken();
    
    if (!routesList) return;
    
    try {
        const response = await fetch(`${API_BASE}/routes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load routes');
        
        const allRoutes = await response.json();
        const user = JSON.parse(localStorage.getItem('salama-user') || '{}');
        
        // Filter routes by current provider
        const providerRoutes = allRoutes.filter(route => {
            const providerId = typeof route.provider === 'object' ? route.provider._id.toString() : route.provider;
            return providerId === user.id;
        });
        
        if (!providerRoutes.length) {
            routesList.innerHTML = '<p class="text-slate-600 col-span-full">You have no routes yet. Create one below.</p>';
            return;
        }
        
        routesList.innerHTML = '';
        providerRoutes.forEach(route => {
            const routeCard = document.createElement('div');
            routeCard.className = 'rounded-lg border border-slate-200 bg-white p-4 shadow-sm';
            routeCard.innerHTML = `
                <div class="flex items-start justify-between">
                    <div>
                        <h3 class="font-semibold text-slate-900">${route.start} → ${route.end}</h3>
                        <p class="text-sm text-slate-600">Price: KES ${route.price}</p>
                        <p class="text-xs text-slate-500">Created: ${new Date(route.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div class="route-actions flex gap-2"></div>
                </div>
            `;

            const actionContainer = routeCard.querySelector('.route-actions');
            if (actionContainer) {
                const editBtn = document.createElement('button');
                editBtn.className = 'rounded-md bg-sky-100 px-3 py-1 text-sm font-medium text-sky-700 hover:bg-sky-200';
                editBtn.textContent = 'Edit';
                editBtn.addEventListener('click', () => startEditRoute(route));
                actionContainer.appendChild(editBtn);

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200';
                deleteBtn.textContent = 'Delete';
                deleteBtn.addEventListener('click', () => deleteRoute(route._id));
                actionContainer.appendChild(deleteBtn);
            }

            routesList.appendChild(routeCard);
        });
    } catch (error) {
        console.error('Error loading routes:', error);
        routesList.innerHTML = '<p class="text-red-600 col-span-full">Error loading routes.</p>';
    }
}

// Add new route
if (addRouteForm) {
    addRouteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const start = document.getElementById('start').value.trim();
        const end = document.getElementById('end').value.trim();
        const price = parseFloat(document.getElementById('price').value);
        const token = getToken();
        
        // Validation
        if (!start || !end) {
            alert('Please enter both start and end locations');
            return;
        }
        
        if (!price || price <= 0) {
            alert('Please enter a valid price');
            return;
        }

        const routeData = { start, end, price };
        const method = editingRouteId ? 'PUT' : 'POST';
        const url = editingRouteId ? `${API_BASE}/routes/${editingRouteId}` : `${API_BASE}/routes`;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(routeData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save route');
            }
            
            const successMessage = editingRouteId ? 'Route updated successfully!' : 'Route created successfully!';
            alert(`✅ ${successMessage}`);
            resetEditMode();
            loadProviderRoutes();
        } catch (error) {
            console.error('Error saving route:', error);
            alert(`❌ Error: ${error.message}`);
        }
    });
}

// Delete route
async function deleteRoute(routeId) {
    if (!confirm('Are you sure you want to delete this route?')) return;
    
    const token = getToken();
    
    try {
        const response = await fetch(`${API_BASE}/routes/${routeId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to delete route');
        
        alert('✅ Route deleted successfully');
        loadProviderRoutes();
    } catch (error) {
        console.error('Error deleting route:', error);
        alert(`❌ Error: ${error.message}`);
    }
}

// Load bookings for provider's routes
async function loadProviderBookings() {
    const token = getToken();
    
    if (!bookingsList) return;
    
    try {
        const response = await fetch(`${API_BASE}/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load bookings');
        
        const allBookings = await response.json();
        const user = JSON.parse(localStorage.getItem('salama-user') || '{}');
        
        // Get provider's routes
        const routesRes = await fetch(`${API_BASE}/routes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const allRoutes = await routesRes.json();
        const providerRouteIds = allRoutes
            .filter(route => {
                const providerId = typeof route.provider === 'object' ? route.provider._id.toString() : route.provider;
                return providerId === user.id;
            })
            .map(route => route._id.toString());
        
        // Filter bookings by provider's routes
        const providerBookings = allBookings.filter(booking => 
            providerRouteIds.includes(booking.route._id.toString())
        );
        
        if (!providerBookings.length) {
            bookingsList.innerHTML = '<p class="text-slate-600 col-span-full">No bookings for your routes yet.</p>';
            return;
        }
        
        bookingsList.innerHTML = '';
        providerBookings.forEach(booking => {
            const bookingCard = document.createElement('div');
            bookingCard.className = 'rounded-lg border border-slate-200 bg-white p-4 shadow-sm';
            const statusColor = booking.paymentStatus === 'paid' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-amber-100 text-amber-700';
            
            bookingCard.innerHTML = `
                <div class="flex items-start justify-between mb-2">
                    <div>
                        <h3 class="font-semibold text-slate-900">${booking.route.start} → ${booking.route.end}</h3>
                        <p class="text-sm text-slate-600">Customer: ${booking.user.username}</p>
                    </div>
                    <span class="inline-block rounded-full ${statusColor} px-2 py-1 text-xs font-medium">${booking.paymentStatus}</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div><span class="text-slate-600">Seats:</span> <span class="font-medium">${booking.selectedSeats.length}</span></div>
                    <div><span class="text-slate-600">Revenue:</span> <span class="font-medium">KES ${booking.route.price * booking.selectedSeats.length}</span></div>
                </div>
            `;
            bookingsList.appendChild(bookingCard);
        });
    } catch (error) {
        console.error('Error loading bookings:', error);
        bookingsList.innerHTML = '<p class="text-red-600 col-span-full">Error loading bookings.</p>';
    }