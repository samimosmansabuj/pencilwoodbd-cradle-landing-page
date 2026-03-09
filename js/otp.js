const OTPService = (function () {
    let generatedOTP = null;
    let verified = false;
    let phoneLocked = null;

    function generateOTP() {
        generatedOTP = Math.floor(100000 + Math.random() * 900000);
        return generatedOTP;
    }

    function verifyOTP(input, phone) {
        if (String(input) === String(generatedOTP)) {
            verified = true;
            phoneLocked = phone;
            return true;
        }
        return false;
    }

    function isVerified() {
        return verified;
    }

    function lockedPhone() {
        return phoneLocked;
    }

    return {
        generateOTP,
        verifyOTP,
        isVerified,
        lockedPhone
    }
})();


document.getElementById("sendOtpBtn").addEventListener("click", async function () {
    const phone = document.getElementById("phone").value.trim();
    if (!isValidBDPhoneNew(phone)) {
        alert("সঠিক মোবাইল নম্বর দিন");
        return;
    }

    try {
        const otp = OTPService.generateOTP();
        const message = `আপনার OTP: ${otp}`;
        const payload = {
            SenderId: "BUYOLX",
            ApiKey: ENV.SMS_API_KEY,
            ClientId: ENV.SMS_CLIENT_ID,
            Message: message,
            MobileNumbers: phone,
            Is_Unicode: true
        };

        console.log("OTP:", otp);
        document.getElementById("otpSection").style.display = "block";
        document.getElementById("otpMessage").innerText = "OTP পাঠানো হয়েছে";
        // const res = await fetch("http://console.smsq.global/api/v2/SendSMS", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify(payload)
        // });
        // if (!res.ok) {
        //     throw new Error(`HTTP error: ${res.status}`);
        // }

        // const data = await res.json();

        // if (data.ErrorCode === 0) {
        //     console.log("OTP:", otp);
        //     document.getElementById("otpSection").style.display = "block";
        //     document.getElementById("otpMessage").innerText = "OTP পাঠানো হয়েছে";
        //     document.getElementById("otpMessage").style.color = "green";
        // } else {
        //     alert("OTP পাঠাতে সমস্যা হয়েছে\n" + data.ErrorDescription);
        // }

    } catch (err) {
        console.error("OTP Send Error:", err);
        alert("OTP পাঠাতে সমস্যা হয়েছে! আবার চেষ্টা করুন।");
    }
});

document.getElementById("verifyOtpBtn").addEventListener("click", function () {
    const otp = document.getElementById("otpInput").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const valid = OTPService.verifyOTP(otp, phone);

    if (valid) {
        document.getElementById("otpSection").style.display = "none";
        document.getElementById("otpVerified").style.display = "block";
        document.getElementById("phone").readOnly = true;
    } else {
        document.getElementById("otpMessage").innerText = "ভুল OTP";
        document.getElementById("otpMessage").style.color = "red";
    }
});
