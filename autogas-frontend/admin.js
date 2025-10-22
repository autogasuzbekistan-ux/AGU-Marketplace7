document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://autogas-backend.test/api';
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const authToken = localStorage.getItem('authToken'); // Xavfsizlik uchun token

    // 1. Xavfsizlik va UI elementlari
    if (!currentUser || !['owner', 'admin', 'operator'].includes(currentUser.role)) {
        // showToast is not yet available, so we use alert before redirecting
        alert("Sizda bu sahifaga kirish huquqi yo'q."); 
        window.location.href = 'index.html'; // Yaxshisi index.html
        return;
    }

    // Elementlarni topish
    const adminNameEl = document.getElementById('admin-name');
    const logoutBtn = document.getElementById('logout-btn');
    const productsTableBody = document.getElementById('products-table-body');
    const showAddModalBtn = document.getElementById('show-add-modal-btn');
    const modal = document.getElementById('admin-product-modal');
    const closeModalBtn = document.getElementById('close-admin-modal-btn');
    const form = document.getElementById('admin-product-form');
    const modalTitle = document.getElementById('admin-modal-title');
    const submitBtn = document.getElementById('admin-product-submit-btn');
    const messageDiv = document.getElementById('admin-message');
    const productsTabBtn = document.getElementById('products-tab-btn');
    const usersTabBtn = document.getElementById('users-tab-btn');
    const productsSection = document.getElementById('products-section');
    const dashboardTabBtn = document.getElementById('dashboard-tab-btn');
    const dashboardSection = document.getElementById('dashboard-section');
    const usersSection = document.getElementById('users-section');
    const usersTableBody = document.getElementById('users-table-body');
    const ordersTabBtn = document.getElementById('orders-tab-btn');
    const ordersSection = document.getElementById('orders-section');
    const reviewsTabBtn = document.getElementById('reviews-tab-btn');
    const reviewsSection = document.getElementById('reviews-section');
    const modalContent = modal.querySelector('.transform');
    const importExcelBtn = document.getElementById('import-excel-btn');
    const excelFileInput = document.getElementById('excel-file-input');

    // Global Toast Notification
    let toastTimeout;
    function showToast(message, isError = true) {
        const toast = document.getElementById('toast-notification');
        const toastMessage = document.getElementById('toast-message');
        if (!toast || !toastMessage) return;

        toastMessage.textContent = message;
        toast.className = `fixed top-5 right-5 text-white py-3 px-6 rounded-lg shadow-lg transform transition-transform duration-500 ease-in-out z-[100] ${isError ? 'bg-red-600' : 'bg-green-600'}`;

        toast.classList.remove('translate-x-[120%]');
        toast.classList.add('translate-x-0');

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('translate-x-0');
            toast.classList.add('translate-x-[120%]');
        }, 4000);
    }

    // Admin nomini ko'rsatish
    let roleText = '';
    switch(currentUser.role) {
        case 'owner': roleText = '(Owner)'; break;
        case 'admin': roleText = '(Admin)'; break;
        case 'operator': roleText = `(Operator, ${currentUser.region})`; break;
    }
    adminNameEl.textContent = `Salom, ${currentUser.name} ${roleText}`;

    // Rollarga qarab elementlarni ko'rsatish/yashirish
    if (currentUser.role === 'owner' || currentUser.role === 'admin') {
        usersTabBtn.classList.remove('hidden');
        importExcelBtn.classList.remove('hidden');
        reviewsTabBtn.classList.remove('hidden');
    }

    // Chiqish tugmasi
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // --- MAHSULOTLARNI BOSHQARISH ---
    // Mahsulotlarni serverdan olish
    const fetchProducts = async () => {
        try {
            // Admin panel uchun paginatsiyasiz barcha mahsulotlarni olish
            const response = await fetch(`${API_BASE_URL}/products?limit=1000`); 
            if (!response.ok) {
                throw new Error('Mahsulotlarni yuklashda xatolik yuz berdi.');
            }
            const data = await response.json();
            // API javobi Laravel paginatsiyasi bilan kelsa (data propertisida), o'shani olish
            return data.data || data;
        } catch (error) {
            showToast(error.message || 'Mahsulotlarni yuklashda xatolik yuz berdi.');
            productsTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500 py-4">Mahsulotlarni yuklab bo'lmadi.</td></tr>`;
            return [];
        }
    };

    // Mahsulotlarni jadvalga chizish
    const renderProducts = async () => {
        const products = await fetchProducts();
        productsTableBody.innerHTML = '';
        if (products.length === 0) {
            productsTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500">Mahsulotlar mavjud emas.</td></tr>`;
            return;
        }
        products.forEach(product => {
            const tr = document.createElement('tr');
            const isOutOfStock = product.stockStatus === 'out_of_stock';
            tr.className = isOutOfStock ? 'bg-red-50 opacity-70' : '';

            const statusHtml = isOutOfStock
                ? `<span class="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Mavjud emas</span>`
                : `<span class="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Mavjud</span>`;

            tr.innerHTML = `
                <td class="font-medium text-gray-800">${product.name}</td>
                <td>${statusHtml}</td>
                <td class="text-gray-600">$${parseFloat(product.price).toFixed(2)}</td>
                <td class="text-gray-600 text-sm">${product.description.substring(0, 50)}...</td>
                <td>
                    <button data-id="${product.id}" class="toggle-stock-btn text-sm text-gray-600 hover:text-black font-semibold mr-2">${isOutOfStock ? 'Stokka qo\'shish' : 'Stokdan olish'}</button>
                    <button data-id="${product.id}" class="edit-btn text-blue-600 hover:text-blue-800 font-semibold mr-4">Tahrirlash</button>
                    <button data-id="${product.id}" class="delete-btn text-red-600 hover:text-red-800 font-semibold">O'chirish</button>
                </td>
            `;
            productsTableBody.appendChild(tr);
        });
    };

    // Modalni ochish/yopish funksiyalari
    const showModal = (productId = null) => {
        // Modal animatsiyasi
        modal.classList.remove('hidden');
        setTimeout(() => modalContent.classList.add('scale-100', 'opacity-100'), 10);

        form.reset();
        messageDiv.classList.add('hidden');
        document.getElementById('admin-product-id').value = '';

        if (productId) {
            // Tahrirlash rejimi
            modalTitle.textContent = "Mahsulotni Tahrirlash";
            submitBtn.textContent = "O'zgarishlarni Saqlash";
            // productData tr elementiga biriktirilmagan, shuning uchun global keshdan qidiramiz
            // Bu funksiya renderProducts ichida to'ldiriladigan global o'zgaruvchidan oladi.
            // Yaxshiroq yechim: renderProducts ichida har bir 'tr' ga product ma'lumotini biriktirish.
            const product = allProductsCache.find(p => p.id == productId);
            if (product) {
                document.getElementById('admin-product-id').value = product.id;
                document.getElementById('admin-product-name').value = product.name;
                document.getElementById('admin-product-price').value = product.price;
                document.getElementById('admin-product-status').value = product.stock_status || 'in_stock';
                document.getElementById('admin-product-description').value = product.description;
                document.getElementById('admin-product-image').value = product.imageUrl;
            }
        } else {
            // Qo'shish rejimi
            modalTitle.textContent = "Yangi Mahsulot Qo'shish";
            submitBtn.textContent = "Qo'shish";
        }
    };

    const closeModal = () => {
        modalContent.classList.remove('scale-100', 'opacity-100');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    };

    // Forma yuborilganda
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageDiv.classList.add('hidden'); // Xabarni yashirish

        const id = document.getElementById('admin-product-id').value;
        const name = document.getElementById('admin-product-name').value;
        const price = parseFloat(document.getElementById('admin-product-price').value);
        const stockStatus = document.getElementById('admin-product-status').value;
        const description = document.getElementById('admin-product-description').value;
        const imageUrl = document.getElementById('admin-product-image').value;

        if (!name || isNaN(price) || !description) {
            messageDiv.className = 'mt-4 p-3 rounded-xl bg-red-100 text-red-800';
            messageDiv.textContent = 'Barcha maydonlarni to\'ldiring.';
            messageDiv.classList.remove('hidden');
            return;
        }

        const productData = {
            name,
            price,
            stock_status: stockStatus,
            description,
            image_url: imageUrl,
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_BASE_URL}/products/${id}` : `${API_BASE_URL}/products`;
        const successMessage = id ? 'Mahsulot muvaffaqiyatli yangilandi!' : 'Mahsulot muvaffaqiyatli qo\'shildi!';

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saqlanmoqda...';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}` // Tokenni qo'shish
                },
                body: JSON.stringify(productData)
            });

            const result = await response.json();

            if (!response.ok) {
                let errorMessage = result.message || 'Serverda xatolik yuz berdi.';
                if (result.errors) {
                    errorMessage = Object.values(result.errors).flat().join(' ');
                }
                throw new Error(errorMessage);
            }

            messageDiv.className = 'mt-4 p-3 rounded-xl bg-green-100 text-green-800';
            messageDiv.textContent = successMessage;
            messageDiv.classList.remove('hidden');
            renderProducts();

            setTimeout(() => {
                closeModal();
            }, 1500);

        } catch (error) {
            messageDiv.className = 'mt-4 p-3 rounded-xl bg-red-100 text-red-800';
            messageDiv.textContent = error.message;
            messageDiv.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = id ? "O'zgarishlarni Saqlash" : "Qo'shish";
        }
    });

    // Tahrirlash va o'chirish tugmalariga event listener qo'shish
    productsTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const id = parseInt(target.getAttribute('data-id'));
        if (!id) return;

        if (target.classList.contains('edit-btn')) {
            showModal(id);
        }

        if (target.classList.contains('delete-btn')) {
            if (confirm("Haqiqatan ham bu mahsulotni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.")) {
                try {
                    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        }
                    });

                    if (!response.ok) {
                        const result = await response.json();
                        throw new Error(result.message || "O'chirishda xatolik yuz berdi.");
                    }

                    showToast("Mahsulot muvaffaqiyatli o'chirildi.", false);
                    renderProducts(); // Jadvalni yangilash

                } catch (error) {
                    showToast(`Xatolik: ${error.message}`, true);
                }
            }
        }

        if (target.classList.contains('toggle-stock-btn')) {
            // Bu funksiya backend'da alohida endpoint talab qiladi.
            const productId = target.getAttribute('data-id');
            if (!productId) return;

            try {
                target.disabled = true;
                target.textContent = 'O\'zgartirilmoqda...';
                const response = await fetch(`${API_BASE_URL}/products/${productId}/toggle-stock`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Accept': 'application/json',
                    }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Amalni bajarishda xatolik.');
                }
                await renderProducts(); // Jadvalni yangilash
            } catch (error) {
                showToast(`Xatolik: ${error.message}`, true);
                target.disabled = false; // Xatolik yuz berganda tugmani asl holiga qaytarish
            }
        }
    });

    // --- EXCEL'DAN IMPORT QILISH ---
    // Backend bilan to'liq integratsiya qilingan versiya
    importExcelBtn.addEventListener('click', () => {
        excelFileInput.click(); // Fayl tanlash oynasini ochish
    });

    excelFileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const originalBtnText = importExcelBtn.textContent;
        importExcelBtn.disabled = true;
        importExcelBtn.textContent = 'Import qilinmoqda...';

        try {
            const response = await fetch(`${API_BASE_URL}/products/import`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Import qilishda noma\'lum xatolik.');
            }

            showToast(result.message, false);
            await renderProducts(); // Jadvalni yangilash

        } catch (error) {
            showToast(`Xatolik: ${error.message}`, true);
        } finally {
            importExcelBtn.disabled = false;
            importExcelBtn.textContent = originalBtnText;
            excelFileInput.value = ''; // Inputni tozalash
        }
    });

    // --- FOYDALANUVCHILARNI BOSHQARISH ---
    // `localStorage` o'rniga backenddan foydalanuvchilarni olish
    const getUsers = async () => {
        if (!['owner', 'admin'].includes(currentUser.role)) return [];
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json',
                }
            });
            if (!response.ok) throw new Error('Foydalanuvchilarni yuklashda xatolik.');
            const data = await response.json();
            return data.data || data;
        } catch (error) {
            showToast(error.message || 'Foydalanuvchilarni yuklashda xatolik.', true);
            usersTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500 py-4">Foydalanuvchilarni yuklab bo'lmadi.</td></tr>`;
            return [];
        }
    };

    const renderUsers = () => {
        let users = getUsers();
        if (currentUser.role === 'admin') {
            users = users.filter(u => u.role !== 'owner' && u.role !== 'admin');
        }
        usersTableBody.innerHTML = '';
        if (users.length === 0) {
            usersTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500">Foydalanuvchilar mavjud emas.</td></tr>`;
            return;
        }
        users.forEach(user => {
            const isBlocked = user.isBlocked || false;
            const tr = document.createElement('tr');
            tr.className = isBlocked ? 'bg-red-50 opacity-70' : '';

            const statusHtml = isBlocked
                ? `<span class="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Bloklangan</span>`
                : `<span class="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Aktiv</span>`;

            let actionButtonHtml = '';
            // Owner hamma narsani qila oladi, admin esa faqat operator va customerlarni
            const canBlock = currentUser.role === 'owner' || (currentUser.role === 'admin' && (user.role === 'operator' || user.role === 'customer'));
            if (canBlock) {
                actionButtonHtml = isBlocked
                    ? `<button data-user-id="${user.id}" class="toggle-block-btn text-green-600 hover:text-green-800 font-semibold">Blokdan yechish</button>`
                    : `<button data-user-id="${user.id}" class="toggle-block-btn text-red-600 hover:text-red-800 font-semibold">Bloklash</button>`;
            }

            tr.innerHTML = `
                <td class="font-medium text-gray-800">${user.name}</td>
                <td class="text-gray-600">${user.email}</td>
                <td class="text-gray-600">${user.phone || 'N/A'}</td>
                <td>${statusHtml}</td>
                <td>
                    ${actionButtonHtml}
                </td>
            `;
            usersTableBody.appendChild(tr);
        });
    };

    usersTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        if (target.classList.contains('toggle-block-btn')) {
            const userId = target.getAttribute('data-user-id');
            if (!userId) return;

            const userRow = target.closest('tr');
            const isCurrentlyBlocked = userRow.classList.contains('bg-red-50');

            const action = isCurrentlyBlocked ? 'unblock' : 'block';
            const url = `${API_BASE_URL}/admin/users/${userId}/${action}`;
            const confirmationMessage = isCurrentlyBlocked
                ? "Haqiqatan ham bu foydalanuvchini blokdan yechmoqchimisiz?"
                : "Haqiqatan ham bu foydalanuvchini bloklamoqchimisiz?";

            if (confirm(confirmationMessage)) {
                try {
                    target.disabled = true;
                    target.textContent = 'Bajarilmoqda...';
                    const response = await fetch(url, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Accept': 'application/json',
                        }
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Amalni bajarishda xatolik.');
                    }
                    await renderUsers(); // Ma'lumotlar bazasidan yangilangan ro'yxatni olish
                } catch (error) {
                    showToast(`Xatolik: ${error.message}`, true);
                    target.disabled = false; // Xatolik yuz berganda tugmani asl holiga qaytarish
                }
            }
        }
    });

    // --- BUYURTMALARNI BOSHQARISH ---
    const fetchOrders = async () => {
        if (!['owner', 'admin', 'operator'].includes(currentUser.role)) return [];
        try {
            const response = await fetch(`${API_BASE_URL}/admin/orders`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json',
                }
            });
            if (!response.ok) throw new Error('Buyurtmalarni yuklashda xatolik.');
            const data = await response.json();
            return data.data || data;
        } catch (error) {
            showToast(error.message || 'Buyurtmalarni yuklashda xatolik.', true);
            document.getElementById('orders-table-body').innerHTML = `<tr><td colspan="6" class="text-center text-gray-500 py-4">Buyurtmalarni yuklab bo'lmadi.</td></tr>`;
            return [];
        }
    };

    const renderOrders = async () => {
        let orders = await fetchOrders();
        const ordersTitle = document.getElementById('orders-title');
        const ordersTableBody = document.getElementById('orders-table-body');
        ordersTableBody.innerHTML = '';

        // Operatorlar faqat o'z viloyatining buyurtmalarini ko'radi
        if (currentUser.role === 'operator') {
            orders = orders.filter(order => order.region === currentUser.region);
            ordersTitle.textContent = `${currentUser.region} viloyati buyurtmalari`;
        }

        if (orders.length === 0) {
            ordersTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-gray-500">Hozircha buyurtmalar mavjud emas.</td></tr>`;
            return;
        }

        orders.forEach(order => {
            const tr = document.createElement('tr');
            const statusClasses = {
                'new': 'bg-blue-100 text-blue-800',
                'completed': 'bg-green-100 text-green-800',
                'cancelled': 'bg-red-100 text-red-800'
            };

            tr.innerHTML = `
                <td class="text-sm text-gray-600">${order.id}</td>
                <td class="font-medium text-gray-800">${order.customer_name}</td>
                <td class="text-gray-600">${order.customer_phone}</td>
                <td class="font-semibold text-gray-700">$${parseFloat(order.total_price).toFixed(2)}</td>
                <td class="text-gray-600">${new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                    <select data-order-id="${order.id}" class="order-status-select w-full p-2 rounded-md border-gray-300 ${statusClasses[order.status] || 'bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="new" ${order.status === 'new' ? 'selected' : ''}>Yangi</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Bajarildi</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Bekor qilindi</option>
                    </select>
                </td>
            `;
            ordersTableBody.appendChild(tr);
        });
    };

    // Buyurtma statusini o'zgartirish
    document.getElementById('orders-table-body').addEventListener('change', async (e) => {
        if (e.target.classList.contains('order-status-select')) {
            const orderId = e.target.getAttribute('data-order-id');
            const newStatus = e.target.value;
            const selectElement = e.target;
            
            try {
                selectElement.disabled = true;
                const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ status: newStatus })
                });

                if (!response.ok) {
                    throw new Error('Statusni yangilashda xatolik yuz berdi.');
                }
                
                // Muvaffaqiyatli bo'lsa, jadvalni qayta chizish
                await renderOrders();

            } catch (error) {
                showToast(`Xatolik: ${error.message}`, true);
                // Xatolik yuz berganda eski statusga qaytarish
                await renderOrders(); 
            } finally {
                selectElement.disabled = false;
            }
        }
    });

    // --- DASHBOARD STATISTIKASI ---
    let salesChartInstance = null;

    const renderSalesChart = (stats) => {
        const ctx = document.getElementById('salesChart').getContext('2d');
        if (!ctx) return;

        // Agar grafik allaqachon mavjud bo'lsa, uni yo'q qilish
        if (salesChartInstance) {
            salesChartInstance.destroy();
        }

        const labels = stats.daily_sales.map(item => item.date);
        const data = stats.daily_sales.map(item => item.total);

        salesChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Kunlik Sotuvlar ($)',
                    data: data,
                    backgroundColor: 'rgba(251, 146, 60, 0.2)',
                    borderColor: 'rgba(251, 146, 60, 1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    };

    const renderTopSellingProducts = (stats) => {
        const container = document.getElementById('top-products-container');
        if (!container) return;

        const topProducts = stats.top_selling_products || [];
        container.innerHTML = '';

        if (topProducts.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center pt-16">Sotilgan mahsulotlar hozircha yo\'q.</p>';
            return;
        }

        topProducts.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'flex items-center space-x-4';
            productElement.innerHTML = `
                <img src="${product.image_url || 'https://via.placeholder.com/40'}" alt="${product.name}" class="w-10 h-10 rounded-lg object-cover bg-gray-100">
                <div class="flex-1">
                    <p class="font-semibold text-gray-800 text-sm">${product.name}</p>
                    <p class="text-xs text-gray-500">${product.total_sold} dona sotilgan</p>
                </div>
                <span class="font-bold text-gray-800 text-sm">$${parseFloat(product.total_revenue).toFixed(2)}</span>
            `;
            container.appendChild(productElement);
        });
    };

    const renderTopCustomers = (stats) => {
        const container = document.getElementById('top-customers-container');
        if (!container) return;

        const topCustomers = stats.top_customers || [];
        container.innerHTML = '';

        if (topCustomers.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center pt-16">Hozircha aktiv mijozlar yo\'q.</p>';
            return;
        }

        topCustomers.forEach(customer => {
            const customerElement = document.createElement('div');
            customerElement.className = 'flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50';
            const initial = (customer.name || '?').charAt(0).toUpperCase();
            customerElement.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">${initial}</div>
                <div class="flex-1">
                    <p class="font-semibold text-gray-800 text-sm">${customer.name}</p>
                    <p class="text-xs text-gray-500">${customer.orders_count} ta buyurtma</p>
                </div>
                <span class="font-bold text-gray-800 text-sm">$${parseFloat(customer.total_spent).toFixed(2)}</span>
            `;
            container.appendChild(customerElement);
        });
    };

    const renderDashboard = async () => {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, { headers: { 'Authorization': `Bearer ${authToken}` } });
        const stats = await response.json();

        document.getElementById('total-products-stat').textContent = stats.total_products;
        document.getElementById('total-users-stat').textContent = stats.total_users;
        document.getElementById('active-users-stat').textContent = stats.active_users;
        document.getElementById('blocked-users-stat').textContent = stats.blocked_users;
        document.getElementById('new-orders-stat').textContent = stats.new_orders;

        renderSalesChart(stats);
        renderTopSellingProducts(stats);
        renderTopCustomers(stats);
    };

    // --- SHARHLARNI BOSHQARISH ---
    const fetchReviews = async () => {
        if (!['owner', 'admin'].includes(currentUser.role)) return [];
        try {
            const response = await fetch(`${API_BASE_URL}/admin/reviews`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json',
                }
            });
            if (!response.ok) throw new Error('Sharhlarni yuklashda xatolik.');
            const data = await response.json();
            return data.data || data;
        } catch (error) {
            showToast(error.message || 'Sharhlarni yuklashda xatolik.', true);
            document.getElementById('reviews-table-body').innerHTML = `<tr><td colspan="6" class="text-center text-gray-500 py-4">Sharhlarni yuklab bo'lmadi.</td></tr>`;
            return [];
        }
    };

    const renderReviews = async () => {
        const reviews = await fetchReviews();
        const reviewsTableBody = document.getElementById('reviews-table-body');
        reviewsTableBody.innerHTML = '';

        if (reviews.length === 0) {
            reviewsTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-gray-500">Hozircha sharhlar mavjud emas.</td></tr>`;
            return;
        }

        reviews.forEach(review => {
            const tr = document.createElement('tr');
            let stars = '';
            for (let i = 1; i <= 5; i++) {
                stars += `<svg class="w-4 h-4 ${i <= review.rating ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
            }

            tr.innerHTML = `
                <td class="text-sm text-gray-700">${review.product ? review.product.name : 'Noma\'lum'}</td>
                <td class="text-sm text-gray-700">${review.user ? review.user.name : 'Noma\'lum'}</td>
                <td class="flex items-center">${stars}</td>
                <td class="text-sm text-gray-600">${review.comment || '<i>Izoh yo\'q</i>'}</td>
                <td class="text-sm text-gray-500">${new Date(review.created_at).toLocaleDateString()}</td>
                <td>
                    <button data-review-id="${review.id}" class="delete-review-btn text-red-600 hover:text-red-800 font-semibold">O'chirish</button>
                </td>
            `;
            reviewsTableBody.appendChild(tr);
        });
    };

    document.getElementById('reviews-table-body').addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-review-btn')) {
            const reviewId = e.target.getAttribute('data-review-id');
            if (confirm("Haqiqatan ham bu sharhni o'chirmoqchimisiz?")) {
                try {
                    const response = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}`, { // URL to'g'irlandi
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Accept': 'application/json',
                        }
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Sharhni o\'chirishda xatolik.');
                    }
                    await renderReviews();
                } catch (error) {
                    showToast(`Xatolik: ${error.message}`, true);
                }
            }
        }
    });

    // --- TABLARNI BOSHQARISH ---
    const switchTab = (tab) => {
        const availableTabs = ['dashboard', 'products', 'orders'];
        if (currentUser.role === 'owner' || currentUser.role === 'admin') {
            availableTabs.push('users');
            availableTabs.push('reviews');
        }

        // Barcha bo'limlarni yashirish va tablarni noaktiv qilish
        [dashboardSection, productsSection, usersSection, ordersSection].forEach(section => section.classList.add('hidden'));
        [dashboardTabBtn, productsTabBtn, usersTabBtn, ordersTabBtn].forEach(button => button.classList.remove('active'));
        [dashboardSection, productsSection, usersSection, ordersSection, reviewsSection].forEach(section => section.classList.add('hidden'));
        [dashboardTabBtn, productsTabBtn, usersTabBtn, ordersTabBtn, reviewsTabBtn].forEach(button => button.classList.remove('active'));

        if (tab === 'users' && availableTabs.includes('users')) {
            usersSection.classList.remove('hidden');
            usersTabBtn.classList.add('active');
            renderUsers();
        } else if (tab === 'products') {
            productsSection.classList.remove('hidden');
            productsTabBtn.classList.add('active');
            renderProducts();
        } else if (tab === 'orders') {
            ordersSection.classList.remove('hidden');
            ordersTabBtn.classList.add('active');
            renderOrders();
        } else if (tab === 'reviews' && availableTabs.includes('reviews')) {
            reviewsSection.classList.remove('hidden');
            reviewsTabBtn.classList.add('active');
            renderReviews();
        } else { // dashboard
            dashboardSection.classList.remove('hidden');
            dashboardTabBtn.classList.add('active');
            renderDashboard();
        }
    };

    dashboardTabBtn.addEventListener('click', () => switchTab('dashboard'));
    productsTabBtn.addEventListener('click', () => switchTab('products'));
    usersTabBtn.addEventListener('click', () => switchTab('users'));
    ordersTabBtn.addEventListener('click', () => switchTab('orders'));
    reviewsTabBtn.addEventListener('click', () => switchTab('reviews'));

    // Modalni ochish va yopish tugmalari
    showAddModalBtn.addEventListener('click', () => showModal());
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Sahifa yuklanganda rolga qarab birinchi bo'limni ko'rsatish
    if (currentUser.role === 'operator') {
        switchTab('orders'); // Operator uchun birinchi bo'lib buyurtmalar ochiladi
    } else {
        switchTab('dashboard'); // Boshqalar uchun statistika
    }
});