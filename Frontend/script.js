document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. INITIAL SETUP & ELEMENT SELECTION
    // =================================================================
    const productListEl = document.getElementById('product-list');
    const cartCountEl = document.getElementById('cart-count');
    const cartIcon = document.getElementById('cart-icon');

    // Standard Modals
    const cartModal = document.getElementById('cart-modal');
    const cartItemsEl = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    const productModal = document.getElementById('product-modal');
    const productClose = document.getElementById('product-close');
    const productModalAdd = document.getElementById('product-modal-add');
    const categoryFilter = document.getElementById('category-filter');
    
    // Admin Login Elements
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminLoginClose = document.getElementById('admin-login-close');
    const adminLoginForm = document.getElementById('admin-login-form');
    const loginMessage = document.getElementById('login-message');
    const adminDashboardSection = document.getElementById('admin-dashboard-section');
    const adminContent = document.getElementById('admin-content');
    
    // Admin Product Form Elements (NEW)
    const productFormModal = document.getElementById('product-form-modal');
    const productFormClose = document.getElementById('product-form-close');
    const productFormTitle = document.getElementById('product-form-title');
    const adminProductForm = document.getElementById('admin-product-form');
    const productIdField = document.getElementById('product-id-field');
    const productNameInput = document.getElementById('product-name-input');
    const productPriceInput = document.getElementById('product-price-input');
    const productStockInput = document.getElementById('product-stock-input');
    const productDescriptionInput = document.getElementById('product-description-input');
    const productImageUrlInput = document.getElementById('product-image-url-input');
    const productCategoryInput = document.getElementById('product-category-input');
    
    // Global State
    let products = [];
    let cart = [];
    let currentProduct = null;
    let adminToken = localStorage.getItem('adminToken'); // Load token from storage
    
    // =================================================================
    // 2. SECURE API CALLS (REUSABLE FUNCTION)
    // =================================================================

    // NEW: Reusable function to make authenticated calls
    async function secureApiCall(url, method = 'GET', body = null) {
        if (!adminToken) {
            console.error('Admin token missing. Cannot perform secure action.');
            alert('You must be logged in as an admin to perform this action.');
            return { ok: false, status: 401 };
        }

        const headers = {
            'Authorization': `Bearer ${adminToken}`, // CRITICAL: Send the JWT token
            'Content-Type': 'application/json'
        };

        const config = {
            method: method,
            headers: headers,
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        // FIX 1: Explicitly target the backend server using IP (port 5000)
        return fetch(`http://127.0.0.1:5000${url}`, config); 
    }
    
    // =================================================================
    // 3. DATA FETCHING (PRODUCTS)
    // =================================================================

    // Function to fetch products from the backend
    async function fetchProducts(filter = 'All') {
        try {
            // FIX 2: Explicitly target the backend server using IP (port 5000)
            const response = await fetch('http://127.0.0.1:5000/api/products'); 
            if (!response.ok) {
                throw new Error('Failed to fetch products from the server');
            }
            products = await response.json(); 
            renderProducts(filter); // This function is now defined below!
            
            // If admin is logged in, re-render the dashboard table to reflect changes
            if (adminToken) {
                renderAdminProductTable();
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            productListEl.innerHTML = '<p style="color:red;">Error loading products. Please check the server.</p>';
        }
    }

    // =================================================================
    // 4. RENDERING FUNCTIONS (PRODUCTS & UI) - MISSING CODE ADDED HERE!
    // =================================================================

    function renderProducts(filter = 'All') {
        const filteredProducts = products.filter(p => 
            filter === 'All' || p.category === filter
        );

        if (productListEl) {
            if (filteredProducts.length === 0) {
                productListEl.innerHTML = '<p style="text-align: center; color: gray;">No products available. Add one using the Admin Dashboard!</p>';
                return;
            }

            productListEl.innerHTML = filteredProducts.map(p => `
                <div class="product-card" data-id="${p._id}">
                    <img src="${p.imageUrl}" alt="${p.name}" class="product-image">
                    <h4 class="product-name">${p.name}</h4>
                    <p class="product-price">$${p.price.toFixed(2)}</p>
                    <button class="add-to-cart-btn" data-id="${p._id}">Add to Cart</button>
                </div>
            `).join('');

            // You would typically attach event listeners for the cart buttons here
        }
    }

    // Function to update the cart count display (Added for completeness)
    function updateCartCount() {
        if (cartCountEl) {
            const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
            cartCountEl.textContent = totalItems;
        }
    }
    
    // =================================================================
    // 5. ADMIN LOGIN LOGIC
    // =================================================================

    // Handle Admin Login Form Submission
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password-input').value; 
            
            loginMessage.textContent = 'Logging in...';

            try {
                // FIX 3: Explicitly target the backend server using IP (port 5000)
                const response = await fetch('http://127.0.0.1:5000/api/login', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    loginMessage.textContent = `Login successful! Welcome, ${data.name}.`;
                    loginMessage.style.color = 'green';
                    
                    adminToken = data.token;
                    localStorage.setItem('adminToken', adminToken);
                    
                    setTimeout(() => {
                        adminLoginModal.style.display = 'none';
                        adminLoginForm.reset();
                        checkAdminStatus();
                    }, 1000);

                } else {
                    loginMessage.textContent = data.message || 'Login failed.';
                    loginMessage.style.color = 'red';
                }
            } catch (error) {
                loginMessage.textContent = 'Network error. Could not reach server.';
                loginMessage.style.color = 'red';
            }
        });
    }

    // Logic to show or hide the Admin Login/Dashboard link
    function checkAdminStatus() {
        if (adminToken) {
            adminLoginBtn.textContent = 'Admin Dashboard';
            adminLoginBtn.removeEventListener('click', openLoginModal);
            adminLoginBtn.addEventListener('click', displayAdminDashboard);
        } else {
            adminLoginBtn.textContent = 'Admin Login';
            adminLoginBtn.removeEventListener('click', displayAdminDashboard);
            adminLoginBtn.addEventListener('click', openLoginModal);
            adminDashboardSection.style.display = 'none';
        }
    }
    
    function openLoginModal(e) {
          e.preventDefault();
          // If a token exists but login is clicked, treat it as a dashboard view
          if(adminToken) {
              displayAdminDashboard();
          } else {
              adminLoginModal.style.display = 'block';
              loginMessage.textContent = '';
          }
    }
    
    // Attach the initial handler for the navbar link
    checkAdminStatus(); 
    
    // Close handlers
    if (adminLoginClose) {
        adminLoginClose.addEventListener('click', () => adminLoginModal.style.display = 'none');
    }
    if (productFormClose) {
        productFormClose.addEventListener('click', () => productFormModal.style.display = 'none');
    }


    // =================================================================
    // 6. ADMIN DASHBOARD & CRUD MANAGEMENT
    // =================================================================
    
    function displayAdminDashboard() {
        adminLoginModal.style.display = 'none';
        adminDashboardSection.style.display = 'block';
        adminContent.innerHTML = '';
        
        const header = document.createElement('div');
        header.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 20px;';
        
        const title = document.createElement('h3');
        title.textContent = 'Product Management';
        
        const controlsDiv = document.createElement('div');
        
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Logout';
        logoutBtn.style.cssText = 'background-color: #f44336; color: white; padding: 10px; border: none; cursor: pointer; margin-left: 10px; border-radius: 4px;';
        logoutBtn.addEventListener('click', handleAdminLogout);
        
        const addProductBtn = document.createElement('button');
        addProductBtn.textContent = 'Add New Product';
        addProductBtn.style.cssText = 'background-color: #007bff; color: white; padding: 10px; border: none; cursor: pointer; border-radius: 4px;';
        addProductBtn.addEventListener('click', () => openProductForm()); // Open form for adding
        
        controlsDiv.appendChild(addProductBtn);
        controlsDiv.appendChild(logoutBtn);
        
        header.appendChild(title);
        header.appendChild(controlsDiv);
        adminContent.appendChild(header);

        renderAdminProductTable();
    }
    
    function renderAdminProductTable() {
        // Find existing table or create a new one
        let table = document.getElementById('admin-product-table');
        if (!table) {
            table = document.createElement('table');
            table.id = 'admin-product-table';
            adminContent.appendChild(table);
        }
        
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Category</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="admin-product-table-body"></tbody>
        `;

        const tbody = document.getElementById('admin-product-table-body');
        
        products.forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${p.name}</td>
                <td>$${p.price.toFixed(2)}</td>
                <td>${p.stock}</td>
                <td>${p.category || 'N/A'}</td>
                <td>
                    <button class="admin-edit-btn" data-id="${p._id}">Edit</button>
                    <button class="admin-delete-btn" data-id="${p._id}" style="background:#e53935;">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Attach event listener for the table actions (Edit/Delete)
        tbody.addEventListener('click', handleProductAction);
    }

    // Handles Edit and Delete button clicks in the Admin table
    function handleProductAction(e) {
        const id = e.target.dataset.id;
        
        if (e.target.classList.contains('admin-edit-btn')) {
            openProductForm(id); // Open form for editing
        } else if (e.target.classList.contains('admin-delete-btn')) {
            handleProductDelete(id); // Execute delete
        }
    }
    
    // Opens and populates the form modal for Add or Edit
    function openProductForm(id = null) {
        adminProductForm.reset();
        productIdField.value = '';
        productFormModal.style.display = 'block';

        if (id) {
            productFormTitle.textContent = 'Edit Product';
            const productToEdit = products.find(p => p._id === id);
            
            if (productToEdit) {
                productIdField.value = id;
                productNameInput.value = productToEdit.name;
                productPriceInput.value = productToEdit.price;
                productStockInput.value = productToEdit.stock;
                productDescriptionInput.value = productToEdit.description;
                productImageUrlInput.value = productToEdit.imageUrl;
                productCategoryInput.value = productToEdit.category;
            }
        } else {
            productFormTitle.textContent = 'Add New Product';
        }
    }
    
    // Handles the submission of the Add/Edit form
    adminProductForm.addEventListener('submit', handleProductSubmit);

    async function handleProductSubmit(e) {
        e.preventDefault();
        
        const id = productIdField.value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/products/${id}` : '/api/products';
        
        const productData = {
            name: productNameInput.value,
            price: parseFloat(productPriceInput.value),
            stock: parseInt(productStockInput.value),
            description: productDescriptionInput.value,
            imageUrl: productImageUrlInput.value,
            category: productCategoryInput.value
        };

        try {
            const response = await secureApiCall(url, method, productData);
            
            if (response.ok) {
                alert(`Product ${id ? 'updated' : 'added'} successfully!`);
                productFormModal.style.display = 'none';
                fetchProducts(); // Refresh the list
            } else {
                const data = await response.json();
                alert(`Error: ${data.message || 'Failed to save product.'}`);
            }
        } catch (error) {
            console.error('API submission error:', error);
            alert('A network error occurred.');
        }
    }

    // Handles the deletion of a product
    async function handleProductDelete(id) {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const response = await secureApiCall(`/api/products/${id}`, 'DELETE');

            if (response.ok) {
                alert('Product deleted successfully!');
                fetchProducts(); // Refresh the list
            } else {
                const data = await response.json();
                alert(`Error: ${data.message || 'Failed to delete product.'}`);
            }
        } catch (error) {
            console.error('API deletion error:', error);
            alert('A network error occurred.');
        }
    }
    
    // Handle Admin Logout
    function handleAdminLogout() {
        localStorage.removeItem('adminToken');
        adminToken = null;
        checkAdminStatus(); 
        adminDashboardSection.style.display = 'none';
        // We use window.location.href to redirect to the homepage after logout
        window.location.href = '/'; 
    }
    
    // =================================================================
    // 7. INITIALIZATION
    // =================================================================
    fetchProducts();
});