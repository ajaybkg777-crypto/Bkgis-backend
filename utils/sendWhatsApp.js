const axios = require("axios");

module.exports = async (phone, otp) => {
  await axios.post(
    `https://graph.facebook.com/v18.0/${process.env.WA_PHONE_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to: `91${phone}`,
      type: "text",
      text: {
        body:
`Your OTP for admission verification is: ${otp}

Do not share this OTP.
Valid for 5 minutes.`
      }
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WA_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
};
