
package com.orbitguard.report.repository;

import com.orbitguard.report.entity.Report;
import com.orbitguard.report.enums.ReportStatus;
import com.orbitguard.report.enums.ReportType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for persistence and querying of OrbitGuard AI reports.
 *
 * Provides standard MongoDB CRUD operations, existing report
 * filtering methods, and optional paginated query methods.
 *
 * Existing list-based methods are retained for backward compatibility.
 */
@Repository
public interface ReportRepository extends MongoRepository<Report, String> {

    /**
     * Finds a report using its unique business code.
     *
     * @param reportCode unique report business code
     * @return matching report, if available
     */
    Optional<Report> findByReportCode(String reportCode);

    /**
     * Checks whether a report exists with the supplied business code.
     *
     * @param reportCode unique report business code
     * @return true when the report exists
     */
    boolean existsByReportCode(String reportCode);

    /**
     * Retrieves reports by report type.
     *
     * @param reportType report type
     * @return matching reports
     */
    List<Report> findByReportType(ReportType reportType);

    /**
     * Retrieves reports by processing status.
     *
     * @param status report status
     * @return matching reports
     */
    List<Report> findByStatus(ReportStatus status);

    /**
     * Retrieves reports matching both report type and status.
     *
     * @param reportType report type
     * @param status report status
     * @return matching reports
     */
    List<Report> findByReportTypeAndStatus(
            ReportType reportType,
            ReportStatus status
    );

    /**
     * Retrieves all reports using pagination and optional sorting.
     *
     * @param pageable page number, page size, and sorting configuration
     * @return requested page of reports
     */
    Page<Report> findAllBy(Pageable pageable);

    /**
     * Retrieves reports by type using pagination and optional sorting.
     *
     * @param reportType report type
     * @param pageable page number, page size, and sorting configuration
     * @return requested page of matching reports
     */
    Page<Report> findByReportType(
            ReportType reportType,
            Pageable pageable
    );

    /**
     * Retrieves reports by status using pagination and optional sorting.
     *
     * @param status report status
     * @param pageable page number, page size, and sorting configuration
     * @return requested page of matching reports
     */
    Page<Report> findByStatus(
            ReportStatus status,
            Pageable pageable
    );

    /**
     * Retrieves reports by type and status using pagination and sorting.
     *
     * @param reportType report type
     * @param status report status
     * @param pageable page number, page size, and sorting configuration
     * @return requested page of matching reports
     */
    Page<Report> findByReportTypeAndStatus(
            ReportType reportType,
            ReportStatus status,
            Pageable pageable
    );
}
