// Demo Elements
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
const messageDiv = document.getElementById("message");
const usernameDisplay = document.getElementById("usernameDisplay");
const currentDateTime = document.getElementById("currentDateTime");

// Check if staff is logged in
window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  if (!token || role !== "staff") {
    window.location.href = "index.html";
  } else {
    if (usernameDisplay) usernameDisplay.textContent = username || "Staff";
    updateDateTime(); // Set initial date/time
    setInterval(updateDateTime, 60000); // Update every minute
    fetchDemoDashboardData(); // Use demo data
  }
});

// Update date and time
function updateDateTime() {
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
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  showMessage("Logged out successfully!", "success");
  setTimeout(() => (window.location.href = "index.html"), 1000);
});

// Fetch demo dashboard data
function fetchDemoDashboardData() {
  // Hardcoded demo data
  const demoOverview = {
    totalRooms: 50,
    occupiedRooms: 20,
    pendingOrders: 5,
  };

  const demoBookings = [
    {
      id: 101,
      guestName: "John Doe",
      roomNumber: 101,
      checkIn: "2025-10-25",
      checkOut: "2025-10-27",
      status: "Confirmed",
    },
    {
      id: 102,
      guestName: "Jane Smith",
      roomNumber: 102,
      checkIn: "2025-10-26",
      checkOut: "2025-10-28",
      status: "Pending",
    },
  ];

  const demoRooms = [
    { number: 101, status: "Occupied" },
    { number: 102, status: "Available" },
    { number: 103, status: "Maintenance" },
  ];

  const demoOrders = [
    {
      id: 201,
      guestName: "John Doe",
      items: ["Burger", "Fries"],
      status: "Cooking",
    },
    { id: 202, guestName: "Jane Smith", items: ["Pizza"], status: "Ready" },
  ];

  const demoLogs = [
    { time: "2025-10-25 14:30", action: "Room 101 checked in", user: "staff1" },
    { time: "2025-10-25 14:00", action: "Order 201 placed", user: "staff1" },
  ];

  populateOverview(demoOverview);
  populateBookings(demoBookings);
  populateRooms(demoRooms);
  populateFoodOrders(demoOrders);
  populateActivityLogs(demoLogs);
}

// Populate overview stats
function populateOverview(data) {
  totalRoomsEl.textContent = data.totalRooms;
  occupiedRoomsEl.textContent = data.occupiedRooms;
  pendingOrdersEl.textContent = data.pendingOrders;
}

// Populate bookings
function populateBookings(bookings) {
  bookingsContainer.innerHTML = "";
  bookings.forEach((b) => {
    const div = document.createElement("div");
    div.className = "booking-item";
    div.innerHTML = `
      <h4>Booking #${b.id}</h4>
      <p><strong>Guest:</strong> ${b.guestName}</p>
      <p><strong>Room:</strong> ${b.roomNumber}</p>
      <p><strong>Check-in:</strong> ${b.checkIn}</p>
      <p><strong>Check-out:</strong> ${b.checkOut}</p>
      <p><strong>Status:</strong> <span class="status-badge ${b.status
        .toLowerCase()
        .replace(" ", "-")}">${b.status}</span></p>
    `;
    bookingsContainer.appendChild(div);
  });
}

// Populate rooms
function populateRooms(rooms) {
  roomsContainer.innerHTML = "";
  rooms.forEach((r) => {
    const div = document.createElement("div");
    div.className = "booking-item";
    div.innerHTML = `
      <h4>Room #${r.number}</h4>
      <p><strong>Status:</strong> <span class="status-badge ${r.status
        .toLowerCase()
        .replace(" ", "-")}">${r.status}</span></p>
    `;
    roomsContainer.appendChild(div);
  });
}

// Handle room form submission (demo mode)
roomForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const roomNumber = roomNumberInput.value.trim();

  if (!roomNumber || roomNumber < 1) {
    showMessage("Please enter a valid room number (minimum 1)", "error");
    return;
  }

  const roomData = {
    number: roomNumber,
    status: roomStatusSelect.value,
  };

  const submitBtn = roomForm.querySelector("button[type='submit']");
  submitBtn.disabled = true;

  // Simulate backend response
  setTimeout(() => {
    showMessage("Room added/updated successfully! (Demo)", "success");
    fetchDemoDashboardData(); // Refresh demo data
    roomForm.reset();
    submitBtn.disabled = false;
  }, 1000); // Simulate delay
});

// Populate food orders
function populateFoodOrders(orders) {
  foodOrdersContainer.innerHTML = "";
  orders.forEach((order) => {
    const div = document.createElement("div");
    div.className = "order-item";
    div.innerHTML = `
      <h4>Order #${order.id}</h4>
      <p><strong>Guest:</strong> ${order.guestName}</p>
      <p><strong>Items:</strong> ${order.items.join(", ")}</p>
      <p><strong>Status:</strong> 
        <select data-order-id="${order.id}" class="orderStatusSelect">
          <option value="cooking" ${
            order.status === "cooking" ? "selected" : ""
          }>Cooking</option>
          <option value="ready" ${
            order.status === "ready" ? "selected" : ""
          }>Ready</option>
          <option value="delivered" ${
            order.status === "delivered" ? "selected" : ""
          }>Delivered</option>
        </select>
      </p>
    `;
    foodOrdersContainer.appendChild(div);
  });

  foodOrdersContainer.addEventListener("change", (e) => {
    if (e.target.classList.contains("orderStatusSelect")) {
      const orderId = e.target.dataset.orderId;
      const newStatus = e.target.value;
      // Simulate backend response
      setTimeout(() => {
        showMessage(
          `Order ${orderId} status updated to ${newStatus} (Demo)`,
          "success"
        );
        fetchDemoDashboardData(); // Refresh demo data
      }, 500);
    }
  });
}

// Populate activity logs
function populateActivityLogs(logs) {
  activityLogsContainer.innerHTML = "";
  logs.slice(-10).forEach((log) => {
    const div = document.createElement("div");
    div.className = "booking-item";
    div.innerHTML = `
      <h4>${log.time}</h4>
      <p><strong>Action:</strong> ${log.action}</p>
      <p><strong>User:</strong> ${log.user}</p>
    `;
    activityLogsContainer.appendChild(div);
  });
}

// Show messages
function showMessage(msg, type) {
  messageDiv.textContent = msg;
  messageDiv.className = `message ${type}`;
  setTimeout(() => {
    messageDiv.textContent = "";
    messageDiv.className = "message";
  }, 3000);
}
