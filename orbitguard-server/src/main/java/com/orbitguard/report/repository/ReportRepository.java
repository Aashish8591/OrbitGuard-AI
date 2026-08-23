package com.orbitguard.report.repository;

import com.orbitguard.report.entity.Report;
import com.orbitguard.report.enums.ReportStatus;
import com.orbitguard.report.enums.ReportType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Report persistence operations.
 *
 * <p>
 * Provides CRUD operations through Spring Data MongoDB and
 * exposes only the custom query methods required by the
 * Reports module.
 * </p>
 */
@Repository
public interface ReportRepository extends MongoRepository<Report, String> {

    /**
     * Finds a report using its unique business code.
     *
     * @param reportCode unique report business code
     * @return matching report when available
     */
    Optional<Report> findByReportCode(String reportCode);

    /**
     * Checks whether a report exists with the supplied business code.
     *
     * @param reportCode unique report business code
     * @return true when the report exists, otherwise false
     */
    boolean existsByReportCode(String reportCode);

    /**
     * Retrieves reports belonging to a specific report type.
     *
     * @param reportType report type used for filtering
     * @return reports matching the supplied type
     */
    List<Report> findByReportType(ReportType reportType);

    /**
     * Retrieves reports having a specific processing status.
     *
     * @param status report processing status
     * @return reports matching the supplied status
     */
    List<Report> findByStatus(ReportStatus status);

    /**
     * Retrieves reports by report type and status.
     *
     * @param reportType report type used for filtering
     * @param status report status used for filtering
     * @return reports matching both conditions
     */
    List<Report> findByReportTypeAndStatus(
            ReportType reportType,
            ReportStatus status
    );
}