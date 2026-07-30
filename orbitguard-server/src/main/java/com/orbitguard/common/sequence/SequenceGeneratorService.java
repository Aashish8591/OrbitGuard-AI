package com.orbitguard.common.sequence;

import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

/**
 * Service responsible for generating
 * unique sequential numbers using MongoDB.
 *
 * <p>
 * Uses MongoDB's atomic findAndModify() operation
 * to safely increment sequence values.
 *
 * Example:
 *
 * database_sequences
 *
 * {
 *      "_id": "debris_sequence",
 *      "sequence": 15
 * }
 *
 * getNextSequence("debris_sequence")
 *
 * returns
 *
 * 16
 * </p>
 *
 * This service is reusable across
 * all OrbitGuard AI modules.
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class SequenceGeneratorService {

    private final MongoOperations mongoOperations;

    /**
     * Returns the next sequence number.
     *
     * @param sequenceName sequence identifier
     * @return next sequence value
     */
    public long getNextSequence(String sequenceName) {

        Query query = new Query(
                Criteria.where("_id").is(sequenceName)
        );

        Update update = new Update().inc("sequence", 1);

        FindAndModifyOptions options =
                FindAndModifyOptions.options()
                        .returnNew(true)
                        .upsert(true);

        DatabaseSequence counter =
                mongoOperations.findAndModify(
                        query,
                        update,
                        options,
                        DatabaseSequence.class
                );

        if (counter == null) {
            throw new IllegalStateException(
                    "Unable to generate sequence for: " + sequenceName
            );
        }

        return counter.getSequence();
    }

}