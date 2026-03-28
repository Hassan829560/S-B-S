// API base URL
const API_BASE = 'http://localhost:5000/api';

// Store all routes for filtering
let allRoutes = [];

// DOM elements
const routesList = document.getElementById('routes-list');
const routeSelect = document.getElementById('route-select');
const bookingForm = document.getElementById('booking-form');
const seatsInput = document.getElementById('seats');
const bookingsList = document.getElementById('bookings-list');

// Load routes on page load
document.addEventListener('DOMContentLoaded', loadRoutes);

// Load routes from API
async function loadRoutes() {
    try {
        const response = await fetch(`${API_BASE}/routes`);
        allRoutes = await response.json();
        
        displayRoutes(allRoutes);
        populateRouteSelect(allRoutes);
    } catch (error) {
        console.error('Error loading routes:', error);
        routesList.innerHTML = '<p>Error loading routes. Please try again later.</p>';
    }
}

// Filter routes based on search criteria
function filterRoutes() {
    const startLocation = document.getElementById('search-start').value.toLowerCase().trim();
    const endLocation = document.getElementById('search-end').value.toLowerCase().trim();
    const maxPrice = parseFloat(document.getElementById('search-price').value) || Infinity;
    
    const filtered = allRoutes.filter(route => {
        const matchStart = !startLocation || route.start.toLowerCase().includes(startLocation);
        const matchEnd = !endLocation || route.end.toLowerCase().includes(endLocation);
        const matchPrice = route.price <= maxPrice;
        
        return matchStart && matchEnd && matchPrice;
    });
    
    if (filtered.length === 0) {
        routesList.innerHTML = '<p class="col-span-full text-center text-slate-600">No routes found matching your search criteria.</p>';
    } else {
        displayRoutes(filtered);
    }
}

// Display routes in the list
function displayRoutes(routes) {
    routesList.innerHTML = '';
    routes.forEach(route => {
        const routeCard = document.createElement('button');
        routeCard.id = `route-${route._id}`;
        routeCard.type = 'button';
        routeCard.className = 'w-full rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-sky-300 hover:bg-sky-50';
        routeCard.innerHTML = `<strong>${route.start} to ${route.end}</strong><br/><span class="text-slate-600">KES ${route.price}</span>`;
        routeCard.addEventListener('click', (e) => selectRoute(route, e));
        routesList.appendChild(routeCard);
    });
}

// Populate route select dropdown
function populateRouteSelect(routes) {
    routeSelect.innerHTML = '<option value="">Choose a route</option>';
    routes.forEach(route => {
        const option = document.createElement('option');
        option.value = route._id;
        option.textContent = `${route.start} to ${route.end} - KES ${route.price}`;
        routeSelect.appendChild(option);
    });
}

// Handle route selection
function selectRoute(route, event) {
    // Remove previous selection
    routesList.querySelectorAll('button').forEach(card => {
        card.classList.remove('border-sky-500', 'bg-sky-50');
    });

    // Apply selected style
    event.currentTarget.classList.add('border-sky-500', 'bg-sky-50');

    // Set the select value
    routeSelect.value = route._id;
}

// Get auth token helper
function getToken() {
    return localStorage.getItem('salama-token');
}

// Handle booking form submission
bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const routeId = routeSelect.value;
    const seats = parseInt(seatsInput.value, 10);

    if (!routeId || !seats || seats < 1) {
        alert('Please select a route and enter number of seats.');
        return;
    }

    const token = getToken();
    if (!token) {
        alert('Please login to book a route.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                routeId,
                selectedSeats: Array.from({ length: seats }, (_, i) => ({ seatNumber: i + 1 }))
            })
        });

        if (response.ok) {
            const booking = await response.json();
            alert('Booking successful!');
            bookingForm.reset();
            loadBookings();
        } else {
            const err = await response.json();
            alert(err.message || 'Booking failed. Please try again.');
        }
    } catch (error) {
        console.error('Error creating booking:', error);
        alert('Error creating booking. Please try again.');
    }
});

// Load bookings using user token
async function loadBookings() {
    const token = getToken();
    if (!token) {
        bookingsList.innerHTML = '<p class="text-slate-600">Please <a class="text-sky-700 hover:underline" href="login.html">log in</a> to view your bookings.</p>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/bookings`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            bookingsList.innerHTML = '<p class="text-red-600">Could not load bookings. Please refresh or login again.</p>';
            return;
        }

        const bookings = await response.json();

        if (!bookings.length) {
            bookingsList.innerHTML = '<p class="text-slate-600">You have no bookings yet.</p>';
            return;
        }

        bookingsList.innerHTML = '';
        bookings.forEach(booking => {
            const item = document.createElement('div');
            item.className = 'booking-item rounded-lg border border-slate-200 bg-white p-4';
            item.innerHTML = `
                <strong>${booking.route.start} to ${booking.route.end}</strong><br />
                Seats: ${booking.selectedSeats.length}<br />
                Status: <span class="${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}">${booking.paymentStatus}</span>
            `;
            bookingsList.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading bookings:', error);
        bookingsList.innerHTML = '<p class="text-red-600">Error loading bookings. Please try again later.</p>';
    }
}
