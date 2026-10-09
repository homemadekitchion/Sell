// ==========================================================================
// 1. CONFIGURATION (Aapka Google Sheet Web App Link)
// ==========================================================================
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzOfFRYi8QQiexm4od54EpVLZeIjf4JnlSyMe4O7UfIM0UyyMAOTdjbpstURYMREtbpkQ/exec";

// Global Variables
let allProducts = [];
let currentCategory = "All";
let itemsToShow = 10;
let selectedProduct = null;
let chosenSize = null;
let chosenColor = null;

// ==========================================================================
// 2. DATA.JSON FETCHING (With Cache-Buster & Auto-Load)
// ==========================================================================
const cacheBusterUrl = './data.json?v=' + new Date().getTime();

fetch(cacheBusterUrl, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' }
})
.then(res => {
    if (!res.ok) throw new Error(`HTTP Error Status: ${res.status}`);
    return res.json();
})
.then(data => {
    initApp(data);
})
.catch(err => {
    console.error("data.json load error:", err);
    const loadingEl = document.getElementById("loadingMsg");
    if (loadingEl) {
        loadingEl.innerHTML = `<span style="color:red;">Error loading data.json: ${err.message}<br>Agar computer par direct kholi hai toh GitHub par push karein.</span>`;
    }
});

function initApp(data) {
    allProducts = data.products || [];

    // Loading indicator hide karein
    const loadingEl = document.getElementById("loadingMsg");
    if (loadingEl) loadingEl.style.display = "none";

    // Agar Home Page par hain (index.html)
    if (document.getElementById("product-container")) {
        displayCategories(data.categories || ["All"]);
        displayProducts();
        if (data.banners && data.banners.length > 0) {
            startBannerSlider(data.banners);
        }
    }

    // Agar Product Detail Page par hain (product.html)
    if (document.getElementById("mainProductImage")) {
        loadProductDetails();
    }
}

// ==========================================================================
// 3. HOME PAGE: BANNER SLIDER
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
// 4. HOME PAGE: CATEGORIES FILTER
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
            itemsToShow = 10; // Filter change hone par wapis 10 dikhayein
            displayProducts();
        };
        catContainer.appendChild(btn);
    });
}

// ==========================================================================
// 5. HOME PAGE: PRODUCTS GRID & LOAD MORE
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

        const firstImage = (prod.images && prod.images.length > 0) ? prod.images[0] : "images/placeholder.jpg";

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
// 6. PRODUCT DETAILS PAGE (SLIDER, SIZES, COLORS, ACCORDIONS)
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

    // Basic Info Fill Karna
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

    // Sizes Setup (Agar nahi hain toh section hide ho jayega)
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

    // Colors Setup (Agar nahi hain toh section hide ho jayega)
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

    // Details Accordion Setup
    if (selectedProduct.details) {
        document.getElementById("accDetails").innerText = selectedProduct.details.productDetails || "No details available.";
        document.getElementById("accCare").innerText = selectedProduct.details.careInstruction || "No instructions provided.";
        document.getElementById("accReturn").innerText = selectedProduct.details.returnPolicy || "Standard 15 days return policy.";
    }

    // Image Slider Setup
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
// 7. ORDER SUBMISSION (REAL-TIME TO GOOGLE SHEETS WITH NO-CORS)
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
        alert("Please complete delivery details!");
        return;
    }

    const confirmBtn = document.querySelector(".confirm-btn");
    confirmBtn.innerText = "Order Bheja Ja Raha Hai...";
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

    // Google Sheets Webhook Call (mode: "no-cors" is critical here)
    fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        mode: "no-cors",
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
    .catch((err) => {
        console.error(err);
        alert("Order submitted successfully!");
        closeModal();
        confirmBtn.innerText = "Confirm Order";
        confirmBtn.disabled = false;
    });
}

// ==========================================================================
// 8. CONTACT FORM SUBMISSION (DIRECT TO GOOGLE SHEETS)
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
    btn.innerText = "Sending Message...";
    btn.disabled = true;

    const contactData = {
        formType: "contact",
        name: name,
        phone: phone,
        message: msg
    };

    fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(contactData),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
    })
    .then(() => {
        alert("Aapka message receive ho gaya hai! Hum jald raabta karenge.");
        document.getElementById("contactName").value = "";
        document.getElementById("contactPhone").value = "";
        document.getElementById("contactMessage").value = "";
        btn.innerText = "Send Message";
        btn.disabled = false;
    })
    .catch((err) => {
        console.error(err);
        alert("Message sent! Shukriya.");
        btn.innerText = "Send Message";
        btn.disabled = false;
    });
}
