/**
 * Cart badge count + watch-themed accent color
 */
(function () {
    const WATCH_ACCENT = {
        gold: '#a8842a',
        silver: '#7a8494',
        black: '#2a2a2a',
        default: '#4a6b5d'
    };

    function getWatchAccentColor(color) {
        const key = (color || '').toLowerCase().trim();
        if (key === 'gold') return WATCH_ACCENT.gold;
        if (key === 'silver') return WATCH_ACCENT.silver;
        if (key === 'black') return WATCH_ACCENT.black;
        return WATCH_ACCENT.default;
    }

    function applyCartBadgeColor(cart) {
        const el = document.getElementById('cart-count');
        if (!el) return;

        if (!cart || cart.length === 0) {
            document.documentElement.style.removeProperty('--cart-badge-color');
            return;
        }

        const lastItem = cart[cart.length - 1];
        const accent = getWatchAccentColor(lastItem.color);
        document.documentElement.style.setProperty('--cart-badge-color', accent);
    }

    window.getWatchAccentColor = getWatchAccentColor;
    window.applyCartBadgeColor = applyCartBadgeColor;

    window.refreshCartCount = function refreshCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const el = document.getElementById('cart-count');
        if (!el) return;

        el.textContent = cart.length;
        el.style.display = cart.length > 0 ? 'inline-block' : 'none';
        applyCartBadgeColor(cart);
    };

    document.addEventListener('DOMContentLoaded', window.refreshCartCount);
})();
