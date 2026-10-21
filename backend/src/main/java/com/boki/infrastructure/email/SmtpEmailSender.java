package com.boki.infrastructure.email;

import com.boki.application.dto.notification.SmtpConfigDto;
import com.boki.infrastructure.persistence.entity.EmailOutboxJobJpaEntity;
import com.boki.infrastructure.persistence.entity.EmailSmtpConfigJpaEntity;
import com.boki.infrastructure.persistence.repository.EmailSmtpConfigJpaRepository;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Properties;

@Slf4j
@Component
@RequiredArgsConstructor
public class SmtpEmailSender {

    private final EmailSmtpConfigJpaRepository smtpConfigRepo;

    public void sendJob(EmailOutboxJobJpaEntity job) throws Exception {
        EmailSmtpConfigJpaEntity config = smtpConfigRepo.findActiveConfig()
                .orElseThrow(() -> new IllegalStateException("SMTP Configuration not found in database"));

        if (!Boolean.TRUE.equals(config.getIsEnabled())) {
            throw new IllegalStateException("SMTP sending is disabled in system settings");
        }

        JavaMailSenderImpl mailSender = buildMailSender(
                config.getHost(),
                config.getPort(),
                config.getUsername(),
                config.getPassword(),
                config.getAuthEnabled(),
                config.getStarttlsEnabled()
        );

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, StandardCharsets.UTF_8.name());

        helper.setFrom(new InternetAddress(config.getFromEmail(), config.getFromName(), StandardCharsets.UTF_8.name()));
        helper.setTo(job.getRecipientEmail());
        helper.setSubject(job.getSubject());

        if (config.getReplyTo() != null && !config.getReplyTo().isBlank()) {
            helper.setReplyTo(config.getReplyTo());
        }

        // Dual-part alternative (plain text + html)
        helper.setText(job.getBodyText() != null ? job.getBodyText() : "", job.getBodyHtml());

        // Anti-Spam & Deliverability Headers (RFC 8058 & ISP Reputation)
        if (job.getUnsubscribeUrl() != null && !job.getUnsubscribeUrl().isBlank()) {
            mimeMessage.setHeader("List-Unsubscribe", "<" + job.getUnsubscribeUrl() + ">");
            mimeMessage.setHeader("List-Unsubscribe-Post", "List-Unsubscribe=One-Click");
        }
        mimeMessage.setHeader("Precedence", "bulk");
        mimeMessage.setHeader("X-Auto-Response-Suppress", "OOF, AutoReply");

        mailSender.send(mimeMessage);
        log.info("Sent email id={} to={}", job.getId(), job.getRecipientEmail());
    }

    public void testConnection(SmtpConfigDto dto) throws Exception {
        JavaMailSenderImpl mailSender = buildMailSender(
                dto.getHost(),
                dto.getPort(),
                dto.getUsername(),
                dto.getPassword(),
                dto.getAuthEnabled(),
                dto.getStarttlsEnabled()
        );
        mailSender.testConnection();
    }

    private JavaMailSenderImpl buildMailSender(
            String host,
            Integer port,
            String username,
            String password,
            Boolean auth,
            Boolean starttls
    ) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        String safeHost = host != null && !host.isBlank() ? host.trim() : "smtp.gmail.com";
        int safePort = port != null ? port : 587;
        sender.setHost(safeHost);
        sender.setPort(safePort);
        sender.setDefaultEncoding(StandardCharsets.UTF_8.name());

        if (username != null && !username.isBlank()) {
            sender.setUsername(username.trim());
        }
        if (password != null && !password.isBlank()) {
            sender.setPassword(password.replaceAll("\\s+", ""));
        }

        boolean isAuth = auth == null || Boolean.TRUE.equals(auth);
        boolean isStarttls = starttls == null || Boolean.TRUE.equals(starttls);

        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", String.valueOf(isAuth));

        if (safePort == 465) {
            props.put("mail.smtp.ssl.enable", "true");
            props.put("mail.smtp.socketFactory.port", "465");
            props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
        } else {
            props.put("mail.smtp.starttls.enable", String.valueOf(isStarttls));
            props.put("mail.smtp.starttls.required", String.valueOf(isStarttls));
        }

        props.put("mail.smtp.ssl.protocols", "TLSv1.2 TLSv1.3");
        props.put("mail.smtp.ssl.trust", safeHost);
        props.put("mail.smtp.connectiontimeout", "7000");
        props.put("mail.smtp.timeout", "7000");
        props.put("mail.smtp.writetimeout", "7000");

        return sender;
    }
}
