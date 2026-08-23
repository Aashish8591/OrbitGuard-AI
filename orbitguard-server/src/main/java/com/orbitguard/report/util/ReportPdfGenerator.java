package com.orbitguard.report.util;

import com.orbitguard.report.entity.Report;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

/**
 * ==============================================================
 * Report PDF Generator
 * ==============================================================
 *
 * Responsible for generating a PDF representation of an existing
 * OrbitGuard AI report.
 *
 * <p>
 * This component belongs to the presentation/document-generation
 * layer of the Reports module. It does not perform business
 * operations or database access.
 * </p>
 *
 * Responsibilities:
 * <ul>
 *     <li>Accept an existing Report entity</li>
 *     <li>Create a PDF document</li>
 *     <li>Write report information into the document</li>
 *     <li>Return the generated PDF as byte[]</li>
 * </ul>
 *
 * <p>
 * It deliberately does NOT:
 * </p>
 * <ul>
 *     <li>Access MongoDB</li>
 *     <li>Call repositories</li>
 *     <li>Generate report business codes</li>
 *     <li>Change report status</li>
 *     <li>Contain report business logic</li>
 * </ul>
 *
 * Module : Reports
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Slf4j
@Component
public class ReportPdfGenerator {

    /**
     * Date-time format used inside generated reports.
     */
    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm:ss");


    /**
     * Generates a PDF document for the supplied report.
     *
     * @param report report entity containing the information
     *              that should appear in the PDF
     * @return generated PDF content as byte array
     * @throws IllegalArgumentException when report is null
     * @throws IllegalStateException when PDF generation fails
     */
    public byte[] generate(Report report) {

        if (report == null) {
            throw new IllegalArgumentException(
                    "Report must not be null."
            );
        }

        try (
                PDDocument document = new PDDocument();
                ByteArrayOutputStream outputStream =
                        new ByteArrayOutputStream()
        ) {

            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (
                    PDPageContentStream contentStream =
                            new PDPageContentStream(document, page)
            ) {

                writeHeader(contentStream);
                writeReportDetails(contentStream, report);
                writeFooter(contentStream);
            }

            document.save(outputStream);

            return outputStream.toByteArray();

        } catch (IOException ex) {

            log.error(
                    "Failed to generate PDF for report: {}",
                    report.getReportCode(),
                    ex
            );

            throw new IllegalStateException(
                    "Unable to generate report PDF.",
                    ex
            );
        }
    }


    /**
     * Writes the main PDF header.
     *
     * @param contentStream PDF content stream
     * @throws IOException when PDF content cannot be written
     */
    private void writeHeader(
            PDPageContentStream contentStream
    ) throws IOException {

        /*
         * ----------------------------------------------------------
         * Application Name
         * ----------------------------------------------------------
         */
        contentStream.beginText();

        contentStream.setFont(
                new PDType1Font(
                        Standard14Fonts.FontName.HELVETICA_BOLD
                ),
                20
        );

        contentStream.newLineAtOffset(
                50,
                770
        );

        contentStream.showText(
                "ORBITGUARD AI"
        );

        contentStream.endText();


        /*
         * ----------------------------------------------------------
         * Report Heading
         * ----------------------------------------------------------
         */
        contentStream.beginText();

        contentStream.setFont(
                new PDType1Font(
                        Standard14Fonts.FontName.HELVETICA_BOLD
                ),
                16
        );

        contentStream.newLineAtOffset(
                50,
                735
        );

        contentStream.showText(
                "REPORT"
        );

        contentStream.endText();


        /*
         * ----------------------------------------------------------
         * Separator Line
         * ----------------------------------------------------------
         */
        contentStream.moveTo(
                50,
                720
        );

        contentStream.lineTo(
                545,
                720
        );

        contentStream.stroke();
    }


    /**
     * Writes report information into the PDF.
     *
     * @param contentStream PDF content stream
     * @param report report entity
     * @throws IOException when PDF content cannot be written
     */
    private void writeReportDetails(
            PDPageContentStream contentStream,
            Report report
    ) throws IOException {

        float currentY = 680;


        /*
         * ----------------------------------------------------------
         * Report Identification
         * ----------------------------------------------------------
         */
        currentY = writeSectionTitle(
                contentStream,
                "Report Information",
                currentY
        );

        currentY -= 25;

        currentY = writeField(
                contentStream,
                "Report Code",
                safeValue(report.getReportCode()),
                currentY
        );

        currentY = writeField(
                contentStream,
                "Report Type",
                report.getReportType() != null
                        ? report.getReportType().name()
                        : "N/A",
                currentY
        );

        currentY = writeField(
                contentStream,
                "Status",
                report.getStatus() != null
                        ? report.getStatus().name()
                        : "N/A",
                currentY
        );


        /*
         * ----------------------------------------------------------
         * Report Content
         * ----------------------------------------------------------
         */
        currentY -= 20;

        currentY = writeSectionTitle(
                contentStream,
                "Report Details",
                currentY
        );

        currentY -= 25;

        currentY = writeField(
                contentStream,
                "Title",
                safeValue(report.getTitle()),
                currentY
        );

        currentY = writeField(
                contentStream,
                "Description",
                safeValue(report.getDescription()),
                currentY
        );


        /*
         * ----------------------------------------------------------
         * Timestamps
         * ----------------------------------------------------------
         */
        currentY -= 20;

        currentY = writeSectionTitle(
                contentStream,
                "Timestamps",
                currentY
        );

        currentY -= 25;

        currentY = writeField(
                contentStream,
                "Created At",
                formatDateTime(report.getCreatedAt()),
                currentY
        );

        writeField(
                contentStream,
                "Updated At",
                formatDateTime(report.getUpdatedAt()),
                currentY
        );
    }


    /**
     * Writes a section heading.
     *
     * @param contentStream PDF content stream
     * @param title section title
     * @param y vertical position
     * @return updated vertical position
     * @throws IOException when PDF content cannot be written
     */
    private float writeSectionTitle(
            PDPageContentStream contentStream,
            String title,
            float y
    ) throws IOException {

        contentStream.beginText();

        contentStream.setFont(
                new PDType1Font(
                        Standard14Fonts.FontName.HELVETICA_BOLD
                ),
                12
        );

        contentStream.newLineAtOffset(
                50,
                y
        );

        contentStream.showText(title);

        contentStream.endText();

        return y;
    }


    /**
     * Writes a label/value field.
     *
     * @param contentStream PDF content stream
     * @param label field label
     * @param value field value
     * @param y vertical position
     * @return updated vertical position
     * @throws IOException when PDF content cannot be written
     */
    private float writeField(
            PDPageContentStream contentStream,
            String label,
            String value,
            float y
    ) throws IOException {

        contentStream.beginText();

        contentStream.setFont(
                new PDType1Font(
                        Standard14Fonts.FontName.HELVETICA_BOLD
                ),
                10
        );

        contentStream.newLineAtOffset(
                50,
                y
        );

        contentStream.showText(
                label + " :"
        );

        contentStream.setFont(
                new PDType1Font(
                        Standard14Fonts.FontName.HELVETICA
                ),
                10
        );

        contentStream.newLineAtOffset(
                110,
                0
        );

        contentStream.showText(
                sanitizeForPdf(value)
        );

        contentStream.endText();

        return y - 20;
    }


    /**
     * Writes the PDF footer.
     *
     * @param contentStream PDF content stream
     * @throws IOException when PDF content cannot be written
     */
    private void writeFooter(
            PDPageContentStream contentStream
    ) throws IOException {

        contentStream.moveTo(
                50,
                55
        );

        contentStream.lineTo(
                545,
                55
        );

        contentStream.stroke();

        contentStream.beginText();

        contentStream.setFont(
                new PDType1Font(
                        Standard14Fonts.FontName.HELVETICA
                ),
                8
        );

        contentStream.newLineAtOffset(
                50,
                40
        );

        contentStream.showText(
                "Generated by OrbitGuard AI"
        );

        contentStream.endText();
    }


    /**
     * Returns a safe value for nullable report fields.
     *
     * @param value source value
     * @return original value or N/A
     */
    private String safeValue(String value) {

        if (value == null || value.isBlank()) {
            return "N/A";
        }

        return value.trim();
    }


    /**
     * Formats a report timestamp.
     *
     * @param dateTime timestamp
     * @return formatted timestamp or N/A
     */
    private String formatDateTime(
            java.time.LocalDateTime dateTime
    ) {

        if (dateTime == null) {
            return "N/A";
        }

        return dateTime.format(DATE_TIME_FORMATTER);
    }


    /**
     * Sanitizes text before passing it to PDFBox's standard
     * Helvetica font.
     *
     * <p>
     * PDFBox Standard 14 fonts do not support arbitrary Unicode
     * characters. Replacing unsupported line-breaking/control
     * characters prevents malformed PDF text output.
     * </p>
     *
     * @param value source text
     * @return sanitized PDF-safe text
     */
    private String sanitizeForPdf(String value) {

        if (value == null || value.isBlank()) {
            return "N/A";
        }

        return value
                .replace("\r", " ")
                .replace("\n", " ")
                .trim();
    }
}