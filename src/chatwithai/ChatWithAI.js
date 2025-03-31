import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './ChatWithAI.css';

const ChatWithAI = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize Google Generative AI
  const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || "YOUR_API_KEY"; // Replace with your actual API key if not using env vars
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat session
  useEffect(() => {
    // Create initial chat history
    const initialHistory = [
      {
        role: 'user',
        parts: [{ text: "You are a helpful assistant that specializes in discussing and explaining news. Provide accurate, balanced information about recent events and news topics. If asked about very recent events you don't have information about, acknowledge this limitation politely." }],
      },
      {
        role: 'model',
        parts: [{ text: "I understand my role is to provide balanced and accurate information about news and current events. I'll do my best to explain news topics clearly, and I'll let you know when I don't have information about very recent events. How can I help you with news today?" }],
      }
    ];
    

    // Start chat session with initial history
    const chat = model.startChat({
      history: initialHistory,
      generationConfig: {
        temperature: 0.7,
      },
    });

    setChatSession(chat);

    // Add welcome message when component mounts
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I can help you understand recent news or provide summaries of current events. What would you like to know about?'
      }
    ]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatSession) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send message to Gemini
      const result = await chatSession.sendMessage(input);
      const responseText = result.response.text();

      const aiMessage = {
        role: 'assistant',
        content: responseText
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again later. Error: ' + 
                   (error.message || 'Unknown error')
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat with AI News</h2>
      </div>
      <div className="messages-container">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant-message">
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about recent news..."
          disabled={isLoading}
          className="chat-input"
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()} 
          className="send-button"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatWithAI;