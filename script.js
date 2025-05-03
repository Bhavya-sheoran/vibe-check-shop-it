
// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navIcons = document.querySelector('.nav-icons');
const filterButtons = document.querySelectorAll('.filter-btn');
const productsGrid = document.querySelector('.products-grid');
const cartIcon = document.querySelector('.cart-icon');
const closeCart = document.querySelector('.close-cart');
const cartSidebar = document.querySelector('.cart-sidebar');
const cartOverlay = document.querySelector('.cart-overlay');
const startShopping = document.querySelector('.start-shopping');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const cartItemsContainer = document.querySelector('.cart-items');
const emptyCartMessage = document.querySelector('.empty-cart');
const cartCount = document.querySelector('.cart-count');
const totalAmount = document.querySelector('.total-amount');
const toast = document.getElementById('toast');
const favoriteButtons = document.querySelectorAll('.favorite');
const checkoutBtn = document.querySelector('.checkout-btn');
const loadMoreBtn = document.querySelector('.load-more button');
const newsletterForm = document.querySelector('.newsletter-form');

// Cart State
let cart = [];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
      navIcons.classList.toggle('active');
      
      // Animate hamburger
      const lines = hamburger.querySelectorAll('.line');
      if (hamburger.classList.contains('active')) {
        lines[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
        lines[1].style.opacity = '0';
        lines[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
      } else {
        lines[0].style.transform = 'none';
        lines[1].style.opacity = '1';
        lines[2].style.transform = 'none';
      }
    });
  }

  // Initialize cart
  loadCart();
  updateCartUI();

  // Cart toggle
  if (cartIcon) {
    cartIcon.addEventListener('click', (e) => {
      e.preventDefault();
      openCart();
    });
  }

  if (closeCart) {
    closeCart.addEventListener('click', closeCartSidebar);
  }

  if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCartSidebar);
  }

  if (startShopping) {
    startShopping.addEventListener('click', closeCartSidebar);
  }

  // Product Filtering
  if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        const filter = button.dataset.filter;
        
        // Filter products
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
          if (filter === 'all') {
            card.style.display = 'block';
          } else {
            if (card.dataset.category.includes(filter)) {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          }
        });
      });
    });
  }

  // Add to cart functionality
  if (addToCartButtons.length > 0) {
    addToCartButtons.forEach(button => {
      button.addEventListener('click', addToCart);
    });
  }

  // Favorite button toggle
  if (favoriteButtons.length > 0) {
    favoriteButtons.forEach(button => {
      button.addEventListener('click', toggleFavorite);
    });
  }

  // Checkout button
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length > 0) {
        alert('Thank you for your purchase! This would normally redirect to checkout.');
        cart = [];
        saveCart();
        updateCartUI();
        closeCartSidebar();
      } else {
        alert('Your cart is empty! Add some items before checkout.');
      }
    });
  }

  // Load more products (simulated)
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      loadMoreBtn.textContent = 'Loading...';
      setTimeout(() => {
        loadMoreBtn.textContent = 'Load More';
        showToast('No more products to load!');
      }, 1500);
    });
  }

  // Newsletter form submission
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      if (emailInput.value.trim() !== '') {
        showToast('Thanks for subscribing!');
        emailInput.value = '';
      } else {
        showToast('Please enter a valid email address');
      }
    });
  }
});

// Functions
function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCartSidebar() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

function addToCart(e) {
  const button = e.currentTarget;
  const id = button.dataset.id;
  const name = button.dataset.name;
  const price = parseFloat(button.dataset.price);
  const originalPrice = button.dataset.originalPrice ? parseFloat(button.dataset.originalPrice) : null;
  
  // Check if product already in cart
  const existingItem = cart.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    const newItem = {
      id, 
      name, 
      price, 
      originalPrice,
      quantity: 1,
      image: button.closest('.product-card').querySelector('.product-img img').src
    };
    cart.push(newItem);
  }
  
  saveCart();
  updateCartUI();
  showToast(`${name} added to cart!`);
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCartUI();
  showToast('Item removed from cart');
}

function updateQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  
  if (item) {
    item.quantity += change;
    
    if (item.quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    saveCart();
    updateCartUI();
  }
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
}

function updateCartUI() {
  // Update cart count
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = totalItems;
  
  // Show/hide empty cart message
  if (cart.length === 0) {
    emptyCartMessage.style.display = 'flex';
    totalAmount.textContent = '$0.00';
  } else {
    emptyCartMessage.style.display = 'none';
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalAmount.textContent = `$${total.toFixed(2)}`;
    
    // Render cart items
    renderCartItems();
  }
}

function renderCartItems() {
  // Clear current items except empty message
  const currentItems = cartItemsContainer.querySelectorAll('.cart-item');
  currentItems.forEach(item => item.remove());
  
  // Add cart items
  cart.forEach(item => {
    const cartItemHtml = `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.name}</h4>
          <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
          <div class="cart-item-actions">
            <button class="quantity-btn decrease" data-id="${item.id}">-</button>
            <span class="cart-item-quantity">${item.quantity}</span>
            <button class="quantity-btn increase" data-id="${item.id}">+</button>
            <button class="remove-item" data-id="${item.id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Append before empty cart message
    emptyCartMessage.insertAdjacentHTML('beforebegin', cartItemHtml);
  });
  
  // Add event listeners to new buttons
  const decreaseButtons = cartItemsContainer.querySelectorAll('.decrease');
  const increaseButtons = cartItemsContainer.querySelectorAll('.increase');
  const removeButtons = cartItemsContainer.querySelectorAll('.remove-item');
  
  decreaseButtons.forEach(button => {
    button.addEventListener('click', () => updateQuantity(button.dataset.id, -1));
  });
  
  increaseButtons.forEach(button => {
    button.addEventListener('click', () => updateQuantity(button.dataset.id, 1));
  });
  
  removeButtons.forEach(button => {
    button.addEventListener('click', () => removeFromCart(button.dataset.id));
  });
}

function toggleFavorite(e) {
  const button = e.currentTarget;
  button.classList.toggle('active');
  
  // Toggle fill
  const svg = button.querySelector('svg path');
  
  if (button.classList.contains('active')) {
    svg.setAttribute('fill', '#FF4D6A');
    showToast('Added to favorites!');
  } else {
    svg.setAttribute('fill', 'none');
    showToast('Removed from favorites!');
  }
}

function showToast(message) {
  const toastMessage = document.querySelector('.toast-message');
  toastMessage.textContent = message;
  
  toast.classList.add('show');
  
  // Hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
