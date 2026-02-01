// স্ক্রল করে section দৃশ্যমান হলে অ্যানিমেশন চালু Start============================
const newPrices = document.querySelectorAll('.new-price');

const new_observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
        }
    });
}, { threshold: 0.5 });

newPrices.forEach(price => {
    new_observer.observe(price);
});

const oldPrices = document.querySelectorAll('.old-price');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('triggered'); // এখানে entry.target হলো আসল এলিমেন্ট
            observer.unobserve(entry.target); // শুধু এই এলিমেন্টটা আর অবজার্ভ করব না
        }
    });
}, {
    threshold: 0.8 // ৮০% দৃশ্যমান হলে ট্রিগার
});

// different observe on all .old-price element
oldPrices.forEach(element => {
    observer.observe(element);
});
// স্ক্রল করে section দৃশ্যমান হলে অ্যানিমেশন চালু End============================


// For FAQ==================================================================
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });
        item.classList.toggle('active');
    });
});





