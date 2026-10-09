// Apni Shop Ka WhatsApp Number yahan daalein (Country code 92 ke sath)
const WATSAPP_NUMBER = "923105784772"; 

let allProducts = [];
let currentCategory = "All";
let itemsToShow = 10;
let selectedProduct = null;

// SLIDER VARIABLES (For Product Page)
let productImages = [];
let currentSlideIndex = 0;
let autoSlideInterval;

// Fetch JSON data
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        allProducts = data.products;
        
        // Agar Homepage par hain
        if (document.getElementById("product-container")) {
            displayCategories(data.categories);
            displayProducts();
            
            // JSON se Banners utha kar slider start karo
            if(data.banners && data.banners.length > 0) {
                startBannerSlider(data.banners);
            }
        } 
        
        // Agar Product Details Page par hain
        if (document.getElementById("mainProductImage")) {
            loadProductDetails();
        }
    })
    .catch(error => console.error("Error loading JSON:", error));

/* =========================================
   HOME PAGE LOGIC
========================================= */
function startBannerSlider(bannerImages) {
    let bannerIndex = 0;
    const bannerElement = document.getElementById("bannerImage");
    
    // Set first banner image immediately
    if(bannerElement) {
        bannerElement.src = bannerImages[bannerIndex];
        
        // Auto slider logic (Change every 3 seconds)
        if(bannerImages.length > 1) {
            setInterval(() => {
                bannerIndex = (bannerIndex + 1) % bannerImages.length;
                bannerElement.src = bannerImages[bannerIndex];
            }, 3000);
        }
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
            currentCategory = cat;
            itemsToShow = 10;
            displayProducts();
        };
        catContainer.appendChild(btn);
    });
}

function displayProducts() {
    const productContainer = document.getElementById("product-container");
    productContainer.innerHTML = ""; 

    let filteredProducts = currentCategory !== "All" 
        ? allProducts.filter(p => p.category === currentCategory) 
        : allProducts;

    let productsToShow = filteredProducts.slice(0, itemsToShow);

    productsToShow.forEach(prod => {
        let card = document.createElement("div");
        card.className = "product-card";
        // Click karne pe product.html pe le jaye ga ID ke sath
        card.onclick = () => window.location.href = `product.html?id=${prod.id}`;
        
        card.innerHTML = `
            <img src="${prod.images[0]}" alt="${prod.name}">
            <h4>${prod.name}</h4>
            <p style="color: green; font-weight: bold;">Rs. ${prod.price}</p>
        `;
        productContainer.appendChild(card);
    });

    const loadMoreBtn = document.getElementById("loadMoreBtn");
    loadMoreBtn.style.display = filteredProducts.length > itemsToShow ? "inline-block" : "none";
}

function loadMore() {
    itemsToShow += 10;
    displayProducts();
}

/* =========================================
   PRODUCT DETAILS PAGE LOGIC (With Slider)
========================================= */
function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    selectedProduct = allProducts.find(p => p.id === productId);

    if (selectedProduct) {
        document.getElementById("prodTitle").innerText = selectedProduct.name;
        document.getElementById("prodPrice").innerText = "Rs. " + selectedProduct.price;
        document.getElementById("prodDesc").innerText = selectedProduct.description;
        
        productImages = selectedProduct.images;
        showSlide(0);
        
        if(productImages.length > 1) {
            autoSlideInterval = setInterval(() => changeSlide(1), 5000); // 5 sec auto slide
        } else {
            document.querySelector(".prev").style.display = "none";
            document.querySelector(".next").style.display = "none";
        }
    } else {
        document.getElementById("prodTitle").innerText = "Product Not Found!";
    }
}

function changeSlide(direction) {
    currentSlideIndex += direction;
    
    if (currentSlideIndex >= productImages.length) { currentSlideIndex = 0; }
    if (currentSlideIndex < 0) { currentSlideIndex = productImages.length - 1; }
    
    showSlide(currentSlideIndex);

    // Reset auto-slider timer on manual click
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => changeSlide(1), 5000);
}

function showSlide(index) {
    document.getElementById("mainProductImage").src = productImages[index];
}

/* =========================================
   ORDER MODAL & WHATSAPP LOGIC
========================================= */
function openModal() {
    document.getElementById("orderItemName").innerText = selectedProduct.name + " (Rs. " + selectedProduct.price + ")";
    document.getElementById("orderModal").style.display = "block";
}

function closeModal() {
    document.getElementById("orderModal").style.display = "none";
}

function submitOrder() {
    let name = document.getElementById("custName").value;
    let phone = document.getElementById("custPhone").value;
    let address = document.getElementById("custAddress").value;

    if (!name || !phone || !address) {
        alert("Meharbani farma kar details mukammal fill karein!");
        return;
    }

    let message = `*NEW ORDER (Cash on Delivery)*%0A%0A`;
    message += `*Product:* ${selectedProduct.name}%0A`;
    message += `*Price:* Rs. ${selectedProduct.price}%0A%0A`;
    message += `*CUSTOMER DETAILS:*%0A`;
    message += `*Name:* ${name}%0A`;
    message += `*Phone:* ${phone}%0A`;
    message += `*Address:* ${address}%0A`;

    let whatsappURL = `https://wa.me/${WATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappURL, "_blank");
    
    closeModal();
    alert("Shukriya! Aapka order WhatsApp par chala gaya hai.");
}
