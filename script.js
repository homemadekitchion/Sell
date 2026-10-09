// ==========================================
// APNI GOOGLE SHEET YA WHATSAPP KA SETUP KAREIN
const GOOGLE_SHEET_URL = "YAHAN_APNA_WEB_APP_URL_PASTE_KAREIN";
// ==========================================

let allProducts = [];
let selectedProduct = null;
let chosenSize = null;
let chosenColor = null;

fetch('data.json')
    .then(response => response.json())
    .then(data => {
        allProducts = data.products;
        if (document.getElementById("product-container")) {
            displayCategories(data.categories);
            displayProducts();
            if(data.banners) startBannerSlider(data.banners);
        } 
        if (document.getElementById("mainProductImage")) {
            loadProductDetails();
        }
    });

// ==========================================
// HOME PAGE LOGIC
// ==========================================
function startBannerSlider(bannerImages) {
    let bannerIndex = 0;
    const bannerElement = document.getElementById("bannerImage");
    if(bannerElement && bannerImages.length > 0) {
        bannerElement.src = bannerImages[0];
    }
}

function displayCategories(categories) {
    const catContainer = document.getElementById("category-container");
    categories.forEach(cat => {
        let btn = document.createElement("button");
        btn.innerText = cat;
        btn.className = "cat-btn" + (cat === "All" ? " active" : "");
        btn.onclick = () => {
            document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            displayProducts(cat);
        };
        catContainer.appendChild(btn);
    });
}

function displayProducts(category = "All") {
    const container = document.getElementById("product-container");
    container.innerHTML = ""; 
    let filtered = category !== "All" ? allProducts.filter(p => p.category === category) : allProducts;

    filtered.forEach(prod => {
        let card = document.createElement("div");
        card.className = "product-card";
        card.onclick = () => window.location.href = `product.html?id=${prod.id}`;
        
        // Agar MRP ya Discount hai toh HTML banao warna khali rakho
        let badgeHtml = prod.discount ? `<div class="badge">${prod.discount}</div>` : '';
        let mrpHtml = prod.mrp ? `<span class="mrp">Rs. ${prod.mrp}</span> <span class="discount-text">${prod.discount}</span>` : '';
        
        // Colors count dikhana
        let colorsHtml = '';
        if(prod.colors && prod.colors.length > 0) {
            colorsHtml = `<div class="colors-count"><div class="color-dot"></div> <div class="color-dot"></div> ${prod.colors.length} colors</div>`;
        }

        card.innerHTML = `
            <div class="product-img-box">
                ${badgeHtml}
                <img src="${prod.images[0]}" alt="${prod.name}">
            </div>
            <div class="product-info">
                <h4>${prod.name}</h4>
                <div class="price-box">Rs. ${prod.price} ${mrpHtml}</div>
                ${colorsHtml}
            </div>
        `;
        container.appendChild(card);
    });
}

// ==========================================
// PRODUCT DETAILS LOGIC
// ==========================================
function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    selectedProduct = allProducts.find(p => p.id === productId);

    if (selectedProduct) {
        document.getElementById("mainProductImage").src = selectedProduct.images[0];
        document.getElementById("prodTitle").innerText = selectedProduct.name;
        document.getElementById("prodSku").innerText = "SKU: " + (selectedProduct.sku || "N/A");
        document.getElementById("prodPrice").innerText = "Rs. " + selectedProduct.price;

        if(selectedProduct.discount) {
            document.getElementById("prodDiscount").innerText = selectedProduct.discount;
            document.getElementById("prodDiscount").style.display = "inline-block";
            document.getElementById("prodMrp").innerText = "MRP: Rs. " + selectedProduct.mrp;
            document.getElementById("prodDiscText").innerText = "(" + selectedProduct.discount + ")";
        }

        // Render Sizes dynamically
        if(selectedProduct.sizes && selectedProduct.sizes.length > 0) {
            document.getElementById("sizeSection").style.display = "block";
            let sCont = document.getElementById("sizeContainer");
            selectedProduct.sizes.forEach(size => {
                let btn = document.createElement("button");
                btn.className = "option-btn";
                btn.innerText = size;
                btn.onclick = () => selectOption(btn, 'size', size);
                sCont.appendChild(btn);
            });
        }

        // Render Colors dynamically
        if(selectedProduct.colors && selectedProduct.colors.length > 0) {
            document.getElementById("colorSection").style.display = "block";
            let cCont = document.getElementById("colorContainer");
            selectedProduct.colors.forEach(color => {
                let btn = document.createElement("button");
                btn.className = "option-btn color-btn";
                btn.innerText = color;
                btn.onclick = () => selectOption(btn, 'color', color);
                cCont.appendChild(btn);
            });
        }

        // Accordion Details Setup
        if(selectedProduct.details) {
            document.getElementById("accDetails").innerText = selectedProduct.details.productDetails || "No details.";
            document.getElementById("accCare").innerText = selectedProduct.details.careInstruction || "No instructions.";
            document.getElementById("accReturn").innerText = selectedProduct.details.returnPolicy || "No policy.";
        }
    }
}

// Selection logic (jab Size/Color pe click ho)
function selectOption(button, type, value) {
    // Us category ke baqi buttons se 'active' hatao
    let siblings = button.parentElement.getElementsByClassName("option-btn");
    for(let i=0; i<siblings.length; i++) {
        siblings[i].classList.remove("active");
    }
    // Is wale pe active lagao
    button.classList.add("active");

    if(type === 'size') chosenSize = value;
    if(type === 'color') chosenColor = value;
}

// Accordion (Collapse) Logic
function toggleAcc(element) {
    const content = element.nextElementSibling;
    const icon = element.querySelector('.acc-icon');
    if(content.style.display === "block") {
        content.style.display = "none";
        icon.innerText = "+";
    } else {
        content.style.display = "block";
        icon.innerText = "-";
    }
}

// ==========================================
// ORDER PROCESS & GOOGLE SHEETS
// ==========================================
function openModal() {
    // Validation check (Kahin user Size bhool toh nahi gaya?)
    if(selectedProduct.sizes && selectedProduct.sizes.length > 0 && !chosenSize) {
        alert("Please Select a Size First!");
        return;
    }
    if(selectedProduct.colors && selectedProduct.colors.length > 0 && !chosenColor) {
        alert("Please Select a Color First!");
        return;
    }

    // Modal mein text dikhana
    document.getElementById("orderItemName").innerText = selectedProduct.name;
    document.getElementById("orderItemPrice").innerText = "Rs. " + selectedProduct.price;
    
    let specs = [];
    if(chosenSize) specs.push("Size: " + chosenSize);
    if(chosenColor) specs.push("Color: " + chosenColor);
    document.getElementById("orderItemSpecs").innerText = specs.join(" | ");

    document.getElementById("orderModal").style.display = "block";
}

function closeModal() {
    document.getElementById("orderModal").style.display = "none";
}

function submitOrder() {
    let name = document.getElementById("custName").value;
    let phone = document.getElementById("custPhone").value;
    let address = document.getElementById("custAddress").value;

    if (!name || !phone || !address) { alert("Please complete details!"); return; }

    let confirmBtn = document.querySelector(".confirm-btn");
    confirmBtn.innerText = "Processing...";
    confirmBtn.disabled = true;

    // Yahan hum name ke sath Size/Color bhi bhej rahe hain taake sheet mein sab nazar aaye
    let fullProductName = selectedProduct.name;
    if(chosenSize) fullProductName += ` (Size: ${chosenSize})`;
    if(chosenColor) fullProductName += ` (Color: ${chosenColor})`;

    let orderData = { 
        formType: "order", 
        product: fullProductName, 
        price: selectedProduct.price, 
        name: name, 
        phone: phone, 
        address: address 
    };

    fetch(GOOGLE_SHEET_URL, { method: "POST", body: JSON.stringify(orderData), headers: { "Content-Type": "text/plain;charset=utf-8" } })
    .then(response => {
        alert("Thank You! Your COD order is confirmed.");
        closeModal();
        confirmBtn.innerText = "Confirm Order"; confirmBtn.disabled = false;
        // reset form
        document.getElementById("custName").value = ""; 
        document.getElementById("custPhone").value = ""; 
        document.getElementById("custAddress").value = "";
    })
    .catch(error => {
        alert("Order failed! Check internet connection.");
        confirmBtn.innerText = "Confirm Order"; confirmBtn.disabled = false;
    });
}
