// ------------------- Product Load -------------------
let products = []; // make products global

(async function () {
    try {
        const response = await fetch(
            `${ENV.API_BASE_URL}/api/products/?landing_page_code=${ENV.PRODUCT_LANDING_PAGE_ID}`
        );
        const response_data = await response.json();

        if (!response_data.status || !response_data.data.length) {
            throw new Error("No product found");
        }

        const data = response_data.data;

        const mainProduct = data[0];
        const subProducts = data.slice(1);

        window.mainProduct = mainProduct;
        window.subProducts = subProducts;

    } catch (error) {
        console.error("Product load failed:", error);
    }
})();

// ------------------- Number Conversion -------------------
function toBanglaNumber(number) {
    const eng = "0123456789";
    const bang = "০১২৩৪৫৬৭৮৯";
    return number.toString().split("").map(d => bang[eng.indexOf(d)] || d).join("");
}
function toEnglishNumber(number) {
    const bang = "০১২৩৪৫৬৭৮৯";
    const eng = "0123456789";
    return number.toString().split("").map(d => eng[bang.indexOf(d)] || d).join("");
}

// ------------------- Image Gallery -------------------
const headerImage = document.getElementById('header-image');
const galleryImages = document.querySelectorAll('.gallery-image');
galleryImages.forEach(img => {
    img.addEventListener('click', () => {
        const header_image = headerImage.src;
        const gallery_image = img.src;
        headerImage.src = gallery_image;
        img.src = header_image;
    });
});

// ------------------- District Fetch -------------------
const districtSelect = document.getElementById("deliverydistrict");
fetch('https://bdapi.vercel.app/api/v.1/district')
    .then(response => response.json())
    .then(data => {
        if (data.status === 200 && data.success) {
            data.data.forEach(district => {
                const option = document.createElement('option')
                option.value = district.name.toLowerCase()
                option.setAttribute('district_id', district.id);
                option.textContent = district.bn_name
                districtSelect.appendChild(option)
            });
        }
    })
    .catch(error => console.log('Error fetching district:', error));

// ------------------- Modal Open & Close -------------------
const openBtns = document.querySelectorAll('.openOrderModal');
const modal = document.getElementById('orderModal');
const closeBtn = document.querySelector('.close-btn');

const apiFetch = async (url, { method = 'GET', body, headers = {} } = {}) =>
    await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: body ? JSON.stringify(body) : undefined
    })
        .then(r => r.ok ? r.json() : Promise.reject(r))
        .catch(err => { console.log('API error:', err); return null; });

openBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
        const data = await apiFetch(`${ENV.API_BASE_URL}/api/products/?landing_page_code=${ENV.PRODUCT_LANDING_PAGE_ID}`);
        products = data.data; // <-- global

        const grid = document.getElementById("productCardGrid");
        grid.innerHTML = "";

        products.forEach((product, index) => {
            const card = document.createElement("div");
            card.className = `product-card selectable ${index === 0 ? "active" : ""}`;
            card.dataset.type = product.name;

            card.innerHTML = `
                <div class="card-info">
                    <p hidden class="product-id">${product.id}</p>
                    <h4>${product.name}</h4>
                    <p>৳ <del>${toBanglaNumber(product.price)}</del> <span class="unit-price">${toBanglaNumber(product.discount_price)}</span></p>
                </div>
                <div class="qty-control">
                    <button type="button" class="qty-btn minus" data-product-id="${product.id}">−</button>
                    <span class="qty-value" id="${product.id}Qty" name="${product.id}Qty" min="0">${index === 0 ? "1" : "0"}</span>
                    <button type="button" class="qty-btn plus" data-product-id="${product.id}">+</button>
                </div>
            `;
            grid.appendChild(card);
        });

        setupModalProducts(products);

        const productPrice = document.getElementById("productPrice");
        const content_ids = [String(productPrice.dataset.productId)];
        const content_name = "Cradle - Baby Product";
        const contentValue = parseFloat(toEnglishNumber(productPrice.textContent || 0));
        FacebookAddToCartEvent(content_ids, content_name, contentValue);

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

// ------------------- Delivery Charge -------------------
function getProductDeliveryCharge(product, district) {
    const dc = product.delivery_charge;
    if (!dc) return district === "dhaka" ? 80 : 120;
    if (dc.area_and_charge?.all !== undefined) return dc.area_and_charge.all;
    if (dc.all !== undefined) return dc.all;

    const areaSets = ["area-set-1", "area-set-2", "area-set-3"];
    const area_and_charge = dc.area_and_charge
    for (const key of areaSets) {
        if (!area_and_charge[key]) continue;
        const { area, charge } = area_and_charge[key];
        if (area.includes("all") || area.includes(district)) return charge;
    }
    return district === "dhaka" ? 80 : 120;
}
function calculateDeliveryChargeFromSummary(district, quantities) {
    let highestCharge = 0;
    products.forEach(product => {
        const qty = quantities[product.id] || 0;
        if (qty > 0) {
            const charge = getProductDeliveryCharge(product, district);
            highestCharge = Math.max(highestCharge, charge);
        }
    });
    return highestCharge;
}

// ------------------- Modal Products & Summary -------------------
function setupModalProducts(products) {
    const productSummary = document.getElementById("productSummary");
    const productTotalEl = document.getElementById("productTotal");
    const summaryTotalEl = document.getElementById("summaryTotal");
    const deliveryChargeEl = document.getElementById("summaryDelivery");

    let quantities = {};
    products.forEach((product, index) => quantities[product.id] = index === 0 ? 1 : 0);

    function updateSummary() {
        productSummary.innerHTML = "";
        let productTotal = 0;

        products.forEach(product => {
            const qty = quantities[product.id];
            if (qty <= 0) return;
            const total_amount = qty * product.discount_price;
            productTotal += total_amount;
            productSummary.appendChild(createRow(product.name, product.id, qty, product.discount_price, total_amount, "MAIN"));

            (product.gift_product || []).forEach(gift => {
                const giftProd = gift.gift_product;
                let giftUnitPrice = giftProd.discount_price;
                if (gift.gift_type === "FREE") giftUnitPrice = 0;
                else if (gift.gift_type === "FLAT") giftUnitPrice -= gift.value;
                else if (gift.gift_type === "PERCENTAGE") giftUnitPrice *= (1 - gift.value / 100);
                if (giftUnitPrice < 0) giftUnitPrice = 0;

                const giftTotal = giftUnitPrice * qty;
                productTotal += giftTotal;

                let giftTitle = giftProd.name;
                if (gift.gift_type === "FREE") giftTitle += " (FREE)";
                else if (gift.gift_type === "FLAT") giftTitle += ` (−৳${gift.value})`;
                else if (gift.gift_type === "PERCENTAGE") giftTitle += ` (${gift.value}% OFF)`;

                productSummary.appendChild(createRow(giftTitle, giftProd.id, qty, giftUnitPrice, giftTotal, "FREE", product.id));
            });
        });

        const currentDistrict = districtSelect.value.toLowerCase();
        const deliveryCharge = calculateDeliveryChargeFromSummary(currentDistrict, quantities);
        deliveryChargeEl.innerText = deliveryCharge;

        productTotalEl.innerText = productTotal;
        summaryTotalEl.innerText = productTotal + deliveryCharge;
    }

    districtSelect.addEventListener("change", updateSummary);

    products.forEach(product => {
        const card = document.querySelector(`.product-card[data-type='${product.name}']`);
        const minusBtn = card.querySelector(".minus");
        const plusBtn = card.querySelector(".plus");
        const qtyEl = card.querySelector(".qty-value");

        minusBtn.addEventListener("click", () => {
            if (quantities[product.id] > 0) quantities[product.id]--;
            qtyEl.innerText = quantities[product.id];
            if (quantities[product.id] === 0) card.classList.remove("active");
            updateSummary();
        });

        plusBtn.addEventListener("click", () => {
            quantities[product.id]++;
            qtyEl.innerText = quantities[product.id];
            card.classList.add("active");
            updateSummary();
        });
    });

    function createRow(title, product_id, qty, unit_amount, total_amount, product_type, reference_id = null) {
        const row = document.createElement("div");
        row.className = "summary-row";
        row.dataset.productId = product_id;
        row.dataset.referenceId = reference_id;
        row.dataset.productType = product_type;
        row.dataset.productUnitPrice = unit_amount;
        row.innerHTML = `
            <span class="product_name">${title}</span>
            <div class="right-meta">
                <span class="qty-wrap">x <span class="qty">${qty}</span></span>
                <span class="price">৳ <span class="total_amount">${total_amount}</span></span>
            </div>
        `;
        return row;
    }

    updateSummary();
}

// ------------------- Modal Close -------------------
closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
});
let lockModal = false;
modal.addEventListener('click', (e) => {
    if (lockModal) return;
    if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ------------------- Order Complete Card -------------------
function OrderCompleteCard() {
    const thankYouCard = document.createElement("div");
    thankYouCard.style.textAlign = "center";
    thankYouCard.style.padding = "30px 20px";
    thankYouCard.style.background = "#fff";
    thankYouCard.style.borderRadius = "20px";
    thankYouCard.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
    thankYouCard.innerHTML = `
        <h2>ধন্যবাদ!</h2>
        <p>আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে।</p>
        <p>হোমপেজে রিডিরেক্ট হবে <span id="countdown">10</span> সেকেন্ডে...</p>
        <a href="https://wa.me/${ENV.WHATSAPP_NUMBER}" target="_blank" class="btn btn-primary" 
        style="margin-top: 20px; display: inline-block;">
        Contact with WhatsApp
        </a>
    `;
    return thankYouCard;
}

// ------------------- Order Submit -------------------
function isValidBDPhoneNew(phone) {
    return /^(?:\+88)?01\d{9}$/.test(phone.replace(/\s+/g, ""));
}

// --- Remaining order submit code stays exactly the same ---