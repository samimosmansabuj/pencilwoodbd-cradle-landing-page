// ==================================================================================================
// *********//////////====Facebook Pixel and Event Tracking Function=====/////////////***************
// View Content Event Tracking Function ========== 
function FacebookViewContentEvent() {
    productPrice = document.getElementById("productPrice");
    if (typeof fbq !== 'function') return;
    fbq('track', 'ViewContent', {
        content_ids: [String(productPrice.dataset.productId)],
        content_name: "Cradle - Baby Product",
        content_type: 'product',
        value: parseFloat(productPrice.textContent || 0),
        currency: 'BDT'
    });
}
FacebookViewContentEvent();

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
function FacebookInitiateCheckEvent(contents, content_name, value) {
    if (typeof fbq !== 'function') return;
    fbq('track', 'InitiateCheckout', {
        contents: contents,
        content_type: 'product',
        value: value,
        currency: 'BDT'
    });
}
function FacebookPurchaseEvent(contents, content_name, value) {
    if (typeof fbq !== 'function') return;
    fbq('track', 'Purchase', {
        value: value,
        currency: 'BDT',
        contents: contents,
        content_type: 'product',
        compared_product: 'recommended-banner-toys',
        delivery_category: 'home_delivery'
    });
}
// *********//////////=========================/////////////***************
// =========================================================================