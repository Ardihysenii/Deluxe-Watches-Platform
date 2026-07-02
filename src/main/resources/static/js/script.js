/**
 * Alfa Accessories - Main Script
 * Ky skedar menaxhon Navigimin, Search-in, Animacionet e Scroll dhe Shportën (Local Storage).
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTET ---
    const hamburger = document.querySelector('.hamburger');
    const menuOverlay = document.getElementById('menuOverlay');
    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    const cartBtn = document.getElementById('cartBtn');
    const cartOverlay = document.getElementById('customCartOverlay');
    const closeCartBtn = document.getElementById('closeCustomCart');
    const menuText = hamburger?.querySelector('.Menu-Text');
    const menuToggle = document.getElementById('menuToggle'); // Për HTML-në me checkbox

    // --- FUNKSIONI PËR MBYLLJE TË SEARCH-IT (FIX) ---
    const closeSearch = () => {
        if (searchOverlay) {
            searchOverlay.classList.remove('active');
            searchOverlay.style.display = 'none'; // Kjo e zhduk inputin plotësisht
        }
        document.body.classList.remove('search-active');
        hamburger?.classList.remove('active');
        if (menuToggle) menuToggle.checked = false; // Reset hamburgerin te vijat
        if (menuText) menuText.style.display = 'inline';
        if (searchInput) searchInput.value = '';
    };

    // --- 1. MENAXHIMI I MENU-SË (HAMBURGER) ---
    hamburger?.addEventListener('click', (e) => {
        const isSearchOpen = searchOverlay?.classList.contains('active') || searchOverlay?.style.display === 'flex';

        if (isSearchOpen) {
            e.preventDefault();
            e.stopPropagation();
            closeSearch();
            return;
        }

        // Logjika normale e menusë
        setTimeout(() => {
            if (menuText) {
                menuText.style.display = menuOverlay?.classList.contains('active') ? 'none' : 'inline';
            }
        }, 10);
    });

    // --- 2. SEARCH OVERLAY (HAPJA) ---
    searchBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        document.body.classList.add('search-active');
        if (searchOverlay) {
            searchOverlay.style.display = 'flex'; // E detyron të shfaqet
            searchOverlay.classList.add('active');
        }
        hamburger?.classList.add('active');
        if (menuToggle) menuToggle.checked = true; // E kthen hamburgerin në X
        menuOverlay?.classList.remove('active');
        if (menuText) menuText.style.display = 'none';

        setTimeout(() => searchInput?.focus(), 100);
    });

    // Mbyllja kur klikon jashtë search-it
    window.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            closeSearch();
        }
    });

    // --- 3. ANIMACIONET GJATË SCROLL-IT ---
    const scrollElements = document.querySelectorAll('.hidden-scroll');
    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            const elementTop = el.getBoundingClientRect().top;
            const isVisible = elementTop <= (window.innerHeight - 100);
            el.classList.toggle('show-on-scroll', isVisible);
        });
    };
    window.addEventListener('scroll', handleScrollAnimation);

    // --- 4. LOGJIKA E SHPORTËS (CART) ---
    const watchData = [
        { id: "baume", title: "Baume Custom Timepiece", price: 399.99, image: "/img/unnamed (3).jpg" },
        { id: "elegant", title: "Elegant Chronograph", price: 449.99, image: "/img/unnamed (4).jpg" },
        { id: "midnight", title: "Midnight Silver Heritage", price: 499.99, image: "/img/unnamed (6).jpg" }
    ];

    cartBtn?.addEventListener('click', () => {
        if (cartOverlay) cartOverlay.style.display = 'flex';
    });

    closeCartBtn?.addEventListener('click', () => {
        if (cartOverlay) cartOverlay.style.display = 'none';
    });

    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("add-to-cart")) {
            const productId = e.target.dataset.id;
            const product = watchData.find(p => p.id === productId);
            if (product) {
                let cart = JSON.parse(localStorage.getItem("cart")) || [];
                cart.push(product);
                localStorage.setItem("cart", JSON.stringify(cart));
                updateCartUI();
                if (cartOverlay) cartOverlay.style.display = "flex";
            }
        }
    });

    function updateCartUI() {
        const container = document.getElementById("customCartItems");
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        if (!container) return;

        container.innerHTML = "";
        let subtotal = 0;

        cart.forEach((item, index) => {
            subtotal += item.price;
            const div = document.createElement("div");
            div.className = "cart-item-row"; // Përdor klasën tënde të CSS
            div.style.display = "flex";
            div.style.alignItems = "center";
            div.style.marginBottom = "10px";
            div.innerHTML = `
                <img src="${item.image}" width="60" style="border-radius:4px; margin-right:15px;" />
                <div style="flex:1;">
                    <h4 style="margin:0; font-size:14px;">${item.title}</h4>
                    <p style="margin:0; font-weight:bold;">${item.price.toFixed(2)} €</p>
                </div>
                <button class="delete-item-btn" data-index="${index}" style="background:none; border:none; cursor:pointer; font-size:18px;">&times;</button>
            `;
            container.appendChild(div);
        });

        const tax = subtotal * 0.18;
        const total = subtotal + tax + (cart.length > 0 ? 5 : 0);

        if(document.getElementById('customSubtotal')) document.getElementById('customSubtotal').textContent = `${subtotal.toFixed(2)} €`;
        if(document.getElementById('customTax')) document.getElementById('customTax').textContent = `${tax.toFixed(2)} €`;
        if(document.getElementById('customTotal')) document.getElementById('customTotal').textContent = `${total.toFixed(2)} €`;

        const cartCount = document.getElementById("cart-count");
        if (cartCount) {
            cartCount.textContent = cart.length;
            cartCount.style.display = cart.length > 0 ? "inline-block" : "none";
        }
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-item-btn')) {
            const index = parseInt(e.target.dataset.index);
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            cart.splice(index, 1);
            localStorage.setItem("cart", JSON.stringify(cart));
            updateCartUI();
        }
    });

    updateCartUI();
    handleScrollAnimation();
});