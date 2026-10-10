// ==========================================================================
// 1. CONFIGURATION (Google Sheet Webhook URL)
// ==========================================================================
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzOfFRYi8QQiexm4od54EpVLZeIjf4JnlSyMe4O7UfIM0UyyMAOTdjbpstURYMREtbpkQ/exec";

// Global State
let allProducts = [];
let allCollections = [];
let allBestSellers = [];
let allOnSale = [];
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
// SMART IMAGE RESOLVER
// ==========================================================================
function getProductImage(item) {
    if (!item) return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80";
    if (item.images && Array.isArray(item.images) && item.images.length > 0 && item.images[0]) {
        return item.images[0];
    }
    if (item.image && typeof item.image === "string" && item.image.trim() !== "") {
        return item.image;
    }
    return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80";
}

// ==========================================================================
// 2. DATA INITIALIZATION & PAGE ROUTING
// ==========================================================================
const cacheTime = new Date().getTime();

// 1. Load Main data.json
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

        // Product Details Page (product.html) Trigger
        if (document.getElementById("mainProductImage") || document.getElementById("prodTitle")) {
            loadProductDetails();
        }

        if (document.getElementById("cartViewContainer")) {
            renderCartPage();
        }
    })
    .catch(err => console.error("Error loading data.json:", err));

// 2. Load New Arrivals
fetch(`./new-arrivals.json?v=${cacheTime}`, { cache: 'no-store' })
    .then(res => res.json())
    .then(data => {
        if (data.hero && document.getElementById("homePromoImg")) {
            document.getElementById("homePromoImg").src = getProductImage(data.hero);
            document.getElementById("homePromoPill").innerText = "🌸 " + (data.hero.badge || "Fresh Drops");
            document.getElementById("homePromoTitle").innerText = data.hero.title || "New Arrival";
            document.getElementById("homePromoDesc").innerText = data.hero.description || "";
        }

        if (document.getElementById("newArrivalsGrid")) {
            renderNewArrivalsPage(data);
        }
    })
    .catch(err => console.error("Error loading new-arrivals.json:", err));

// 3. Load Best Sellers
fetch(`./best-sellers.json?v=${cacheTime}`, { cache: 'no-store' })
    .then(res => res.json())
    .then(data => {
        allBestSellers = data.products || [];
        if (document.getElementById("homeBestGrid")) {
            renderHomeBestSellers(allBestSellers.slice(0, 4));
        }
    })
    .catch(err => console.error("Error loading best-sellers.json:", err));

// 4. Load On Sale
fetch(`./on-sale.json?v=${cacheTime}`, { cache: 'no-store' })
    .then(res => res.json())
    .then(data => {
        allOnSale = data.products || [];
        if (document.getElementById("homeSaleGrid")) {
            renderHomeOnSale(allOnSale.slice(0, 4));
        }
    })
    .catch(err => console.error("Error loading on-sale.json:", err));

// 5. Load Collections
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
// 3. PRODUCT DETAILS LOADER (100% FIXED FOR product.html)
// ==========================================================================
let productImages = [];
let currentSlideIndex = 0;
let autoSlideInterval = null;

function loadProductDetails() {
    if (!allProducts || allProducts.length === 0) return;

    const urlParams = new URLSearchParams(window.location.search);
    const rawId = urlParams.get("id");

    // Smart Match: String vs Number loose check
    if (rawId) {
        selectedProduct = allProducts.find(p => 
            String(p.id).trim() === String(rawId).trim() || 
            p.id == rawId
        );
    }

    // Agar ID match na ho ya URL mein ?id na ho toh pehla product default load karo
    if (!selectedProduct) {
        selectedProduct = allProducts[0];
    }

    if (!selectedProduct) {
        const titleEl = document.getElementById("prodTitle");
        if (titleEl) titleEl.innerText = "Product Not Found!";
        return;
    }

    // Title, SKU, Price Safe Injection
    const titleEl = document.getElementById("prodTitle");
    if (titleEl) titleEl.innerText = selectedProduct.name || "Product Name";

    const skuEl = document.getElementById("prodSku");
    if (skuEl) skuEl.innerText = "SKU: " + (selectedProduct.sku || "N/A");

    const priceEl = document.getElementById("prodPrice");
    if (priceEl) priceEl.innerText = "Rs. " + (selectedProduct.price || 0);

    const bCat = document.getElementById("breadCategory");
    if (bCat) bCat.innerText = selectedProduct.category || "Shop";

    const bName = document.getElementById("breadName");
    if (bName) bName.innerText = selectedProduct.name || "Product Details";

    // Discount & MRP
    const badge = document.getElementById("prodDiscount");
    const mrp = document.getElementById("prodMrp");
    const disc = document.getElementById("prodDiscText");

    if (selectedProduct.discount) {
        if (badge) { badge.innerText = selectedProduct.discount; badge.style.display = "inline-block"; }
        if (mrp) mrp.innerText = "MRP: Rs. " + (selectedProduct.mrp || "");
        if (disc) disc.innerText = "(" + selectedProduct.discount + ")";
    } else {
        if (badge) badge.style.display = "none";
        if (mrp) mrp.innerText = "";
        if (disc) disc.innerText = "";
    }

    // Sizes Injection
    const sizeSection = document.getElementById("sizeSection");
    const sizeContainer = document.getElementById("sizeContainer");
    if (selectedProduct.sizes && Array.isArray(selectedProduct.sizes) && selectedProduct.sizes.length > 0) {
        if (sizeSection) sizeSection.style.display = "block";
        if (sizeContainer) {
            sizeContainer.innerHTML = "";
            selectedProduct.sizes.forEach(size => {
                const btn = document.createElement("button");
                btn.className = "option-btn";
                btn.innerText = size;
                btn.onclick = () => selectOption(btn, "size", size);
                sizeContainer.appendChild(btn);
            });
        }
    } else if (sizeSection) {
        sizeSection.style.display = "none";
    }

    // Colors Injection
    const colorSection = document.getElementById("colorSection");
    const colorContainer = document.getElementById("colorContainer");
    if (selectedProduct.colors && Array.isArray(selectedProduct.colors) && selectedProduct.colors.length > 0) {
        if (colorSection) colorSection.style.display = "block";
        if (colorContainer) {
            colorContainer.innerHTML = "";
            selectedProduct.colors.forEach(col => {
                const btn = document.createElement("button");
                btn.className = "option-btn color-btn";
                btn.innerText = col;
                btn.onclick = () => selectOption(btn, "color", col);
                colorContainer.appendChild(btn);
            });
        }
    } else if (colorSection) {
        colorSection.style.display = "none";
    }

    // Accordions
    const accDet = document.getElementById("accDetails");
    const accCare = document.getElementById("accCare");
    const accRet = document.getElementById("accReturn");

    if (selectedProduct.details) {
        if (accDet) accDet.innerText = selectedProduct.details.productDetails || selectedProduct.description || "Premium quality product.";
        if (accCare) accCare.innerText = selectedProduct.details.careInstruction || "Handle with care.";
        if (accRet) accRet.innerText = selectedProduct.details.returnPolicy || "Standard 15 days return policy.";
    } else {
        if (accDet) accDet.innerText = selectedProduct.description || "Premium quality guaranteed.";
        if (accCare) accCare.innerText = "Keep clean and dry.";
        if (accRet) accRet.innerText = "15 days replacement warranty.";
    }

    // Multi-Images Slider Safe Setup
    if (selectedProduct.images && Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0) {
        productImages = selectedProduct.images;
    } else if (selectedProduct.image) {
        productImages = [selectedProduct.image];
    } else {
        productImages = ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"];
    }

    currentSlideIndex = 0;
    showSlide(0);

    if (autoSlideInterval) clearInterval(autoSlideInterval);
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
    if (!productImages || productImages.length === 0) return;
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
    if (img && productImages && productImages.length > 0) {
        img.src = productImages[index];
        img.onerror = function() {
            this.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80";
        };
    }
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
    if (!selectedProduct) return;

    if (selectedProduct.sizes && selectedProduct.sizes.length > 0 && !chosenSize) {
        alert("Please Select a Size First!");
        return;
    }
    if (selectedProduct.colors && selectedProduct.colors.length > 0 && !chosenColor) {
        alert("Please Select a Color First!");
        return;
    }

    const cartItemId = `prod_${selectedProduct.id}_${chosenSize || ''}_${chosenColor || ''}`;
    const existingIndex = cart.findIndex(i => i.id === cartItemId);
    const prodImg = getProductImage(selectedProduct);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: cartItemId,
            name: selectedProduct.name,
            price: selectedProduct.price,
            image: prodImg,
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

// ==========================================================================
// 4. HOME PAGE: PRODUCTS & CATEGORIES
// ==========================================================================
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
            colorsHtml = `<div class="colors-count">${prod.colors.length} colors available</div>`;
        }

        const prodImg = getProductImage(prod);

        card.innerHTML = `
            <div class="product-img-box">
                ${badgeHtml}
                <img src="${prodImg}" alt="${prod.name}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80';">
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

function startBannerSlider(bannerImages) {
    let bannerIndex = 0;
    const bannerImg = document.getElementById("bannerImage");
    if (!bannerImg || bannerImages.length === 0) return;

    bannerImg.src = bannerImages[0];
    bannerImg.onerror = function() {
        this.src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80";
    };

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

// ==========================================================================
// 5. HOME PREVIEWS & SHOWCASE
// ==========================================================================
function renderHomeBestSellers(products) {
    const grid = document.getElementById("homeBestGrid");
    if (!grid) return;
    grid.innerHTML = "";

    products.forEach(item => {
        const card = document.createElement("div");
        card.className = "best-card";
        const mrpHtml = item.mrp ? `<span style="text-decoration:line-through;color:#94a3b8;font-size:12px;margin-left:5px;">Rs. ${item.mrp}</span>` : "";
        const itemImg = getProductImage(item);

        card.innerHTML = `
            <div>
                <div class="best-img-box" onclick="addGenericToCart('${item.name} [Best Seller]', ${item.price}, '${itemImg}', true)">
                    <img src="${itemImg}" alt="${item.name}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80';">
                </div>
                <h3 class="best-card-title" onclick="addGenericToCart('${item.name} [Best Seller]', ${item.price}, '${itemImg}', true)">${item.name}</h3>
                <div class="best-price-row">Rs. ${item.price} ${mrpHtml}</div>
            </div>
            <button class="btn-add-cart-best" onclick="addGenericToCart('${item.name} [Best Seller]', ${item.price}, '${itemImg}', false)">ADD TO CART</button>
        `;
        grid.appendChild(card);
    });
}

function renderHomeOnSale(products) {
    const grid = document.getElementById("homeSaleGrid");
    if (!grid) return;
    grid.innerHTML = "";

    products.forEach(item => {
        const card = document.createElement("div");
        card.className = "sale-card";
        const badgeColor = item.badgeColor || "#e11d48";
        const badgeHtml = item.badge ? `<div class="badge-circle" style="background-color: ${badgeColor};">${item.badge}</div>` : "";
        const itemImg = getProductImage(item);

        let swatchesHtml = "";
        if (item.colors && item.colors.length > 0) {
            swatchesHtml = `<div class="swatches-row">` + item.colors.map(c => `<span class="swatch-dot" style="background-color: ${c};"></span>`).join('') + `</div>`;
        }

        card.innerHTML = `
            <div>
                ${badgeHtml}
                <div class="sale-img-box" onclick="addGenericToCart('${item.name} [On Sale]', ${item.price}, '${itemImg}', true)">
                    <img src="${itemImg}" alt="${item.name}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';">
                </div>
                <div class="sale-info">
                    <h3 class="sale-card-title" onclick="addGenericToCart('${item.name} [On Sale]', ${item.price}, '${itemImg}', true)">${item.name}</h3>
                    <div class="sale-card-price">Rs. ${item.price}</div>
                    <div class="stars-row">★★★★★</div>
                    ${swatchesHtml}
                </div>
            </div>
            <div style="padding: 0 10px 10px 10px;">
                <button class="btn-quick-sale" onclick="addGenericToCart('${item.name} [On Sale]', ${item.price}, '${itemImg}', true)">Quick Buy</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function addGenericToCart(name, price, image, redirectToCart) {
    const cartItemId = `item_${encodeURIComponent(name)}`;
    const existingIndex = cart.findIndex(i => i.id === cartItemId);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: cartItemId,
            name: name,
            price: price,
            image: image,
            size: "Standard",
            color: "Featured",
            quantity: 1
        });
    }

    localStorage.setItem("pak_store_cart", JSON.stringify(cart));
    updateCartBadge();

    if (redirectToCart) {
        window.location.href = "cart.html";
    } else {
        alert(`"${name}" added to cart!`);
    }
}

function renderHomeShowcase(data) {
    const container = document.getElementById("showcaseContainer");
    if (!container) return;

    if (data.badge && document.getElementById("showcaseBadge")) {
        document.getElementById("showcaseBadge").innerText = data.badge;
    }
    if (data.heading && document.getElementById("showcaseHeading")) {
        document.getElementById("showcaseHeading").innerText = data.heading;
    }

    container.innerHTML = "";

    data.collections.forEach((item, index) => {
        const isReverse = index % 2 !== 0;
        const row = document.createElement("div");
        row.className = `showcase-row ${isReverse ? 'reverse' : ''}`;

        const mrpHtml = item.mrp ? `<span style="text-decoration:line-through;color:#94a3b8;font-size:12px;margin-left:6px;">Rs. ${item.mrp}</span>` : "";
        const discHtml = item.discount ? `<span style="color:#e11d48;font-size:12px;font-weight:700;margin-left:4px;">${item.discount}</span>` : "";
        const firstImg = getProductImage(item);

        row.innerHTML = `
            <div class="showcase-img-card" onclick="window.location.href='collection-detail.html?id=${item.id}'">
                <img src="${firstImg}" alt="${item.title}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80';">
            </div>
            <div class="showcase-text-box">
                <h3 class="showcase-item-title" onclick="window.location.href='collection-detail.html?id=${item.id}'">${item.title}</h3>
                <p class="showcase-item-desc">${item.description}</p>
                <div class="showcase-price-box">
                    <span>Rs. ${item.price}</span>
                    ${mrpHtml}
                    ${discHtml}
                </div>
                <div class="showcase-actions">
                    <button class="col-buy-btn" onclick="window.location.href='collection-detail.html?id=${item.id}'">View & Select Options</button>
                    <button class="col-cart-btn" onclick="addGenericToCart('${item.title} (Collection)', ${item.price}, '${firstImg}', false)">Quick Add</button>
                </div>
            </div>
        `;
        container.appendChild(row);
    });
}

// ==========================================================================
// 6. NEW ARRIVALS PAGE LOADER (new-arrivals.html)
// ==========================================================================
function renderNewArrivalsPage(data) {
    if (data.hero) {
        const img = document.getElementById("newHeroImg");
        const pill = document.getElementById("newHeroPill");
        const title = document.getElementById("newHeroTitle");
        const desc = document.getElementById("newHeroDesc");
        if (img) img.src = getProductImage(data.hero);
        if (pill) pill.innerText = "🌸 " + (data.hero.badge || "Fresh Drops");
        if (title) title.innerText = data.hero.title || "New Arrival";
        if (desc) desc.innerText = data.hero.description || "";
    }

    const grid = document.getElementById("newArrivalsGrid");
    if (!grid) return;
    grid.innerHTML = "";

    data.products.forEach(prod => {
        const card = document.createElement("div");
        card.className = "new-card";

        const mrpHtml = prod.mrp ? `<span class="mrp">Rs. ${prod.mrp}</span>` : "";
        const discHtml = prod.discount ? `<span class="disc">${prod.discount}</span>` : "";
        const prodImg = getProductImage(prod);

        card.innerHTML = `
            <div class="new-tag">${prod.badge || "NEW"}</div>
            <div class="img-box" onclick="buyNewItem(${prod.id}, true)">
                <img src="${prodImg}" alt="${prod.name}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80';">
            </div>
            <div class="card-info">
                <div class="rating-stars">★★★★★</div>
                <h3 class="card-title" onclick="buyNewItem(${prod.id}, true)">${prod.name}</h3>
                <div class="price-row">
                    <span class="price">Rs. ${prod.price}</span>
                    ${mrpHtml}
                    ${discHtml}
                </div>
                <div class="colors-strip">
                    ${prod.colors ? prod.colors.map(() => '<span class="color-dot"></span>').join('') : ''}
                </div>
                <div class="card-actions">
                    <button class="btn-buy" onclick="buyNewItem(${prod.id}, true)">Buy Now</button>
                    <button class="btn-cart" onclick="buyNewItem(${prod.id}, false)">Add to Cart</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function buyNewItem(id, redirectToCart) {
    fetch(`./new-arrivals.json`)
        .then(res => res.json())
        .then(data => {
            const item = data.products.find(p => p.id === id);
            if (!item) return;

            const cartItemId = `new_${item.id}`;
            const existingIndex = cart.findIndex(i => i.id === cartItemId);
            const imgUrl = getProductImage(item);

            if (existingIndex > -1) {
                cart[existingIndex].quantity += 1;
            } else {
                cart.push({
                    id: cartItemId,
                    name: `${item.name} [New Arrival]`,
                    price: item.price,
                    image: imgUrl,
                    size: item.sizes ? item.sizes[0] : "Standard",
                    color: item.colors ? item.colors[0] : "Standard",
                    quantity: 1
                });
            }

            localStorage.setItem("pak_store_cart", JSON.stringify(cart));
            updateCartBadge();

            if (redirectToCart) {
                window.location.href = "cart.html";
            } else {
                alert(`"${item.name}" added to cart!`);
            }
        });
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
                <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80';">
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
    if (cart[index].quantity <= 0) cart.splice(index, 1);
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

// Contact Form
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

// Search System
function handleSearch() {
    const input = document.getElementById("searchInput");
    searchQuery = input.value.trim().toLowerCase();
    itemsToShow = 10;

    const featBlocks = document.getElementById("homeFeaturedBlocks");
    if (featBlocks) {
        featBlocks.style.display = searchQuery === "" ? "block" : "none";
    }

    displayProducts();
}

function clearSearch() {
    const input = document.getElementById("searchInput");
    if (input) input.value = "";
    searchQuery = "";
    currentCategory = "All";

    const featBlocks = document.getElementById("homeFeaturedBlocks");
    if (featBlocks) featBlocks.style.display = "block";

    document.querySelectorAll(".cat-btn").forEach(b => {
        b.classList.toggle("active", b.innerText === "All");
    });
    displayProducts();
}
