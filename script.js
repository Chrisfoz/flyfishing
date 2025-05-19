// script.js

// Mobile Menu Toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const desktopNav = document.getElementById('desktop-nav');

if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        // Optional: change icon on toggle
        const icon = mobileMenuButton.querySelector('i');
        if (mobileMenu.classList.contains('hidden')) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
            mobileMenuButton.setAttribute('aria-label', 'Open navigation menu');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
        } else {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
            mobileMenuButton.setAttribute('aria-label', 'Close navigation menu');
            mobileMenuButton.setAttribute('aria-expanded', 'true');
        }
    });
}

// Active Nav Link Highlighting on Scroll & Click
const sections = document.querySelectorAll('section[id]');
const navLinksDesktop = desktopNav ? desktopNav.querySelectorAll('a.nav-link-custom') : [];
const navLinksMobile = mobileMenu ? mobileMenu.querySelectorAll('a.mobile-nav-link') : [];

function changeNavActiveState() {
    let currentSectionId = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        // Adjust for sticky header height if necessary, e.g., - header.offsetHeight
        if (pageYOffset >= sectionTop - sectionHeight / 3) { 
            currentSectionId = section.getAttribute('id');
        }
    });

    navLinksDesktop.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active');
        }
    });
    navLinksMobile.forEach(link => {
        link.classList.remove('active'); // Or a different class for mobile active state
        if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', changeNavActiveState);
document.addEventListener('DOMContentLoaded', () => { // Wrap more logic in DOMContentLoaded
    changeNavActiveState(); // Initial check

    const signupForm = document.getElementById('signupForm'); // Initialize earlier
    const formMessage = document.getElementById('formMessage'); // Initialize earlier

    // Define displayMessage within DOMContentLoaded scope, accessible by later code
    function displayMessage(message, type) {
        if (formMessage) { // Check if formMessage element exists
           formMessage.textContent = message;
           formMessage.className = `form-message ${type}`; // Applies 'success' or 'error' class
        } else {
            console.warn('formMessage element not found on this page. Cannot display message:', message);
        }
    }

    const SUPABASE_URL = 'https://feelvtntqnxlkwfzjyfd.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZWx2dG50cW54bGt3ZnpqeWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDUxMTYsImV4cCI6MjA2MzIyMTExNn0.kS8Lar654dnkNfCl-YqzqU5gWVf-p-o7PmaoVd2WK_w';
    let supabase;

    function initializeSupabase() {
        try {
            if (typeof supabaseJs !== 'undefined') {
                supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('Supabase client initialized.');
                // Setup signup form listener only if Supabase initialized successfully
                setupSignupForm();
            } else {
                console.error('Supabase JS library (supabaseJs) not found after polling. Ensure it is loaded before script.js');
                if (signupForm) signupForm.style.display = 'none';
                displayMessage('Newsletter signup is temporarily unavailable.', 'error');
            }
        } catch (e) {
            console.error('Error initializing Supabase client:', e);
            if (signupForm) signupForm.style.display = 'none';
            displayMessage('Newsletter signup is temporarily unavailable due to an error.', 'error');
        }
    }

    function waitForSupabase(callback, maxRetries = 10, delay = 200) {
        let retries = 0;
        function check() {
            if (typeof supabaseJs !== 'undefined') {
                callback();
            } else if (retries < maxRetries) {
                retries++;
                setTimeout(check, delay);
            } else {
                console.error('Supabase JS library (supabaseJs) did not load after multiple retries.');
                // Call the callback anyway, it will handle the undefined supabaseJs
                callback();
            }
        }
        check();
    }

    waitForSupabase(initializeSupabase);

    // The problematic duplicated displayMessage function that was here has been removed.
    // The first instance of displayMessage (defined above) is the correct one.

    function setupSignupForm() {
        if (signupForm && supabase) { // Ensure both form and supabase client exist
            signupForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const name = signupForm.name.value.trim();
            const email = signupForm.email.value.trim();

            if (!name || !email) {
                displayMessage('Please enter both name and email.', 'error');
                return;
            }

            // Clear previous messages
            if (formMessage) { // Ensure formMessage exists before manipulating
                formMessage.innerHTML = '';
                formMessage.className = 'form-message';
            }

            try {
                const { data, error } = await supabase
                    .from('user_details') // Table name
                    .insert([{ name: name, email: email, created_at: new Date() }]);

                if (error) {
                    console.error('Supabase error:', error);
                    displayMessage(`Error: ${error.message}`, 'error');
                } else {
                    displayMessage('Thank you for subscribing!', 'success');
                    signupForm.reset(); // Clear the form
                }
            } catch (error) {
                console.error('Submission error:', error);
                displayMessage('An unexpected error occurred. Please try again.', 'error');
            }
        });
    } // End of if (signupForm && supabase) in setupSignupForm
} // End of setupSignupForm()

// Smooth scrolling for ALL navigation links (desktop and mobile)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        // Check if the link is for the current page or another page (shop.html)
        if (targetId.startsWith('#') && window.location.pathname.includes('flyfihing.html') || 
            (targetId.startsWith('shop.html#') && window.location.pathname.includes('shop.html'))) {
            const actualId = targetId.includes('#') ? targetId.substring(targetId.indexOf('#')) : targetId;
            const targetElement = document.querySelector(actualId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        } else if (!targetId.startsWith('#') && targetId.includes('.html')) { // It's a link to another page
             window.location.href = targetId;
        } else if (targetId.startsWith('#') && !window.location.pathname.endsWith(targetId.split('#')[0]) && targetId.includes('.html#')) {
            // This case handles navigating to an ID on another page, e.g. from shop.html to flyfishing.html#contact
            window.location.href = targetId;
        }


        // Close mobile menu on link click
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
            const icon = mobileMenuButton.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
            mobileMenuButton.setAttribute('aria-label', 'Open navigation menu');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
        }
    });
});

    // Cart functionality will be initialized within the same primary DOMContentLoaded
    const cart = loadCart();

    // Update cart count on all pages
    updateCartCount(cart);
    updateMobileCartCount(cart);


    // Elements specific to shop.html
    const productGrid = document.getElementById('product-grid');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPriceEl = document.getElementById('cart-total-price');
    const cartEmptyMsg = document.getElementById('cart-empty-msg');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartSection = document.getElementById('cart');
    const cartLinks = document.querySelectorAll('a[href="#cart"], a[href="shop.html#cart"]');


    if (productGrid) { // Only run if on shop.html or a page with products
        productGrid.addEventListener('click', (event) => {
            if (event.target.closest('.add-to-cart-btn')) {
                const button = event.target.closest('.add-to-cart-btn');
                const id = button.dataset.id;
                const name = button.dataset.name;
                const price = parseFloat(button.dataset.price);
                const image = button.dataset.image;
                addToCart(id, name, price, image, cart);
            }
        });
    }

    if (cartItemsContainer) { // Only run if on shop.html (where the cart details are)
        updateCartDisplay(cart);

        cartItemsContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-from-cart-btn')) {
                const productId = event.target.dataset.id;
                removeFromCart(productId, cart);
            } else if (event.target.classList.contains('quantity-change')) {
                const productId = event.target.dataset.id;
                const newQuantity = parseInt(event.target.value);
                updateQuantity(productId, newQuantity, cart);
            }
        });
    }
    
    cartLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetHref = link.getAttribute('href');

            if (targetHref === '#cart' && window.location.pathname.includes('shop.html')) {
                // On shop.html, clicking a #cart link
                if (cartSection) {
                    cartSection.classList.toggle('hidden');
                    if (!cartSection.classList.contains('hidden')) {
                        cartSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            } else if (targetHref === 'shop.html#cart') {
                // Link explicitly to shop.html#cart
                window.location.href = targetHref;
            } else if (targetHref === '#cart' && !window.location.pathname.includes('shop.html')) {
                 // On a page other than shop.html, clicking a generic #cart link
                window.location.href = 'shop.html#cart';
            }
        });
    });
    
    // If URL has #cart, show cart section on shop.html when page loads
    if (window.location.pathname.includes('shop.html') && window.location.hash === '#cart' && cartSection) {
        cartSection.classList.remove('hidden');
        // Optional: scroll to it, but might be jarring on initial load if not already there.
        // cartSection.scrollIntoView({ behavior: 'smooth' }); 
    }


    function addToCart(id, name, price, image, currentCart) {
        const existingItem = currentCart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            currentCart.push({ id, name, price, image, quantity: 1 });
        }
        saveCart(currentCart);
        updateCartDisplay(currentCart);
        updateCartCount(currentCart);
        updateMobileCartCount(currentCart);
        showNotification(`${name} added to cart!`);
    }

    function removeFromCart(id, currentCart) {
        const itemIndex = currentCart.findIndex(item => item.id === id);
        if (itemIndex > -1) {
            const itemName = currentCart[itemIndex].name;
            currentCart.splice(itemIndex, 1);
            saveCart(currentCart);
            updateCartDisplay(currentCart);
            updateCartCount(currentCart);
            updateMobileCartCount(currentCart);
            showNotification(`${itemName} removed from cart.`);
        }
    }

    function updateQuantity(id, quantity, currentCart) {
        const item = currentCart.find(item => item.id === id);
        if (item) {
            if (quantity <= 0) {
                removeFromCart(id, currentCart);
            } else {
                item.quantity = quantity;
                saveCart(currentCart);
                updateCartDisplay(currentCart);
                updateCartCount(currentCart);
                updateMobileCartCount(currentCart);
            }
        }
    }

    function loadCart() {
        const cartJson = localStorage.getItem('adventureFlyFishingCart');
        return cartJson ? JSON.parse(cartJson) : [];
    }

    function saveCart(currentCart) {
        localStorage.setItem('adventureFlyFishingCart', JSON.stringify(currentCart));
    }

    function updateCartCount(currentCart) {
        const cartCountEl = document.getElementById('cart-count'); 
        const cartCountMainEl = document.getElementById('cart-count-main'); 
        
        const totalItems = currentCart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountEl) cartCountEl.textContent = totalItems;
        if (cartCountMainEl) cartCountMainEl.textContent = totalItems;
    }
    
    function updateMobileCartCount(currentCart) {
        const mobileCartCountEl = document.getElementById('mobile-cart-count'); 
        const mobileCartCountMainEl = document.getElementById('mobile-cart-count-main'); 
        const totalItems = currentCart.reduce((sum, item) => sum + item.quantity, 0);
        if (mobileCartCountEl) mobileCartCountEl.textContent = totalItems;
        if (mobileCartCountMainEl) mobileCartCountMainEl.textContent = totalItems;
    }


    function updateCartDisplay(currentCart) {
        if (!cartItemsContainer || !cartTotalPriceEl || !cartEmptyMsg || !checkoutBtn) return;

        cartItemsContainer.innerHTML = ''; 
        let totalPrice = 0;

        if (currentCart.length === 0) {
            cartEmptyMsg.classList.remove('hidden');
            checkoutBtn.disabled = true;
            checkoutBtn.classList.add('disabled:opacity-50');
        } else {
            cartEmptyMsg.classList.add('hidden');
            checkoutBtn.disabled = false;
            checkoutBtn.classList.remove('disabled:opacity-50');

            currentCart.forEach(item => {
                totalPrice += item.price * item.quantity;
                const itemElement = document.createElement('div');
                itemElement.className = 'flex justify-between items-center border-b border-gray-200 py-4';
                itemElement.innerHTML = `
                    <div class="flex items-center">
                        <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded mr-4">
                        <div>
                            <h4 class="font-semibold text-md">${item.name}</h4>
                            <p class="text-sm text-gray-600">$${item.price.toFixed(2)}</p>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <input type="number" value="${item.quantity}" min="1" class="quantity-change w-16 text-center border border-gray-300 rounded-md p-1 mr-3" data-id="${item.id}">
                        <button class="remove-from-cart-btn text-red-500 hover:text-red-700" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
        }
        cartTotalPriceEl.textContent = `$${totalPrice.toFixed(2)}`;
    }
    
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-5 right-5 bg-brand-blue text-white py-3 px-6 rounded-lg shadow-lg transition-opacity duration-300';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                showNotification('Proceeding to checkout (simulation)!');
            } else {
                showNotification('Your cart is empty.');
            }
        });
    }
});
