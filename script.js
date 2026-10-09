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

// Fetch JSON based on which page we are on
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        allProducts = data.products;
        
        // Agar Homepage par hain
        if (document.getElementById("product-container")) {
            displayCategories(data.categories);
            displayProducts();
            startBannerSlider();
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
function startBannerSlider() {
    const bannerImages = ["images/banner1.jpg", "images/banner2.jpg"];
    let bannerIndex = 0;
    const bannerElement = document.getElementById("bannerImage");
    if(bannerElement){
        setInterval(() => {
            bannerIndex = (bannerIndex + 1) % bannerImages.length;
            bannerElement.src = bannerImages[bannerIndex];
        }, 3000);
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
        // Jab card pe click hoga tou product.html pe chala jayega uski ID ke sath
        card.onclick = () => window.location.href = `product.html?id=${prod.id}`;
        
        // Homepage par sirf array ki Pehli [0] picture show hogi
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
    // URL se product ki ID nikalna (e.g., product.html?id=2)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    // ID ke zariye JSON se product dhoondna
    selectedProduct = allProducts.find(p => p.id === productId);

    if (selectedProduct) {
        document.getElementById("prodTitle").innerText = selectedProduct.name;
        document.getElementById("prodPrice").innerText = "Rs. " + selectedProduct.price;
        document.getElementById("prodDesc").innerText = selectedProduct.description;
        
        // Setup Images Slider
        productImages = selectedProduct.images;
        showSlide(0);
        
        // Start Auto Slider (Har 5 second baad picture change)
        if(productImages.length > 1) {
            autoSlideInterval = setInterval(() => changeSlide(1), 5000);
        } else {
            // Agar ek hi picture hai tou buttons hide kar do
            document.querySelector(".prev").style.display = "none";
            document.querySelector(".next").style.display = "none";
        }
    } else {
        document.getElementById("prodTitle").innerText = "Product Not Found!";
    }
}

// Next / Previous Button Logic
function changeSlide(direction) {
    currentSlideIndex += direction;
    
    // Agar last picture pe next dabaye tou wapis pehli pe aa jaye
    if (currentSlideIndex >= productImages.length) { currentSlideIndex = 0; }
    if (currentSlideIndex < 0) { currentSlideIndex = productImages.length - 1; }
    
    showSlide(currentSlideIndex);

    // Jab user khud button dabaye tou auto-slider timer reset ho jaye (taake double skip na ho)
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
        alert("Please details mukammal fill karein!");
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
    alert("Shukriya! Aapka order WhatsApp par receive ho gaya hai.");
}
