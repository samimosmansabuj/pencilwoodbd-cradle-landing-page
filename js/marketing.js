// ==================================================================================================
// *********//////////====Facebook Pixel and Event Tracking Function=====/////////////***************

// Main Pixel Setup Code Dynamic Event Tracking Function ========== 
// (async function () {
//     try {
//         const res = await fetch(`${ENV.API_BASE_URL}/api/pixel-settings/`);
//         const data = await res.json();

//         const pixelId = data.FACEBOOK_PIXEL_ID;
//         if (!pixelId) return;

//         fbq('init', pixelId);
//         fbq('track', 'PageView');

//         // noscript
//         const noscript = document.createElement("noscript");
//         noscript.innerHTML = `
//     <img height="1" width="1" style="display:none"
//         src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />
//     `;
//         document.body.appendChild(noscript);

//         FacebookViewContentEvent()
//     } catch (e) {
//         // console.log("Pixel error:", e);
//     }
// })();


// View Content Event Tracking Function ========== 
function FacebookViewContentEvent(productName, productPrice, productIds) {
    if (typeof fbq !== 'function') return;
    fbq('track', 'ViewContent', {
        content_ids: [String(productIds)],
        content_name: productName,
        content_type: 'product',
        value: parseFloat(productPrice || 0),
        currency: 'BDT'
    });
    // productPrice = document.getElementById("productPrice");
    // if (typeof fbq !== 'function') return;
    // fbq('track', 'ViewContent', {
    //     content_ids: [String(productPrice.dataset.productId)],
    //     content_name: "Cradle - Baby Product",
    //     content_type: 'product',
    //     value: parseFloat(productPrice.textContent || 0),
    //     currency: 'BDT'
    // });
}
function FacebookAddToCartEvent(content_ids, content_name, value) {
    if (typeof fbq !== 'function') return;
    fbq('track', 'AddToCart', {
        content_ids: content_ids,
        content_name: content_name,
        content_type: 'product',
        value: value,
        currency: 'BDT'
    });
}

function FacebookInitiateCheckEvent(contents, value) {
    if (typeof fbq !== 'function') return;
    fbq('track', 'InitiateCheckout', {
        contents: contents,
        content_type: 'product',
        value: Number(value),
        currency: 'BDT'
    });
}
function GAInitiateCheckoutEvent(products, total) {
    if (!products?.length) return;
    items = products.map(p => ({
        item_id: p.id,
        item_name: p.name,
        price: p.price,
        quantity: p.quantity
    }))

    window.dataLayer = window.dataLayer || [];

    window.dataLayer.push({
        event: "begin_checkout",
        ecommerce: {
            currency: "BDT",
            value: Number(total),
            items: items
        }
    });
}

function FacebookPurchaseEvent(contents, value) {
    if (typeof fbq !== 'function') return;
    fbq('track', 'Purchase', {
        value: Number(value),
        currency: 'BDT',
        contents: contents,
        content_type: 'product',
        compared_product: 'recommended-banner-toys',
        delivery_category: 'home_delivery'
    });
}
function GAInitiatePurchaseEvent(products, total) {
    if (!products?.length) return;

    const items = products.map(p => ({
        item_id: p.id,
        item_name: p.name,
        price: p.price,
        quantity: p.quantity
    }));

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: "purchase",
        ecommerce: {
            currency: "BDT",
            value: Number(total),
            items: items
        }
    });
}


// function GAInitiatePurchaseEvent(products, total) {
//     items = products.map(p => ({
//         item_id: p.id,
//         item_name: p.name,
//         price: p.price,
//         quantity: p.quantity
//     }))
//     gtag("event", "purchase", {
//         currency: "BDT",
//         value: Number(total),
//         items: items
//     });
// }


// *********//////////=========================/////////////***************
// =========================================================================