const API_BASE_URL = "http://localhost:5000/api";

// Elements - with null checks
const logoutBtn = document.getElementById("logoutBtn");
const totalRoomsEl = document.getElementById("totalRooms");
const occupiedRoomsEl = document.getElementById("occupiedRooms");
const pendingOrdersEl = document.getElementById("pendingOrders");
const bookingsContainer = document.getElementById("bookingsContainer");
const roomsContainer = document.getElementById("roomsContainer");
const foodOrdersContainer = document.getElementById("foodOrdersContainer");
const activityLogsContainer = document.getElementById("activityLogsContainer");
const roomForm = document.getElementById("roomForm");
const roomNumberInput = document.getElementById("roomNumber");
const roomStatusSelect = document.getElementById("roomStatus");
const messageDiv = document.getElementById("message"); // This might be null
const usernameDisplay = document.getElementById("usernameDisplay");
const currentDateTime = document.getElementById("currentDateTime");

// Safe message function
function showMessage(msg, type = "success") {
    console.log(`${type}: ${msg}`); // Always log to console
    
    // Only update DOM if messageDiv exists
    if (messageDiv) {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
        setTimeout(() => {
            if (messageDiv) {
                messageDiv.textContent = "";
                messageDiv.className = "message";
            }
        }, 3000);
    }
}

// Check if staff is logged in
window.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    if (!token || role !== "staff") {
        window.location.href = "index.html";
        return;
    }

    if (usernameDisplay) usernameDisplay.textContent = username || "Staff";
    updateDateTime(); // Set initial date/time
    setInterval(updateDateTime, 60000); // Update every minute
    fetchDashboardData();
});

// Update date and time
function updateDateTime() {
    if (!currentDateTime) return;
    
    const now = new Date();
    const options = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    };
    currentDateTime.textContent = now.toLocaleString("en-US", options) + " IST";
}

// Logout
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        showMessage("Logged out successfully!", "success");
        setTimeout(() => (window.location.href = "index.html"), 1000);
    });
}

// Fetch all dashboard data
// Enhanced fetchDashboardData with better error handling
async function fetchDashboardData() {
    const token = localStorage.getItem("token");
    
    if (messageDiv) {
        messageDiv.textContent = "Loading data...";
        messageDiv.className = "message loading";
    }

    try {
        const [overviewRes, bookingsRes, roomsRes, ordersRes, logsRes] =
            await Promise.all([
                fetch(`${API_BASE_URL}/staff/overview`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/staff/bookings`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/staff/rooms`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/staff/food-orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/staff/activity-logs`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

        // Check each response individually
        if (!overviewRes.ok) throw new Error(`Overview: ${overviewRes.status} ${overviewRes.statusText}`);
        if (!bookingsRes.ok) throw new Error(`Bookings: ${bookingsRes.status} ${bookingsRes.statusText}`);
        if (!roomsRes.ok) throw new Error(`Rooms: ${roomsRes.status} ${roomsRes.statusText}`);
        if (!ordersRes.ok) throw new Error(`Orders: ${ordersRes.status} ${ordersRes.statusText}`);
        if (!logsRes.ok) throw new Error(`Logs: ${logsRes.status} ${logsRes.statusText}`);

        const overview = await overviewRes.json();
        const bookings = await bookingsRes.json();
        const rooms = await roomsRes.json();
        const orders = await ordersRes.json();
        const logs = await logsRes.json();

        console.log("📊 Staff Data Loaded:", { 
            overview, 
            bookingsCount: bookings.length, 
            roomsCount: rooms.length, 
            ordersCount: orders.length,
            logsCount: logs.length 
        });
        
        console.log("🍕 Food Orders:", orders);
        console.log("📋 Activity Logs:", logs);

        populateOverview(overview);
        populateBookings(bookings);
        populateRooms(rooms);
        populateFoodOrders(orders);
        populateActivityLogs(logs);
        
        showMessage("Dashboard updated successfully!", "success");
        
    } catch (err) {
        console.error("Fetch error:", err);
        showMessage(`Error: ${err.message}`, "error");
    } finally {
        if (messageDiv) {
            messageDiv.textContent = "";
            messageDiv.className = "message";
        }
    }
}

// Populate overview stats
function populateOverview(data) {
    if (!totalRoomsEl || !occupiedRoomsEl || !pendingOrdersEl) return;
    
    if (data && typeof data === 'object') {
        totalRoomsEl.textContent = data.totalRooms || 0;
        occupiedRoomsEl.textContent = data.occupiedRooms || 0;
        pendingOrdersEl.textContent = data.pendingOrders || 0;
    }
}

// Populate bookings
function populateBookings(bookings) {
    if (!bookingsContainer) return;
    
    bookingsContainer.innerHTML = "";
    
    if (bookings && bookings.length > 0) {
        bookings.forEach((b) => {
            const div = document.createElement("div");
            div.className = "booking-item";
            div.innerHTML = `
                <h4>Booking #${b.BookingID || b.id}</h4>
                <p><strong>Guest:</strong> ${b.guestName || b.GuestName}</p>
                <p><strong>Room:</strong> ${b.roomNumber || b.RoomNumber}</p>
                <p><strong>Check-in:</strong> ${b.checkIn || b.CheckIn}</p>
                <p><strong>Check-out:</strong> ${b.checkOut || b.CheckOut}</p>
                <p><strong>Status:</strong> <span class="status-badge ${(b.status || b.Status || '').toLowerCase()}">${b.status || b.Status}</span></p>
            `;
            bookingsContainer.appendChild(div);
        });
    } else {
        bookingsContainer.innerHTML = '<p class="loading-text">No bookings found</p>';
    }
}

// Populate rooms
function populateRooms(rooms) {
    if (!roomsContainer) return;
    
    roomsContainer.innerHTML = "";
    
    if (rooms && rooms.length > 0) {
        rooms.forEach((r) => {
            const div = document.createElement("div");
            div.className = "booking-item";
            div.innerHTML = `
                <h4>Room #${r.number || r.RoomNumber}</h4>
                <p><strong>Type:</strong> ${r.Type || r.type}</p>
                <p><strong>Status:</strong> <span class="status-badge ${(r.status || r.Status || '').toLowerCase()}">${r.status || r.Status}</span></p>
                <p><strong>Price:</strong> ₹${r.Price || r.price}</p>
            `;
            roomsContainer.appendChild(div);
        });
    } else {
        roomsContainer.innerHTML = '<p class="loading-text">No rooms found</p>';
    }
}

// Handle room form submission
if (roomForm) {
    roomForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const roomNumber = roomNumberInput ? roomNumberInput.value.trim() : "";

        if (!roomNumber || roomNumber < 1) {
            showMessage("Please enter a valid room number (minimum 1)", "error");
            return;
        }

        const roomData = {
            number: roomNumber,
            status: roomStatusSelect ? roomStatusSelect.value : "Available",
        };

        const submitBtn = roomForm.querySelector("button[type='submit']");
        if (!submitBtn) return;

        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Processing...";

        try {
            const res = await fetch(`${API_BASE_URL}/staff/rooms`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(roomData),
            });
            
            const data = await res.json();
            if (res.ok) {
                showMessage(data.msg || "Room added/updated successfully!", "success");
                fetchDashboardData();
                if (roomForm) roomForm.reset();
            } else {
                showMessage(data.msg || "Failed to add/update room.", "error");
            }
        } catch (err) {
            console.error(err);
            showMessage("Server error while updating room.", "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Populate food orders
// Populate food orders
// Populate food orders - COMPLETELY FIXED VERSION
function populateFoodOrders(orders) {
    if (!foodOrdersContainer) {
        console.error("❌ Food orders container not found!");
        return;
    }
    
    console.log("🍕 populateFoodOrders called with:", orders);
    
    // Clear container
    foodOrdersContainer.innerHTML = "";
    
    if (orders && orders.length > 0) {
        console.log(`🍕 Displaying ${orders.length} food orders`);
        
        orders.forEach((order) => {
            console.log("🍕 Creating element for order:", order);
            
            const div = document.createElement("div");
            div.className = "order-item";
            
            // Extract data with proper fallbacks
            const orderId = order.id || order.OrderID || 'N/A';
            const guestName = order.guestName || order.GuestName || 'Unknown Guest';
            const item = order.Item || order.item || 'Unknown Item';
            const quantity = order.Quantity || order.quantity || 0;
            const status = order.Status || order.status || 'Pending';
            const orderTime = order.OrderTime || order.orderTime;
            
            // Format the time
            let formattedTime = 'Unknown';
            if (orderTime) {
                try {
                    formattedTime = new Date(orderTime).toLocaleString();
                } catch (e) {
                    formattedTime = String(orderTime);
                }
            }
            
            // Create status dropdown options
            const statusOptions = `
                <option value="Pending" ${status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="Delivered" ${status === 'Delivered' ? 'selected' : ''}>Delivered</option>
            `;
            
            // Create the HTML content
            div.innerHTML = `
                <div class="order-header">
                    <h4>Order #${orderId}</h4>
                    <span class="guest-badge">${guestName}</span>
                </div>
                <div class="order-details">
                    <p><strong>Item:</strong> ${item}</p>
                    <p><strong>Quantity:</strong> ${quantity}</p>
                    <p><strong>Ordered:</strong> ${formattedTime}</p>
                    <div class="status-control">
                        <label><strong>Status:</strong></label>
                        <select data-order-id="${orderId}" class="orderStatusSelect">
                            ${statusOptions}
                        </select>
                    </div>
                </div>
            `;
            
            foodOrdersContainer.appendChild(div);
        });

        // Add event listeners for status changes
        const statusSelects = foodOrdersContainer.querySelectorAll('.orderStatusSelect');
        console.log(`🍕 Added ${statusSelects.length} status dropdowns`);
        
        statusSelects.forEach(select => {
            select.addEventListener('change', async function() {
                const orderId = this.dataset.orderId;
                const newStatus = this.value;
                
                console.log(`🔄 Changing order ${orderId} to status: ${newStatus}`);
                
                try {
                    const response = await fetch(
                        `${API_BASE_URL}/staff/food-orders/${orderId}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                            body: JSON.stringify({ status: newStatus }),
                        }
                    );
                    
                    const data = await response.json();
                    if (response.ok) {
                        showMessage(`Order #${orderId} status updated to ${newStatus}`, "success");
                        // Refresh the data
                        fetchDashboardData();
                    } else {
                        showMessage(data.msg || "Failed to update order status", "error");
                        // Revert the selection on error
                        this.value = status;
                    }
                } catch (err) {
                    console.error("Status update error:", err);
                    showMessage("Server error while updating order status", "error");
                    // Revert the selection on error
                    this.value = status;
                }
            });
        });
        
    } else {
        console.log("🍕 No food orders to display");
        foodOrdersContainer.innerHTML = `
            <div class="no-orders-message">
                <p>No food orders found</p>
                <small>When guests place food orders, they will appear here.</small>
            </div>
        `;
    }
}

// Populate activity logs
function populateActivityLogs(logs) {
    if (!activityLogsContainer) return;
    
    activityLogsContainer.innerHTML = "";
    
    if (logs && logs.length > 0) {
        logs.forEach((log) => {
            const div = document.createElement("div");
            div.className = "booking-item";
            div.innerHTML = `
                <h4>${log.time}</h4>
                <p><strong>Action:</strong> ${log.action}</p>
                <p><strong>User:</strong> ${log.user}</p>
            `;
            activityLogsContainer.appendChild(div);
        });
    } else {
        activityLogsContainer.innerHTML = '<p class="loading-text">No activity logs found</p>';
    }
}