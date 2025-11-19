// ==============================
// CONFIG
// ==============================

// IMPORTANT: Your Render backend URL
const API_URL = "https://fabe-e-commerce-store.onrender.com/api/users";

// Input fields
const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");

// Table body
const userTableBody = document.getElementById("userTableBody");


// ==============================
// FETCH USERS AND DISPLAY
// ==============================

async function fetchAndDisplayUsers() {
  try {
    const response = await fetch(API_URL);
    const users = await response.json();

    userTableBody.innerHTML = ""; // Clear table

    users.forEach(user => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>
            <button onclick="deleteUser('${user._id}')">Delete</button>
        </td>
      `;
      userTableBody.appendChild(tr);
    });

  } catch (err) {
    console.error("Error fetching users:", err);
  }
}


// ==============================
// ADD USER
// ==============================

const handleAddUser = async (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  if (!name || !email) {
    alert('Please fill out both name and email.');
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });

    if (response.ok) {
      nameInput.value = "";
      emailInput.value = "";
      fetchAndDisplayUsers();
    } else {
      const errorData = await response.json();
      console.error("Failed to add user:", errorData.message);
    }

  } catch (error) {
    console.error("Error adding user:", error);
  }
};


// ==============================
// DELETE USER
// ==============================

async function deleteUser(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchAndDisplayUsers();
  } catch (err) {
    console.error("Failed to delete:", err);
  }
}


// ==============================
// INITIAL LOAD
// ==============================

document.addEventListener("DOMContentLoaded", fetchAndDisplayUsers);
