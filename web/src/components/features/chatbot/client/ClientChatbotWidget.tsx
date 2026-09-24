'use client';

import React, { useState } from 'react';
import { MessageSquareText, Sparkles, X } from 'lucide-react';
import ClientChatWindow from './ClientChatWindow';
import { useProactivePrompt } from '../hooks/useProactivePrompt';
import styles from '../styles/clientChatbot.module.css';

export default function ClientChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const { prompt, dismissPrompt } = useProactivePrompt(isOpen);

  const handleOpenWithPrompt = (promptText?: string) => {
    if (promptText) {
      setInitialPrompt(promptText);
    }
    setIsOpen(true);
    dismissPrompt();
  };

  return (
    <div className={styles.floatingLauncher}>
      {/* Proactive Engagement Tooltip Bubble */}
      {prompt && !isOpen && (
        <div className={styles.proactiveTooltip}>
          <div
            style={{ cursor: 'pointer', flex: 1 }}
            onClick={() => handleOpenWithPrompt(prompt.promptText)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#EE4D2D', marginBottom: '2px' }}>
              <Sparkles size={14} />
              <span>Gợi ý từ Boki</span>
            </div>
            <div>{prompt.message}</div>
          </div>
          <button
            type="button"
            className={styles.tooltipClose}
            onClick={dismissPrompt}
            title="Đóng gợi ý"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        type="button"
        className={styles.launcherButton}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) dismissPrompt();
        }}
        title="Trò chuyện với Boki AI"
        aria-label="Mở khung chat BokiStore"
      >
        <MessageSquareText size={26} />
        <span className={styles.launcherBadge} />
      </button>

      {/* Slide-up Chat Window */}
      {isOpen && (
        <ClientChatWindow
          onClose={() => setIsOpen(false)}
          initialPrompt={initialPrompt}
        />
      )}
    </div>
  );
}
