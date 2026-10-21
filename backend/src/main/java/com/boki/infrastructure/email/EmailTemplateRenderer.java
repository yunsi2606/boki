package com.boki.infrastructure.email;

import org.springframework.stereotype.Component;

@Component
public class EmailTemplateRenderer {

    public record RenderedEmail(String subject, String htmlBody, String textBody) {}

    public RenderedEmail renderReleaseAlert(
            String recipientEmail,
            String seriesName,
            String volumeTitle,
            String releaseDate,
            String publisher,
            String price,
            String coverUrl,
            String detailUrl,
            String unsubscribeUrl
    ) {
        String subject = "Lịch phát hành: " + volumeTitle + " chuẩn bị ra mắt!";

        String textBody = String.format(
                "THÔNG BÁO LỊCH PHÁT HÀNH - BOKI\n\n" +
                "Tác phẩm: %s\n" +
                "Tập phát hành: %s\n" +
                "Ngày phát hành dự kiến: %s\n" +
                "Nhà xuất bản: %s\n" +
                "%s\n\n" +
                "Xem chi tiết ấn bản và đặt mua tại: %s\n\n" +
                "---\n" +
                "Bạn nhận được email này vì đã đăng ký theo dõi bộ truyện \"%s\" trên Boki Schedule.\n" +
                "Hủy nhận thông báo bộ truyện này: %s",
                seriesName, volumeTitle, releaseDate, publisher,
                price != null ? "Giá dự kiến: " + price : "",
                detailUrl, seriesName, unsubscribeUrl
        );

        String htmlBody = """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>%s</title>
                  <style>
                    body { margin: 0; padding: 0; background-color: #F8F9FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #343A40; }
                    .wrapper { width: 100%%; background-color: #F8F9FA; padding: 24px 0; }
                    .card { max-width: 580px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E9ECEF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
                    .header { background: #FFFFFF; padding: 20px 24px; border-bottom: 1px solid #E9ECEF; text-align: left; }
                    .brand { font-size: 20px; font-weight: 800; color: #EE4D2D; letter-spacing: -0.02em; }
                    .brand-sub { font-size: 11px; font-weight: 700; color: #868E96; margin-left: 8px; letter-spacing: 0.05em; }
                    .content { padding: 28px 24px; }
                    .badge { display: inline-block; background: rgba(238, 77, 45, 0.1); color: #EE4D2D; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px; margin-bottom: 12px; }
                    .title { font-size: 20px; font-weight: 800; color: #111827; margin: 0 0 16px 0; line-height: 1.3; }
                    .book-table { width: 100%%; margin: 16px 0; border-collapse: collapse; }
                    .book-cover { width: 110px; vertical-align: top; padding-right: 16px; }
                    .book-cover img { width: 110px; height: 160px; object-fit: cover; border-radius: 8px; border: 1px solid #E9ECEF; display: block; }
                    .book-details { vertical-align: top; font-size: 14px; line-height: 1.6; color: #495057; }
                    .book-details strong { color: #111827; }
                    .cta-box { margin-top: 24px; text-align: center; }
                    .cta-btn { display: inline-block; background-color: #EE4D2D; color: #FFFFFF !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; }
                    .footer { background: #F8F9FA; padding: 20px 24px; border-top: 1px solid #E9ECEF; font-size: 12px; color: #868E96; line-height: 1.6; text-align: center; }
                    .unsub-link { color: #868E96; text-decoration: underline; }
                  </style>
                </head>
                <body>
                  <div class="wrapper">
                    <div class="card">
                      <div class="header">
                        <span class="brand">BOKI</span>
                        <span class="brand-sub">LỊCH PHÁT HÀNH MANGA</span>
                      </div>
                      <div class="content">
                        <span class="badge">SẮP PHÁT HÀNH</span>
                        <h1 class="title">%s</h1>
                        <table class="book-table">
                          <tr>
                            %s
                            <td class="book-details">
                              <p style="margin: 0 0 6px 0;"><strong>Bộ truyện:</strong> %s</p>
                              <p style="margin: 0 0 6px 0;"><strong>Tập:</strong> %s</p>
                              <p style="margin: 0 0 6px 0;"><strong>Ngày phát hành:</strong> %s</p>
                              <p style="margin: 0 0 6px 0;"><strong>Nhà xuất bản:</strong> %s</p>
                              %s
                            </td>
                          </tr>
                        </table>
                        <div class="cta-box">
                          <a href="%s" class="cta-btn" target="_blank">Xem thông tin & Mua ngay</a>
                        </div>
                      </div>
                      <div class="footer">
                        Email này được gửi đến <strong>%s</strong> vì bạn đã bật thông báo theo dõi bộ truyện "%s" trên Boki.<br>
                        <a href="%s" class="unsub-link">Hủy đăng ký nhận thông báo bộ truyện này</a>
                      </div>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(
                subject,
                volumeTitle,
                coverUrl != null && !coverUrl.isBlank() ? "<td class=\"book-cover\"><img src=\"" + coverUrl + "\" alt=\"Bìa sách\"></td>" : "",
                seriesName,
                volumeTitle,
                releaseDate,
                publisher,
                price != null ? "<p style=\"margin: 0 0 6px 0;\"><strong>Giá bìa:</strong> " + price + "</p>" : "",
                detailUrl,
                recipientEmail,
                seriesName,
                unsubscribeUrl
        );

        return new RenderedEmail(subject, htmlBody, textBody);
    }

    public RenderedEmail renderCustomBroadcast(
            String recipientEmail,
            String subject,
            String messageContent,
            String unsubscribeUrl
    ) {
        String textBody = messageContent + "\n\n---\nBoki Schedule\nHủy nhận tin: " + unsubscribeUrl;

        String htmlBody = """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                  <meta charset="UTF-8">
                  <style>
                    body { margin: 0; padding: 0; background: #F8F9FA; font-family: -apple-system, sans-serif; color: #343A40; }
                    .card { max-width: 580px; margin: 24px auto; background: #FFFFFF; border: 1px solid #E9ECEF; border-radius: 12px; overflow: hidden; }
                    .header { padding: 18px 24px; border-bottom: 1px solid #E9ECEF; }
                    .brand { font-size: 20px; font-weight: 800; color: #EE4D2D; }
                    .content { padding: 24px; font-size: 15px; line-height: 1.7; color: #343A40; white-space: pre-line; }
                    .footer { background: #F8F9FA; padding: 16px 24px; border-top: 1px solid #E9ECEF; font-size: 12px; color: #868E96; text-align: center; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="header"><span class="brand">BOKI</span></div>
                    <div class="content">%s</div>
                    <div class="footer">
                      Gửi đến %s · <a href="%s" style="color: #868E96;">Hủy đăng ký</a>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(messageContent, recipientEmail, unsubscribeUrl);

        return new RenderedEmail(subject, htmlBody, textBody);
    }
}
