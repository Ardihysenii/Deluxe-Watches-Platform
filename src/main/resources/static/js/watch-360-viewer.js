/**
 * Full-screen 360° viewer — one watch image rotated in 3D.
 */
(function () {
    function init(options) {
        const trigger = document.querySelector(options.trigger || '#heroWatch360Trigger');
        const overlay = document.querySelector(options.overlay || '#watch360Overlay');
        const closeBtn = document.querySelector(options.closeBtn || '#watch360Close');
        const stage = document.querySelector(options.stage || '#watch360Stage');
        const spinner = document.querySelector(options.spinner || '#watch360Spinner');
        const hint = document.querySelector(options.hint || '#watch360Hint');

        const imageUrl = (options.imageUrl || trigger?.dataset?.image || '').trim();
        if (!trigger || !overlay || !stage || !spinner || !imageUrl) {
            return;
        }

        const productName = options.productName || 'Watch';
        const frontFace = spinner.querySelector('.watch-360-face-front');
        const backFace = spinner.querySelector('.watch-360-face-back');

        if (frontFace) {
            frontFace.src = imageUrl;
            frontFace.alt = productName;
        }
        if (backFace) {
            backFace.src = imageUrl;
            backFace.alt = productName;
        }

        let rotation = 0;
        let isDragging = false;
        let lastPointerX = 0;

        function applyRotation() {
            spinner.style.transform = `rotateY(${rotation}deg)`;
        }

        function openViewer() {
            overlay.hidden = false;
            overlay.setAttribute('aria-hidden', 'false');
            document.body.classList.add('watch-360-open');
            applyRotation();
            closeBtn?.focus({ preventScroll: true });
        }

        function closeViewer() {
            overlay.hidden = true;
            overlay.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('watch-360-open');
            isDragging = false;
            spinner.classList.remove('is-dragging');
            trigger.focus({ preventScroll: true });
        }

        function onPointerDown(e) {
            isDragging = true;
            lastPointerX = e.clientX;
            spinner.classList.add('is-dragging');
            stage.setPointerCapture?.(e.pointerId);
        }

        function onPointerMove(e) {
            if (!isDragging) return;
            const delta = e.clientX - lastPointerX;
            lastPointerX = e.clientX;
            rotation += delta * 0.5;
            applyRotation();
        }

        function onPointerUp(e) {
            if (!isDragging) return;
            isDragging = false;
            spinner.classList.remove('is-dragging');
            stage.releasePointerCapture?.(e.pointerId);
        }

        new Image().src = imageUrl;
        applyRotation();

        trigger.addEventListener('click', openViewer);
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openViewer();
            }
        });

        closeBtn?.addEventListener('click', closeViewer);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeViewer();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !overlay.hidden) {
                closeViewer();
            }
        });

        stage.addEventListener('pointerdown', onPointerDown);
        stage.addEventListener('pointermove', onPointerMove);
        stage.addEventListener('pointerup', onPointerUp);
        stage.addEventListener('pointercancel', onPointerUp);
    }

    window.AlfaWatch360 = { init };
})();
