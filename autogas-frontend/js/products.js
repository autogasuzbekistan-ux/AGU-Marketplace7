import { API_BASE_URL } from './api.js';
import { parseCSV } from './utils.js';
import * as UI from './ui.js';
import * as Cart from './cart.js';

// Fetch products: try API, fallback to local CSV
export async function fetchProducts({ page = 1, search = '', sort = 'default' } = {}) {
  const params = new URLSearchParams({ page, search, sort });
  if (window.debugLog) window.debugLog('Attempting to fetch products from API...');

  try {
    const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
    if (window.debugLog) window.debugLog(`API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      if (window.debugLog) window.debugLog(`API response not OK. Body: ${errorText.substring(0, 500)}...`); // Log first 500 chars
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (window.debugLog) window.debugLog('API response successful and parsed as JSON.');
    return data;

  } catch (err) {
    if (window.debugLog) window.debugLog(`Error fetching from API: ${err.message}. Falling back to CSV.`);
    
    try {
      const resp = await fetch('../products_db.csv');
      if (!resp.ok) {
        if (window.debugLog) window.debugLog('Fallback to CSV failed: CSV file not available.');
        throw new Error('CSV not available');
      }
      const txt = await resp.text();
      const parsed = parseCSV(txt);
      if (window.debugLog) window.debugLog('Fallback to CSV successful.');
      return { data: parsed, current_page: 1, last_page: 1 };
    } catch (e) {
      if (window.debugLog) window.debugLog(`Fallback to CSV failed during processing: ${e.message}`);
      return { data: [], current_page: 1, last_page: 1 };
    }
  }
}

// Create product card element, but accept callbacks instead of relying on globals
export function createProductCard(product, { onAddToCart = () => {}, onShowDetail = () => {} } = {}) {
  const newProductCard = document.createElement('div');
  const isOutOfStock = product.stockStatus === 'out_of_stock';
  let cardClasses = 'product-card relative p-6 rounded-2xl shadow-lg card-hover fade-in';
  if (isOutOfStock) cardClasses += ' opacity-60';
  newProductCard.className = cardClasses;

  const defaultIcon = `<svg class="w-16 h-16 interactive-icon" style="color: var(--secondary-orange);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`;

  // image wrapper
  const imageWrapper = document.createElement('div');
  const gradients = [
    'from-orange-100 to-red-100',
    'from-blue-100 to-purple-100',
    'from-green-100 to-teal-100',
    'from-yellow-100 to-orange-100'
  ];
  const randomGradient = product.gradient || gradients[Math.floor(Math.random() * gradients.length)];
  imageWrapper.className = `w-full h-48 bg-gradient-to-br ${randomGradient} rounded-xl mb-6 flex items-center justify-center product-image`;

  if (product.imageUrl) {
    const img = document.createElement('img');
    img.src = product.imageUrl;
    img.alt = product.name || 'Product image';
    img.loading = 'lazy';
    img.className = 'w-full h-full object-cover rounded-xl';
    img.addEventListener('error', function () {
      this.style.display = 'none';
      const icon = this.parentElement.querySelector('.fallback-icon');
      if (icon) icon.style.display = 'flex';
    });
    const fallbackIcon = document.createElement('div');
    fallbackIcon.className = 'fallback-icon w-16 h-16 interactive-icon hidden';
    fallbackIcon.style.color = 'var(--secondary-orange)';
    fallbackIcon.innerHTML = defaultIcon;
    imageWrapper.appendChild(img);
    imageWrapper.appendChild(fallbackIcon);
  } else {
    imageWrapper.innerHTML = product.icon || defaultIcon;
  }

  newProductCard.appendChild(imageWrapper);

  const titleEl = document.createElement('h3');
  titleEl.className = 'text-xl font-bold mb-2';
  titleEl.style.color = 'var(--dark-gray)';
  titleEl.textContent = product.name;
  newProductCard.appendChild(titleEl);

  const descEl = document.createElement('p');
  descEl.className = 'text-gray-600 mb-4';
  descEl.textContent = product.description || '';
  newProductCard.appendChild(descEl);

  const footer = document.createElement('div');
  footer.className = 'flex justify-between items-center';
  const priceSpan = document.createElement('span');
  priceSpan.className = 'text-2xl font-bold';
  priceSpan.style.color = 'var(--secondary-orange)';
  priceSpan.textContent = `$${parseFloat(product.price || 0).toFixed(2)}`;
  footer.appendChild(priceSpan);

  const addToCartButtonEl = document.createElement('button');
  if (isOutOfStock) {
    addToCartButtonEl.disabled = true;
    addToCartButtonEl.className = 'bg-gray-400 cursor-not-allowed text-white px-6 py-2 rounded-full font-semibold';
    addToCartButtonEl.textContent = "Savatga qo'shish";
  } else {
    addToCartButtonEl.className = 'btn-primary text-white px-6 py-2 rounded-full font-semibold';
    addToCartButtonEl.textContent = "Savatga qo'shish";
    addToCartButtonEl.addEventListener('click', (ev) => {
      ev.stopPropagation();
      onAddToCart(product.id);
    });
  }
  footer.appendChild(addToCartButtonEl);
  newProductCard.appendChild(footer);

  newProductCard.addEventListener('click', () => onShowDetail(product.id));

  return newProductCard;
}

// Render products into the DOM, with pagination
export async function renderProducts({ search = '', sort = 'default', page = 1 } = {}) {
  const productsGrid = document.getElementById('products-grid');
  if (!productsGrid) return;
  UI.showSkeletons(8);
  let response;
  try {
    response = await fetchProducts({ page, search, sort });
  } catch (e) {
    response = { data: [], current_page: 1, last_page: 1 };
  }
  const products = response.data || [];
  const totalPages = response.last_page || 1;
  const currentPage = response.current_page || page;

  productsGrid.innerHTML = '';
  if (products.length === 0) {
    productsGrid.innerHTML = `<p class="text-center text-gray-500 col-span-full py-10">Hech qanday mahsulot topilmadi.</p>`;
    announceAndRenderPagination(0, 0);
    return;
  }

  // render
  products.forEach(product => {
    const card = createProductCard(product, { onAddToCart: (id) => {
      // try cart module
      if (Cart && typeof Cart.addToCart === 'function') {
        Cart.addToCart(product, { onCartUpdated: () => UI.announce('Savat yangilandi') });
      } else if (window && typeof window.addToCart === 'function') {
        window.addToCart(product.id);
      }
    }, onShowDetail: (id) => {
      if (window && typeof window.showProductDetailModal === 'function') window.showProductDetailModal(id);
    }});
    productsGrid.appendChild(card);
    setTimeout(() => card.classList.add('visible'), 100);
  });

  announceAndRenderPagination(totalPages, currentPage, page);
}

function announceAndRenderPagination(totalPages, currentPage, requestedPage = 1) {
  const live = document.getElementById('site-live');
  if (live) live.textContent = `${document.querySelectorAll('#products-grid .product-card').length} ta mahsulot topildi.`;
  renderPagination(totalPages, currentPage);
}

export function renderPagination(totalPages, currentPage) {
  const paginationContainer = document.getElementById('pagination-container');
  if (!paginationContainer) return;
  paginationContainer.innerHTML = '';
  if (totalPages <= 1) return;

  const createButton = (text, page, isDisabled = false, isActive = false) => {
    const button = document.createElement('button');
    button.innerHTML = text;
    button.disabled = isDisabled;
    button.onclick = () => updateProductView(page);
    let baseClasses = 'px-4 py-2 rounded-lg transition duration-300';
    if (isDisabled) {
      button.className = `${baseClasses} bg-gray-200 text-gray-400 cursor-not-allowed`;
    } else if (isActive) {
      button.className = `${baseClasses} btn-primary text-white shadow-md`;
    } else {
      button.className = `${baseClasses} bg-white text-gray-700 border border-gray-300 hover:bg-gray-100`;
    }
    return button;
  };

  paginationContainer.appendChild(createButton('Oldingisi', currentPage - 1, currentPage === 1));
  for (let i = 1; i <= totalPages; i++) {
    paginationContainer.appendChild(createButton(i.toString(), i, false, i === currentPage));
  }
  paginationContainer.appendChild(createButton('Keyingisi', currentPage + 1, currentPage === totalPages));
}

export function updateProductView(page = 1) {
  const searchTerm = (document.getElementById('search-input') || {}).value || '';
  const sortOrder = (document.getElementById('sort-select') || {}).value || 'default';
  renderProducts({ search: searchTerm, sort: sortOrder, page });
}