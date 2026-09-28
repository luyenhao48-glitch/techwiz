import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext.jsx';
import ToastNotification from '../components/common/ToastNotification.jsx';

const TOPIC_PRESETS = [
  { id: 'merch', icon: 'bi-bag-heart' },
  { id: 'content', icon: 'bi-journal-richtext' },
  { id: 'partnership', icon: 'bi-handshake' },
  { id: 'copyright', icon: 'bi-shield-check' },
  { id: 'feedback', icon: 'bi-lightbulb' },
];

export default function Contact() {
  const { t, i18n } = useTranslation();
  const { isDark } = useTheme();
  const mapLang = i18n.language && i18n.language.startsWith('vi') ? 'vi' : 'en';
  const topicSubject = (id) => t(`contact.topics.${id}.subject`);
  const faqs = t('contact.faqs', { returnObjects: true });

  const [selectedTopic, setSelectedTopic] = useState('merch');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: topicSubject('merch'),
    priority: 'normal',
    message: '',
  });
  const [subjectEdited, setSubjectEdited] = useState(false);

  // Keep the preset subject in the active language until the user types their own
  useEffect(() => {
    if (!subjectEdited) {
      setForm((prev) => ({ ...prev, subject: topicSubject(selectedTopic) }));
    }
  }, [i18n.language]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [toast, setToast] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);

  const handleSelectTopic = (preset) => {
    setSelectedTopic(preset.id);
    setSubjectEdited(false);
    setForm((prev) => ({ ...prev, subject: topicSubject(preset.id) }));
  };

  const handleCopyGps = () => {
    navigator.clipboard.writeText('21.0368° N, 105.8195° E');
    setToast({
      message: t('contact.toastGps'),
      type: 'info',
      icon: 'bi-clipboard-check-fill',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setToast({
        message: t('contact.toastRequired'),
        type: 'warning',
        icon: 'bi-exclamation-circle-fill',
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const ticketId = `FDV-${Math.floor(10000 + Math.random() * 90000)}`;
      setSubmittedTicket({
        id: ticketId,
        date: new Date().toLocaleTimeString(mapLang === 'vi' ? 'vi-VN' : 'en-US'),
        name: form.name,
        subject: form.subject,
      });
      setIsSubmitting(false);
      setToast({
        message: t('contact.toastSuccess', { id: ticketId }),
        type: 'success',
        icon: 'bi-check-circle-fill',
      });
    }, 900);
  };

  const handleResetForm = () => {
    setSubmittedTicket(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      subject: topicSubject('merch'),
      priority: 'normal',
      message: '',
    });
    setSelectedTopic('merch');
    setSubjectEdited(false);
  };

  return (
    <div className="container-fluid px-3 px-md-4 px-lg-5 py-4">
      {/* Hero Banner with Futuristic Ambient Glassmorphism */}
      <div
        className="position-relative overflow-hidden text-center rounded-4 mb-5 px-3 py-5"
        style={{
          background: isDark
            ? 'radial-gradient(120% 140% at 50% -10%, rgba(108, 92, 231, 0.28) 0%, rgba(12, 15, 29, 0) 65%), linear-gradient(180deg, rgba(20, 26, 48, 0.6) 0%, rgba(11, 15, 28, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(108, 92, 231, 0.12) 0%, rgba(255, 107, 129, 0.08) 50%, rgba(0, 245, 212, 0.06) 100%)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-color)',
          boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.5)' : '0 10px 30px rgba(108, 92, 231, 0.08)',
        }}
      >
        <div className="ambient-glow" style={{ width: '320px', height: '320px', top: '-110px', left: '-80px', background: 'rgba(108, 92, 231, 0.4)' }}></div>
        <div className="ambient-glow" style={{ width: '280px', height: '280px', bottom: '-90px', right: '-60px', background: 'rgba(255, 107, 129, 0.35)' }}></div>
        <div className="ambient-glow" style={{ width: '200px', height: '200px', top: '20%', right: '20%', background: 'rgba(0, 245, 212, 0.2)' }}></div>

        <div className="position-relative" style={{ zIndex: 1 }}>
          <div
            className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-3"
            style={{
              background: isDark ? 'rgba(108, 92, 231, 0.25)' : 'rgba(108, 92, 231, 0.12)',
              color: isDark ? '#a29bfe' : '#6C5CE7',
              border: isDark ? '1px solid rgba(108, 92, 231, 0.4)' : '1px solid rgba(108, 92, 231, 0.2)',
            }}
          >
            <span className="spinner-grow spinner-grow-sm text-success" role="status" style={{ width: '8px', height: '8px' }}></span>
            <span className="small fw-bold text-uppercase" style={{ letterSpacing: '0.05em' }}>
              {t('contact.badge')}
            </span>
          </div>

          <h1 className="font-heading fw-bold display-5 text-dark mb-2">
            {t('contact.title')}
          </h1>
          <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '680px', fontSize: '1.05rem' }}>
            {t('contact.subtitle')}
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-2">
            <span
              className="badge rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 fw-semibold"
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#ffffff',
                color: isDark ? '#e2e8f0' : '#2D3436',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid var(--border-color)',
              }}
            >
              <i className="bi bi-stopwatch text-warning"></i> {t('contact.chipResponse')}
            </span>
            <span
              className="badge rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 fw-semibold"
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#ffffff',
                color: isDark ? '#e2e8f0' : '#2D3436',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid var(--border-color)',
              }}
            >
              <i className="bi bi-people-fill text-info"></i> {t('contact.chipCommunity')}
            </span>
            <span
              className="badge rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 fw-semibold"
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#ffffff',
                color: isDark ? '#e2e8f0' : '#2D3436',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid var(--border-color)',
              }}
            >
              <i className="bi bi-shield-check text-success"></i> {t('contact.chipSecure')}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Direct Channel Cards (4 Pillars) */}
      <div className="row g-3 mb-5">
        <div className="col-6 col-md-3">
          <div
            className="card fv-card border-0 shadow-sm rounded-4 p-3 h-100 text-center text-md-start transition-all"
            style={{
              background: isDark ? 'rgba(18, 23, 43, 0.7)' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            <div
              className="rounded-3 d-inline-flex align-items-center justify-content-center mb-2"
              style={{
                width: '46px',
                height: '46px',
                background: 'rgba(88, 101, 242, 0.15)',
                color: '#5865F2',
                fontSize: '1.4rem',
              }}
            >
              <i className="bi bi-discord"></i>
            </div>
            <h6 className="fw-bold mb-1">Discord Community</h6>
            <p className="text-secondary small mb-2">{t('contact.discordDesc')}</p>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-outline-primary rounded-pill mt-auto"
              style={{ borderColor: '#5865F2', color: '#5865F2' }}
            >
              {t('contact.joinNow')} <i className="bi bi-box-arrow-up-right ms-1"></i>
            </a>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div
            className="card fv-card border-0 shadow-sm rounded-4 p-3 h-100 text-center text-md-start transition-all"
            style={{
              background: isDark ? 'rgba(18, 23, 43, 0.7)' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            <div
              className="rounded-3 d-inline-flex align-items-center justify-content-center mb-2"
              style={{
                width: '46px',
                height: '46px',
                background: 'rgba(0, 184, 148, 0.15)',
                color: '#00b894',
                fontSize: '1.4rem',
              }}
            >
              <i className="bi bi-telephone-inbound-fill"></i>
            </div>
            <h6 className="fw-bold mb-1">{t('contact.hotlineTitle')}</h6>
            <p className="text-secondary small mb-2 font-monospace">+84 (024) 3762 3456</p>
            <a
              href="tel:+8402437623456"
              className="btn btn-sm btn-outline-success rounded-pill mt-auto"
            >
              {t('contact.callNow')} <i className="bi bi-telephone-outbound ms-1"></i>
            </a>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div
            className="card fv-card border-0 shadow-sm rounded-4 p-3 h-100 text-center text-md-start transition-all"
            style={{
              background: isDark ? 'rgba(18, 23, 43, 0.7)' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            <div
              className="rounded-3 d-inline-flex align-items-center justify-content-center mb-2"
              style={{
                width: '46px',
                height: '46px',
                background: 'rgba(9, 132, 227, 0.15)',
                color: '#0984e3',
                fontSize: '1.4rem',
              }}
            >
              <i className="bi bi-envelope-at-fill"></i>
            </div>
            <h6 className="fw-bold mb-1">{t('contact.emailTitle')}</h6>
            <p className="text-secondary small mb-2 text-truncate">support@fandomverse.techwir.vn</p>
            <a
              href="mailto:support@fandomverse.techwir.vn"
              className="btn btn-sm btn-outline-info rounded-pill mt-auto"
            >
              {t('contact.sendMail')} <i className="bi bi-send ms-1"></i>
            </a>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div
            className="card fv-card border-0 shadow-sm rounded-4 p-3 h-100 text-center text-md-start transition-all"
            style={{
              background: isDark ? 'rgba(18, 23, 43, 0.7)' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            <div
              className="rounded-3 d-inline-flex align-items-center justify-content-center mb-2"
              style={{
                width: '46px',
                height: '46px',
                background: 'rgba(255, 107, 129, 0.15)',
                color: '#ff6b81',
                fontSize: '1.4rem',
              }}
            >
              <i className="bi bi-geo-alt-fill"></i>
            </div>
            <h6 className="fw-bold mb-1">{t('contact.hqTitle')}</h6>
            <p className="text-secondary small mb-2">{t('contact.hqShort')}</p>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger rounded-pill mt-auto"
              onClick={handleCopyGps}
            >
              {t('contact.copyGps')} <i className="bi bi-clipboard ms-1"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        {/* Left Column: Interactive Contact Form */}
        <div className="col-lg-7">
          <div
            className="card fv-card border-0 shadow-sm rounded-4 p-4 p-md-5 h-100 d-flex flex-column position-relative overflow-hidden"
            style={{
              background: isDark ? 'rgba(18, 23, 43, 0.85)' : '#ffffff',
            }}
          >
            <div
              style={{
                height: '4px',
                margin: '-1.5rem -1.5rem 1.5rem',
                borderRadius: '1rem 1rem 0 0',
                background: 'linear-gradient(90deg, #6C5CE7 0%, #00f5d4 50%, #FF6B81 100%)',
              }}
            ></div>

            {submittedTicket ? (
              /* Success confirmation state */
              <div className="text-center py-5 my-auto">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{
                    width: '76px',
                    height: '76px',
                    background: 'rgba(0, 184, 148, 0.15)',
                    color: '#00b894',
                    boxShadow: '0 0 20px rgba(0, 184, 148, 0.3)',
                  }}
                >
                  <i className="bi bi-check2-circle display-4"></i>
                </div>
                <span className="badge bg-success-subtle text-success border border-success px-3 py-1 rounded-pill mb-2">
                  {t('contact.successBadge')}
                </span>
                <h3 className="font-heading fw-bold mb-2">{t('contact.thanks', { name: submittedTicket.name })}</h3>
                <p className="text-secondary small mx-auto mb-4" style={{ maxWidth: '420px' }}>
                  {t('contact.successDesc')}
                </p>
                <div
                  className="p-3 rounded-3 mb-4 mx-auto text-start"
                  style={{ maxWidth: '380px', background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8f9fa' }}
                >
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-secondary">{t('contact.ticketId')}</span>
                    <strong className="font-monospace text-primary">#{submittedTicket.id}</strong>
                  </div>
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-secondary">{t('contact.sentAt')}</span>
                    <span>{submittedTicket.date}</span>
                  </div>
                  <div className="small">
                    <span className="text-secondary">{t('contact.subjectShort')}</span>
                    <div className="fw-semibold text-truncate">{submittedTicket.subject}</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2"
                  onClick={handleResetForm}
                >
                  <i className="bi bi-arrow-repeat me-1"></i> {t('contact.sendAnother')}
                </button>
              </div>
            ) : (
              /* Active Form */
              <>
                <div className="mb-4">
                  <h4 className="font-heading fw-bold text-primary mb-1 d-flex align-items-center gap-2">
                    <i className="bi bi-chat-heart-fill text-danger"></i> {t('contact.formTitle')}
                  </h4>
                  <p className="text-secondary small mb-0">
                    {t('contact.formSubtitle')}
                  </p>
                </div>

                {/* Topic Selector Chips */}
                <div className="mb-4">
                  <label className="form-label small fw-semibold text-secondary d-block mb-2">
                    {t('contact.topicLabel')}
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {TOPIC_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`btn btn-sm rounded-pill d-inline-flex align-items-center gap-1.5 transition-all ${
                          selectedTopic === p.id
                            ? 'btn-primary-fv text-white shadow-xs'
                            : isDark ? 'btn-outline-secondary text-light' : 'btn-outline-secondary'
                        }`}
                        onClick={() => handleSelectTopic(p)}
                      >
                        <i className={`bi ${p.icon}`}></i>
                        <span>{t(`contact.topics.${p.id}.label`)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="d-flex flex-column flex-grow-1">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">
                        {t('contact.nameLabel')}
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-muted">
                          <i className="bi bi-person"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 bg-light"
                          placeholder={t('contact.namePlaceholder')}
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">
                        {t('contact.emailLabel')}
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-muted">
                          <i className="bi bi-envelope"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control border-start-0 bg-light"
                          placeholder="name@example.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-semibold text-secondary">
                        {t('contact.subjectLabel')}
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-muted">
                          <i className="bi bi-tag"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 bg-light"
                          value={form.subject}
                          onChange={(e) => {
                            setSubjectEdited(true);
                            setForm({ ...form, subject: e.target.value });
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-secondary">
                        {t('contact.priorityLabel')}
                      </label>
                      <select
                        className="form-select bg-light"
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      >
                        <option value="normal">{t('contact.priorityNormal')}</option>
                        <option value="high">{t('contact.priorityHigh')}</option>
                        <option value="urgent">{t('contact.priorityUrgent')}</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label small fw-semibold text-secondary mb-0">
                          {t('contact.messageLabel')}
                        </label>
                        <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                          {t('contact.charCount', { count: form.message.length })}
                        </span>
                      </div>
                      <textarea
                        className="form-control bg-light"
                        rows="5"
                        placeholder={t('contact.messagePlaceholder')}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value.substring(0, 1000) })}
                        required
                      ></textarea>
                    </div>
                  </div>

                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mt-4 pt-2">
                    <span className="small text-muted">
                      <i className="bi bi-lock-fill me-1"></i> {t('contact.secureNote')}
                    </span>
                    <button
                      type="submit"
                      className="btn btn-primary-fv px-4 py-2 d-flex align-items-center justify-content-center gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          {t('contact.sending')}
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send-fill"></i> {t('contact.sendButton')}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Right Column: HQ Location, GPS & Interactive Map */}
        <div className="col-lg-5">
          <div
            className="card fv-card border-0 shadow-sm rounded-4 p-4 h-100 d-flex flex-column"
            style={{
              background: isDark ? 'rgba(18, 23, 43, 0.85)' : '#ffffff',
            }}
          >
            <div
              style={{
                height: '4px',
                margin: '-1.5rem -1.5rem 1.5rem',
                borderRadius: '1rem 1rem 0 0',
                background: 'linear-gradient(90deg, #FF6B81 0%, #6C5CE7 100%)',
              }}
            ></div>

            <div className="d-flex align-items-center justify-content-between mb-3">
              <h4 className="font-heading fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-geo-alt-fill text-danger"></i> {t('contact.infoTitle')}
              </h4>
              <span className="badge bg-danger-subtle text-danger border border-danger-subtle small">
                {t('contact.infoBadge')}
              </span>
            </div>

            <div className="d-flex flex-column gap-3 mb-4">
              <div className="d-flex align-items-start gap-3 p-3 bg-light rounded-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center shadow-xs flex-shrink-0"
                  style={{
                    width: '42px',
                    height: '42px',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'var(--bg-surface-alt)',
                    border: '1.5px solid var(--color-primary)',
                    boxShadow: '0 0 14px rgba(108, 92, 231, 0.35)',
                  }}
                >
                  <i className="bi bi-building fs-5 text-primary"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1">{t('contact.addressTitle')}</h6>
                  <p className="text-secondary small mb-0">
                    {t('contact.addressValue')}
                  </p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 p-3 bg-light rounded-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center shadow-xs flex-shrink-0"
                  style={{
                    width: '42px',
                    height: '42px',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'var(--bg-surface-alt)',
                    border: '1.5px solid var(--color-success)',
                    boxShadow: '0 0 14px rgba(0, 184, 148, 0.35)',
                  }}
                >
                  <i className="bi bi-compass fs-5 text-success"></i>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-1">{t('contact.gpsTitle')}</h6>
                    <button
                      type="button"
                      className="btn btn-sm btn-link p-0 text-decoration-none small"
                      onClick={handleCopyGps}
                    >
                      <i className="bi bi-copy"></i> {t('contact.copy')}
                    </button>
                  </div>
                  <p className="text-secondary small mb-0 font-monospace">
                    {t('contact.latitudeLabel')} <strong>21.0368° N</strong> • {t('contact.longitudeLabel')} <strong>105.8195° E</strong>
                  </p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 p-3 bg-light rounded-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center shadow-xs flex-shrink-0"
                  style={{
                    width: '42px',
                    height: '42px',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'var(--bg-surface-alt)',
                    border: '1.5px solid var(--color-info)',
                    boxShadow: '0 0 14px rgba(9, 132, 227, 0.35)',
                  }}
                >
                  <i className="bi bi-clock-history fs-5 text-info"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1">{t('contact.hoursTitle')}</h6>
                  <p className="text-secondary small mb-0">
                    {t('contact.hoursDays')} <strong>08:30 – 18:30</strong> {t('contact.hoursSunday')}
                  </p>
                </div>
              </div>
            </div>

            {/* Embedded Google Maps with Glow Border */}
            <div
              className="rounded-4 overflow-hidden border shadow-sm position-relative mt-auto"
              style={{
                height: '240px',
                border: isDark ? '1px solid rgba(0, 245, 212, 0.3)' : '1px solid rgba(108, 92, 231, 0.3)',
                boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.06)',
              }}
            >
              <iframe
                title={t('contact.mapTitle')}
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.924403889028!2d105.81729867597148!3d21.03571068753896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab0d127a01e7%3A0xab069cd4f9143592!2zMjg1IMSQ4buZaSBD4bqlbiwgTGnhu4d1IEdpYWksIEJhIMSQw6xuaCwgSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1s${mapLang}!2s!4v1711200000000!5m2!1s${mapLang}!2s`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              <a
                href="https://maps.google.com/?q=285+Doi+Can+Ba+Dinh+Ha+Noi"
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-primary-fv position-absolute bottom-0 end-0 m-2 rounded-pill px-3 shadow"
                style={{ fontSize: '0.78rem' }}
              >
                <i className="bi bi-box-arrow-up-right me-1"></i> {t('contact.openMaps')}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ Accordion) */}
      <div className="mb-5">
        <div className="text-center mb-4">
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill mb-2">
            {t('contact.faqBadge')}
          </span>
          <h3 className="font-heading fw-bold">{t('contact.faqTitle')}</h3>
          <p className="text-secondary small mx-auto" style={{ maxWidth: '500px' }}>
            {t('contact.faqSubtitle')}
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="d-flex flex-column gap-3">
              {(Array.isArray(faqs) ? faqs : []).map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="card border-0 shadow-xs rounded-4 overflow-hidden transition-all"
                    style={{
                      background: isDark ? 'rgba(18, 23, 43, 0.7)' : '#ffffff',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    <button
                      type="button"
                      className="btn w-100 text-start p-3 p-md-4 d-flex justify-content-between align-items-center bg-transparent border-0"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                    >
                      <span className="fw-bold font-heading fs-6 d-flex align-items-center gap-2">
                        <i className="bi bi-question-circle text-primary"></i>
                        {faq.q}
                      </span>
                      <i className={`bi bi-chevron-down text-secondary transition-all ${isOpen ? 'rotate-180 text-primary' : ''}`}></i>
                    </button>
                    {isOpen && (
                      <div className="px-3 px-md-4 pb-4 pt-0 text-secondary small border-top pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
