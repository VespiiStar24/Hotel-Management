const API_BASE_URL = "http://localhost:5000/api";

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginFormContainer = document.getElementById("loginFormContainer");
const signupFormContainer = document.getElementById("signupFormContainer");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");

// TAB SWITCHING FUNCTIONALITY

// When Login tab is clicked
loginTab.addEventListener("click", function () {
  // Show login form, hide signup form
  loginFormContainer.style.display = "block";
  signupFormContainer.style.display = "none";

  // Update active tab styling
  loginTab.classList.add("active");
  signupTab.classList.remove("active");

  // Clear any messages
  hideMessages();
});

// When Signup tab is clicked
signupTab.addEventListener("click", function () {
  // Hide login form, show signup form
  loginFormContainer.style.display = "none";
  signupFormContainer.style.display = "block";

  // Update active tab styling
  signupTab.classList.add("active");
  loginTab.classList.remove("active");

  // Clear any messages
  hideMessages();
});

// MESSAGE DISPLAY FUNCTIONS

// Show error message
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add("show");
  successMessage.classList.remove("show");
}

// Show success message
function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.classList.add("show");
  errorMessage.classList.remove("show");
}

// Hide all messages
function hideMessages() {
  errorMessage.classList.remove("show");
  successMessage.classList.remove("show");
}

// LOGIN FUNCTIONALITY

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault(); // Prevent default form submission

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const roleInput = document.querySelector('input[name="loginRole"]:checked');

  if (!username || !password || !roleInput) {
    showError("Please fill in all fields and select a role");
    return;
  }

  const role = roleInput.value;

  hideMessages();

  // Disable button during submission
  const submitBtn = this.querySelector("button[type='submit']");
  submitBtn.disabled = true;

  try {
    // Make API call to backend
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
        role: role,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Login successful
      // Store token and user info in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", role);
      localStorage.setItem("username", username);

      // Redirect based on role
      if (role === "guest") {
        window.location.href = "guest.html";
      } else if (role === "staff") {
        window.location.href = "staff.html";
      }
    } else {
      // Login failed
      showError(data.message || "Invalid username or password");
    }
  } catch (error) {
    // Network or server error
    console.error("Login error:", error);
    showError("Connection error. Please check if the server is running.");
  } finally {
    submitBtn.disabled = false; // Re-enable button
  }
});

// SIGNUP FUNCTIONALITY

signupForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("signupUsername").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById(
    "signupConfirmPassword"
  ).value;
  const phone = document.getElementById("signupPhone").value.trim();

  if (!username || !email || !password || !confirmPassword) {
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

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError("Please enter a valid email address");
    return;
  }

  // Phone validation (10 digits)
  const phoneRegex = /^\d{10}$/;
  if (phone && !phoneRegex.test(phone)) {
    showError("Please enter a valid 10-digit phone number");
    return;
  }

  hideMessages();

  // Disable button during submission
  const submitBtn = this.querySelector("button[type='submit']");
  submitBtn.disabled = true;

  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
        phone: phone,
        role: "guest", // Signup is only for guests
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showSuccess("Account created successfully! Please login.");

      signupForm.reset();

      // Switch to login tab after 2 seconds
      setTimeout(() => {
        loginTab.click();
      }, 2000);
    } else {
      showError(data.message || "Signup failed. Username might already exist.");
    }
  } catch (error) {
    console.error("Signup error:", error);
    showError("Connection error. Please check if the server is running.");
  } finally {
    submitBtn.disabled = false; // Re-enable button
  }
});

// CHECK IF USER IS ALREADY LOGGED IN

window.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // If user has token and role, redirect to appropriate dashboard
  if (token && role) {
    hideMessages(); // Clear any messages before redirect
    if (role === "guest") {
      window.location.href = "guest.html";
    } else if (role === "staff") {
      window.location.href = "staff.html";
    }
  }
});
