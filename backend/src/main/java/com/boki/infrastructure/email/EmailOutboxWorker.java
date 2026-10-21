package com.boki.infrastructure.email;

import com.boki.infrastructure.persistence.entity.EmailOutboxJobJpaEntity;
import com.boki.infrastructure.persistence.entity.EmailSmtpConfigJpaEntity;
import com.boki.infrastructure.persistence.repository.EmailOutboxJobJpaRepository;
import com.boki.infrastructure.persistence.repository.EmailSmtpConfigJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailOutboxWorker {

    private final EmailOutboxJobJpaRepository outboxRepo;
    private final EmailSmtpConfigJpaRepository smtpConfigRepo;
    private final SmtpEmailSender smtpSender;

    @Scheduled(fixedDelay = 5000)
    public void processOutboxQueue() {
        EmailSmtpConfigJpaEntity config = smtpConfigRepo.findActiveConfig().orElse(null);
        if (config == null || !Boolean.TRUE.equals(config.getIsEnabled())) {
            return;
        }

        int ratePerMin = config.getMaxRatePerMinute() != null ? config.getMaxRatePerMinute() : 30;
        long delayBetweenSendsMs = Math.max(500, 60000L / Math.max(1, ratePerMin));
        int batchSize = Math.min(10, Math.max(2, ratePerMin / 6));

        List<EmailOutboxJobJpaEntity> pendingJobs = outboxRepo.findPendingJobs(
                OffsetDateTime.now(),
                PageRequest.of(0, batchSize)
        );

        if (pendingJobs.isEmpty()) {
            return;
        }

        for (EmailOutboxJobJpaEntity job : pendingJobs) {
            executeSingleJob(job);
            try {
                Thread.sleep(delayBetweenSendsMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void executeSingleJob(EmailOutboxJobJpaEntity job) {
        job.setStatus("SENDING");
        outboxRepo.save(job);

        try {
            smtpSender.sendJob(job);
            job.setStatus("SENT");
            job.setSentAt(OffsetDateTime.now());
            job.setErrorMessage(null);
            outboxRepo.save(job);
        } catch (Exception ex) {
            log.error("Failed to send email job {}: {}", job.getId(), ex.getMessage());
            int retries = (job.getRetryCount() != null ? job.getRetryCount() : 0) + 1;
            job.setRetryCount(retries);

            String errMsg = ex.getMessage();
            if (errMsg != null && errMsg.length() > 1000) {
                errMsg = errMsg.substring(0, 1000);
            }
            job.setErrorMessage(errMsg);

            boolean isBounce = errMsg != null && (errMsg.contains("550") || errMsg.contains("NoSuchUser"));
            if (isBounce) {
                job.setStatus("BOUNCED");
            } else if (retries >= job.getMaxRetries()) {
                job.setStatus("FAILED");
            } else {
                job.setStatus("PENDING");
                job.setScheduledAt(OffsetDateTime.now().plusMinutes(2L * retries));
            }
            outboxRepo.save(job);
        }
    }
}
