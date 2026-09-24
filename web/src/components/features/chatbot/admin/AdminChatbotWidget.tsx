'use client';

import React, { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import AdminChatWindow from './AdminChatWindow';
import styles from '../styles/adminChatbot.module.css';

export default function AdminChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.adminLauncher}>
      <button
        type="button"
        className={styles.adminLauncherBtn}
        onClick={() => setIsOpen(!isOpen)}
        title="Mở Boki Admin AI Co-Pilot"
      >
        <Bot size={18} />
        <span>Boki Copilot</span>
        <Sparkles size={14} style={{ color: '#60a5fa' }} />
      </button>

      {isOpen && <AdminChatWindow onClose={() => setIsOpen(false)} />}
    </div>
  );
}
