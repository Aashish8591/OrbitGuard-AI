package com.orbitguard.common.sequence;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * MongoDB document used to store sequence counters.
 *
 * Example Document:
 *
 * {
 *      "_id" : "debris_sequence",
 *      "sequence" : 101
 * }
 *
 * This collection is used for generating
 * unique sequential business codes.
 *
 * Example:
 * DEB-000101
 * SAT-000015
 * ALT-000025
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "database_sequences")
public class DatabaseSequence {

    /**
     * Sequence name.
     *
     * Example:
     * debris_sequence
     * satellite_sequence
     */
    @Id
    private String id;

    /**
     * Current sequence value.
     */
    private long sequence;
}