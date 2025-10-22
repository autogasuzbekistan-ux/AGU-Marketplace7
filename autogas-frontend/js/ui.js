// UI helpers: focus trap, modals, skeletons
const activeFocusTraps = new Map();
export function enableFocusTrap(modal) {
  if (!modal) return;
  const focusableSelectors = 'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const focusable = Array.from(modal.querySelectorAll(focusableSelectors)).filter(el => el.offsetParent !== null);
  const first = focusable[0] || modal;
  const last = focusable[focusable.length - 1] || modal;
  const previouslyFocused = document.activeElement;
  function handleKeydown(e) {
    if (e.key === 'Tab') {
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  }
  modal.addEventListener('keydown', handleKeydown);
  activeFocusTraps.set(modal, { handleKeydown, previouslyFocused });
  setTimeout(() => first.focus && first.focus(), 10);
}
export function disableFocusTrap(modal) {
  const record = activeFocusTraps.get(modal);
  if (!record) return;
  modal.removeEventListener('keydown', record.handleKeydown);
  if (record.previouslyFocused && typeof record.previouslyFocused.focus === 'function') {
    try { record.previouslyFocused.focus(); } catch (e) {}
  }
  activeFocusTraps.delete(modal);
}

export function showSkeletons(count = 8) {
  const productsGrid = document.getElementById('products-grid');
  if (!productsGrid) return;
  productsGrid.innerHTML = '';
  for (let i=0;i<count;i++){
    const card = document.createElement('div');
    card.className = 'product-card p-6 rounded-2xl shadow-lg fade-in';
    card.innerHTML = `
      <div class="product-image" aria-hidden="true"><div class="skeleton skeleton-rect" style="width:100%;height:100%;border-radius:10px"></div></div>
      <h3 class="skeleton skeleton-text" style="width:60%; height:20px; margin-top:12px"></h3>
      <p class="skeleton skeleton-text" style="width:90%; height:14px; margin-top:8px"></p>
      <div class="price-row" style="margin-top:12px;"><div class="skeleton skeleton-text" style="width:30%; height:24px"></div><div class="skeleton skeleton-btn" style="width:40%; height:36px"></div></div>
    `;
    productsGrid.appendChild(card);
  }
}

export function announce(message) {
  const live = document.getElementById('site-live');
  if (live) live.textContent = message;
}
