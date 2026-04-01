function isValidBDPhoneNew(phone) {
    return /^(?:\+88)?01\d{9}$/.test(phone.replace(/\s+/g, ""));
}

// Send OTP
document.getElementById("sendOtpBtn").addEventListener("click", async function () {
    const phone = document.getElementById("phone").value.trim();

    if (!isValidBDPhoneNew(phone)) {
        alert("সঠিক মোবাইল নম্বর দিন");
        return;
    }

    try {
        const res = await fetch(`${ENV.API_BASE_URL}/api/send-otp/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone })
        });

        const data = await res.json();

        if (data.success) {
            document.getElementById("otpSection").style.display = "block";
            document.getElementById("otpMessage").innerText = "OTP পাঠানো হয়েছে";
            document.getElementById("otpMessage").style.color = "green";
        } else {
            throw new Error(data.message || "OTP failed");
        }

    } catch (err) {
        console.error(err);
        alert("OTP পাঠাতে সমস্যা হয়েছে!");
    }
});

// Verify OTP — backend verification
document.getElementById("verifyOtpBtn").addEventListener("click", async function () {
    const otp = document.getElementById("otpInput").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (!otp || !phone) return;

    try {
        const res = await fetch(`${ENV.API_BASE_URL}/api/verify-otp/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, otp })
        });

        const data = await res.json();

        if (data.success) {
            document.getElementById("otpSection").style.display = "none";
            document.getElementById("otpVerified").style.display = "block";
            document.getElementById("phone").readOnly = true;
            document.getElementById("otpMessage").innerText = "OTP Verified!";
            document.getElementById("otpMessage").style.color = "green";
        } else {
            document.getElementById("otpMessage").innerText = data.message || "ভুল OTP";
            document.getElementById("otpMessage").style.color = "red";
        }
    } catch (err) {
        console.error(err);
        alert("OTP verify করতে সমস্যা হয়েছে!");
    }
});

// Reset OTP if phone changes
document.getElementById("phone").addEventListener("input", function () {
    document.getElementById("otpSection").style.display = "none";
    document.getElementById("otpVerified").style.display = "none";
    document.getElementById("otpMessage").innerText = "";
});