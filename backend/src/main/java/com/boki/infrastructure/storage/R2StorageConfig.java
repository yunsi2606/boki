package com.boki.infrastructure.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;

@Configuration
public class R2StorageConfig {

    @Value("${app.cloudflare.r2.account-id:}")
    private String accountId;

    @Value("${app.cloudflare.r2.access-key-id:}")
    private String accessKeyId;

    @Value("${app.cloudflare.r2.secret-access-key:}")
    private String secretAccessKey;

    @Bean
    public S3Client r2S3Client() {
        if (accountId == null || accountId.trim().isEmpty() ||
            accessKeyId == null || accessKeyId.trim().isEmpty()) {
            // Return null or placeholder if credentials are not configured yet
            return null;
        }

        String endpoint = String.format("https://%s.r2.cloudflarestorage.com", accountId);

        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKeyId, secretAccessKey)
                ))
                .region(Region.US_EAST_1) // Cloudflare R2 requires US_EAST_1 or auto
                .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
                .build();
    }
}
