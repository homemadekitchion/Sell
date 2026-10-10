// ==========================================================================
// 1. CONFIGURATION (Google Sheet Webhook URL)
// ==========================================================================
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzOfFRYi8QQiexm4od54EpVLZeIjf4JnlSyMe4O7UfIM0UyyMAOTdjbpstURYMREtbpkQ/exec";

// Global State
let allProducts = [];
let allCollections = [];
let currentCategory = "All";
let itemsToShow = 10;
let searchQuery = "";
let selectedProduct = null;
let selectedCollection = null;
let chosenSize = null;
let chosenColor = null;

// Cart System (localStorage)
let cart = JSON.parse(localStorage.getItem("pak_store_cart")) || [];

// ==========================================================================
// 2. DATA INITIALIZATION
// ==========================================================================
const cacheTime = new Date().getTime();

// 1. Main Products Fetch
fetch(`./data.json?v=${cacheTime}`, { cache: 'no-store' })
    .then(res => res.json())
    .then(data => {
        allProducts = data.products || [];

        const loadingEl = document.getElementById("loadingMsg");
        if (loadingEl) loadingEl.style.display = "none";

        updateCartBadge();

        if (document.getElementById("product-container")) {
            displayCategories(data.categories || ["All"]);
            displayProducts();
            if (data.banners && data.banners.length > 0) {
                startBannerSlider(data.banners);
            }
        }

        if (document.getElementById("mainProductImage")) {
            loadProductDetails();
        }

        if (document.getElementById("cartViewContainer")) {
            renderCartPage();
        }
    })
    .catch(err => console.error("Error loading data.json:", err));

// 2. Collections JSON Fetch
fetch(`./collections.json?v=${cacheTime}`, { cache: 'no-store' })
    .then(res => res.json())
    .then(data => {
        allCollections = data.collections || [];

        if (document.getElementById("showcaseContainer")) {
            renderHomeShowcase(data);
        }

        if (document.getElementById("fullCollectionsGrid")) {
            renderFullCollectionsPage(data);
        }

        if (document.getElementById("mainCollectionImage")) {
            loadCollectionDetails();
        }
    })
    .catch(err => console.error("Error loading collections.json:", err));

function updateCartBadge() {
    const badge = document.getElementById("cartCount");
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.innerText = totalItems;
    }
}

// ==========================================================================
// 3. HOME PAGE SHOWCASE RENDER
// ==========================================================================
function renderHomeShowcase(data) {
    const container = document.getElementById("showcaseContainer");
    if (!container) return;

    if (data.badge) {
        const badgeEl = document.getElementById("showcaseBadge");
        if (badgeEl) badgeEl.innerText = data.badge;
    }
    if (data.heading) {
        const headEl = document.getElementById("showcaseHeading");
        if (headEl) headEl.innerText = data.heading;
    }

    container.innerHTML = "";

    data.collections.forEach((item, index) => {
        const isReverse = index % 2 !== 0;
        const row = document.createElement("div");
        row.className = `showcase-row ${isReverse ? 'reverse' : ''}`;

        const mrpHtml = item.mrp ? `<span class="showcase-mrp">Rs. ${item.mrp}</span>` : "";
        const discHtml = item.discount ? `<span class="showcase-disc">${item.discount}</span>` : "";

        row.innerHTML = `
            <div class="showcase-img-card" onclick="window.location.href='collection-detail.html?id=${item.id}'" style="cursor: pointer;">
                <img src="${(item.images && item.images.length > 0) ? item.images[0] : item.image}" alt="${item.title}" onerror="this.onerror=null;this.src='https://via.placeholder.com/350?text=Collection';">
            </div>
            <div class="showcase-text-box">
                <h3 class="showcase-item-title" onclick="window.location.href='collection-detail.html?id=${item.id}'" style="cursor: pointer;">${item.title}</h3>
                <p class="showcase-item-desc">${item.description}</p>
                <div class="showcase-price-box">
                    <span class="showcase-price">Rs. ${item.price}</span>
                    ${mrpHtml}
                    ${discHtml}
                </div>
                <div class="showcase-actions">
                    <button class="col-buy-btn" onclick="window.location.href='collection-detail.html?id=${item.id}'">View & Select Options</button>
                    <button class="col-cart-btn" onclick="quickAddCollection(${item.id})">Quick Add</button>
                </div>
            </div>
        `;
        container.appendChild(row);
    });
}

// ==========================================================================
// 4. COLLECTION PAGE: FULL GRID (collection.html)
// ==========================================================================
function renderFullCollectionsPage(data) {
    const grid = document.getElementById("fullCollectionsGrid");
    if (!grid) return;

    if (data.badge) {
        const b = document.getElementById("pageBadge");
        if (b) b.innerText = data.badge;
    }
    if (data.heading) {
        const h = document.getElementById("pageHeading");
        if (h) h.innerText = data.heading;
    }

    grid.innerHTML = "";

    data.collections.forEach(item => {
        const card = document.createElement("div");
        card.className = "collection-card";

        const mrpHtml = item.mrp ? `<span class="card-mrp">Rs. ${item.mrp}</span>` : "";
        const discHtml = item.discount ? `<span class="card-disc">${item.discount}</span>` : "";
        const firstImg = (item.images && item.images.length > 0) ? item.images[0] : item.image;

        card.innerHTML = `
            <div class="collection-img-box" onclick="window.location.href='collection-detail.html?id=${item.id}'" style="cursor: pointer;">
                <img src="${firstImg}" alt="${item.title}" onerror="this.onerror=null;this.src='https://via.placeholder.com/400?text=Collection';">
            </div>
            <div class="collection-body">
                <div>
                    <div class="collection-tag">${item.category || "Collection"}</div>
                    <h2 class="collection-name" onclick="window.location.href='collection-detail.html?id=${item.id}'" style="cursor: pointer;">${item.title}</h2>
                    <p class="collection-text">${item.description}</p>
                    <div class="card-price-row">
                        <span class="card-price">Rs. ${item.price}</span>
                        ${mrpHtml}
                        ${discHtml}
                    </div>
                </div>
                <div class="card-action-row">
                    <button class="card-buy-btn" onclick="window.location.href='collection-detail.html?id=${item.id}'">Select Size / Color</button>
                    <button class="card-cart-btn" onclick="quickAddCollection(${item.id})">Add to Cart</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ==========================================================================
// 5. COLLECTION DETAILS PAGE LOGIC (collection-detail.html)
// ==========================================================================
let colImages = [];
let colSlideIndex = 0;
let colSlideInterval = null;

function loadCollectionDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const colId = parseInt(urlParams.get("id"));

    selectedCollection = allCollections.find(c => c.id === colId);

    if (!selectedCollection) {
        const titleEl = document.getElementById("colTitle");
        if (titleEl) titleEl.innerText = "Collection Not Found!";
        return;
    }

    document.getElementById("colTitle").innerText = selectedCollection.title;
    document.getElementById("colSku").innerText = "SKU: " + (selectedCollection.sku || "N/A");
    document.getElementById("colPrice").innerText = "Rs. " + selectedCollection.price;

    const bCat = document.getElementById("colBreadCategory");
    if (bCat) bCat.innerText = selectedCollection.category || "Collection";
    const bName = document.getElementById("colBreadName");
    if (bName) bName.innerText = selectedCollection.title;
    const catBadge = document.getElementById("colCatBadge");
    if (catBadge) catBadge.innerText = selectedCollection.category || "Featured";

    if (selectedCollection.discount) {
        const badge = document.getElementById("colDiscount");
        if (badge) { badge.innerText = selectedCollection.discount; badge.style.display = "inline-block"; }
        const mrp = document.getElementById("colMrp");
        if (mrp) mrp.innerText = "MRP: Rs. " + selectedCollection.mrp;
        const disc = document.getElementById("colDiscText");
        if (disc) disc.innerText = "(" + selectedCollection.discount + ")";
    }

    // Sizes Rendering
    const sizeSection = document.getElementById("colSizeSection");
    const sizeContainer = document.getElementById("colSizeContainer");
    if (selectedCollection.sizes && selectedCollection.sizes.length > 0) {
        sizeSection.style.display = "block";
        sizeContainer.innerHTML = "";
        selectedCollection.sizes.forEach(size => {
            const btn = document.createElement("button");
            btn.className = "option-btn";
            btn.innerText = size;
            btn.onclick = () => selectColOption(btn, "size", size);
            sizeContainer.appendChild(btn);
        });
    } else if (sizeSection) {
        sizeSection.style.display = "none";
    }

    // Colors Rendering
    const colorSection = document.getElementById("colColorSection");
    const colorContainer = document.getElementById("colColorContainer");
    if (selectedCollection.colors && selectedCollection.colors.length > 0) {
        colorSection.style.display = "block";
        colorContainer.innerHTML = "";
        selectedCollection.colors.forEach(col => {
            const btn = document.createElement("button");
            btn.className = "option-btn color-btn";
            btn.innerText = col;
            btn.onclick = () => selectColOption(btn, "color", col);
            colorContainer.appendChild(btn);
        });
    } else if (colorSection) {
        colorSection.style.display = "none";
    }

    // Accordions
    if (selectedCollection.details) {
        document.getElementById("colAccDetails").innerText = selectedCollection.details.productDetails || selectedCollection.description;
        document.getElementById("colAccCare").innerText = selectedCollection.details.careInstruction || "Standard care.";
        document.getElementById("colAccReturn").innerText = selectedCollection.details.returnPolicy || "15 days replacement warranty.";
    }

    // Multi-Image Slider
    colImages = selectedCollection.images && selectedCollection.images.length > 0
        ? selectedCollection.images
        : [selectedCollection.image || "https://via.placeholder.com/500?text=Collection"];

    showColSlide(0);

    if (colImages.length > 1) {
        colSlideInterval = setInterval(() => changeColSlide(1), 5000);
    }
}

function selectColOption(button, type, value) {
    const siblings = button.parentElement.getElementsByClassName("option-btn");
    for (let s of siblings) s.classList.remove("active");
    button.classList.add("active");

    if (type === "size") chosenSize = value;
    if (type === "color") chosenColor = value;
}

function changeColSlide(direction) {
    colSlideIndex += direction;
    if (colSlideIndex >= colImages.length) colSlideIndex = 0;
    if (colSlideIndex < 0) colSlideIndex = colImages.length - 1;
    showColSlide(colSlideIndex);

    if (colSlideInterval) {
        clearInterval(colSlideInterval);
        colSlideInterval = setInterval(() => changeColSlide(1), 5000);
    }
}

function showColSlide(index) {
    const img = document.getElementById("mainCollectionImage");
    if (img) img.src = colImages[index];
}

// Add to Cart from collection-detail.html
function addCollectionFromDetails(redirectToCart = false) {
    if (selectedCollection.sizes && selectedCollection.sizes.length > 0 && !chosenSize) {
        alert("Please Select a Size First!");
        return;
    }
    if (selectedCollection.colors && selectedCollection.colors.length > 0 && !chosenColor) {
        alert("Please Select a Color First!");
        return;
    }

    const cartItemId = `col_${selectedCollection.id}_${chosenSize || ''}_${chosenColor || ''}`;
    const existingIndex = cart.findIndex(i => i.id === cartItemId);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: cartItemId,
            name: selectedCollection.title + " (Curated Collection)",
            price: selectedCollection.price,
            image: (selectedCollection.images && selectedCollection.images.length > 0) ? selectedCollection.images[0] : (selectedCollection.image || "images/placeholder.jpg"),
            size: chosenSize || null,
            color: chosenColor || null,
            quantity: 1
        });
    }

    localStorage.setItem("pak_store_cart", JSON.stringify(cart));
    updateCartBadge();

    if (redirectToCart) {
        window.location.href = "cart.html";
    } else {
        alert(`"${selectedCollection.title}" added to cart!`);
    }
}

function quickAddCollection(colId) {
    const item = allCollections.find(c => c.id === colId);
    if (!item) return;

    // If it has sizes or colors, take user to detail page first so they can choose
    if ((item.sizes && item.sizes.length > 0) || (item.colors && item.colors.length > 0)) {
        window.location.href = `collection-detail.html?id=${item.id}`;
        return;
    }

    cart.push({
        id: `col_${item.id}`,
        name: item.title,
        price: item.price,
        image: (item.images && item.images.length > 0) ? item.images[0] : (item.image || "images/placeholder.jpg"),
        size: null,
        color: null,
        quantity: 1
    });

    localStorage.setItem("pak_store_cart", JSON.stringify(cart));
    updateCartBadge();
    alert(`"${item.title}" added to cart!`);
}

// ==========================================================================
// 6. HOME PAGE: SEARCH, CATEGORIES & PRODUCTS
// ==========================================================================
function handleSearch() {
    const input = document.getElementById("searchInput");
    searchQuery = input.value.trim().toLowerCase();
    itemsToShow = 10;

    const showcaseWrapper = document.getElementById("showcaseWrapper");
    if (showcaseWrapper) {
        showcaseWrapper.style.display = searchQuery === "" ? "block" : "none";
    }

    displayProducts();
}

function clearSearch() {
    const input = document.getElementById("searchInput");
    if (input) input.value = "";
    searchQuery = "";
    currentCategory = "All";

    const showcaseWrapper = document.getElementById("showcaseWrapper");
    if (showcaseWrapper) showcaseWrapper.style.display = "block";

    document.querySelectorAll(".cat-btn").forEach(b => {
        b.classList.toggle("active", b.innerText === "All");
    });
    displayProducts();
}

function startBannerSlider(bannerImages) {
    let bannerIndex = 0;
    const bannerImg = document.getElementById("bannerImage");
    if (!bannerImg || bannerImages.length === 0) return;

    bannerImg.src = bannerImages[0];
    if (bannerImages.length > 1) {
        setInterval(() => {
            bannerIndex = (bannerIndex + 1) % bannerImages.length;
            bannerImg.src = bannerImages[bannerIndex];
        }, 4000);
    }
}

function displayCategories(categories) {
    const catContainer = document.getElementById("category-container");
    if (!catContainer) return;
    catContainer.innerHTML = "";

    categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.innerText = cat;
        btn.className = "cat-btn" + (cat === "All" ? " active" : "");
        btn.onclick = () => {
            document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentCategory = cat;
            searchQuery = "";
            const searchInput = document.getElementById("searchInput");
            if (searchInput) searchInput.value = "";
            itemsToShow = 10;
            displayProducts();
        };
        catContainer.appendChild(btn);
    });
}

function displayProducts() {
    const container = document.getElementById("product-container");
    if (!container) return;
    container.innerHTML = "";

    let filtered = currentCategory !== "All"
        ? allProducts.filter(p => p.category === currentCategory)
        : allProducts;

    if (searchQuery !== "") {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchQuery) ||
            p.category.toLowerCase().includes(searchQuery)
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="no-results-box">
                <span>🔍</span>
                <h3>Koi Product Nahi Mila!</h3>
                <p>Aapne "<strong>${searchQuery}</strong>" search kiya jo hamare paas mojood nahi hai.</p>
                <button onclick="clearSearch()">Tamam Products Dekhein</button>
            </div>
        `;
        const loadMoreBtn = document.getElementById("loadMoreBtn");
        if (loadMoreBtn) loadMoreBtn.style.display = "none";
        return;
    }

    const visible = filtered.slice(0, itemsToShow);

    visible.forEach(prod => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.onclick = () => window.location.href = `product.html?id=${prod.id}`;

        const badgeHtml = prod.discount ? `<div class="badge">${prod.discount}</div>` : "";
        const mrpHtml = prod.mrp ? `<span class="mrp">Rs. ${prod.mrp}</span><span class="discount-text">${prod.discount || ""}</span>` : "";

        let colorsHtml = "";
        if (prod.colors && prod.colors.length > 0) {
            colorsHtml = `<div class="colors-count"><span class="color-dot"></span><span class="color-dot"></span> ${prod.colors.length} colors</div>`;
        }

        const firstImage = (prod.images && prod.images.length > 0) ? prod.images[0] : "images/placeholder.jpg";

        card.innerHTML = `
            <div class="product-img-box">
                ${badgeHtml}
                <img src="${firstImage}" alt="${prod.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/300?text=Product';">
            </div>
            <div class="product-info">
                <h3>${prod.name}</h3>
                <div class="price-box">Rs. ${prod.price} ${mrpHtml}</div>
                ${colorsHtml}
            </div>
        `;
        container.appendChild(card);
    });

    const loadMoreBtn = document.getElementById("loadMoreBtn");
    if (loadMoreBtn) {
        loadMoreBtn.style.display = filtered.length > itemsToShow ? "inline-block" : "none";
    }
}

function loadMore() {
    itemsToShow += 10;
    displayProducts();
}

// ==========================================================================
// 7. CART PAGE (cart.html)
// ==========================================================================
function renderCartPage() {
    const container = document.getElementById("cartViewContainer");
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart-state">
                <span>🛒</span>
                <h2>Aapka Cart Khali Hai!</h2>
                <p>Aapne abhi tak koi item cart mein add nahi kiya.</p>
                <a href="index.html" class="shop-now-btn">Start Shopping Now</a>
            </div>
        `;
        return;
    }

    let subtotal = 0;
    let itemsHtml = cart.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        let specs = [];
        if (item.size) specs.push("Size: " + item.size);
        if (item.color) specs.push("Color: " + item.color);
        const specsText = specs.length > 0 ? specs.join(" | ") : "Standard";

        return `
            <div class="cart-row">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-row-info">
                    <div class="cart-row-title">${item.name}</div>
                    <div class="cart-row-specs">${specsText}</div>
                    <div class="cart-row-price">Rs. ${item.price} each</div>
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                        <span class="qty-text">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 800; font-size: 14px; margin-bottom: 5px;">Rs. ${itemTotal.toLocaleString()}</div>
                    <button class="remove-btn" onclick="removeCartItem(${index})" title="Delete">&times;</button>
                </div>
            </div>
        `;
    }).join("");

    const deliveryFee = 200;
    const finalTotal = subtotal + deliveryFee;

    container.innerHTML = `
        <div class="cart-grid">
            <div class="cart-items-card">
                <h2>Cart Items (${cart.length})</h2>
                ${itemsHtml}
            </div>

            <div class="checkout-summary-card">
                <h2>Order Summary</h2>
                <div class="bill-row">
                    <span>Subtotal:</span>
                    <span>Rs. ${subtotal.toLocaleString()}</span>
                </div>
                <div class="bill-row">
                    <span>Delivery Charges:</span>
                    <span>Rs. ${deliveryFee}</span>
                </div>
                <div class="bill-row total">
                    <span>Total (COD):</span>
                    <span>Rs. ${finalTotal.toLocaleString()}</span>
                </div>

                <div class="cod-form">
                    <h3 style="margin: 15px 0 8px 0; font-size: 15px;">Delivery Details:</h3>
                    <input type="text" id="custName" placeholder="Full Name" required>
                    <input type="text" id="custPhone" placeholder="Mobile Number (03XXXXXXXXX)" required>
                    <textarea id="custAddress" rows="3" placeholder="Complete Street Delivery Address" required></textarea>
                    <button class="confirm-order-btn" id="orderSubmitBtn" onclick="submitFinalOrder(${finalTotal})">Confirm Order (Cash on Delivery)</button>
                </div>
            </div>
        </div>
    `;
}

function updateQty(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    localStorage.setItem("pak_store_cart", JSON.stringify(cart));
    updateCartBadge();
    renderCartPage();
}

function removeCartItem(index) {
    cart.splice(index, 1);
    localStorage.setItem("pak_store_cart", JSON.stringify(cart));
    updateCartBadge();
    renderCartPage();
}

function submitFinalOrder(totalAmount) {
    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const address = document.getElementById("custAddress").value.trim();

    if (!name || !phone || !address) {
        alert("Please enter full delivery details!");
        return;
    }

    const submitBtn = document.getElementById("orderSubmitBtn");
    submitBtn.innerText = "Order Bheja Ja Raha Hai...";
    submitBtn.disabled = true;

    let orderItemsSummary = cart.map((item, idx) => {
        let details = [];
        if (item.size) details.push(`Size: ${item.size}`);
        if (item.color) details.push(`Color: ${item.color}`);
        details.push(`Qty: ${item.quantity}`);
        details.push(`Price: Rs. ${item.price * item.quantity}`);
        return `${idx + 1}) ${item.name} [${details.join(", ")}]`;
    }).join(" | ");

    const orderData = {
        formType: "order",
        product: orderItemsSummary,
        price: totalAmount,
        name: name,
        phone: phone,
        address: address
    };

    fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(orderData),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
    })
    .then(() => {
        alert(`Shukriya ${name}! Aapka Cash on Delivery order confirm ho gaya hai.\nTotal Bill: Rs. ${totalAmount.toLocaleString()}`);
        cart = [];
        localStorage.removeItem("pak_store_cart");
        updateCartBadge();
        window.location.href = "index.html";
    })
    .catch((err) => {
        console.error(err);
        alert("Order submitted successfully!");
        cart = [];
        localStorage.removeItem("pak_store_cart");
        updateCartBadge();
        window.location.href = "index.html";
    });
}

// ==========================================================================
// 8. PRODUCT DETAILS PAGE (product.html)
// ==========================================================================
let productImages = [];
let currentSlideIndex = 0;
let autoSlideInterval = null;

function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get("id"));

    selectedProduct = allProducts.find(p => p.id === productId);

    if (!selectedProduct) {
        const titleEl = document.getElementById("prodTitle");
        if (titleEl) titleEl.innerText = "Product Not Found!";
        return;
    }

    document.getElementById("prodTitle").innerText = selectedProduct.name;
    document.getElementById("prodSku").innerText = "SKU: " + (selectedProduct.sku || "N/A");
    document.getElementById("prodPrice").innerText = "Rs. " + selectedProduct.price;

    const bCat = document.getElementById("breadCategory");
    if (bCat) bCat.innerText = selectedProduct.category;
    const bName = document.getElementById("breadName");
    if (bName) bName.innerText = selectedProduct.name;

    if (selectedProduct.discount) {
        const badge = document.getElementById("prodDiscount");
        if (badge) { badge.innerText = selectedProduct.discount; badge.style.display = "inline-block"; }
        const mrp = document.getElementById("prodMrp");
        if (mrp) mrp.innerText = "MRP: Rs. " + selectedProduct.mrp;
        const disc = document.getElementById("prodDiscText");
        if (disc) disc.innerText = "(" + selectedProduct.discount + ")";
    }

    // Sizes
    const sizeSection = document.getElementById("sizeSection");
    const sizeContainer = document.getElementById("sizeContainer");
    if (selectedProduct.sizes && selectedProduct.sizes.length > 0) {
        sizeSection.style.display = "block";
        sizeContainer.innerHTML = "";
        selectedProduct.sizes.forEach(size => {
            const btn = document.createElement("button");
            btn.className = "option-btn";
            btn.innerText = size;
            btn.onclick = () => selectOption(btn, "size", size);
            sizeContainer.appendChild(btn);
        });
    } else if (sizeSection) {
        sizeSection.style.display = "none";
    }

    // Colors
    const colorSection = document.getElementById("colorSection");
    const colorContainer = document.getElementById("colorContainer");
    if (selectedProduct.colors && selectedProduct.colors.length > 0) {
        colorSection.style.display = "block";
        colorContainer.innerHTML = "";
        selectedProduct.colors.forEach(col => {
            const btn = document.createElement("button");
            btn.className = "option-btn color-btn";
            btn.innerText = col;
            btn.onclick = () => selectOption(btn, "color", col);
            colorContainer.appendChild(btn);
        });
    } else if (colorSection) {
        colorSection.style.display = "none";
    }

    // Accordions
    if (selectedProduct.details) {
        document.getElementById("accDetails").innerText = selectedProduct.details.productDetails || "No details.";
        document.getElementById("accCare").innerText = selectedProduct.details.careInstruction || "No instructions.";
        document.getElementById("accReturn").innerText = selectedProduct.details.returnPolicy || "Standard 15 days return policy.";
    }

    // Slider
    productImages = selectedProduct.images && selectedProduct.images.length > 0
        ? selectedProduct.images
        : ["https://via.placeholder.com/500?text=Product"];

    showSlide(0);

    if (productImages.length > 1) {
        autoSlideInterval = setInterval(() => changeSlide(1), 5000);
    }
}

function selectOption(button, type, value) {
    const siblings = button.parentElement.getElementsByClassName("option-btn");
    for (let s of siblings) s.classList.remove("active");
    button.classList.add("active");

    if (type === "size") chosenSize = value;
    if (type === "color") chosenColor = value;
}

function changeSlide(direction) {
    currentSlideIndex += direction;
    if (currentSlideIndex >= productImages.length) currentSlideIndex = 0;
    if (currentSlideIndex < 0) currentSlideIndex = productImages.length - 1;
    showSlide(currentSlideIndex);

    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(() => changeSlide(1), 5000);
    }
}

function showSlide(index) {
    const img = document.getElementById("mainProductImage");
    if (img) img.src = productImages[index];
}

function toggleAcc(element) {
    const content = element.nextElementSibling;
    const icon = element.querySelector(".acc-icon");
    if (content.style.display === "block") {
        content.style.display = "none";
        if (icon) icon.innerText = "+";
    } else {
        content.style.display = "block";
        if (icon) icon.innerText = "-";
    }
}

function addToCartFromDetails(redirectToCart = false) {
    if (selectedProduct.sizes && selectedProduct.sizes.length > 0 && !chosenSize) {
        alert("Please Select a Size First!");
        return;
    }
    if (selectedProduct.colors && selectedProduct.colors.length > 0 && !chosenColor) {
        alert("Please Select a Color First!");
        return;
    }

    const existingIndex = cart.findIndex(i => 
        i.id === selectedProduct.id && 
        i.size === chosenSize && 
        i.color === chosenColor
    );

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            image: (selectedProduct.images && selectedProduct.images.length > 0) ? selectedProduct.images[0] : "images/placeholder.jpg",
            size: chosenSize || null,
            color: chosenColor || null,
            quantity: 1
        });
    }

    localStorage.setItem("pak_store_cart", JSON.stringify(cart));
    updateCartBadge();

    if (redirectToCart) {
        window.location.href = "cart.html";
    } else {
        alert("Item added to cart successfully!");
    }
}

function submitContact() {
    const name = document.getElementById("contactName").value.trim();
    const phone = document.getElementById("contactPhone").value.trim();
    const msg = document.getElementById("contactMessage").value.trim();

    if (!name || !phone || !msg) {
        alert("Please complete the contact form!");
        return;
    }

    const btn = document.getElementById("contactBtn");
    btn.innerText = "Sending Message...";
    btn.disabled = true;

    fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ formType: "contact", name: name, phone: phone, message: msg }),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
    })
    .then(() => {
        alert("Aapka message receive ho gaya hai!");
        document.getElementById("contactName").value = "";
        document.getElementById("contactPhone").value = "";
        document.getElementById("contactMessage").value = "";
        btn.innerText = "Send Message";
        btn.disabled = false;
    });
}
