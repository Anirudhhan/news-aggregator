require('dotenv').config();
const readline = require('readline');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const API_KEY = "AIzaSyDoiv_KaPG2QZDCe1FEAcRZ8u7ULCsAf8Q";  // Gemini API Key
const WEATHER_API_KEY = "your_openweathermap_api_key"; // Replace with your OpenWeatherMap API key
const CITY = "New Delhi";  // Change to your desired location

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function getWeather() {
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${WEATHER_API_KEY}&units=metric`);
    const weather = response.data;
    return `The weather in ${CITY} is ${weather.weather[0].description} with a temperature of ${weather.main.temp}°C.`;
  } catch (error) {
    return "I couldn't fetch the weather data right now.";
  }
}

async function chatWithAI() {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const chat = model.startChat({ history: [] });

  function askQuestion() {
    rl.question("You: ", async (message) => {
      if (message.toLowerCase() === 'exit') {
        console.log("Chat ended.");
        rl.close();
        return;
      }

      let prompt = message;
      if (message.toLowerCase().includes("weather") || message.toLowerCase().includes("date")) {
        const today = new Date().toDateString();
        const weatherInfo = await getWeather();
        prompt = `Today's date is ${today}. ${weatherInfo}. Also, ${message}`;
      }

      const result = await chat.sendMessage(prompt);
      console.log("AI:", result.response.text());
      askQuestion();
    });
  }

  console.log("Chatbot started. Type 'exit' to end chat.");
  askQuestion();
}

chatWithAI();