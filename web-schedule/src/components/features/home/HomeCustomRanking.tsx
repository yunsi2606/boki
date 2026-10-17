'use client';

import { useState, useEffect } from 'react';
import { communityService, type CustomRankTopic } from '@/services/communityService';
import styles from './homeCustomRanking.module.css';

export function HomeCustomRanking() {
  const [topics, setTopics] = useState<CustomRankTopic[]>([]);
  const [selectedTopicIdx, setSelectedTopicIdx] = useState(0);

  useEffect(() => {
    setTopics(communityService.getCustomRankings());
  }, []);

  const handleVote = (itemId: string) => {
    if (!topics[selectedTopicIdx]) return;
    const currentTopic = topics[selectedTopicIdx];
    const updated = communityService.voteItem(currentTopic.id, itemId);
    setTopics(updated);
  };

  if (topics.length === 0) return null;

  const current = topics[selectedTopicIdx] || topics[0];

  return (
    <div className={styles.card} aria-label="Bảng xếp hạng cộng đồng bình chọn">
      <div className={styles.kickerRow}>
        <span className={styles.kicker}>BÌNH CHỌN ĐỘC GIẢ</span>
        <span className={styles.topicBadge}>{current.badge}</span>
      </div>
      <h3 className={styles.title}>{current.topicTitle}</h3>

      {/* Topic Switch Tabs */}
      <div className={styles.topicTabs}>
        {topics.map((t, idx) => (
          <button
            key={t.id}
            type="button"
            className={`${styles.tabBtn} ${idx === selectedTopicIdx ? styles.activeTab : ''}`}
            onClick={() => setSelectedTopicIdx(idx)}
          >
            Chủ đề {idx + 1}
          </button>
        ))}
      </div>

      <div className={styles.itemsList}>
        {current.items.map((item) => (
          <div key={item.id} className={styles.rankRow}>
            <span className={styles.rankNum}>#{item.rank}</span>
            <div className={styles.rankInfo}>
              <div className={styles.rankTitle} title={item.title}>
                {item.title}
              </div>
              <div className={styles.votesText}>
                {item.votes.toLocaleString()} lượt vote
              </div>
            </div>
            <button
              type="button"
              className={styles.voteBtn}
              onClick={() => handleVote(item.id)}
              title="Bình chọn cho tác phẩm này"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              <span>Vote</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
