/**
 * Shared product search + recent searches (localStorage) for all pages with search overlay.
 */
(function () {
    const STORAGE_KEY = 'alfaRecentSearches';
    const MAX_RECENT = 6;

    function getRecentSearches() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const list = raw ? JSON.parse(raw) : [];
            return Array.isArray(list)
                ? list.filter((q) => typeof q === 'string' && q.trim().length >= 2)
                : [];
        } catch {
            return [];
        }
    }

    function saveRecentSearches(list) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
    }

    function addRecentSearch(query) {
        const q = query.trim();
        if (q.length < 2) return;
        const list = getRecentSearches().filter(
            (item) => item.toLowerCase() !== q.toLowerCase()
        );
        list.unshift(q);
        saveRecentSearches(list);
    }

    function removeRecentSearch(query) {
        const q = query.trim().toLowerCase();
        saveRecentSearches(getRecentSearches().filter((item) => item.toLowerCase() !== q));
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    const clockIcon =
        '<svg class="recent-search-icon" stroke="currentColor" fill="none" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>' +
        '</svg>';

    function initSearchUI() {
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        const recentSearchesEl = document.getElementById('recentSearches');
        const searchCombo = document.getElementById('homeSearchCombo');
        if (!searchInput || !searchResults) return;

        let searchFetchController = null;

        const urlQuery = new URLSearchParams(window.location.search).get('query');
        if (urlQuery && urlQuery.trim().length >= 2) {
            addRecentSearch(urlQuery.trim());
        }

        function setSearchResultsVisible(visible) {
            searchResults.style.display = visible ? 'block' : 'none';
            if (visible) {
                requestAnimationFrame(() => {
                    searchResults.scrollIntoView({ block: 'nearest' });
                });
            }
        }

        function scrollSearchIntoView() {
            (searchCombo || searchInput)?.scrollIntoView({ block: 'nearest' });
        }

        function hideRecentSearches() {
            if (!recentSearchesEl) return;
            recentSearchesEl.hidden = true;
            recentSearchesEl.innerHTML = '';
        }

        function renderRecentSearches() {
            if (!recentSearchesEl) return;
            const items = getRecentSearches();
            if (items.length === 0) {
                hideRecentSearches();
                return;
            }

            recentSearchesEl.hidden = false;
            recentSearchesEl.innerHTML =
                '<div class="recent-searches-header">' +
                '<span class="recent-searches-title">Kërkime të fundit</span>' +
                '<button type="button" class="recent-searches-clear">Pastro</button>' +
                '</div>' +
                '<ul class="recent-searches-list"></ul>';

            const list = recentSearchesEl.querySelector('.recent-searches-list');
            items.forEach((query) => {
                const li = document.createElement('li');
                li.className = 'recent-search-item';
                li.innerHTML =
                    '<button type="button" class="recent-search-link">' +
                    clockIcon +
                    '<span>' + escapeHtml(query) + '</span>' +
                    '</button>' +
                    '<button type="button" class="recent-search-remove" aria-label="Hiq">&times;</button>';

                li.querySelector('.recent-search-link').addEventListener('click', () => {
                    addRecentSearch(query);
                    window.location.href = '/collection?query=' + encodeURIComponent(query);
                });

                li.querySelector('.recent-search-remove').addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeRecentSearch(query);
                    if (searchInput.value.trim().length < 2) {
                        renderRecentSearches();
                    } else {
                        hideRecentSearches();
                    }
                });

                list.appendChild(li);
            });

            recentSearchesEl.querySelector('.recent-searches-clear').addEventListener('click', () => {
                saveRecentSearches([]);
                hideRecentSearches();
            });

            requestAnimationFrame(() => {
                recentSearchesEl.scrollIntoView({ block: 'nearest' });
            });
        }

        function navigateToCollection(query) {
            addRecentSearch(query);
            window.location.href = '/collection?query=' + encodeURIComponent(query);
        }

        function showRecentIfIdle() {
            if (searchInput.value.trim().length < 2) {
                renderRecentSearches();
                setSearchResultsVisible(false);
            }
        }

        searchInput.addEventListener('focus', () => {
            setTimeout(scrollSearchIntoView, 350);
            showRecentIfIdle();
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query.length > 0) {
                    e.preventDefault();
                    navigateToCollection(query);
                }
            }
        });

        searchInput.addEventListener('input', async function () {
            const query = this.value.trim();

            if (searchFetchController) {
                searchFetchController.abort();
            }

            searchResults.innerHTML = '';

            if (query.length < 2) {
                showRecentIfIdle();
                return;
            }

            hideRecentSearches();
            searchFetchController = new AbortController();

            try {
                const response = await fetch(
                    '/api/products/search?query=' + encodeURIComponent(query),
                    { signal: searchFetchController.signal }
                );
                if (!response.ok) return;

                const products = await response.json();
                const uniqueProducts = [];
                const seenIds = new Set();
                for (const product of products) {
                    if (product.id != null && !seenIds.has(product.id)) {
                        seenIds.add(product.id);
                        uniqueProducts.push(product);
                    }
                }

                if (uniqueProducts.length === 0) {
                    searchResults.innerHTML = '<li class="search-empty">Asnjë orë nuk u gjet.</li>';
                } else {
                    uniqueProducts.forEach((product) => {
                        const li = document.createElement('li');
                        li.innerHTML =
                            '<span class="result-name">' + escapeHtml(product.name) + '</span>' +
                            '<hr class="result-line">';
                        li.addEventListener('click', () => {
                            addRecentSearch(query);
                            window.location.href = '/product-details/' + product.id;
                            window.forceCloseSearch?.();
                        });
                        searchResults.appendChild(li);
                    });
                }
                setSearchResultsVisible(true);
                scrollSearchIntoView();
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Gabim gjatë kërkimit:', error);
                }
            }
        });

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                if (document.body.classList.contains('search-active')) {
                    scrollSearchIntoView();
                }
            });
        }

        window.alfaShowRecentSearches = showRecentIfIdle;
        window.alfaHideRecentSearches = hideRecentSearches;
        window.alfaAddRecentSearch = addRecentSearch;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSearchUI);
    } else {
        initSearchUI();
    }
})();
