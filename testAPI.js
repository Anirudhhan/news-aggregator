const axios = require("axios");

const API_KEY = "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";  // Replace with your actual key

async function testAPI() {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello, AI!" }],
      },
      {
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("AI Response:", response.data.choices[0].message.content);
  } catch (error) {
    console.error("API Error:", error.response ? error.response.data : error.message);
  }
}

testAPI();