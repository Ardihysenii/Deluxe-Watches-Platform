const images = [
    "/img/unnamed (3).jpg",
    "/img/unnamed (4).jpg",
    "/img/unnamed (6).jpg"
];

const watchData = [
    {
        title: "Baume Custom Timepiece Small Second",
        price: "$399.99",
        stars: "★ ★ ★ ★ ☆",
        description: "Personalized watches are a job of quality and commitment. Each piece is the result of a work of co-creation of innovation and responsible sensitivity for users.",
        id: "baume"
    },
    {
        title: "Elegant Chronograph 42mm",
        price: "$449.99",
        stars: "★ ★ ★ ★ ★",
        description: "This chronograph combines sport and luxury, made for those who want precision and performance in a timeless design.",
        id: "elegant"
    },
    {
        title: "Midnight Silver Heritage",
        price: "$499.99",
        stars: "★ ★ ★ ★ ☆",
        description: "Inspired by classic craftsmanship, this piece brings a perfect balance of modern elegance and vintage charm."
    }
];


let currentIndex = 0;

const img = document.querySelector(".watch-frame img");
const dots = document.querySelectorAll(".dot");
const frame = document.querySelector(".watch-frame");

const titleEl = document.querySelector(".title");
const priceEl = document.querySelector(".price");
const starsEl = document.querySelector(".stars");
const descEl = document.querySelector(".right p");

function showImage(index) {
    img.style.opacity = 0;
    setTimeout(() => {
        img.src = images[index];
        img.style.opacity = 1;
    }, 150);

    dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
    });

    // Ndryshojmë tekstin sipas orës
    titleEl.textContent = watchData[index].title;
    priceEl.textContent = watchData[index].price;
    starsEl.textContent = watchData[index].stars;
    descEl.textContent = watchData[index].description;
}

function goToSlide(index) {
    currentIndex = index;
    showImage(currentIndex);
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(currentIndex);
}

// Drag/Swipe funksioni
let isDown = false;
let startX = 0;

frame.addEventListener("pointerdown", (e) => {
    isDown = true;
    startX = e.clientX;
});

frame.addEventListener("pointerup", (e) => {
    if (!isDown) return;
    const endX = e.clientX;
    const delta = endX - startX;
    const threshold = 50;

    if (delta > threshold) {
        prevSlide();
    } else if (delta < -threshold) {
        nextSlide();
    }
    isDown = false;
});

frame.addEventListener("pointermove", (e) => {
    if (isDown) e.preventDefault();
});

img.addEventListener('dragstart', e => e.preventDefault());

// Fillon me orën e parë
showImage(currentIndex);

//Modal Fotoja kur klikojm learn more
const modal = document.getElementById("imageModal");
const learnMore = document.querySelector(".learn-more");
const closeBtn = document.querySelector(".image-modal .close");

learnMore.onclick = () => {
    modal.style.display = "flex";
};

closeBtn.onclick = () => {
    modal.style.display = "none";
};

window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
};

//Arrow Remover

// Hide arrow when Learn More is clicked
document.querySelector('.learn-more').addEventListener('click', () => {
    document.querySelector('.back-to-home').style.display = 'none';
    document.getElementById('imageModal').style.display = 'flex'; // Show modal
});

// Show arrow when modal X is clicked
document.querySelector('.close').addEventListener('click', () => {
    document.querySelector('.back-to-home').style.display = 'inline-block';
    document.getElementById('imageModal').style.display = 'none'; // Hide modal
});
/*=======================
    Buy click
========================*/


/*========================
  Add to Cart
==========================*/
function showAddedToCartMessage() {
    const message = document.createElement('div');
    message.textContent = 'Added to Cart';
    message.style.position = 'fixed';
    message.style.top = '20px';
    message.style.right = '20px';
    message.style.backgroundColor = '#d4edda';
    message.style.color = '#155724';
    message.style.padding = '10px 20px';
    message.style.border = '1px solid #c3e6cb';
    message.style.borderRadius = '5px';
    message.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.2)';
    message.style.zIndex = '9999';
    message.style.fontFamily = 'sans-serif';
    message.style.transition = 'opacity 0.3s ease';

    document.body.appendChild(message);

    setTimeout(() => {
        message.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(message);
        }, 300);
    }, 1500);
}

function updateCartCount(increment = false) {
    let count = parseInt(localStorage.getItem('cartCount')) || 0;
    if (increment) {
        count++;
        localStorage.setItem('cartCount', count);
        showAddedToCartMessage();
    }
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
        cartCountElement.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

// Run on page load to sync cart number
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount(false);
});

// Set up Add to Cart buttons (only if they exist)
const addToCartButtons = document.querySelectorAll('.add-to-cart');
addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        updateCartCount(true);
    });
});




document.querySelector('.add-to-cart').addEventListener('click', () => {
    const product = watchData[currentIndex];
    const imageSrc = images[currentIndex];

    if (!product) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    cart.push({
        name: product.title,
        price: parseFloat(product.price.replace('$', '').trim()),
        image: imageSrc
    });

    localStorage.setItem('cart', JSON.stringify(cart));

    updateCartCount(true);
    showAddedToCartMessage();
});





document.querySelector('.btn').addEventListener('click', () => {
    const selectedWatch = {
        name: watchData[currentIndex].title,
        price: parseFloat(watchData[currentIndex].price.replace('$', '')),
        image: images[currentIndex]
    };

    localStorage.setItem('selectedWatch', JSON.stringify(selectedWatch));
    localStorage.removeItem('cart'); // heq shportën nëse po blen një orë direkt

    window.location.href = 'buy.html';
});

localStorage.setItem('cart', JSON.stringify([selectedWatch]));
window.location.href = 'buy.html';