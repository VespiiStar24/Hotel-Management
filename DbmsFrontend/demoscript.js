// ===== DEMO DATA =====
const demoUsers = [
  {
    username: "guest1",
    password: "guest123",
    role: "guest",
    email: "guest1@example.com",
    phone: "1234567890",
  },
  {
    username: "staff1",
    password: "staff123",
    role: "staff",
    email: "staff1@example.com",
    phone: "9876543210",
  },
];

// ===== ELEMENTS =====
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginFormContainer = document.getElementById("loginFormContainer");
const signupFormContainer = document.getElementById("signupFormContainer");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");

// ===== TAB SWITCHING =====
loginTab.addEventListener("click", () => {
  loginFormContainer.style.display = "block";
  signupFormContainer.style.display = "none";
  loginTab.classList.add("active");
  signupTab.classList.remove("active");
  hideMessages();
});

signupTab.addEventListener("click", () => {
  loginFormContainer.style.display = "none";
  signupFormContainer.style.display = "block";
  signupTab.classList.add("active");
  loginTab.classList.remove("active");
  hideMessages();
});

// ===== MESSAGE FUNCTIONS =====
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add("show");
  successMessage.classList.remove("show");
}

function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.classList.add("show");
  errorMessage.classList.remove("show");
}

function hideMessages() {
  errorMessage.classList.remove("show");
  successMessage.classList.remove("show");
}

// ===== LOGIN FUNCTIONALITY =====
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const roleInput = document.querySelector('input[name="loginRole"]:checked');

  if (!username || !password || !roleInput) {
    showError("Please fill in all fields and select a role");
    return;
  }

  const role = roleInput.value;

  hideMessages();

  const user = demoUsers.find(
    (u) => u.username === username && u.password === password && u.role === role
  );

  if (user) {
    localStorage.setItem("token", `demo-token-${Date.now()}`); // Dynamic token
    localStorage.setItem("role", role);
    localStorage.setItem("username", username);

    if (role === "guest") window.location.href = "guest.html";
    else if (role === "staff") window.location.href = "staff.html";
  } else {
    showError("Invalid username or password");
  }
});

// ===== SIGNUP FUNCTIONALITY =====
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("signupUsername").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById(
    "signupConfirmPassword"
  ).value;
  const phone = document.getElementById("signupPhone").value.trim();

  if (!username || !email || !password || !confirmPassword || !phone) {
    showError("Please fill in all required fields");
    return;
  }

  if (password !== confirmPassword) {
    showError("Passwords do not match");
    return;
  }

  if (password.length < 6) {
    showError("Password must be at least 6 characters long");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError("Please enter a valid email address");
    return;
  }

  // Basic phone validation (10 digits)
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone)) {
    showError("Please enter a valid 10-digit phone number");
    return;
  }

  hideMessages();

  const existingUser = demoUsers.find((u) => u.username === username);
  if (existingUser) {
    showError("Username already exists");
    return;
  }

  demoUsers.push({ username, password, email, phone, role: "guest" });
  showSuccess("Account created successfully! Please login.");
  signupForm.reset();

  setTimeout(() => loginTab.click(), 2000);
});

// ===== AUTO-REDIRECT IF ALREADY LOGGED IN =====
window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token && role) {
    hideMessages(); // Clear any messages before redirect
    if (role === "guest") window.location.href = "guest.html";
    else if (role === "staff") window.location.href = "staff.html";
  }
});
