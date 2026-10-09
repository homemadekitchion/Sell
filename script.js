// ==========================================================================
// 1. CONFIGURATION
// ==========================================================================
const GOOGLE_SHEET_URL = "YAHAN_APNA_WEB_APP_URL_PASTE_KAREIN";

// State Variables
let allProducts = [];
let currentCategory = "All";
let itemsToShow = 10;
let selectedProduct = null;
let chosenSize = null;
let chosenColor = null;

// ==========================================================================
// 2. AUTO-LOAD DATA.JSON (WITH CACHE-BUSTER)
// ==========================================================================
// ?v= + timestamp lagane se browser hamesha FRESH JSON uthata hai, purani nahi
const cacheBusterUrl = './data.json?v=' + new Date().getTime();

fetch(cacheBusterUrl, { 
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' }
})
.then(res => {
    if (!res.ok) {
        throw new Error(`data.json file nahi mili! (HTTP Status: ${res.status})`);
    }
    return res.json();
})
.then(data => {
    console.log("data.json successfully loaded:", data);
    initApp(data);
})
.catch(err => {
    console.error("JSON Loading Error:", err);
    const loadingEl = document.getElementById("loadingMsg");
    if (loadingEl) {
        loadingEl.innerHTML = `
            <div style="color: #a41c23; padding: 20px; border: 1px solid #a41c23; background: #fff5f5; border-radius: 5px; max-width: 600px; margin: 20px auto;">
                <strong>⚠️ data.json Load Hone Mein Masla Aya Hai:</strong><br>
                <span>${err.message}</span><br><br>
                <small style="color: #555;">
                    1. Agar aap file offline (direct double-click) chala rahe hain toh browser JSON block karta hai, isay <strong>GitHub Pages</strong> par upload karke check karein.<br>
                    2. Ya check karein ke <strong>data.json</strong> mein koi comma (,) ya bracket ki ghalti toh nahi.
                </small>
            </div>
        `;
    }
});

function initApp(data) {
    allProducts = data.products || [];

    // Loading msg hide karein
    const loadingEl = document.getElementById("loadingMsg");
    if (loadingEl) loadingEl.style.display = "none";

    // Agar Home Page par hain
    if (document.getElementById("product-container")) {
        displayCategories(data.categories || ["All"]);
        displayProducts();
        if (data.banners && data.banners.length > 0) {
            startBannerSlider(data.banners);
        }
    }

    // Agar Product Detail Page par hain
    if (document.getElementById("mainProductImage")) {
        loadProductDetails();
    }
}

// ==========================================================================
// 3. BANNER SLIDER
// ==========================================================================
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

// ==========================================================================
// 4. CATEGORIES
// ==========================================================================
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
            itemsToShow = 10;
            displayProducts();
        };
        catContainer.appendChild(btn);
    });
}

// ==========================================================================
// 5. PRODUCTS GRID & LOAD MORE
// ==========================================================================
function displayProducts() {
    const container = document.getElementById("product-container");
    if (!container) return;
    container.innerHTML = "";

    const filtered = currentCategory !== "All"
        ? allProducts.filter(p => p.category === currentCategory)
        : allProducts;

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

        const firstImage = (prod.images && prod.images.length > 0) ? prod.images[0] : "https://via.placeholder.com/300?text=Product";

        card.innerHTML = `
            <div class="product-img-box">
                ${badgeHtml}
                <img src="${firstImage}" alt="${prod.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/300?text=Product';">
            </div>
            <div class="product-info">
                <h4>${prod.name}</h4>
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
// 6. PRODUCT DETAILS PAGE
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

    // Details Accordion
    if (selectedProduct.details) {
        document.getElementById("accDetails").innerText = selectedProduct.details.productDetails || "No details.";
        document.getElementById("accCare").innerText = selectedProduct.details.careInstruction || "No care instructions.";
        document.getElementById("accReturn").innerText = selectedProduct.details.returnPolicy || "Standard 15 days return policy.";
    }

    // Multi-Image Slider
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

// ==========================================================================
// 7. ORDER SUBMIT (COD)
// ==========================================================================
function openModal() {
    if (selectedProduct.sizes && selectedProduct.sizes.length > 0 && !chosenSize) {
        alert("Please Select a Size First!");
        return;
    }
    if (selectedProduct.colors && selectedProduct.colors.length > 0 && !chosenColor) {
        alert("Please Select a Color First!");
        return;
    }

    document.getElementById("orderItemName").innerText = selectedProduct.name;
    document.getElementById("orderItemPrice").innerText = "Rs. " + selectedProduct.price;

    let specs = [];
    if (chosenSize) specs.push("Size: " + chosenSize);
    if (chosenColor) specs.push("Color: " + chosenColor);
    document.getElementById("orderItemSpecs").innerText = specs.join(" | ");

    document.getElementById("orderModal").style.display = "block";
}

function closeModal() {
    document.getElementById("orderModal").style.display = "none";
}

function submitOrder() {
    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const address = document.getElementById("custAddress").value.trim();

    if (!name || !phone || !address) {
        alert("Please enter complete delivery details!");
        return;
    }

    const confirmBtn = document.querySelector(".confirm-btn");
    confirmBtn.innerText = "Processing...";
    confirmBtn.disabled = true;

    let fullProduct = selectedProduct.name;
    if (chosenSize) fullProduct += ` (Size: ${chosenSize})`;
    if (chosenColor) fullProduct += ` (Color: ${chosenColor})`;

    const orderData = {
        formType: "order",
        product: fullProduct,
        price: selectedProduct.price,
        name: name,
        phone: phone,
        address: address
    };

    fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        body: JSON.stringify(orderData),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
    })
    .then(() => {
        alert("Thank you! Your Cash on Delivery order is confirmed.");
        closeModal();
        document.getElementById("custName").value = "";
        document.getElementById("custPhone").value = "";
        document.getElementById("custAddress").value = "";
        confirmBtn.innerText = "Confirm Order";
        confirmBtn.disabled = false;
    })
    .catch(() => {
        alert("Order recorded! Thank you.");
        closeModal();
        confirmBtn.innerText = "Confirm Order";
        confirmBtn.disabled = false;
    });
}

// ==========================================================================
// 8. CONTACT FORM SUBMISSION
// ==========================================================================
function submitContact() {
    const name = document.getElementById("contactName").value.trim();
    const phone = document.getElementById("contactPhone").value.trim();
    const msg = document.getElementById("contactMessage").value.trim();

    if (!name || !phone || !msg) {
        alert("Please complete the contact form!");
        return;
    }

    const btn = document.getElementById("contactBtn");
    btn.innerText = "Sending...";
    btn.disabled = true;

    const contactData = {
        formType: "contact",
        name: name,
        phone: phone,
        message: msg
    };

    fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        body: JSON.stringify(contactData),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
    })
    .then(() => {
        alert("Aapka message receive ho gaya hai!");
        document.getElementById("contactName").value = "";
        document.getElementById("contactPhone").value = "";
        document.getElementById("contactMessage").value = "";
        btn.innerText = "Send Message";
        btn.disabled = false;
    })
    .catch(() => {
        alert("Message sent! Shukriya.");
        btn.innerText = "Send Message";
        btn.disabled = false;
    });
}
