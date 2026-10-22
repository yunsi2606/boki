package com.boki.application.service;

import com.boki.infrastructure.persistence.entity.EmailOutboxJobJpaEntity;
import com.boki.infrastructure.persistence.entity.GiveawayCampaignJpaEntity;
import com.boki.infrastructure.persistence.entity.GiveawayEntryJpaEntity;
import com.boki.infrastructure.persistence.entity.GiveawayPrizeJpaEntity;
import com.boki.infrastructure.persistence.repository.EmailOutboxJobJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class GiveawayEmailNotifier {

    private final EmailOutboxJobJpaRepository outboxRepository;

    public void enqueueEntryConfirmation(GiveawayCampaignJpaEntity campaign, GiveawayEntryJpaEntity entry) {
        try {
            String idempotencyKey = "giveaway_entry_" + campaign.getId() + "_" + entry.getId();
            if (outboxRepository.findByIdempotencyKey(idempotencyKey).isPresent()) {
                return;
            }

            String subject = "[Boki Giveaway] Đã ghi nhận con số may mắn của bạn: " + campaign.getTitle();
            String html = buildEntryConfirmationHtml(campaign, entry);
            String text = "Xin chào " + entry.getFullName() + ", bạn đã đăng ký con số may mắn "
                    + entry.getLuckyNumber() + " cho sự kiện: " + campaign.getTitle();

            EmailOutboxJobJpaEntity job = EmailOutboxJobJpaEntity.builder()
                    .recipientEmail(entry.getEmail())
                    .subject(subject)
                    .bodyHtml(html)
                    .bodyText(text)
                    .emailType("GIVEAWAY_ENTRY")
                    .status("PENDING")
                    .idempotencyKey(idempotencyKey)
                    .scheduledAt(OffsetDateTime.now())
                    .build();

            outboxRepository.save(job);
        } catch (Exception ex) {
            log.error("Failed to enqueue giveaway entry confirmation email: {}", ex.getMessage());
        }
    }

    public void enqueueWinnerNotifications(
            GiveawayCampaignJpaEntity campaign,
            List<GiveawayEntryJpaEntity> winners,
            Integer winningNumber
    ) {
        for (GiveawayEntryJpaEntity winner : winners) {
            try {
                String idempotencyKey = "giveaway_win_" + campaign.getId() + "_" + winner.getId();
                if (outboxRepository.findByIdempotencyKey(idempotencyKey).isPresent()) {
                    continue;
                }

                GiveawayPrizeJpaEntity prize = winner.getPrize();
                String prizeName = prize != null ? prize.getPrizeName() : "Quà tặng Manga";
                String subject = "[Boki] Chúc mừng bạn đã trúng thưởng Give Away: " + campaign.getTitle();
                String html = buildWinnerHtml(campaign, winner, prizeName, winningNumber);
                String text = "Chúc mừng " + winner.getFullName() + "! Bạn đã trúng giải: " + prizeName
                        + " trong sự kiện " + campaign.getTitle() + " với số " + winner.getLuckyNumber() + ".";

                EmailOutboxJobJpaEntity job = EmailOutboxJobJpaEntity.builder()
                        .recipientEmail(winner.getEmail())
                        .subject(subject)
                        .bodyHtml(html)
                        .bodyText(text)
                        .emailType("GIVEAWAY_WINNER")
                        .status("PENDING")
                        .idempotencyKey(idempotencyKey)
                        .scheduledAt(OffsetDateTime.now())
                        .build();

                outboxRepository.save(job);
            } catch (Exception ex) {
                log.error("Failed to enqueue giveaway winner email for {}: {}", winner.getEmail(), ex.getMessage());
            }
        }
    }

    private String buildEntryConfirmationHtml(GiveawayCampaignJpaEntity campaign, GiveawayEntryJpaEntity entry) {
        return "<div style=\"font-family:'Plus Jakarta Sans',sans-serif;max-width:580px;margin:0 auto;background:#fff;border:1px solid #E9ECEF;border-radius:12px;overflow:hidden;\">"
                + "<div style=\"background:#EE4D2D;padding:24px 20px;text-align:center;color:#fff;\">"
                + "<h2 style=\"margin:0;font-size:20px;\">BOKI MANGA GIVEAWAY</h2>"
                + "</div>"
                + "<div style=\"padding:24px 20px;color:#343A40;\">"
                + "<p>Xin chào <strong>" + entry.getFullName() + "</strong>,</p>"
                + "<p>Bạn đã đăng ký tham gia thành công sự kiện <strong>" + campaign.getTitle() + "</strong>.</p>"
                + "<div style=\"text-align:center;background:#FFF5F7;border:1px dashed #FF6B81;border-radius:8px;padding:16px;margin:20px 0;\">"
                + "<span style=\"font-size:13px;color:#868E96;display:block;\">CON SỐ MAY MẮN CỦA BẠN</span>"
                + "<strong style=\"font-size:32px;color:#EE4D2D;letter-spacing:4px;\">" + entry.getLuckyNumber() + "</strong>"
                + "</div>"
                + "<p style=\"font-size:14px;color:#495057;\">Kết quả sẽ được so khớp trực tiếp với 3 số cuối Giải Đặc Biệt Xổ Số Miền Bắc khi sự kiện kết thúc. Hãy chú ý theo dõi email nhé!</p>"
                + "</div>"
                + "<div style=\"background:#F8F9FA;padding:12px 20px;text-align:center;font-size:12px;color:#868E96;\">Boki.vn - Hệ sinh thái truyện tranh & bản quyền</div>"
                + "</div>";
    }

    private String buildWinnerHtml(
            GiveawayCampaignJpaEntity campaign,
            GiveawayEntryJpaEntity winner,
            String prizeName,
            Integer winningNumber
    ) {
        return "<div style=\"font-family:'Plus Jakarta Sans',sans-serif;max-width:580px;margin:0 auto;background:#fff;border:1px solid #E9ECEF;border-radius:12px;overflow:hidden;\">"
                + "<div style=\"background:linear-gradient(135deg, #EE4D2D, #FF9800);padding:24px 20px;text-align:center;color:#fff;\">"
                + "<h2 style=\"margin:0;font-size:22px;\">CHÚC MỪNG BẠN ĐÃ TRÚNG THƯỞNG!</h2>"
                + "</div>"
                + "<div style=\"padding:24px 20px;color:#343A40;\">"
                + "<p>Xin chào <strong>" + winner.getFullName() + "</strong>,</p>"
                + "<p>Boki vui mừng thông báo bạn là người chiến thắng trong sự kiện <strong>" + campaign.getTitle() + "</strong>!</p>"
                + "<div style=\"background:#FFF5F7;border:1px solid #FFE4E8;border-radius:8px;padding:16px;margin:16px 0;\">"
                + "<div style=\"font-size:13px;color:#868E96;\">GIẢI THƯỞNG CỦA BẠN:</div>"
                + "<div style=\"font-size:18px;font-weight:bold;color:#EE4D2D;margin-top:4px;\">" + prizeName + "</div>"
                + "<div style=\"font-size:13px;color:#495057;margin-top:8px;\">Số may mắn của bạn: <strong>" + winner.getLuckyNumber() + "</strong> (KQXS: <strong>" + winningNumber + "</strong>)</div>"
                + "</div>"
                + "<p style=\"font-size:14px;color:#495057;\">Đội ngũ Admin Boki sẽ chủ động liên hệ qua số điện thoại <strong>" + winner.getPhone() + "</strong> để xác nhận địa chỉ gửi quà.</p>"
                + "</div>"
                + "<div style=\"background:#F8F9FA;padding:12px 20px;text-align:center;font-size:12px;color:#868E96;\">Boki.vn - Cảm ơn bạn đã luôn đồng hành cùng Boki!</div>"
                + "</div>";
    }
}
