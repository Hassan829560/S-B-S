// Admin Dashboard Script
const API_BASE = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('salama-token');
}

// Tab management
const tabs = document.querySelectorAll('[data-tab]');
const tabContents = document.querySelectorAll('[data-tab-content]');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.getAttribute('data-tab');
    
    // Update active tab styling
    tabs.forEach(t => {
      t.classList.remove('border-sky-500', 'text-sky-600');
      t.classList.add('border-transparent');
    });
    tab.classList.remove('border-transparent');
    tab.classList.add('border-sky-500', 'text-sky-600');
    
    // Show corresponding content
    tabContents.forEach(content => {
      if (content.getAttribute('data-tab-content') === tabName) {
        content.classList.remove('hidden');
        // Load data for the tab
        if (tabName === 'users') loadUsers();
        else if (tabName === 'routes') loadRoutes();
        else if (tabName === 'bookings') loadBookings();
      } else {
        content.classList.add('hidden');
      }
    });

    loadBookingStats();
  });
});

// Load and display users
function loadBookingStats() {
  const token = getToken();
  if (!token) return;
  
  const statsContainer = document.getElementById('booking-stats');
  if (!statsContainer) return;

  fetch(`${API_BASE}/bookings/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(response => response.json())
  .then(stats => {
    statsContainer.innerHTML = `
      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-sm text-slate-500">Total Bookings</p>
        <p class="text-2xl font-bold">${stats.total || 0}</p>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-sm text-slate-500">Paid</p>
        <p class="text-2xl font-bold text-green-600">${stats.paid || 0}</p>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-sm text-slate-500">Pending</p>
        <p class="text-2xl font-bold text-amber-600">${stats.pending || 0}</p>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-sm text-slate-500">Revenue</p>
        <p class="text-2xl font-bold text-sky-600">KES ${stats.revenue || 0}</p>
      </div>
    `;
  })
  .catch(error => {
    console.error('Error loading booking stats:', error);
    statsContainer.innerHTML = '<p class="text-red-600">Error loading stats.</p>';
  });
}

function loadUsers() {
  const token = getToken();
  if (!token) {
    document.getElementById('users-list').innerHTML = '<p class="text-slate-600">Please login.</p>';
    return;
  }
  
  const usersList = document.getElementById('users-list');
  if (!usersList) return;

  fetch(`${API_BASE}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(response => response.json())
  .then(users => {
    if (!users.length) {
      usersList.innerHTML = '<p class="text-slate-600">No users found.</p>';
      return;
    }
    
    usersList.innerHTML = '';
    users.forEach(user => {
      const userCard = document.createElement('div');
      userCard.className = 'rounded-lg border border-slate-200 bg-white p-4 shadow-sm';
      userCard.innerHTML = `
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-semibold text-slate-900">${user.username}</h3>
            <p class="text-sm text-slate-600">${user.email}</p>
            <p class="mt-1 inline-block rounded-full bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700">${user.role}</p>
          </div>
          <p class="text-sm text-slate-500">${new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      `;
      usersList.appendChild(userCard);
    });
  })
  .catch(error => {
    console.error('Error loading users:', error);
    usersList.innerHTML = '<p class="text-red-600">Error loading users. Check console.</p>';
  });
}

// Load and display routes
async function loadRoutes() {
  const token = await getToken();
  const routesList = document.getElementById('routes-list');
  
  if (!routesList) return;
  
  try {
    const response = await fetch(`${API_BASE}/routes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to load routes');
    
    const routes = await response.json();
    
    if (!routes.length) {
      routesList.innerHTML = '<p class="text-slate-600">No routes found.</p>';
      return;
    }
    
    routesList.innerHTML = '';
    routes.forEach(route => {
      const routeCard = document.createElement('div');
      routeCard.className = 'rounded-lg border border-slate-200 bg-white p-4 shadow-sm';
      routeCard.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-slate-900">${route.start} → ${route.end}</h3>
            <p class="text-sm text-slate-600">Price: KES ${route.price}</p>
            <p class="text-sm text-slate-500">Provider: ${route.provider?.username || route.provider || 'Unknown'}</p>
          </div>
          <button class="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200" onclick="deleteRoute('${route._id}')">Delete</button>
        </div>
      `;
      routesList.appendChild(routeCard);
    });
  } catch (error) {
    console.error('Error loading routes:', error);
    routesList.innerHTML = '<p class="text-red-600">Error loading routes.</p>';
  }
}

// Load and display bookings
async function loadBookings() {
  const token = await getToken();
  const bookingsList = document.getElementById('bookings-list');
  
  if (!bookingsList) return;
  
  try {
    const response = await fetch(`${API_BASE}/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to load bookings');
    
    const bookings = await response.json();
    
    if (!bookings.length) {
      bookingsList.innerHTML = '<p class="text-slate-600">No bookings found.</p>';
      return;
    }
    
    bookingsList.innerHTML = '';
    bookings.forEach(booking => {
      const bookingCard = document.createElement('div');
      bookingCard.className = 'rounded-lg border border-slate-200 bg-white p-4 shadow-sm';
      const statusColor = booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700';
      bookingCard.innerHTML = `
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-semibold text-slate-900">${booking.route.start} → ${booking.route.end}</h3>
            <p class="text-sm text-slate-600">Customer: ${booking.user.username}</p>
            <p class="text-sm text-slate-600">Seats: ${booking.selectedSeats.length}</p>
            <p class="mt-1 inline-block rounded-full ${statusColor} px-2 py-1 text-xs font-medium">${booking.paymentStatus}</p>
          </div>
          <p class="text-sm text-slate-500">${new Date(booking.createdAt).toLocaleDateString()}</p>
        </div>
      `;
      bookingsList.appendChild(bookingCard);
    });
  } catch (error) {
    console.error('Error loading bookings:', error);
    bookingsList.innerHTML = '<p class="text-red-600">Error loading bookings.</p>';
  }
}

// Delete route
async function deleteRoute(routeId) {
  if (!confirm('Are you sure you want to delete this route?')) return;
  
  const token = await getToken();
  
  try {
    const response = await fetch(`${API_BASE}/routes/${routeId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to delete route');
    
    alert('Route deleted successfully');
    loadRoutes();
  } catch (error) {
    console.error('Error deleting route:', error);
    alert('Error deleting route');
  }
}

// Load initial data on page load
document.addEventListener('DOMContentLoaded', () => {
  loadBookingStats();
  loadUsers();
});
        if (response.ok) {
            addRouteForm.reset();
            loadRoutes();
        } else {
            alert('Failed to add route');
        }
    } catch (error) {
        console.error('Error adding route:', error);
    }
});

// Load routes
async function loadRoutes() {
    try {
        const response = await fetch(`${API_BASE}/routes`);
        const routes = await response.json();
        displayRoutes(routes);
    } catch (error) {
        console.error('Error loading routes:', error);
    }
}

// Display routes
function displayRoutes(routes) {
    routesList.innerHTML = '';
    routes.forEach(route => {
        const routeItem = document.createElement('div');
        routeItem.className = 'route-item';
        routeItem.innerHTML = `
            <h3>${route.start} to ${route.end}</h3>
            <p>Price: KES ${route.price}</p>
            <button class="delete-btn" onclick="deleteRoute('${route._id}')">Delete</button>
        `;
        routesList.appendChild(routeItem);
    });
}

// Delete route
async function deleteRoute(id) {
    if (confirm('Are you sure you want to delete this route?')) {
        try {
            const response = await fetch(`${API_BASE}/routes/${id}`, { method: 'DELETE' });
            if (response.ok) {
                loadRoutes();
            } else {
                alert('Failed to delete route');
            }
        } catch (error) {
            console.error('Error deleting route:', error);
        }
    }
}

// Load users (assuming an endpoint exists)
async function loadUsers() {
    // Placeholder - implement when backend has user management
    usersList.innerHTML = '<p>User management not implemented yet.</p>';
}

// Load bookings
async function loadBookings() {
    // Placeholder - implement when backend has booking retrieval
    bookingsList.innerHTML = '<p>Booking management not implemented yet.</p>';
}