import styles from './scheduleFooter.module.css';

export function ScheduleFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandTitle}>Boki — Hệ Sinh Thái Lịch Phát Hành Truyện Tranh & Light Novel</div>
        <p className={styles.disclaimer}>
          Dữ liệu lịch phát hành được tổng hợp từ thông báo chính thức của các Nhà xuất bản (Kim Đồng, Trẻ, IPM, Wings Books, Amak, AZ...).
          Bản quyền hình ảnh và tác phẩm thuộc về các tác giả và đơn vị phát hành tương ứng.
        </p>
        <div>© {new Date().getFullYear()} Boki. Bản quyền thuộc về sàn sách Boki.</div>
      </div>
    </footer>
  );
}
