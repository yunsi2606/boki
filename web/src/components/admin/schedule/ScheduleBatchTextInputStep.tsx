'use client';

import React from 'react';
import styles from './scheduleBatchTextInputStep.module.css';

interface Props {
  text: string;
  onTextChange: (val: string) => void;
  publishers: string[];
  selectedPublisher: string;
  onPublisherChange: (val: string) => void;
  month: number;
  onMonthChange: (val: number) => void;
  year: number;
  onYearChange: (val: number) => void;
  geminiApiKey: string;
  onApiKeyChange: (val: string) => void;
}

export default function ScheduleBatchTextInputStep({
  text,
  onTextChange,
  publishers,
  selectedPublisher,
  onPublisherChange,
  month,
  onMonthChange,
  year,
  onYearChange,
  geminiApiKey,
  onApiKeyChange,
}: Props) {
  const placeholderSample = `Dán nội dung bài đăng lịch tháng của NXB vào đây. Ví dụ (IPM):
✏️ 1.9:
- PHẢI LÒNG CHỊ CỦA BẠN THÂN - 4
- PHÁT PHIỀN VỚI BẠN THÂN CỦA CHỊ - 4
- ÁNG PHÙ DU MÙA HẠ - 2

✏️ 9.9:
- HAKUMEI VÀ MIKOCHI - 5
- CHẠY TRỐN CÓ ĐÔI - 1 ĐẾN 4 (NEW)

✏️ 13.9:
- VĂN HÀO LƯU LẠC GÂU! - 12
- MẸ KẾ, CHỊ KẾ KHÔNG HỀ KHẮT KHE - 1 (NEW)`;

  return (
    <div className={styles.container}>
      <div className={styles.configRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Nhà xuất bản</label>
          <select
            className={styles.select}
            value={selectedPublisher}
            onChange={(e) => onPublisherChange(e.target.value)}
          >
            <option value="IPM">IPM</option>
            <option value="Kim Đồng">Kim Đồng</option>
            <option value="NXB Trẻ">NXB Trẻ</option>
            <option value="AZ Việt Nam">AZ Việt Nam</option>
            <option value="Wings Books">Wings Books</option>
            <option value="Nhã Nam">Nhã Nam</option>
            {publishers
              .filter(
                (p) =>
                  !['IPM', 'Kim Đồng', 'NXB Trẻ', 'AZ Việt Nam', 'Wings Books', 'Nhã Nam'].includes(p)
              )
              .map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Tháng phát hành</label>
          <select
            className={styles.select}
            value={month}
            onChange={(e) => onMonthChange(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Năm</label>
          <input
            type="number"
            className={styles.input}
            value={year}
            min={2020}
            max={2030}
            onChange={(e) => onYearChange(Number(e.target.value))}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Nội dung văn bản lịch phát hành *</label>
        <textarea
          className={styles.textarea}
          placeholder={placeholderSample}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
        />
      </div>

      <div className={styles.hintBox}>
        AI sẽ tự động nhận diện các mốc ngày (như 1.9, 9.9...), chuẩn hóa viết hoa tên truyện, tự động
        tách các tập dải (như 1 đến 4), gán nhãn tập mới (NEW). Giá bìa và ảnh bìa được để trống để bạn
        cập nhật sau khi NXB mở đặt trước.
      </div>

      <div className={styles.apiKeyRow}>
        <input
          type="password"
          className={styles.input}
          placeholder="Gemini API Key tùy chọn (để trống nếu đã cấu hình trong .env)"
          value={geminiApiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
        />
      </div>
    </div>
  );
}
