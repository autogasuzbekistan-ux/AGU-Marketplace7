export async function getCart() {
  return JSON.parse(sessionStorage.getItem('cart') || '[]');
}

export async function saveCart(cart) {
  sessionStorage.setItem('cart', JSON.stringify(cart));
}

export async function addToCart(product, { onCartUpdated = () => {} } = {}) {
  let cart = await getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) existing.quantity++;
  else cart.push({ ...product, quantity: 1 });
  await saveCart(cart);
  onCartUpdated(cart);
}

export async function updateCartItemQuantity(productId, newQuantity, { onCartUpdated = () => {} } = {}) {
  let cart = await getCart();
  const idx = cart.findIndex(i => i.id === productId);
  if (idx === -1) return;
  if (newQuantity > 0) cart[idx].quantity = newQuantity;
  else cart.splice(idx, 1);
  await saveCart(cart);
  onCartUpdated(cart);
}

export async function getCartTotalItems() {
  const cart = await getCart();
  return cart.reduce((sum, i) => sum + (i.quantity || 0), 0);
}

export async function getCartTotalPrice() {
  const cart = await getCart();
  return cart.reduce((sum, i) => sum + (i.quantity || 0) * (parseFloat(i.price) || 0), 0);
}

// UI: render cart items into the DOM
export async function renderCartItems() {
  const cart = await getCart();
  const container = document.getElementById('cart-items-container');
  const totalPriceEl = document.getElementById('cart-total-price');
  const checkoutBtn = document.getElementById('checkout-btn');
  if (!container || !totalPriceEl || !checkoutBtn) return;
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = `<p class="text-center text-gray-500">Savatingiz bo'sh.</p>`;
    totalPriceEl.textContent = '$0.00';
    checkoutBtn.disabled = true;
    return;
  }
  checkoutBtn.disabled = false;
  let totalPrice = 0;
  cart.forEach(item => {
    const itemTotal = (parseFloat(item.price) || 0) * (item.quantity || 0);
    totalPrice += itemTotal;

    const itemElement = document.createElement('div');
    itemElement.className = 'flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0';
    itemElement.innerHTML = `
      <div class="flex items-center space-x-4">
        <img src="${item.imageUrl || ''}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg" onerror="this.style.display='none'; this.parentElement.insertAdjacentHTML('afterbegin', '<div class=\'w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center\'><svg class=\'w-8 h-8 text-gray-400\' fill=\'none\' stroke=\'currentColor\' viewBox=\'0 0 24 24\'><path stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M4 16l4.586-4.586a2 2 0 012.828 0L20 16m-2-2l2-2m-2 2l-2 2m2-2l2 2m-2-2l-2-2\'></path></svg></div>')">
        <div>
          <h4 class="font-semibold text-gray-800">${item.name}</h4>
          <p class="text-sm text-gray-500">$${parseFloat(item.price).toFixed(2)}</p>
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <input type="number" value="${item.quantity}" min="1" onchange="updateCartItemQuantity('${item.id}', parseInt(this.value))" class="w-16 text-center border border-gray-300 rounded-md py-1">
        <span class="font-semibold w-20 text-right">$${itemTotal.toFixed(2)}</span>
        <button onclick="updateCartItemQuantity('${item.id}', 0)" class="text-gray-400 hover:text-red-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    `;
    container.appendChild(itemElement);
  });

  totalPriceEl.textContent = `$${totalPrice.toFixed(2)}`;
}

export function showCartModal() {
  renderCartItems();
  const modal = document.getElementById('cart-modal');
  if (!modal) return;
  const modalContent = modal.querySelector('.transform');
  modal.classList.remove('hidden');
  setTimeout(() => modalContent && modalContent.classList.remove('translate-x-full'), 10);
}

export function closeCartModal() {
  const modal = document.getElementById('cart-modal');
  if (!modal) return;
  const modalContent = modal.querySelector('.transform');
  modalContent && modalContent.classList.add('translate-x-full');
  setTimeout(() => modal.classList.add('hidden'), 500);
}

export async function showCheckoutModal(currentUser, regions) {
  const cart = await getCart();
  if (cart.length === 0) return;
  closeCartModal();
  if (currentUser) {
    document.getElementById('checkout-name').value = currentUser.name || '';
    document.getElementById('checkout-phone').value = currentUser.phone || '';
  }
  const totalPrice = cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 0), 0);
  document.getElementById('checkout-total-price').textContent = `$${totalPrice.toFixed(2)}`;
  const modal = document.getElementById('checkout-modal');
  const modalContent = modal.querySelector('.transform');
  modal.classList.remove('hidden');
  setTimeout(() => modalContent && modalContent.classList.remove('scale-95', 'opacity-0'), 10);
  document.getElementById('checkout-content').classList.remove('hidden');
  document.getElementById('checkout-success-message').classList.add('hidden');
  const regionSelect = document.getElementById('checkout-region');
  if (regionSelect) {
    regionSelect.innerHTML = '<option value="" disabled selected>Filialni tanlang</option>';
    (regions || []).forEach(region => {
      regionSelect.innerHTML += `<option value="${region}">${region}</option>`;
    });
  }
}

export function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (!modal) return;
  const modalContent = modal.querySelector('.transform');
  modalContent && modalContent.classList.add('scale-95', 'opacity-0');
  setTimeout(() => {
    modal.classList.add('hidden');
    const form = document.getElementById('checkout-form');
    form && form.reset();
  }, 300);
}

export async function checkout(currentUser, regions) {
  if (!currentUser) {
    if (typeof window !== 'undefined' && window.showLoginModal) return window.showLoginModal();
    return;
  }
  showCheckoutModal(currentUser, regions);
}

export async function loadCartFromServer(authToken) {
  if (!authToken) return;
  try {
    const response = await fetch(`/api/cart`, { headers: { 'Authorization': `Bearer ${authToken}`, 'Accept': 'application/json' } });
    if (response.ok) {
      const data = await response.json();
      sessionStorage.setItem('cart', JSON.stringify(data.items || data || []));
      return;
    }
  } catch (e) {
    console.warn('loadCartFromServer failed', e);
  }
}
