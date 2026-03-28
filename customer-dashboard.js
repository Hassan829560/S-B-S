// Customer Dashboard Script
const API_BASE = 'http://localhost:5000/api';

const bookingForm = document.getElementById('booking-form');
const routeSelect = document.getElementById('route-select');
const seatLayout = document.getElementById('seat-layout');
const selectedCount = document.getElementById('selected-count');
const bookingsList = document.getElementById('bookings-list');

let selectedSeats = [];
let occupiedSeats = [];

// Load routes and bookings on page load
document.addEventListener('DOMContentLoaded', () => {
    loadAvailableRoutes();
    loadUserBookings();
    generateSeatLayout();
});

// Get token helper
function getToken() {
    return localStorage.getItem('salama-token');
}

// Load available routes for booking
async function loadAvailableRoutes() {
    try {
        const response = await fetch(`${API_BASE}/routes`);
        if (!response.ok) throw new Error('Failed to load routes');
        
        const routes = await response.json();
        
        // Populate route select dropdown
        routeSelect.innerHTML = '<option value="">Select a route to book...</option>';
        routes.forEach(route => {
            const option = document.createElement('option');
            option.value = route._id;
            option.textContent = `${route.start} → ${route.end} (KES ${route.price})`;
            routeSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading routes:', error);
        routeSelect.innerHTML = '<option value="">Error loading routes</option>';
    }
}

// Load occupied seats for selected route
async function loadOccupiedSeats(routeId) {
    try {
        const response = await fetch(`${API_BASE}/bookings/route/${routeId}`);
        if (!response.ok) throw new Error('Failed to load bookings');
        
        const bookings = await response.json();
        occupiedSeats = bookings.flatMap(booking => booking.selectedSeats.map(seat => seat.seatNumber));
        generateSeatLayout();
    } catch (error) {
        console.error('Error loading occupied seats:', error);
        occupiedSeats = [];
        generateSeatLayout();
    }
}

// Add event listener for route selection
routeSelect.addEventListener('change', (e) => {
    const routeId = e.target.value;
    if (routeId) {
        loadOccupiedSeats(routeId);
    } else {
        occupiedSeats = [];
        generateSeatLayout();
    }
});

// Handle booking form submission
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const routeId = routeSelect.value;
        const token = getToken();
        
        // Validation
        if (!routeId) {
            alert('Please select a route');
            return;
        }
        
        if (selectedSeats.length === 0) {
            alert('Please select at least one seat');
            return;
        }
        
        if (!token) {
            alert('Please login to book a route');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    routeId,
                    selectedSeats
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Booking failed');
            }
            
            alert('✅ Booking created successfully!');
            selectedSeats = [];
            updateSelectedCount();
            generateSeatLayout(); // Reset seat layout
            bookingForm.reset();
            loadUserBookings();
        } catch (error) {
            console.error('Error creating booking:', error);
            alert(`❌ Booking failed: ${error.message}`);
        }
    });
}

// Load and display user's bookings
async function loadUserBookings() {
    const token = getToken();
    
    if (!bookingsList) return;
    
    if (!token) {
        bookingsList.innerHTML = '<p class="text-slate-600">Please login to view your bookings.</p>';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load bookings');
        
        const bookings = await response.json();
        
        if (!bookings.length) {
            bookingsList.innerHTML = '<p class="text-slate-600">You have no bookings yet.</p>';
            return;
        }
        
        bookingsList.innerHTML = '';
        bookings.forEach(booking => {
            const bookingCard = document.createElement('div');
            bookingCard.className = 'rounded-lg border border-slate-200 bg-white p-6 shadow-sm';
            const statusColor = booking.paymentStatus === 'paid' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-amber-100 text-amber-700';
            const bookingDate = new Date(booking.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            bookingCard.innerHTML = `
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <h3 class="text-lg font-semibold text-slate-900">${booking.route.start} → ${booking.route.end}</h3>
                        <p class="text-sm text-slate-600">Price: KES ${booking.route.price}</p>
                    </div>
                    <span class="inline-block rounded-full ${statusColor} px-3 py-1 text-sm font-medium">${booking.paymentStatus}</span>
                </div>
                <div class="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div><span class="text-slate-600">Seats:</span> <span class="font-medium">${booking.selectedSeats.length}</span></div>
                    <div><span class="text-slate-600">Total:</span> <span class="font-medium">KES ${booking.route.price * booking.selectedSeats.length}</span></div>
                </div>
                <div class="mb-3 text-sm">
                    <div><span class="text-slate-600">Selected Seats:</span> ${booking.selectedSeats.map(seat => seat.seatNumber).join(', ')}</div>
                    ${booking.paymentStatus === 'paid' ? `<div><span class="text-slate-600">Ticket Code:</span> <span class="font-medium">${booking.ticketCode}</span></div>` : ''}
                </div>
                <p class="text-xs text-slate-500">Booked on ${bookingDate}</p>
            `;

            if (booking.paymentStatus === 'pending') {
                const controls = document.createElement('div');
                controls.className = 'mt-3 flex flex-wrap gap-2';

                const payBtn = document.createElement('button');
                payBtn.className = 'rounded bg-green-600 px-3 py-2 text-xs text-white hover:bg-green-700';
                payBtn.textContent = 'Pay Now';
                payBtn.addEventListener('click', () => payBooking(booking._id));
                controls.appendChild(payBtn);

                const cancelBtn = document.createElement('button');
                cancelBtn.className = 'rounded bg-red-600 px-3 py-2 text-xs text-white hover:bg-red-700';
                cancelBtn.textContent = 'Cancel Booking';
                cancelBtn.addEventListener('click', () => cancelBooking(booking._id));
                controls.appendChild(cancelBtn);

                bookingCard.appendChild(controls);
            } else {
                const ticketBtn = document.createElement('button');
                ticketBtn.className = 'mt-3 rounded bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700';
                ticketBtn.textContent = 'Download Ticket';
                ticketBtn.addEventListener('click', () => downloadTicket(booking._id));
                bookingCard.appendChild(ticketBtn);
            }

            bookingsList.appendChild(bookingCard);
        });
    } catch (error) {
        console.error('Error loading bookings:', error);
        bookingsList.innerHTML = '<p class="text-red-600">Error loading bookings. Please refresh the page.</p>';
    }
}

// Pay for a booking via MPESA simulation
async function payBooking(bookingId) {
    const token = getToken();
    if (!token) {
        alert('Please login to pay.');
        return;
    }

    const phone = prompt('Enter MPESA phone number (e.g., 2547XXXXXXXX):');
    if (!phone) {
        alert('MPESA phone number is required.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/bookings/${bookingId}/mpesa`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ phone })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'MPESA payment failed');
        }

        const result = await response.json();
        alert(`✅ MPESA payment success! Ref: ${result.mpesa.transactionRef}`);
        loadUserBookings();
    } catch (error) {
        console.error('Error processing MPESA payment:', error);
        alert(`❌ MPESA payment failed: ${error.message}`);
    }
}

async function cancelBooking(bookingId) {
    const token = getToken();
    if (!token) {
        alert('Please login to cancel bookings.');
        return;
    }

    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
        const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Cancellation failed');
        }

        alert('✅ Booking cancelled successfully.');
        loadUserBookings();
    } catch (error) {
        console.error('Error cancelling booking:', error);
        alert(`❌ Cancellation failed: ${error.message}`);
    }
}

// Download ticket as PDF
async function downloadTicket(bookingId) {
    const token = getToken();
    if (!token) {
        alert('Please login to download your ticket.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/bookings/${bookingId}/ticket`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ticket retrieval failed');
        }

        const ticket = await response.json();
        const doc = new window.jspdf.jsPDF();
    doc.setFontSize(18);
    doc.text('Salama Ticket', 20, 25);

    doc.setFontSize(12);
    doc.text(`Ticket Code: ${ticket.ticketCode}`, 20, 40);
    doc.text(`Passenger: ${ticket.user.username} (${ticket.user.email})`, 20, 50);
    doc.text(`Route: ${ticket.route.start} → ${ticket.route.end}`, 20, 60);
    doc.text(`Seats: ${ticket.seats.map(s => s.seatNumber).join(', ')}`, 20, 70);
    doc.text(`Total: KES ${ticket.totalAmount}`, 20, 80);
    doc.text(`Issued: ${new Date(ticket.issuedAt).toLocaleString()}`, 20, 90);
    doc.text(`Payment Status: ${ticket.paymentStatus || 'paid'}`, 20, 100);

    doc.save(`salama-ticket-${ticket.ticketCode}.pdf`);
    alert('✅ Ticket PDF downloaded.');
  } catch (error) {
    console.error('Error downloading ticket:', error);
    alert(`❌ Ticket download failed: ${error.message}`);
  }
}

// Generate seat layout (4 rows, 5 seats per row)
function generateSeatLayout() {
    seatLayout.innerHTML = '';
    const rows = ['A', 'B', 'C', 'D'];
    const seatsPerRow = 5;

    rows.forEach(row => {
        for (let i = 1; i <= seatsPerRow; i++) {
            const seatNumber = `${row}${i}`;
            const seatBtn = document.createElement('button');
            seatBtn.type = 'button';
            seatBtn.className = 'w-10 h-10 border border-slate-300 rounded text-xs font-medium';
            seatBtn.textContent = seatNumber;
            seatBtn.dataset.seat = seatNumber;

            if (occupiedSeats.includes(seatNumber)) {
                seatBtn.classList.add('bg-red-500', 'text-white', 'cursor-not-allowed');
                seatBtn.disabled = true;
            } else if (selectedSeats.some(seat => seat.seatNumber === seatNumber)) {
                seatBtn.classList.add('bg-sky-600', 'text-white');
            } else {
                seatBtn.classList.add('hover:bg-slate-100');
            }

            if (!seatBtn.disabled) {
                seatBtn.addEventListener('click', () => toggleSeat(seatNumber));
            }
            seatLayout.appendChild(seatBtn);
        }
    });
}

// Toggle seat selection
function toggleSeat(seatNumber) {
    const index = selectedSeats.findIndex(seat => seat.seatNumber === seatNumber);
    if (index > -1) {
        selectedSeats.splice(index, 1);
    } else {
        selectedSeats.push({ seatNumber });
    }
    updateSelectedCount();
    generateSeatLayout();
}

// Update selected seats count display
function updateSelectedCount() {
    selectedCount.textContent = selectedSeats.length;
}