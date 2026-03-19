/**
 * GK Fashion Jewellery - Main JS
 * Extracted for better caching and performance
 */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : '';

let cart = JSON.parse(localStorage.getItem('gk_cart')) || [];
let allProducts = []; // Store all products for filtering
let lastFetchTime = 0;
const CACHE_DURATION = 120000; // 2 minutes cache

// SEO-optimised display labels for each product category
const CATEGORY_LABELS = {
    'Necklace': 'Necklace Jewellery',
    'Earrings': 'Earrings Collection',
    'Ring': 'Rings & Finger Rings',
    'Bangle': 'Bangles & Bracelets',
    'Bridal Collection': 'Bridal Jewellery Collection',
    'Pendant with Earrings': 'Pendant with Earrings Set',
    'Necklace with Earrings': 'Necklace & Earrings Set',
};

// Returns the SEO label for a category, falling back to the raw value
function getCategoryLabel(cat) {
    return CATEGORY_LABELS[cat] || cat;
}

function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    const hamburgerIcon = document.querySelector('.hamburger i');
    if (window.innerWidth <= 768) {
        navMenu.classList.toggle('active');
        hamburgerIcon.classList.toggle('fa-bars');
        hamburgerIcon.classList.toggle('fa-times');
    }
}

function showToast(message, duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-message">${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        toast.addEventListener('animationend', () => toast.remove());
    }, duration);
}

async function toggleCart() {
    const modal = document.getElementById('cart-modal');
    const isFlex = modal.style.display === 'flex';

    if (!isFlex) {
        // Proactively refresh products and sync cart before showing
        await fetchProducts(true);
        renderCart();
        modal.style.display = 'flex';

        const navMenu = document.getElementById('nav-menu');
        if (navMenu && navMenu.classList.contains('active')) {
            toggleMenu();
        }
    } else {
        modal.style.display = 'none';
    }
}

function updateCartCount() {
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        countEl.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    localStorage.setItem('gk_cart', JSON.stringify(cart));
}

function syncCart(products) {
    const validIds = new Set(products.map(p => String(p.id)));
    const initialCartLength = cart.length;
    const removedItems = cart.filter(item => !validIds.has(String(item.id)));

    cart = cart.filter(item => validIds.has(String(item.id)));

    if (cart.length !== initialCartLength) {
        updateCartCount();
        const names = removedItems.map(i => i.name).join(', ');
        showToast(`Unavailable items removed: ${names}`);
    }
}

function addToCart(id, name, price, image) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price: parseInt(price), image, quantity: 1 });
    }

    updateCartCount();
    showToast(`${name} added to cart!`);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    renderCart();
}

function changeQuantity(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCartCount();
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total');
    let total = 0;

    if (!container || !totalEl) return;

    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        totalEl.innerText = '₹0';
        return;
    }

    container.innerHTML = cart.map((item, index) => {
        total += item.price * item.quantity;
        const imgSrc = item.image.startsWith('http') ? item.image : `${API_BASE}${item.image}`;
        return `
            <div class="cart-item">
                <img src="${imgSrc}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60x60?text=Jewel'">
                <div class="cart-item-info">
                    <strong>${item.name}</strong><br>
                    <small>₹${item.price}</small>
                    <div class="quantity-control">
                        <button onclick="changeQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity(${index}, 1)">+</button>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:600; margin-bottom: 5px;">
                        ₹${item.price * item.quantity}
                    </div>
                    <button class="btn-remove" onclick="removeFromCart(${index})" title="Remove item">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    totalEl.innerText = `₹${total}`;
}

async function checkoutWhatsApp() {
    if (cart.length === 0) {
        showToast("Your cart is empty!");
        return;
    }

    // Final sync check before checkout
    await fetchProducts(true);
    if (cart.length === 0) return; // Cart became empty after sync

    const phoneNumber = "9487724818";
    let message = "Hello GK Fashion Jewellery, I'd like to request a quote for the following items:\n\n";
    let total = 0;

    cart.forEach(item => {
        message += `*${item.name}* (Qty: ${item.quantity}) - ₹${item.price * item.quantity}\n`;
        total += item.price * item.quantity;
    });

    message += `\n*Total Estimate:* ₹${total}\n\nPlease let me know about availability and shipping.`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
}

async function fetchProducts(quiet = false) {
    const container = document.getElementById('product-container');
    if (!container) return;

    try {
        if (quiet && allProducts.length > 0) return; // Only syncing, don't re-render if we have cache

        const now = Date.now();
        if (!quiet && allProducts.length > 0 && (now - lastFetchTime < CACHE_DURATION)) {
            renderProducts(allProducts);
            return;
        }

        const response = await fetch(`${API_BASE}/products`);
        const products = await response.json();
        allProducts = products;
        lastFetchTime = Date.now();

        updateCategoryFilter(products);
        syncCart(products);

        if (quiet) return;

        // Clear skeletons
        container.innerHTML = '';
        renderProducts(products);
    } catch (err) {
        console.error('Failed to fetch products:', err);
        container.innerHTML = '<p>Unable to load products. Please refresh the page.</p>';
    }
}

// Called by static category cards in the Collections section
function filterByCategory(categoryValue) {
    const filter = document.getElementById('category-filter');
    if (filter) {
        filter.value = categoryValue;
        filterProducts();
    } else {
        // On the home page (no filter element), redirect to the new-arrivals page
        window.location.href = `new-arrivals.html?category=${encodeURIComponent(categoryValue)}`;
    }
}

function filterProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const category = document.getElementById('category-filter').value;
    const container = document.getElementById('product-container');

    if (!container) return;

    const filtered = allProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) ||
            (p.description && p.description.toLowerCase().includes(searchTerm));
        const matchesCategory = category === 'all' || p.category === category;
        return matchesSearch && matchesCategory;
    });

    renderProducts(filtered);
}

function updateCategoryFilter(products) {
    const filter = document.getElementById('category-filter');
    if (!filter) return;

    const currentSelection = filter.value;

    // All known categories (must match admin panel options)
    const knownCategories = Object.keys(CATEGORY_LABELS);

    // Merge known categories with any from products (in case new ones are added later)
    const productCategories = products.map(p => p.category);
    const allCategories = ['all', ...new Set([...knownCategories, ...productCategories])];

    filter.innerHTML = allCategories.map(cat => `
        <option value="${cat}" ${cat === currentSelection ? 'selected' : ''}>
            ${cat === 'all' ? 'All Categories' : getCategoryLabel(cat)}
        </option>
    `).join('');
}

function renderProducts(products) {
    const container = document.getElementById('product-container');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<p>No products found matching your criteria.</p>';
        return;
    }

    container.innerHTML = '';

    // Clear existing product structured data
    const oldScripts = document.querySelectorAll('script[data-type="product-ld"]');
    oldScripts.forEach(s => s.remove());

    products.forEach((p, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        const imgSrc = p.image.startsWith('http') ? p.image : `${API_BASE}${p.image}`;
        
        // Priority loading for top products
        const priorityAttr = index < 3 ? 'fetchpriority="high"' : '';
        const loadingAttr = index < 3 ? 'eager' : 'lazy';

        // Dynamic Structured Data for each product
        const productLD = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": p.name,
            "image": imgSrc,
            "description": p.description || `${p.name} - Premium ${getCategoryLabel(p.category)} from GK Fashion Jewellery. Fast shipping to Kerala and across India.`,
            "brand": {
                "@type": "Brand",
                "name": "GK Fashion Jewellery"
            },
            "offers": {
                "@type": "Offer",
                "url": window.location.href,
                "priceCurrency": "INR",
                "price": p.price,
                "availability": "https://schema.org/InStock",
                "itemCondition": "https://schema.org/NewCondition"
            },
            "category": getCategoryLabel(p.category)
        };
        const ldScript = document.createElement('script');
        ldScript.type = "application/ld+json";
        ldScript.setAttribute('data-type', 'product-ld');
        ldScript.text = JSON.stringify(productLD);
        document.head.appendChild(ldScript);

        card.innerHTML = `
            <img src="${imgSrc}" alt="${p.name} - ${getCategoryLabel(p.category)} | GK Fashion Jewellery Coimbatore" loading="${loadingAttr}" ${priorityAttr}>
            <div class="product-details">
                <span class="product-category">${getCategoryLabel(p.category)}</span>
                <h3>${p.name}</h3>
                <p class="product-price">₹${Number(p.price).toLocaleString('en-IN')}</p>
                ${p.description ? `<p class="product-description">${p.description}</p>` : ''}
                
                <div class="product-actions">
                    <button class="btn-cart" onclick="addToCart('${p.id}', '${p.name}', '${p.price}', '${p.image}')">Add to Cart</button>
                    <button class="btn-quote" onclick="addToCart('${p.id}', '${p.name}', '${p.price}', '${p.image}'); toggleCart();"><i class="fas fa-shopping-bag"></i> Buy Now</button>
                </div>
            </div>
        `;

        const img = card.querySelector('img');
        img.onerror = function () {
            this.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
            this.parentElement.classList.add('image-error');
        };

        container.appendChild(card);
    });
}

// Custom Animated Cursor
function initCustomCursor() {
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');

    if (!cursor || !follower) return;

    let posX = 0, posY = 0;
    let mouseX = 0, mouseY = 0;

    if (window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.setProperty('--cursor-x', `${mouseX}px`);
            cursor.style.setProperty('--cursor-y', `${mouseY}px`);
        });

        function animateFollower() {
            posX += (mouseX - posX) / 9;
            posY += (mouseY - posY) / 9;
            follower.style.setProperty('--follower-x', `${posX}px`);
            follower.style.setProperty('--follower-y', `${posY}px`);
            requestAnimationFrame(animateFollower);
        }
        animateFollower();

        // Mouse hover effects - use event delegation
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('a, button, .cart-icon, .category-card, .product-card, .hamburger, .btn-cart, .btn-quote');
            if (target) {
                cursor.classList.add('active');
                follower.classList.add('active');
            }
        });

        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest('a, button, .cart-icon, .category-card, .product-card, .hamburger, .btn-cart, .btn-quote');
            if (target) {
                cursor.classList.remove('active');
                follower.classList.remove('active');
            }
        });
    } else {
        cursor.style.display = 'none';
        follower.style.display = 'none';
    }
}

// Global initialization
window.addEventListener('DOMContentLoaded', async () => {
    updateCartCount();
    initCustomCursor();

    // Only fetch and render products on pages that have the product container
    const productContainer = document.getElementById('product-container');
    if (productContainer) {
        await fetchProducts();

        // Apply category filter from URL parameter (e.g. ?category=Necklace)
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        if (categoryParam) {
            const filter = document.getElementById('category-filter');
            if (filter) {
                filter.value = categoryParam;
                filterProducts();
            }
        }
    }
});
