import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { chatbotService } from '../../services/chatbotService.js';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function ChatbotWidget() {
  const { t } = useTranslation();
  const { bcp47 } = useLanguage();
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      sender: 'bot',
      text: t('chatbot.greeting'),
      link: null,
      time: new Date().toLocaleTimeString(bcp47, { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const quickReplies = chatbotService.getQuickReplies();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const time = new Date().toLocaleTimeString(bcp47, { hour: '2-digit', minute: '2-digit' });

    // 1. Add User message
    const userMsg = { sender: 'user', text, link: null, time };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // 2. Query Chatbot Service
    setTimeout(() => {
      const response = chatbotService.matchAnswer(text);
      const botMsg = {
        sender: 'bot',
        text: response.answer,
        link: response.link,
        time: new Date().toLocaleTimeString(bcp47, { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 400);
  };

  const handleQuickReply = (question) => {
    handleSend(question);
  };

  const handleNavigate = (link) => {
    if (link) {
      // Internal route starts with #/
      const cleanPath = link.replace(/^#/, '');
      navigate(cleanPath);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fv-chatbot-launcher position-fixed bottom-0 end-0 m-3 m-md-4" style={{ zIndex: 1045 }}>
        {!isOpen && (
          <button
            type="button"
            className="btn btn-primary-fv p-3 rounded-circle shadow-lg d-flex align-items-center justify-content-center position-relative fv-chatbot-btn"
            onClick={() => setIsOpen(true)}
            aria-label={t('chatbot.openAria')}
            title={t('chatbot.openTitle')}
          >
            <span className="fv-chatbot-icon">🤖</span>
            <span
              className="position-absolute top-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle"
              title={t('chatbot.activeTitle')}
            ></span>
          </button>
        )}
      </div>

      {/* Chat Window Overlay */}
      {isOpen && (
        <div
          className={`fv-chatbot-window ${isDark ? 'dark' : 'light'} position-fixed card border-0`}
        >
          {/* Header */}
          <div className="fv-chatbot-header text-white d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🤖</span>
              <div>
                <h6 className="font-heading fv-chatbot-header-title mb-0">{t('chatbot.headerTitle')}</h6>
                <small className="fv-chatbot-header-sub d-flex align-items-center gap-1">
                  <span className="badge bg-success p-1 rounded-circle" style={{ width: '6px', height: '6px' }}></span>
                  {t('chatbot.headerSubtitle')}
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white btn-sm"
              style={{ fontSize: '0.7rem' }}
              aria-label={t('chatbot.closeAria')}
              onClick={() => setIsOpen(false)}
            ></button>
          </div>

          {/* Messages Area */}
          <div className="flex-grow-1 p-2.5 overflow-y-auto fv-chatbot-body d-flex flex-column gap-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`d-flex flex-column ${
                  msg.sender === 'user' ? 'align-items-end' : 'align-items-start'
                }`}
              >
                <div
                  className={`fv-chatbot-bubble shadow-xs ${
                    msg.sender === 'user'
                      ? 'fv-chatbot-user-bubble'
                      : 'fv-chatbot-bot-bubble'
                  }`}
                >
                  <div>{msg.text}</div>
                  {msg.link && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary mt-1.5 w-100 rounded-pill py-1 fw-semibold d-flex align-items-center justify-content-center gap-1"
                      style={{ fontSize: '0.74rem' }}
                      onClick={() => handleNavigate(msg.link)}
                    >
                      <span>{t('chatbot.exploreNow')}</span> <i className="bi bi-arrow-right-short fs-6"></i>
                    </button>
                  )}
                </div>
                <span className="text-muted mt-0.5 px-1" style={{ fontSize: '0.62rem' }}>
                  {msg.time}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies Strip */}
          <div className="p-1.5 px-2 fv-chatbot-replies-strip overflow-x-auto d-flex gap-1" style={{ whiteSpace: 'nowrap' }}>
            {quickReplies.map((qr) => (
              <button
                key={qr.id}
                type="button"
                className="btn btn-sm fv-chatbot-chip rounded-pill px-2 py-0.5 flex-shrink-0"
                style={{ fontSize: '0.72rem', lineHeight: 1.3 }}
                onClick={() => handleQuickReply(qr.question)}
              >
                {qr.question}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            className="p-2 fv-chatbot-input-bar d-flex align-items-center gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              className="form-control form-control-sm rounded-pill fv-chatbot-input"
              style={{ fontSize: '0.8rem', height: '34px' }}
              placeholder={t('chatbot.inputPlaceholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-sm btn-primary-fv rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px', flexShrink: 0, padding: 0 }}
              disabled={!input.trim()}
              aria-label={t('chatbot.sendAria')}
            >
              <i className="bi bi-send-fill" style={{ fontSize: '0.75rem' }}></i>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
