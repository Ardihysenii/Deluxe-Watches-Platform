/**
 * Alfa Accessories - Shopping Cart Script
 */
document.addEventListener('DOMContentLoaded', () => {
    const cartBtn = document.getElementById('cartBtn');
    const cartOverlay = document.getElementById('customCartOverlay');
    const closeCartBtn = document.getElementById('closeCustomCart');
    const cartCount = document.getElementById("cart-count");

    // Product Data
    const watchData = [
        { id: "baume", title: "Baume Custom Timepiece", price: 3500.00, image: "/img/unnamed (3).jpg" },
        { id: "elegant", title: "Elegant Chronograph", price: 8200.00, image: "/img/unnamed (4).jpg" },
        { id: "sportive", title: "Sportive Edition", price: 4800.00, image: "/img/unnamed (5).jpg" }
    ];

    // Open/Close
    cartBtn?.addEventListener('click', () => cartOverlay.style.display = 'block');
    closeCartBtn?.addEventListener('click', () => cartOverlay.style.display = 'none');

    // Add to Cart Logic
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("add-to-cart") || e.target.closest(".add-to-cart")) {
            const btn = e.target.classList.contains("add-to-cart") ? e.target : e.target.closest(".add-to-cart");
            const productId = btn.dataset.id;
            const product = watchData.find(p => p.id === productId);

            if (product) {
                let cart = JSON.parse(localStorage.getItem("cart")) || [];
                cart.push(product);
                localStorage.setItem("cart", JSON.stringify(cart));
                updateCartUI();
                cartOverlay.style.display = "block";
            }
        }
    });

    // Update UI and Calculations
    function updateCartUI() {
        const container = document.getElementById("customCartItems");
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        if (!container) return;

        container.innerHTML = "";
        let subtotal = 0;

        if (cart.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:20px;">Shporta është bosh.</div>';
        }

        cart.forEach((item, index) => {
            subtotal += item.price;
            const div = document.createElement("div");
            div.className = "cart-item";
            div.style.display = "flex";
            div.style.alignItems = "center";
            div.style.marginBottom = "15px";
            div.innerHTML = `
                <img src="${item.image}" width="60" style="margin-right:15px;">
                <div style="flex-grow:1;">
                    <h4 style="margin:0; font-size:14px;">${item.title}</h4>
                    <p style="margin:5px 0;">${item.price.toFixed(2)} €</p>
                    <button class="delete-item-btn" data-index="${index}" style="background:none; border:none; color:red; cursor:pointer; padding:0; font-size:12px;">Fshije</button>
                </div>
            `;
            container.appendChild(div);
        });

        // Calculations
        const tax = subtotal * 0.18;
        const shipping = cart.length > 0 ? 5.00 : 0;
        const total = subtotal + tax + shipping;

        document.getElementById('customSubtotal').textContent = `${subtotal.toFixed(2)} €`;
        document.getElementById('customTax').textContent = `${tax.toFixed(2)} €`;
        document.getElementById('customShipping').textContent = `${shipping.toFixed(2)} €`;
        document.getElementById('customTotal').textContent = `${total.toFixed(2)} €`;

        if (cartCount && typeof window.refreshCartCount === 'function') {
            window.refreshCartCount();
        } else if (cartCount) {
            cartCount.textContent = cart.length;
            cartCount.style.display = cart.length > 0 ? "inline-block" : "none";
        }
    }

    // Delete Logic
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-item-btn')) {
            const index = parseInt(e.target.dataset.index);
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            cart.splice(index, 1);
            localStorage.setItem("cart", JSON.stringify(cart));
            updateCartUI();
        }
    });

    // Buy Now
    document.getElementById("buyNowBtn")?.addEventListener("click", () => {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        if (cart.length > 0) {
            window.location.href = "/checkout";
        } else {
            alert("Shtoni të paktën një produkt!");
        }
    });

    updateCartUI();
});