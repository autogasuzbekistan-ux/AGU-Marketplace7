// API BASE URL - FAQAT BITTA JOYDA!
export const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Products
export async function fetchProductsApi(page = 1, search = '', sort = 'default') {
    const params = new URLSearchParams({ page, search, sort });
    const resp = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
}

// Authentication
export async function postLogin(email, password) {
    const resp = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json' 
        },
        body: JSON.stringify({ email, password })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || 'Login failed');
    return data;
}

export async function postRegister(payload) {
    const resp = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json' 
        },
        body: JSON.stringify(payload)
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || 'Register failed');
    return data;
}

export async function postLogout(token) {
    const resp = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json' 
        }
    });
    if (!resp.ok) throw new Error('Logout failed');
    return resp.json();
}

// Cart - BACKEND BILAN TO'G'RI MOSLASHTIRISH
export async function fetchCartApi(token) {
    const resp = await fetch(`${API_BASE_URL}/cart`, { 
        headers: { 
            'Authorization': `Bearer ${token}`, 
            'Accept': 'application/json' 
        } 
    });
    if (!resp.ok) throw new Error('Could not fetch cart');
    return resp.json();
}

export async function addToCartApi(productId, quantity, token) {
    const resp = await fetch(`${API_BASE_URL}/cart`, {  // ✓ /cart (backend bilan mos)
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ product_id: productId, quantity })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || 'Could not add to cart');
    return data;
}

export async function updateCartItemApi(productId, quantity, token) {
    const resp = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ quantity })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || 'Could not update cart');
    return data;
}

export async function removeFromCartApi(productId, token) {
    const resp = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'DELETE',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json' 
        }
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || 'Could not remove from cart');
    return data;
}

// Orders
export async function postOrder(orderData, token) {
    const resp = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json', 
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(orderData)
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || 'Order failed');
    return data;
}

// Wishlist (agar backend'da bo'lsa)
export async function fetchWishlistApi(token) {
    const resp = await fetch(`${API_BASE_URL}/wishlist`, { 
        headers: { 
            'Authorization': `Bearer ${token}`, 
            'Accept': 'application/json' 
        } 
    });
    if (!resp.ok) throw new Error('Could not fetch wishlist');
    return resp.json();
}

export async function addToWishlistApi(productId, token) {
    const resp = await fetch(`${API_BASE_URL}/wishlist`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ product_id: productId })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || 'Could not add to wishlist');
    return data;
}

export async function removeFromWishlistApi(productId, token) {
    const resp = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json' 
        }
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || 'Could not remove from wishlist');
    return data;
}