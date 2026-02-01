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



// // Product Summary Update When increase and decrease product quantity====
document.addEventListener("DOMContentLoaded", () => {
    // ---------- Prices ----------
    const CRADLE_PRICE = parseInt(
        document.getElementById("cradle-unit-price").textContent.replace(/[^0-9]/g, "")
    );
    const CHAIR_PRICE = parseInt(
        document.getElementById("chair-unit-price").textContent.replace(/[^0-9]/g, "")
    );

    // ---------- Summary Elements ----------
    const productSummary = document.getElementById("productSummary");
    const productTotalEl = document.getElementById("productTotal");
    const summaryTotalEl = document.getElementById("summaryTotal");
    const deliveryChargeEl = document.getElementById("summaryDelivery");

    let deliveryCharge = parseInt(deliveryChargeEl.textContent.replace(/[^0-9]/g, "")) || 100;
    document.getElementById("deliverydistrict").addEventListener("change", function(){
        const charge = (this.value === "dhaka") ? 80 : 120;
        deliveryCharge = charge;
        deliveryChargeEl.innerText = charge;
        updateSummary();
    });


    // ---------- Quantity Elements ----------
    const cradleCard = document.querySelector(".product-card[data-type='cradle']");
    const chairCard = document.querySelector(".product-card[data-type='chair']");

    const cradleQtyEl = cradleCard.querySelector(".qty-value");
    const chairQtyEl = chairCard.querySelector(".qty-value");

    let cradleQty = parseInt(cradleQtyEl.innerText);
    let chairQty = parseInt(chairQtyEl.innerText);

    // ---------- Quantity Buttons ----------
    function setupQty(card, type) {
        const minusBtn = card.querySelector(".minus");
        const plusBtn = card.querySelector(".plus");
        const qtyEl = card.querySelector(".qty-value");

        let qty = parseInt(qtyEl.innerText);

        plusBtn.addEventListener("click", () => {
            qty++;
            qtyEl.innerText = qty;
            card.classList.add("active");
            onQuantityChange(type, qty);
        });
        minusBtn.addEventListener("click", () => {
            if (qty > 0) qty--;
            qtyEl.innerText = qty;
            if (qty === 0) card.classList.remove("active");
            onQuantityChange(type, qty);
        });
    }
    setupQty(cradleCard, "cradle");
    setupQty(chairCard, "chair");

    // ---------- Update Summary ----------
    function onQuantityChange(type, value) {
        if (type === "cradle") cradleQty = value;
        if (type === "chair") chairQty = value;
        updateSummary();
    }

    function updateSummary() {
        productSummary.innerHTML = "";
        let productTotal = 0;
        if (cradleQty > 0) {
            const cradleProductId = document.getElementById("cradle-product-id").textContent;
            const cradleAmount = cradleQty * CRADLE_PRICE;
            productTotal += cradleAmount;
            productSummary.appendChild(createRow("Cradle / Table", cradleProductId, cradleQty, CRADLE_PRICE, cradleAmount));
        }
        if (chairQty > 0) {
            const chairProductId = document.getElementById("chair-product-id").textContent;
            const chairAmount = chairQty * CHAIR_PRICE;
            productTotal += chairAmount;
            productSummary.appendChild(createRow("Chair", chairProductId, chairQty, CHAIR_PRICE, chairAmount));
        }
        productTotalEl.innerText = productTotal;
        summaryTotalEl.innerText = productTotal + deliveryCharge;
    }

    function createRow(title, product_id, qty, unit_amount, total_amount) {
        const row = document.createElement("div");
        row.className = "summary-row";
        row.dataset.productId = product_id;
        row.dataset.productUnitPrice = unit_amount;
        row.innerHTML = `
            <span class="product_name">${title}</span>
            <span>x <span class="qty">${qty}</span></span>
            <span>৳ <span class="total_amount">${total_amount}</span></span>
        `;
        return row;
    }

    updateSummary();

});

// *** District List Fetch ***
const districtSelect = document.getElementById('deliverydistrict');
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
.catch(error => console.error('Error fetching district:', error))
districtSelect.addEventListener("change", function(){
    const district = this.value;
    if (!district) return;
    // fetchDeliveryCharge({ district });
})




// Order Form Modal Open & Close Script Start=================================
const openBtns = document.querySelectorAll('.openOrderModal');
const modal = document.getElementById('orderModal');
const closeBtn = document.querySelector('.close-btn');

openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
});

// modal.addEventListener('click', (e) => {
//     if (e.target === modal) {
//         modal.classList.remove('active');
//         document.body.style.overflow = '';
//     }
// });
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
        <a href="https://wa.me/8801775155760" target="_blank" class="btn btn-primary" 
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
    
    function getProductsJSON() {
        const allRows = productSummary.querySelectorAll(".summary-row");
        const products = [];

        allRows.forEach(row => {
            const product_id = row.dataset.productId;
            const product_unit_price = row.dataset.productUnitPrice;
            const product_title = row.querySelector(".product_name")?.textContent.trim() || "";
            const qty = Number(row.querySelector(".qty")?.textContent) || 0;
            const total_amount = parseFloat(row.querySelector(".total_amount")?.textContent) || 0;

            products.push({
                id: product_id,
                name: product_title,
                price: product_unit_price,
                quantity: qty,
                total_amount: total_amount
            });
        });

        return products;
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
            // productTotal: parseFloat(productTotalEl.textContent || 0),
            productTotal: parseFloat(document.getElementById("productTotal").textContent),
            deliveryCharge: Number(document.getElementById("summaryDelivery").textContent),
            totalAmount: parseFloat(document.getElementById('summaryTotal').textContent || 0),
        }
    }
    const formData = {
        customer: getCustomerJSON(),
        products: getProductsJSON(),
        amount: getAmountJSON(),
        note: document.getElementById("note").value.trim() || "No Note Is Provided From Client",
    };
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        // const response = await fetch("https://crm-server-kappa.vercel.app/api/orders", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //         "Accept": "application/json"
        //     },
        //     body: JSON.stringify(formData)
        // });

        // if (!response.ok) {
        //     const errorText = await response.text();
        //     throw new Error(`Server error: ${response.status} - ${errorText}`);
        // }

        // const data = await response.json();

        lockModal = true;
        modalContent.innerHTML = "";
        modalContent.appendChild(OrderCompleteCard());
        loader.classList.add("hidden");
        document.body.style.overflow = 'hidden';

        let countdown = 10;
        const countdownEl = document.getElementById("countdown");
        const interval = setInterval(() => {
            countdown -= 1;
            countdownEl.textContent = countdown;
            if (countdown <= 0) {
                clearInterval(interval);
                window.location.href = "/";
            }
        }, 1000);
        // window.location.href = "/thank-you";
    } catch (err) {
        alert("অর্ডার সাবমিট করতে সমস্যা হয়েছে! দয়া করে আবার চেষ্টা করুন।\n" + err.message);
        loader.classList.add("hidden");
        submitBtn.disabled = false;
        submitBtn.innerHTML = "অর্ডার কনফার্ম করুন";
    }
});

// Order Form Modal Open & Close Script End=================================
