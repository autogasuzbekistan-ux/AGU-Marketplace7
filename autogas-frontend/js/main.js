import { setupGsapAnimations, setupFaqAccordion, setupSmoothScrolling, setupModalClosers, setupMobileMenu, setupHeaderScroll, setupLogoInteraction } from './ui.js';
import { checkUserSession, setupAuthModals, setupProfileModal, handleLogout } from './auth.js';
import { updateProductView, setupProductSearchAndSort, filterByCategory } from './products.js';
import { setupCart, showCartModal } from './cart.js';
import { handleReviewSubmit, setupStarRating } from './reviews.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Animatsiyalar va UI elementlarini sozlash
    setupGsapAnimations();
    setupHeaderScroll();
    setupLogoInteraction();
    setupSmoothScrolling();
    setupFaqAccordion();
    setupMobileMenu();

    // 2. Autentifikatsiya va sessiyani tekshirish
    const { currentUser, authToken } = checkUserSession();
    
    // Global oyna (window) obyektiga kerakli funksiya va o'zgaruvchilarni qo'shish
    // Bu eski kodning ba'zi qismlari (inline onclick) ishlashi uchun kerak
    window.currentUser = currentUser;
    window.authToken = authToken;
    window.API_BASE_URL = 'http://autogas-backend.test/api';
    window.filterByCategory = filterByCategory;

    // 3. Modal oynalarni sozlash
    setupAuthModals();
    setupProfileModal();
    setupModalClosers();

    // 4. Savat funksiyalarini sozlash
    setupCart(currentUser, authToken);

    // 5. Mahsulotlar va filtrlarni sozlash
    setupProductSearchAndSort();
    updateProductView(1); // Boshlang'ich yuklash

    // 6. Sharhlar tizimini sozlash
    const addReviewForm = document.getElementById('add-review-form');
    if (addReviewForm) {
        addReviewForm.addEventListener('submit', handleReviewSubmit);
    }
    setupStarRating();

    // 7. Chiqish (Logout) tugmalarini bog'lash
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    document.getElementById('mobile-logout-btn')?.addEventListener('click', handleLogout);

    // 8. Boshqa event listener'lar
    setupEventListeners();
});

function setupEventListeners() {
    // Aloqa formasi
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formMessage = document.getElementById('form-message');
            const name = document.getElementById('name').value;
            formMessage.className = 'mt-4 p-4 rounded-xl bg-green-100 text-green-800';
            formMessage.textContent = `Rahmat ${name}! Xabaringiz muvaffaqiyatli yuborildi. Tez orada javob beramiz.`;
            formMessage.classList.remove('hidden');
            contactForm.reset();
            setTimeout(() => formMessage.classList.add('hidden'), 5000);
        });
    }

    // Checkout formasi
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = document.getElementById('checkout-submit') || this.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            const name = document.getElementById('checkout-name').value;
            const phone = document.getElementById('checkout-phone').value;
            const address = document.getElementById('checkout-address').value;
            const region = document.getElementById('checkout-region').value;
            const successDiv = document.getElementById('checkout-success-message');
            const contentDiv = document.getElementById('checkout-content');
            
            // Savat ma'lumotlarini cart.js'dan olish kerak bo'ladi
            // Hozircha global `localCart` dan foydalanamiz
            const cart = window.getCart ? window.getCart() : [];

            const orderData = {
                customer_name: name,
                customer_phone: phone,
                address: address,
                region: region,
                items: cart.map(item => ({ product_id: item.product.id, quantity: item.quantity, price: item.product.price }))
            };

            try {
                const response = await fetch(`${window.API_BASE_URL}/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${window.authToken}`
                    },
                    body: JSON.stringify(orderData)
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Buyurtma berishda xatolik yuz berdi.');

                contentDiv.classList.add('hidden');
                successDiv.innerHTML = `
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h4 class="text-xl font-semibold mb-2">Rahmat, ${name}!</h4>
                    <p class="text-gray-600">Buyurtmangiz muvaffaqiyatli qabul qilindi. Tez orada operatorlarimiz siz bilan bog'lanishadi.</p>
                `;
                successDiv.classList.remove('hidden');
                
                // Savatni tozalash
                if (window.updateLocalCart) window.updateLocalCart({ items: [] });

                setTimeout(() => { 
                    if (submitBtn) submitBtn.disabled = false; 
                    if(window.closeCheckoutModal) window.closeCheckoutModal(); 
                }, 4000);

            } catch (error) {
                contentDiv.classList.add('hidden');
                successDiv.innerHTML = `
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                         <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                    <h4 class="text-xl font-semibold text-red-700 mb-2">Xatolik!</h4>
                    <p class="text-gray-600">${error.message}</p>`;
                successDiv.classList.remove('hidden');
                setTimeout(() => { 
                    if (submitBtn) submitBtn.disabled = false; 
                    if(window.closeCheckoutModal) window.closeCheckoutModal(); 
                }, 5000);
            }
        });
    }
}