const API_BASE_URL = "http://localhost:5000/api";

// Get authentication token and user info from localStorage
let token = localStorage.getItem("token");
let username = localStorage.getItem("username");
let role = localStorage.getItem("role");

console.log("🚀 Guest.js loaded - Token:", token ? "Present" : "Missing", "Username:", username);

// AUTHENTICATION CHECK
if (!token || role !== "guest") {
    console.log("❌ Redirecting to login - missing token or wrong role");
    window.location.href = "index.html";
}

// LOGOUT FUNCTIONALITY
document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.clear();
    window.location.href = "index.html";
});

// TOAST NOTIFICATION SYSTEM
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// LOAD MY BOOKINGS
async function loadBookings() {
    const bookingsList = document.getElementById("bookingsList");
    bookingsList.innerHTML = '<p class="loading-text">Loading bookings...</p>';
    
    console.log("📅 Attempting to load bookings...");

    try {
        const response = await fetch(`${API_BASE_URL}/guest/dashboard`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log("📅 Dashboard response status:", response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log("📅 Dashboard data received:", data);
            
            if (data.bookings && data.bookings.length > 0) {
                bookingsList.innerHTML = data.bookings.map(booking => {
                    // Fix: Handle different status values properly
                    const statusClass = booking.Status === "Confirmed" ? "status-confirmed" : 
                                      booking.Status === "Pending" ? "status-pending" : "status-cancelled";
                    return `
                    <div class="booking-item">
                        <h4>Room ${booking.RoomNumber}</h4>
                        <p><strong>Type:</strong> ${booking.Type}</p>
                        <p><strong>Check-in:</strong> ${booking.CheckIn}</p>
                        <p><strong>Check-out:</strong> ${booking.CheckOut}</p>
                        <p><strong>Status:</strong> <span class="status-badge ${statusClass}">${booking.Status}</span></p>
                    </div>
                    `;
                }).join("");
            } else {
                bookingsList.innerHTML = '<p class="loading-text">No bookings yet. Book your first room!</p>';
            }
        } else {
            const error = await response.json();
            console.error("📅 Bookings error:", error);
            bookingsList.innerHTML = '<p class="loading-text">Failed to load bookings</p>';
        }
    } catch (error) {
        console.error("📅 Bookings fetch error:", error);
        bookingsList.innerHTML = '<p class="loading-text">Connection error loading bookings</p>';
    }
}

// LOAD AVAILABLE ROOMS
async function loadRooms() {
    const roomSelect = document.getElementById("roomSelect");
    roomSelect.innerHTML = '<option value="">Loading rooms...</option>';
    
    console.log("🏨 Attempting to load rooms...");

    try {
        const response = await fetch(`${API_BASE_URL}/guest/rooms`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log("🏨 Rooms response status:", response.status);
        
        if (response.ok) {
            const rooms = await response.json();
            console.log("🏨 Rooms data received:", rooms);
            
            roomSelect.innerHTML = '<option value="">Choose a room...</option>';
            
            if (rooms && rooms.length > 0) {
                rooms.forEach(room => {
                    const option = document.createElement("option");
                    option.value = room.RoomID;
                    option.textContent = `Room ${room.RoomNumber} - ${room.Type} (₹${room.Price}/night)`;
                    option.dataset.price = room.Price;
                    roomSelect.appendChild(option);
                });
                console.log("🏨 Rooms loaded into dropdown");
            } else {
                roomSelect.innerHTML = '<option value="">No rooms available</option>';
            }
        } else {
            const error = await response.json();
            console.error("🏨 Rooms error:", error);
            roomSelect.innerHTML = '<option value="">Error loading rooms</option>';
        }
    } catch (error) {
        console.error("🏨 Rooms fetch error:", error);
        roomSelect.innerHTML = '<option value="">Connection error loading rooms</option>';
    }
}

// LOAD MY FOOD ORDERS
async function loadFoodOrders() {
    const foodOrdersList = document.getElementById("foodOrdersList");
    foodOrdersList.innerHTML = '<p class="loading-text">Loading orders...</p>';
    
    console.log("🍕 Attempting to load food orders...");

    try {
        const response = await fetch(`${API_BASE_URL}/guest/orders`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log("🍕 Food orders response status:", response.status);
        
        if (response.ok) {
            const orders = await response.json();
            console.log("🍕 Food orders data received:", orders);
            
            if (orders && orders.length > 0) {
                foodOrdersList.innerHTML = orders.map(order => {
                    // Fix: Handle food order status properly
                    const statusClass = order.Status === "Delivered" ? "status-delivered" : "status-preparing";
                    const statusText = order.Status === "Delivered" ? "Delivered" : "Preparing";
                    
                    return `
                        <div class="order-item">
                            <h4>${order.Item}</h4>
                            <p><strong>Quantity:</strong> ${order.Quantity}</p>
                            <p><strong>Status:</strong> ${order.Status}</p>
                            ${order.SpecialInstructions ? `<p><strong>Instructions:</strong> ${order.SpecialInstructions}</p>` : ''}
                            <p><strong>Ordered:</strong> ${new Date(order.OrderTime).toLocaleString()}</p>
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>
                    `;
                }).join("");
            } else {
                foodOrdersList.innerHTML = '<p class="loading-text">No orders yet. Order some food!</p>';
            }
        } else {
            const error = await response.json();
            console.error("🍕 Food orders error:", error);
            foodOrdersList.innerHTML = '<p class="loading-text">Failed to load orders</p>';
        }
    } catch (error) {
        console.error("🍕 Food orders fetch error:", error);
        foodOrdersList.innerHTML = '<p class="loading-text">Connection error loading orders</p>';
    }
}

// CALCULATE BOOKING COST
function calculateCost() {
    const roomSelect = document.getElementById("roomSelect");
    const checkInDate = document.getElementById("checkInDate").value;
    const checkOutDate = document.getElementById("checkOutDate").value;
    const costDisplay = document.getElementById("estimatedCost");

    if (roomSelect.value && checkInDate && checkOutDate) {
        const selectedOption = roomSelect.options[roomSelect.selectedIndex];
        const pricePerNight = parseFloat(selectedOption.dataset.price);

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        
        // Fix: Calculate nights properly
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (nights > 0) {
            const totalCost = pricePerNight * nights;
            costDisplay.textContent = `₹${totalCost}`;
        } else {
            costDisplay.textContent = "₹0";
            showToast("Check-out date must be after check-in date", "error");
        }
    } else {
        costDisplay.textContent = "₹0";
    }
}

// Add event listeners for cost calculation
document.getElementById("roomSelect").addEventListener("change", calculateCost);
document.getElementById("checkInDate").addEventListener("change", calculateCost);
document.getElementById("checkOutDate").addEventListener("change", calculateCost);

// BOOK ROOM
document.getElementById("bookRoomForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const roomId = document.getElementById("roomSelect").value;
    const checkInDate = document.getElementById("checkInDate").value;
    const checkOutDate = document.getElementById("checkOutDate").value;

    // Validation
    if (!roomId || !checkInDate || !checkOutDate) {
        showToast("Please fill in all fields", "error");
        return;
    }

    // Check if checkout is after checkin
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
        showToast("Check-out date must be after check-in date", "error");
        return;
    }

    // Disable button during submission
    const submitBtn = this.querySelector("button[type='submit']");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Booking...";

    try {
        const response = await fetch(`${API_BASE_URL}/guest/book`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                room_id: parseInt(roomId), // Ensure it's a number
                check_in_date: checkInDate,
                check_out_date: checkOutDate,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            showToast("Room booked successfully!", "success");

            // Reset form
            this.reset();
            document.getElementById("estimatedCost").textContent = "₹0";

            // Reload all data
            setTimeout(() => {
                loadBookings();
                loadRooms();
                loadFoodOrders();
            }, 1000);
        } else {
            showToast(data.msg || "Failed to book room", "error");
        }
    } catch (error) {
        console.error("Error booking room:", error);
        showToast("Connection error. Please try again.", "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// ORDER FOOD
document.getElementById("orderFoodForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const foodItem = document.getElementById("foodItem").value.trim();
    const quantity = parseInt(document.getElementById("quantity").value);
    const specialInstructions = document.getElementById("specialInstructions").value.trim();

    // Validation
    if (!foodItem || quantity < 1) {
        showToast("Please enter valid food item and quantity", "error");
        return;
    }

    if (foodItem.length < 2) {
        showToast("Please enter a valid food item name", "error");
        return;
    }

    // Disable button during submission
    const submitBtn = this.querySelector("button[type='submit']");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Ordering...";

    try {
        const response = await fetch(`${API_BASE_URL}/guest/order-food`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                food_item: foodItem,
                quantity: quantity,
                special_instructions: specialInstructions,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            showToast("Food order placed successfully!", "success");

            // Reset form
            this.reset();

            // Reload food orders after a short delay
            setTimeout(() => {
                loadFoodOrders();
            }, 500);
        } else {
            showToast(data.msg || "Failed to place order", "error");
        }
    } catch (error) {
        console.error("Error ordering food:", error);
        showToast("Connection error. Please try again.", "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// SET MINIMUM DATE FOR DATE PICKERS
function setMinDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    document.getElementById("checkInDate").setAttribute("min", todayStr);
    document.getElementById("checkOutDate").setAttribute("min", tomorrowStr);
    
    // Set default values
    document.getElementById("checkInDate").value = todayStr;
    document.getElementById("checkOutDate").value = tomorrowStr;
}

// INITIALIZE DASHBOARD
window.addEventListener("DOMContentLoaded", function () {
    console.log("🎯 Dashboard initializing...");
    
    // Display username in navbar
    document.getElementById("usernameDisplay").textContent = username || "Guest";
    console.log("👤 Username displayed:", username);

    // Set minimum dates
    setMinDates();
    
    // Calculate initial cost
    calculateCost();

    // Load all data
    console.log("🔄 Starting to load all data...");
    loadBookings();
    loadRooms();
    loadFoodOrders();
});