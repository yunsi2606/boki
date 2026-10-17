'use client';

import styles from './volumeSynopsisBox.module.css';

interface Props {
  title: string;
  seriesName?: string;
  volumeNumber?: number;
  description?: string;
  author?: string;
  publisher: string;
}

export function VolumeSynopsisBox({
  title,
  seriesName,
  volumeNumber,
  description,
  author,
  publisher,
}: Props) {
  const content =
    description && description.trim().length > 0
      ? description.trim()
      : `Tập ${volumeNumber || ''} của tác phẩm "${seriesName || title}" chính thức ra mắt độc giả Việt Nam qua đơn vị phát hành ${publisher}. Ấn bản được cấp phép xuất bản bản quyền chính thức với chất lượng in ấn cao cấp, bám sát nguyên tác tác giả ${author || 'Nhật Bản'}.`;

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.kicker}>Tóm tắt & Nội dung tác phẩm</div>
        <h3 className={styles.heading}>Cốt truyện & Điểm nhấn tập {volumeNumber || ''}</h3>
      </div>

      <div className={styles.body}>
        <p className={styles.synopsisText}>{content}</p>
      </div>

      <div className={styles.tagRow}>
        <span className={styles.tagItem}>Bản quyền chính thức</span>
        <span className={styles.tagItem}>{publisher}</span>
        {author && <span className={styles.tagItem}>Tác giả: {author}</span>}
      </div>
    </section>
  );
}
