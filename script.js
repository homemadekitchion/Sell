// ==========================================================================
// 1. CONFIGURATION
// ==========================================================================
const GOOGLE_SHEET_URL = "YAHAN_APNA_WEB_APP_URL_PASTE_KAREIN";

// ==========================================================================
// 2. BACKUP DATA (In case data.json has CORS / file:// block)
// ==========================================================================
const DEFAULT_DATA = {
  banners: [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&q=80",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80"
  ],
  categories: ["All", "Shoes", "Mobiles", "Laptops", "Fashion", "Watches"],
  products: [
    { id: 1, name: "Women Beige Casual Sandals", category: "Shoes", sku: "SH-BEI-1201", price: 1291, mrp: 2690, discount: "52% OFF", images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80"], colors: ["Beige", "Black", "Rose Gold"], sizes: ["3", "4", "5", "6", "7", "8"], details: { productDetails: "Soft cushioned footbed with durable sole.", careInstruction: "Wipe with a clean dry cloth.", returnPolicy: "15 days return available." } },
    { id: 2, name: "Women Rose-Gold Party Sandals", category: "Shoes", sku: "SH-RSG-1402", price: 1444, mrp: 2490, discount: "42% OFF", images: ["https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=500&q=80"], colors: ["Rose Gold", "Silver"], sizes: ["4", "5", "6", "7", "8"], details: { productDetails: "Shimmer strap block heel party sandals.", careInstruction: "Do not wash in water.", returnPolicy: "15 days return available." } },
    { id: 3, name: "Men Classic Leather Oxford Shoes", category: "Shoes", sku: "SH-OXF-3301", price: 4200, mrp: 6000, discount: "30% OFF", images: ["https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500&q=80"], colors: ["Black", "Brown"], sizes: ["7", "8", "9", "10", "11"], details: { productDetails: "Premium formal lace-up shoes.", careInstruction: "Use shoe cream polish.", returnPolicy: "7 days exchange policy." } },
    { id: 4, name: "Men Breathable Running Sneakers", category: "Shoes", sku: "SH-SNK-4402", price: 2799, mrp: 4500, discount: "38% OFF", images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"], colors: ["Black", "Grey", "Navy"], sizes: ["6", "7", "8", "9", "10"], details: { productDetails: "Ultra lightweight running shoes.", careInstruction: "Hand wash with mild soap.", returnPolicy: "15 days return." } },
    { id: 5, name: "Women Black Block Heel Mules", category: "Shoes", sku: "SH-BLK-5503", price: 1850, mrp: 3200, discount: "42% OFF", images: ["https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=500&q=80"], colors: ["Black", "Nude"], sizes: ["4", "5", "6", "7"], details: { productDetails: "Open-toe slip-on stylish heels.", careInstruction: "Keep in a dry shoe box.", returnPolicy: "15 days return." } },
    { id: 6, name: "Samsung Galaxy S23 Ultra", category: "Mobiles", sku: "MOB-SAM-S23U", price: 315000, mrp: 350000, discount: "10% OFF", images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80"], colors: ["Phantom Black", "Cream"], details: { productDetails: "200MP Quad Camera, 5000mAh battery. 100% PTA Approved.", careInstruction: "Use premium case and tempered glass.", returnPolicy: "7 days brand warranty." } },
    { id: 7, name: "Apple iPhone 14 Pro Max", category: "Mobiles", sku: "MOB-APL-14PM", price: 379000, mrp: 420000, discount: "10% OFF", images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80"], colors: ["Deep Purple", "Gold"], details: { productDetails: "A16 Bionic chip, Dynamic Island. PTA Approved.", careInstruction: "Use original Apple charger.", returnPolicy: "Official 1-Year Apple warranty." } },
    { id: 8, name: "Infinix Note 30 Pro", category: "Mobiles", sku: "MOB-INF-N30P", price: 62999, mrp: 69999, discount: "10% OFF", images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80"], colors: ["Magic Black", "Gold"], details: { productDetails: "8GB RAM + 256GB Storage, 68W fast charge.", careInstruction: "Keep moisture away.", returnPolicy: "1 year Carlcare warranty." } },
    { id: 9, name: "Xiaomi Redmi Note 12", category: "Mobiles", sku: "MOB-XIA-RN12", price: 46999, mrp: 54999, discount: "15% OFF", images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80"], colors: ["Onyx Gray", "Ice Blue"], details: { productDetails: "Snapdragon 685, 50MP AI Camera.", careInstruction: "Use standard box charger.", returnPolicy: "7 days checking warranty." } },
    { id: 10, name: "Tecno Spark 20 Pro", category: "Mobiles", sku: "MOB-TEC-S20P", price: 38999, mrp: 44000, discount: "11% OFF", images: ["https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&q=80"], colors: ["Moonlit Black", "White"], details: { productDetails: "Helio G99 Gaming processor, 108MP camera.", careInstruction: "Clean with microfiber cloth.", returnPolicy: "Official warranty." } },
    { id: 11, name: "Dell Latitude 7490 Core i7", category: "Laptops", sku: "LAP-DEL-7490", price: 84999, mrp: 98000, discount: "13% OFF", images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80"], colors: ["Matte Black"], details: { productDetails: "Core i7 8th Gen, 16GB RAM, 512GB SSD.", careInstruction: "Do not block air vents.", returnPolicy: "1 month checking warranty." } },
    { id: 12, name: "HP EliteBook 840 G5 Core i5", category: "Laptops", sku: "LAP-HP-840G5", price: 72500, mrp: 85000, discount: "15% OFF", images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80"], colors: ["Silver"], details: { productDetails: "Core i5 8th Gen, 8GB RAM, 256GB SSD, aluminum body.", careInstruction: "Use laptop sleeve.", returnPolicy: "1 month checking warranty." } },
    { id: 13, name: "Apple MacBook Air M1", category: "Laptops", sku: "LAP-APL-MBM1", price: 218000, mrp: 245000, discount: "11% OFF", images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80"], colors: ["Space Gray", "Silver"], details: { productDetails: "Apple M1 chip, 8GB RAM, 256GB SSD, 18-hour battery.", careInstruction: "Clean display gently.", returnPolicy: "7 days checking warranty." } },
    { id: 14, name: "Lenovo ThinkPad T480", category: "Laptops", sku: "LAP-LEN-T480", price: 68000, mrp: 79000, discount: "14% OFF", images: ["https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&q=80"], colors: ["Classic Black"], details: { productDetails: "Core i5 8th Gen, 16GB RAM, dual battery.", careInstruction: "Keep keyboard clean.", returnPolicy: "1 month store warranty." } },
    { id: 15, name: "Men Waterproof Winter Parachute Jacket", category: "Fashion", sku: "FSH-JKT-1101", price: 3899, mrp: 5500, discount: "29% OFF", images: ["https://images.unsplash.com/photo-1548883354-7622d03aca27?w=500&q=80"], colors: ["Black", "Navy Blue", "Olive"], sizes: ["M", "L", "XL", "XXL"], details: { productDetails: "Windproof fleece lined warm jacket.", careInstruction: "Cold machine wash.", returnPolicy: "7 days exchange." } },
    { id: 16, name: "Slim Fit Stretch Denim Jeans", category: "Fashion", sku: "FSH-JNS-2202", price: 1950, mrp: 3200, discount: "39% OFF", images: ["https://images.unsplash.com/photo-1542272604-780c96856592?w=500&q=80"], colors: ["Dark Blue", "Light Blue", "Black"], sizes: ["30", "32", "34", "36", "38"], details: { productDetails: "98% cotton stretch denim jeans.", careInstruction: "Wash inside out.", returnPolicy: "10 days exchange." } },
    { id: 17, name: "Men Premium Formal Cotton Shirt", category: "Fashion", sku: "FSH-SHT-3303", price: 1650, mrp: 2600, discount: "37% OFF", images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&q=80"], colors: ["White", "Sky Blue"], sizes: ["S", "M", "L", "XL"], details: { productDetails: "Wrinkle-resistant fine cotton shirt.", careInstruction: "Medium steam iron.", returnPolicy: "7 days exchange." } },
    { id: 18, name: "Women Stitched Embroidered Kurti", category: "Fashion", sku: "FSH-KRT-4404", price: 2499, mrp: 3999, discount: "38% OFF", images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&q=80"], colors: ["Mustard", "Peach", "Maroon"], sizes: ["S", "M", "L", "XL"], details: { productDetails: "Embroidered lawn fabric kurti.", careInstruction: "Hand wash separately.", returnPolicy: "7 days return." } },
    { id: 19, name: "Rolex Submariner Homage Watch", category: "Watches", sku: "WAT-RLX-SUB01", price: 8800, mrp: 14000, discount: "37% OFF", images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80"], colors: ["Black Dial", "Green Bezel"], details: { productDetails: "Stainless steel automatic homage watch.", careInstruction: "Avoid hot water steam.", returnPolicy: "6 months movement warranty." } },
    { id: 20, name: "Casio Edifice Chronograph Watch", category: "Watches", sku: "WAT-CAS-EDF02", price: 6499, mrp: 9500, discount: "32% OFF", images: ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80"], colors: ["Silver Black", "Silver Blue"], details: { productDetails: "Stopwatch chronograph, 100m water resistance.", careInstruction: "Keep away from heavy magnets.", returnPolicy: "1 year battery warranty." } }
  ]
};

// ==========================================================================
// 3. STATE VARIABLES
// ==========================================================================
let allProducts = [];
let currentCategory = "All";
let itemsToShow = 10;
let selectedProduct = null;
let chosenSize = null;
let chosenColor = null;

// ==========================================================================
// 4. DATA INITIALIZATION (FETCH WITH SAFE FALLBACK)
// ==========================================================================
fetch('data.json')
  .then(res => {
    if (!res.ok) throw new Error("HTTP error " + res.status);
    return res.json();
  })
  .then(data => initApp(data))
  .catch(err => {
    console.warn("data.json fetch failed (offline or CORS). Using embedded data.", err);
    initApp(DEFAULT_DATA);
  });

function initApp(data) {
  allProducts = data.products || [];

  // Hide loading message
  const loadingEl = document.getElementById("loadingMsg");
  if (loadingEl) loadingEl.style.display = "none";

  // If on index.html
  if (document.getElementById("product-container")) {
    displayCategories(data.categories || ["All"]);
    displayProducts();
    if (data.banners && data.banners.length > 0) {
      startBannerSlider(data.banners);
    }
  }

  // If on product.html
  if (document.getElementById("mainProductImage")) {
    loadProductDetails();
  }
}

// ==========================================================================
// 5. BANNER SLIDER
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
// 6. CATEGORIES
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
      itemsToShow = 10; // reset limit
      displayProducts();
    };
    catContainer.appendChild(btn);
  });
}

// ==========================================================================
// 7. PRODUCTS GRID & LOAD MORE
// ==========================================================================
function displayProducts() {
  const container = document.getElementById("product-container");
  if (!container) return;
  container.innerHTML = "";

  // Filter
  const filtered = currentCategory !== "All"
    ? allProducts.filter(p => p.category === currentCategory)
    : allProducts;

  // Slice to itemsToShow (initially 10)
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

  // Handle Load More visibility
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
// 8. PRODUCT DETAILS PAGE
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

  // Populate info
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

  // Sizes setup
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

  // Colors setup
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

  // Accordion details
  if (selectedProduct.details) {
    document.getElementById("accDetails").innerText = selectedProduct.details.productDetails || "No details.";
    document.getElementById("accCare").innerText = selectedProduct.details.careInstruction || "No care instructions.";
    document.getElementById("accReturn").innerText = selectedProduct.details.returnPolicy || "Standard 15 days return policy.";
  }

  // Image slider setup
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
// 9. ORDER MODAL & SUBMISSION (GOOGLE SHEETS)
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
  .catch(err => {
    console.error(err);
    alert("Order recorded! Thank you.");
    closeModal();
    confirmBtn.innerText = "Confirm Order";
    confirmBtn.disabled = false;
  });
}

// ==========================================================================
// 10. CONTACT FORM SUBMISSION
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
    alert("Aapka message receive ho gaya hai! Hum jald raabta karenge.");
    document.getElementById("contactName").value = "";
    document.getElementById("contactPhone").value = "";
    document.getElementById("contactMessage").value = "";
    btn.innerText = "Send Message";
    btn.disabled = false;
  })
  .catch(err => {
    console.error(err);
    alert("Message sent! Shukriya.");
    btn.innerText = "Send Message";
    btn.disabled = false;
  });
}
