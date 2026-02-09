(async function () {
    try{
        const response = await fetch(`${ENV.API_BASE_URL}/api/product/`);
        const response_data = await response.json()
        const data = response_data.data[0]

        document.getElementById("header-image").src = data.images[0].image;
        document.querySelectorAll(".product-old-price").forEach(el => {
            el.textContent = toBanglaNumber(Math.floor(data.price));
        });
        document.querySelectorAll(".product-new-price").forEach(el => {
            el.textContent = toBanglaNumber(Math.floor(data.discount_price));
        })
        FacebookViewContentEvent(data.name, data.discount_price, data.id)
    } catch (e) {
        console.log("Product fetch errro:", e);
    }
})();

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


const headerImage = document.getElementById('header-image');
const galleryImages = document.querySelectorAll('.gallery-image');
galleryImages.forEach(img => {
    img.addEventListener('click', () => {
        header_image = headerImage.src;
        gallery_image = img.src;
        headerImage.src = img.src;
        img.src = header_image;
    });
});



// *** District List Fetch ***
const districtSelect = document.getElementById("deliverydistrict");
fetch('https://bdapi.vercel.app/api/v.1/district').then(response => response.json()).then(data => {
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
.catch(error => console.log('Error fetching district:', error))
// districtSelect.addEventListener("change", function(){
//     const district = this.value;
//     if (!district) return;
//     // fetchDeliveryCharge({ district });
// })




// Order Form Modal Open & Close Script Start=================================
const openBtns = document.querySelectorAll('.openOrderModal');
const modal = document.getElementById('orderModal');
const closeBtn = document.querySelector('.close-btn');

const apiFetch = async (url, { method='GET', body, headers={} } = {}) =>
    await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: body ? JSON.stringify(body) : undefined
    })
    .then(r => r.ok ? r.json() : Promise.reject(r))
    .catch(err => { console.log('API error:', err); return null; });


openBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
        // Fetch products
        const data = await apiFetch(`${ENV.API_BASE_URL}/api/product/`);
        products = data.data

        // Create Grid
        const grid = document.getElementById("productCardGrid");
        grid.innerHTML = "";

        // Render products dynamically
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

        // Initialize quantities and summary
        setupModalProducts(products);


        // ----- PIXEL ADD TO CART SETUP -----
        productPrice = document.getElementById("productPrice");
        content_ids = [String(productPrice.dataset.productId)];
        content_name = "Cradle - Baby Product";
        contentValue = parseFloat(toEnglishNumber(productPrice.textContent || 0));
        FacebookAddToCartEvent(content_ids, content_name, contentValue);

        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});




function getProductDeliveryCharge(product, district) {
    const dc = product.delivery_charge;
    if (!dc) {
        return district === "dhaka" ? 80 : 120;
    }
    if (dc.area_and_charge?.all !== undefined) {
        return dc.area_and_charge.all;
    }
    if (dc.all !== undefined) {
        return dc.all;
    }

    // Area-set priority order
    const areaSets = ["area-set-1", "area-set-2", "area-set-3"];
    area_and_charge = dc.area_and_charge
    for (const key of areaSets) {
        if (!area_and_charge[key]) continue;

        const { area, charge } = area_and_charge[key];
        if (
            area.includes("all") ||
            area.includes(district)
        ) {
            return charge;
        }
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

function setupModalProducts(){
    // ---------- Summary Elements ----------
    const productSummary = document.getElementById("productSummary");
    const productTotalEl = document.getElementById("productTotal");
    const summaryTotalEl = document.getElementById("summaryTotal");
    const deliveryChargeEl = document.getElementById("summaryDelivery");

    // Initialize quantities
    let quantities = {};
    products.forEach((product, index) => {
        quantities[product.id] = index === 0 ? 1 : 0;
    });


    // DELIVERY CHARGE CALCULATE 
    let deliveryCharge = calculateDeliveryChargeFromSummary(
        document.getElementById("deliverydistrict").value, quantities
    );
    deliveryChargeEl.innerText = deliveryCharge;
    document.getElementById("deliverydistrict").addEventListener("change", function () {
        deliveryCharge = calculateDeliveryChargeFromSummary(this.value, quantities);
        deliveryChargeEl.innerText = deliveryCharge;
        updateSummary();
    });
    

    // Setup qty buttons
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

    function updateSummary() {
        productSummary.innerHTML = "";
        let productTotal = 0;

        products.forEach(product => {
            const qty = quantities[product.id];
            if (qty > 0) {
                // --- Main product ---
                const total_amount = qty * product.discount_price;
                productTotal += total_amount;
                productSummary.appendChild(createRow(product.name, product.id, qty, product.discount_price, total_amount, "MAIN"));

                // --- Gift products ---
                const gift_products = product.gift_product || [];
                gift_products.forEach(gift => {
                    const giftProd = gift.gift_product;
                    let giftUnitPrice = giftProd.discount_price;

                    // Apply gift_type discount
                    if (gift.gift_type === "FREE") {
                        giftUnitPrice = 0;
                    } else if (gift.gift_type === "FLAT") {
                        giftUnitPrice -= gift.value; // subtract flat discount
                        if (giftUnitPrice < 0) giftUnitPrice = 0;
                    } else if (gift.gift_type === "PERCENTAGE") {
                        giftUnitPrice = giftUnitPrice * (1 - gift.value / 100);
                    }

                    const giftTotal = giftUnitPrice * qty; // multiply by parent product qty
                    productTotal += giftTotal;

                    // Add row to summary
                    let giftTitle = giftProd.name;
                    if (gift.gift_type === "FREE") giftTitle += " (FREE)";
                    else if (gift.gift_type === "FLAT") giftTitle += ` (−৳${gift.value})`;
                    else if (gift.gift_type === "PERCENTAGE") giftTitle += ` (${gift.value}% OFF)`;

                    productSummary.appendChild(
                        createRow(giftTitle, giftProd.id, qty, giftUnitPrice, giftTotal, "FREE", product.id)
                    );
                });
            }
        });

        deliveryCharge = calculateDeliveryChargeFromSummary(
            document.getElementById("deliverydistrict").value,
            quantities
        );
        deliveryChargeEl.innerText = deliveryCharge;

        productTotalEl.innerText = productTotal;
        summaryTotalEl.innerText = productTotal + deliveryCharge;
    }

    function createRow(title, product_id, qty, unit_amount, total_amount, product_type, reference_id=null) {
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


function OrderCompleteCard(){
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

document.getElementById("orderForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const modalContent = document.querySelector(".modal-content");
    const loader = document.getElementById("pageLoader");
    const submitBtn = document.getElementById("submitBtn");
    loader.classList.remove("hidden");
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> প্রসেসিং...';
    
    function getProductJSON() {
        const allRows = productSummary.querySelectorAll(".summary-row");
        const contents = [];
        allRows.forEach(row => {
            const product_id = row.dataset.productId;
            const product_type = row.dataset.productType;
            const reference_id = row.dataset.referenceId;
            const product_unit_price = row.dataset.productUnitPrice;
            const product_title = row.querySelector(".product_name")?.textContent.trim() || "";
            const qty = Number(row.querySelector(".qty")?.textContent) || 0;
            const total_amount = parseFloat(row.querySelector(".total_amount")?.textContent) || 0;
            contents.push({
                product_type: product_type,
                reference_product: reference_id,
                id: product_id,
                name: product_title,
                price: product_unit_price,
                quantity: qty,
                total_amount: total_amount
            });
        });
        return contents;
    }
    function getCustomerJSON(){
        customer_details = {
            name: document.getElementById("name").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            district: document.getElementById("deliverydistrict").value.trim(),
            address: document.getElementById("address").value.trim(),
        }
        return customer_details
    }
    function getAmountJSON(){
        return {
            productTotal: parseFloat(document.getElementById("productTotal").textContent),
            deliveryCharge: Number(document.getElementById("summaryDelivery").textContent),
            totalAmount: parseFloat(document.getElementById('summaryTotal').textContent || 0),
        }
    }
    
    if (!getCustomerJSON().name || !getCustomerJSON().phone || !getCustomerJSON().district || !getCustomerJSON().address) {
        alert("অনুগ্রহ করে সমস্ত গ্রাহক তথ্য পূরণ করুন।");
        loader.classList.add("hidden");
        submitBtn.disabled = false;
        submitBtn.innerHTML = "অর্ডার কনফার্ম করুন";
        return;
    }
    if (getProductJSON().length === 0) {
        alert("অনুগ্রহ করে অন্তত একটি পণ্য নির্বাচন করুন।");
        loader.classList.add("hidden");
        submitBtn.disabled = false;
        submitBtn.innerHTML = "অর্ডার কনফার্ম করুন";
        return;
    }
    if (getAmountJSON().totalAmount <= 0) {
        alert("অবৈধ অর্ডার পরিমাণ। দয়া করে পণ্য এবং পরিমাণ পরীক্ষা করুন।");
        loader.classList.add("hidden");
        submitBtn.disabled = false;
        submitBtn.innerHTML = "অর্ডার কনফার্ম করুন";
        return;
    }

    // ----- PIXEL INITIATE CHECKOUT SETUP -----
    const product_details_for_event_send = function getProductJsonForEventSend(){
        const allRows = productSummary.querySelectorAll(".summary-row");
        const contents = [];
        allRows.forEach(row => {
            const product_id = row.dataset.productId;
            const product_unit_price = row.dataset.productUnitPrice;
            const product_title = row.querySelector(".product_name")?.textContent.trim() || "";
            const qty = Number(row.querySelector(".qty")?.textContent) || 0;
            contents.push({
                id: product_id,
                name: product_title,
                quantity: qty,
                price: product_unit_price,
            });
        });
        return contents;
    };
    summaryTotal = parseFloat(document.getElementById('summaryTotal').textContent || 0);
    // FacebookInitiateCheckEvent(product_details_for_event_send(), summaryTotal);
    GAInitiateCheckoutEvent(product_details_for_event_send(), summaryTotal);
    
    const formData = {
        customer: getCustomerJSON(),
        products: getProductJSON(),
        amount: getAmountJSON(),
        note: document.getElementById("note").value.trim() || "No Note Is Provided From Client",
    };
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        // ----- ALTERNATIVE ORDER SUBMISSION METHOD -----
        const response = await fetch(`${ENV.API_BASE_URL}/api/create-order/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(formData)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        if (data.success){
            // ----- PIXEL PURCHASE SETUP -----
            // FacebookPurchaseEvent(product_details_for_event_send(), summaryTotal);
            GAInitiatePurchaseEvent(product_details_for_event_send(), summaryTotal);
            
            lockModal = true;
            modalContent.innerHTML = "";
            modalContent.appendChild(OrderCompleteCard());
            loader.classList.add("hidden");
            document.body.style.overflow = 'hidden';
            

            let countdown = 5;
            const countdownEl = document.getElementById("countdown");
            const interval = setInterval(() => {
                countdown -= 1;
                countdownEl.textContent = countdown;
                if (countdown <= 0) {
                    clearInterval(interval);
                    window.location.href = "/";
                }
            }, 1000);
        } else{
            alert("অর্ডার সাবমিট করতে সমস্যা হয়েছে! দয়া করে আবার চেষ্টা করুন।\n" + data.message);
            loader.classList.add("hidden");
            submitBtn.disabled = false;
            submitBtn.innerHTML = "অর্ডার কনফার্ম করুন";
        }
    } catch (err) {
        alert("অর্ডার সাবমিট করতে সমস্যা হয়েছে! দয়া করে আবার চেষ্টা করুন।\n" + err.message);
        loader.classList.add("hidden");
        submitBtn.disabled = false;
        submitBtn.innerHTML = "অর্ডার কনফার্ম করুন";
    }
});

// Order Form Modal Open & Close Script End=================================
