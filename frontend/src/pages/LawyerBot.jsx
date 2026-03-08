import { useState } from 'react';
import { t, translateDept } from '../utils/i18n';
import { askLawyerBot } from '../utils/api';
import './LawyerBot.css';

const DEPARTMENTS = [
    "Water Supply & Sanitation", "Roads & Transport", "Electricity & Power",
    "Healthcare & Hospitals", "Education", "Revenue & Land",
    "Law & Order", "Municipal Administration", "General"
];

export default function LawyerBot({ lang }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [category, setCategory] = useState('General');
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
        setInput('');
        setLoading(true);

        try {
            const res = await askLawyerBot({ grievance_text: userMessage, category });
            setMessages((prev) => [...prev, { role: 'bot', text: res.data.response }]);
        } catch {
            setMessages((prev) => [...prev, { role: 'bot', text: t(lang, 'lawyer_error') }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="page-header animate-in">
                <h1 className="page-title">{t(lang, 'lawyer_title')}</h1>
                <p className="page-subtitle">{t(lang, 'lawyer_subtitle')}</p>
            </div>

            <div className="lawyer-container animate-in">
                <div className="lawyer-sidebar glass-card">
                    <h3 style={{ marginBottom: 16, fontSize: 14, color: 'var(--text-muted)' }}>
                        {t(lang, 'lawyer_category')}
                    </h3>
                    {DEPARTMENTS.map((dept) => (
                        <button key={dept}
                            className={`dept-btn ${category === dept ? 'active' : ''}`}
                            onClick={() => setCategory(dept)}>
                            {translateDept(lang, dept)}
                        </button>
                    ))}
                </div>

                <div className="lawyer-chat glass-card">
                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div className="chat-welcome">
                                <div style={{ fontSize: 48, marginBottom: 16 }}>⚖️</div>
                                <h3>{t(lang, 'lawyer_welcome')}</h3>
                                <p>{t(lang, 'lawyer_welcome_desc')}</p>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-message ${msg.role}`}>
                                <div className="message-avatar">
                                    {msg.role === 'user' ? '👤' : '⚖️'}
                                </div>
                                <div className="message-content">
                                    {msg.text.split('\n').map((line, j) => (
                                        <p key={j}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="chat-message bot">
                                <div className="message-avatar">⚖️</div>
                                <div className="message-content typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSend} className="chat-input-row">
                        <input type="text" className="form-input" value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t(lang, 'lawyer_placeholder')}
                            disabled={loading}
                        />
                        <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
                            {t(lang, 'lawyer_send')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
