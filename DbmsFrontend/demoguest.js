// API Base URL
const API_BASE_URL = "http://localhost:5000";

// DEMO MODE - Set to false when backend is ready
const DEMO_MODE = flase;

// Get authentication token and user info from localStorage
let token = localStorage.getItem("token");
let username = localStorage.getItem("username");
let role = localStorage.getItem("role");

// ========================================
// DEMO MODE - AUTO LOGIN
// ========================================

if (DEMO_MODE) {
  // Auto-create demo credentials if not present
  if (!token || !username || !role) {
    token = "demo-token-12345";
    username = "DemoGuest";
    role = "guest";
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("role", role);
  }
}

// ========================================
// AUTHENTICATION CHECK
// ========================================

// Check if user is logged in
if (!token || role !== "guest") {
  // Not logged in or not a guest, redirect to login
  if (!DEMO_MODE) {
    window.location.href = "index.html";
  }
}

// ========================================
// LOGOUT FUNCTIONALITY
// ========================================

document.getElementById("logoutBtn").addEventListener("click", function () {
  // Clear localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");

  // Redirect to login page
  window.location.href = "index.html";
});

// ========================================
// TOAST NOTIFICATION SYSTEM
// ========================================

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  // Hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ========================================
// DEMO DATA
// ========================================

const DEMO_BOOKINGS = [
  {
    id: 1,
    room_number: "101",
    room_id: 1,
    check_in_date: "2025-11-01",
    check_out_date: "2025-11-05",
    total_cost: 8000,
  },
  {
    id: 2,
    room_number: "205",
    room_id: 2,
    check_in_date: "2025-11-15",
    check_out_date: "2025-11-18",
    total_cost: 9000,
  },
];

const DEMO_ROOMS = [
  { id: 1, room_number: "101", room_type: "Deluxe", price: 2000 },
  { id: 2, room_number: "102", room_type: "Suite", price: 3500 },
  { id: 3, room_number: "103", room_type: "Standard", price: 1500 },
  { id: 4, room_number: "201", room_type: "Deluxe", price: 2000 },
  { id: 5, room_number: "202", room_type: "Presidential Suite", price: 5000 },
];

const DEMO_FOOD_ORDERS = [
  {
    id: 1,
    food_item: "Chicken Biryani",
    quantity: 2,
    special_instructions: "Extra spicy please",
    order_time: "2025-10-26T14:30:00",
    status: "preparing",
  },
  {
    id: 2,
    food_item: "Margherita Pizza",
    quantity: 1,
    special_instructions: "",
    order_time: "2025-10-25T19:15:00",
    status: "delivered",
  },
  {
    id: 3,
    food_item: "Caesar Salad",
    quantity: 1,
    special_instructions: "No croutons",
    order_time: "2025-10-26T12:00:00",
    status: "delivered",
  },
];

// ========================================
// LOAD MY BOOKINGS
// ========================================

async function loadBookings() {
  const bookingsList = document.getElementById("bookingsList");

  if (DEMO_MODE) {
    // Use demo data
    if (DEMO_BOOKINGS.length > 0) {
      bookingsList.innerHTML = DEMO_BOOKINGS.map(
        (booking) => `
                <div class="booking-item">
                    <h4>Room ${booking.room_number}</h4>
                    <p><strong>Check-in:</strong> ${booking.check_in_date}</p>
                    <p><strong>Check-out:</strong> ${booking.check_out_date}</p>
                    <p><strong>Cost:</strong> ₹${booking.total_cost}</p>
                    <span class="status-badge status-confirmed">Confirmed</span>
                </div>
            `
      ).join("");
    }
    return;
  }

  // Real backend code
  try {
    const response = await fetch(`${API_BASE_URL}/guest/bookings`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      if (data.bookings && data.bookings.length > 0) {
        bookingsList.innerHTML = data.bookings
          .map(
            (booking) => `
                    <div class="booking-item">
                        <h4>Room ${booking.room_number || booking.room_id}</h4>
                        <p><strong>Check-in:</strong> ${
                          booking.check_in_date
                        }</p>
                        <p><strong>Check-out:</strong> ${
                          booking.check_out_date
                        }</p>
                        <p><strong>Cost:</strong> ₹${booking.total_cost}</p>
                        <span class="status-badge status-confirmed">Confirmed</span>
                    </div>
                `
          )
          .join("");
      } else {
        bookingsList.innerHTML =
          '<p class="loading-text">No bookings yet. Book your first room!</p>';
      }
    } else {
      bookingsList.innerHTML =
        '<p class="loading-text">Failed to load bookings</p>';
    }
  } catch (error) {
    console.error("Error loading bookings:", error);
    bookingsList.innerHTML =
      '<p class="loading-text">Error loading bookings</p>';
  }
}

// ========================================
// LOAD AVAILABLE ROOMS
// ========================================

async function loadRooms() {
  const roomSelect = document.getElementById("roomSelect");

  if (DEMO_MODE) {
    // Use demo data
    DEMO_ROOMS.forEach((room) => {
      const option = document.createElement("option");
      option.value = room.id;
      option.textContent = `Room ${room.room_number} - ${room.room_type} (₹${room.price}/night)`;
      option.dataset.price = room.price;
      roomSelect.appendChild(option);
    });
    return;
  }

  // Real backend code
  try {
    const response = await fetch(`${API_BASE_URL}/guest/rooms`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok && data.rooms) {
      data.rooms.forEach((room) => {
        const option = document.createElement("option");
        option.value = room.id;
        option.textContent = `Room ${room.room_number} - ${room.room_type} (₹${room.price}/night)`;
        option.dataset.price = room.price;
        roomSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error loading rooms:", error);
    showToast("Failed to load rooms", "error");
  }
}

// ========================================
// CALCULATE BOOKING COST
// ========================================

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
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (nights > 0) {
      const totalCost = pricePerNight * nights;
      costDisplay.textContent = `₹${totalCost}`;
    } else {
      costDisplay.textContent = "₹0";
    }
  } else {
    costDisplay.textContent = "₹0";
  }
}

// Add event listeners for cost calculation
document.getElementById("roomSelect").addEventListener("change", calculateCost);
document
  .getElementById("checkInDate")
  .addEventListener("change", calculateCost);
document
  .getElementById("checkOutDate")
  .addEventListener("change", calculateCost);

// ========================================
// BOOK ROOM
// ========================================

document
  .getElementById("bookRoomForm")
  .addEventListener("submit", async function (e) {
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

    if (DEMO_MODE) {
      // Demo mode - simulate success
      showToast("Room booked successfully! (Demo Mode)", "success");

      // Add to demo bookings with a unique ID
      const roomSelect = document.getElementById("roomSelect");
      const selectedOption = roomSelect.options[roomSelect.selectedIndex];
      const roomNumber = selectedOption.textContent
        .split(" - ")[0]
        .replace("Room ", "");

      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const pricePerNight = parseFloat(selectedOption.dataset.price);

      DEMO_BOOKINGS.unshift({
        id: Date.now(), // Use timestamp for unique ID
        room_number: roomNumber,
        room_id: roomId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        total_cost: pricePerNight * nights,
      });

      // Reset form
      this.reset();
      document.getElementById("estimatedCost").textContent = "₹0";

      // Reload bookings
      loadBookings();
      return;
    }

    // Real backend code
    try {
      const response = await fetch(`${API_BASE_URL}/guest/book`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room_id: roomId,
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Room booked successfully!", "success");
        this.reset();
        document.getElementById("estimatedCost").textContent = "₹0";
        loadBookings();
      } else {
        showToast(data.message || "Failed to book room", "error");
      }
    } catch (error) {
      console.error("Error booking room:", error);
      showToast("Connection error. Please try again.", "error");
    }
  });

// ========================================
// LOAD MY FOOD ORDERS
// ========================================

async function loadFoodOrders() {
  const foodOrdersList = document.getElementById("foodOrdersList");

  if (DEMO_MODE) {
    // Use demo data
    if (DEMO_FOOD_ORDERS.length > 0) {
      foodOrdersList.innerHTML = DEMO_FOOD_ORDERS.map((order) => {
        const statusClass =
          order.status === "delivered"
            ? "status-delivered"
            : "status-preparing";
        return `
                    <div class="order-item">
                        <h4>${order.food_item}</h4>
                        <p><strong>Quantity:</strong> ${order.quantity}</p>
                        ${
                          order.special_instructions
                            ? `<p><strong>Instructions:</strong> ${order.special_instructions}</p>`
                            : ""
                        }
                        <p><strong>Ordered:</strong> ${new Date(
                          order.order_time
                        ).toLocaleString()}</p>
                        <span class="status-badge ${statusClass}">${
          order.status
        }</span>
                    </div>
                `;
      }).join("");
    }
    return;
  }

  // Real backend code
  try {
    const response = await fetch(`${API_BASE_URL}/guest/orders`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      if (data.orders && data.orders.length > 0) {
        foodOrdersList.innerHTML = data.orders
          .map((order) => {
            const statusClass =
              order.status === "delivered"
                ? "status-delivered"
                : "status-preparing";
            return `
                        <div class="order-item">
                            <h4>${order.food_item}</h4>
                            <p><strong>Quantity:</strong> ${order.quantity}</p>
                            ${
                              order.special_instructions
                                ? `<p><strong>Instructions:</strong> ${order.special_instructions}</p>`
                                : ""
                            }
                            <p><strong>Ordered:</strong> ${new Date(
                              order.order_time
                            ).toLocaleString()}</p>
                            <span class="status-badge ${statusClass}">${
              order.status
            }</span>
                        </div>
                    `;
          })
          .join("");
      } else {
        foodOrdersList.innerHTML =
          '<p class="loading-text">No orders yet. Order some food!</p>';
      }
    } else {
      foodOrdersList.innerHTML =
        '<p class="loading-text">Failed to load orders</p>';
    }
  } catch (error) {
    console.error("Error loading orders:", error);
    foodOrdersList.innerHTML =
      '<p class="loading-text">Error loading orders</p>';
  }
}

// ========================================
// ORDER FOOD
// ========================================

document
  .getElementById("orderFoodForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const foodItem = document.getElementById("foodItem").value.trim();
    const quantity = parseInt(document.getElementById("quantity").value);
    const specialInstructions = document
      .getElementById("specialInstructions")
      .value.trim();

    // Validation
    if (!foodItem || quantity < 1) {
      showToast("Please enter valid food item and quantity", "error");
      return;
    }

    if (DEMO_MODE) {
      // Demo mode - simulate success
      showToast("Food order placed successfully! (Demo Mode)", "success");

      // Add to demo orders
      DEMO_FOOD_ORDERS.unshift({
        id: Date.now(), // Use timestamp for unique ID
        food_item: foodItem,
        quantity: quantity,
        special_instructions: specialInstructions,
        order_time: new Date().toISOString(),
        status: "preparing",
      });

      // Reset form
      this.reset();

      // Reload food orders
      loadFoodOrders();
      return;
    }

    // Real backend code
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
        this.reset();
        loadFoodOrders();
      } else {
        showToast(data.message || "Failed to place order", "error");
      }
    } catch (error) {
      console.error("Error ordering food:", error);
      showToast("Connection error. Please try again.", "error");
    }
  });

// ========================================
// SET MINIMUM DATE FOR DATE PICKERS
// ========================================

// Set minimum date to today
const today = new Date().toISOString().split("T")[0];
document.getElementById("checkInDate").setAttribute("min", today);
document.getElementById("checkOutDate").setAttribute("min", today);

// ========================================
// INITIALIZE DASHBOARD
// ========================================

// Load all data when page loads
window.addEventListener("DOMContentLoaded", function () {
  // Display username in navbar
  document.getElementById("usernameDisplay").textContent =
    username || "DemoGuest";

  loadBookings();
  loadRooms();
  loadFoodOrders();

  if (DEMO_MODE) {
    console.log("DEMO MODE ACTIVE - Using fake data");
    console.log("Set DEMO_MODE = false in demoguest.js when backend is ready");
  }
});
