package com.orbitguard.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * Enables automatic creation and modification timestamps
 * for MongoDB documents using Spring Data auditing.
 */
@Configuration
@EnableMongoAuditing
public class MongoAuditingConfig {
}
