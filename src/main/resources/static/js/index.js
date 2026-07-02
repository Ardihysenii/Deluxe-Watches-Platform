/**
 * Alfa Accessories - Navbar, search overlay, and menu interactions
 */

window.alert = function() { return true; };

document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menuToggle');
    const hamburgerIcon = document.getElementById('hamburgerIcon');
    const menuOverlay = document.getElementById('menuOverlay');
    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const splitMenu = document.querySelector('.menu-left-panel');
    const menuText = hamburgerIcon?.querySelector('.Menu-Text');

    const updateMenuLabel = () => {
        if (!menuText || !splitMenu) return;
        menuText.textContent = document.body.classList.contains('menu-open') ? 'Close' : 'Menu';
    };

    const closeSearch = () => {
        if (searchOverlay) searchOverlay.style.display = 'none';
        document.body.classList.remove('search-active');
        if (searchInput) searchInput.value = '';
        if (searchResults) {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
        }
        window.alfaHideRecentSearches?.();
        if (menuToggle) menuToggle.checked = false;
        hamburgerIcon?.classList.remove('active');
        if (splitMenu) {
            document.body.classList.remove('menu-open');
            updateMenuLabel();
        } else {
            menuOverlay?.classList.remove('active');
        }
    };

    const openSearch = () => {
        document.body.classList.add('search-active');

        if (splitMenu) {
            document.body.classList.remove('menu-open');
            if (menuToggle) menuToggle.checked = true;
            hamburgerIcon?.classList.add('active');
        } else {
            menuOverlay?.classList.remove('active');
            if (menuToggle) menuToggle.checked = true;
            hamburgerIcon?.classList.add('active');
        }

        if (searchOverlay) searchOverlay.style.display = 'flex';
        searchInput?.focus({ preventScroll: true });
        setTimeout(() => {
            searchInput?.scrollIntoView({ block: 'nearest' });
            window.alfaShowRecentSearches?.();
        }, 300);
    };

    window.forceCloseSearch = closeSearch;

    searchBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!document.body.classList.contains('search-active')) {
            openSearch();
        }
    });

    menuToggle?.addEventListener('change', function() {
        if (splitMenu) {
            if (document.body.classList.contains('search-active')) {
                hamburgerIcon?.classList.toggle('active', this.checked);
                if (!this.checked) {
                    closeSearch();
                }
                return;
            }
            document.body.classList.toggle('menu-open', this.checked);
            hamburgerIcon?.classList.toggle('active', this.checked);
            updateMenuLabel();
            if (!this.checked) {
                closeSearch();
            }
            return;
        }

        if (this.checked) {
            if (document.body.classList.contains('search-active')) {
                menuOverlay?.classList.remove('active');
            } else {
                menuOverlay?.classList.add('active');
            }
            hamburgerIcon?.classList.add('active');
        } else {
            closeSearch();
        }
    });

    updateMenuLabel();

    if (navbar) {
        let lastScroll = window.scrollY;
        window.addEventListener('scroll', () => {
            if (window.scrollY > lastScroll && window.scrollY > 50) {
                navbar.classList.add('hidden');
            } else {
                navbar.classList.remove('hidden');
            }
            lastScroll = window.scrollY;
        });
    }
});

async function submitOrder() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const submitBtn = document.querySelector('.confirm-btn') || document.getElementById('buyNowBtn');

    const showMsg = (txt) => {
        if (submitBtn) {
            const original = submitBtn.innerText;
            submitBtn.innerText = txt;
            submitBtn.style.backgroundColor = "#cc0000";
            setTimeout(() => {
                submitBtn.innerText = original;
                submitBtn.style.backgroundColor = "";
            }, 2500);
        }
    };

    if (cart.length === 0) {
        showMsg("SHPORTA ËSHTË BOSHE");
        return;
    }

    const orderData = {
        fullName: document.getElementById('customerName')?.value,
        email: document.getElementById('customerEmail')?.value,
        phoneNumber: document.getElementById('customerPhone')?.value,
        address: document.getElementById('customerAddress')?.value,
        totalPrice: cart.reduce((sum, item) => sum + parseFloat(item.price), 0),
        items: cart.map(item => ({
            name: item.name,
            price: item.price.toString(),
            imageUrl: item.imageUrl || item.image || '',
            color: item.color || ''
        }))
    };

    if (!orderData.fullName || !orderData.email) {
        showMsg("PLOTËSONI TË DHËNAT");
        return;
    }

    try {
        const response = await fetch('/api/orders/place', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            localStorage.removeItem('cart');
            window.location.reload();
        } else {
            showMsg("GABIM NË SERVER");
        }
    } catch (e) {
        showMsg("GABIM LIDHJEJE");
    }
}
