package com.orbitguard.report.util;

import com.orbitguard.report.entity.Report;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

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
 *     <li>Wrap long text within the page boundaries</li>
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
     * Standard PDF fonts used by the report.
     *
     * <p>
     * PDFBox Standard 14 fonts provide broad compatibility
     * without requiring an external font file.
     * </p>
     */
    private static final PDFont BOLD_FONT =
            new PDType1Font(
                    Standard14Fonts.FontName.HELVETICA_BOLD
            );

    private static final PDFont REGULAR_FONT =
            new PDType1Font(
                    Standard14Fonts.FontName.HELVETICA
            );

    /**
     * Horizontal position where field values begin.
     */
    private static final float VALUE_X_POSITION = 160;

    /**
     * Right margin of the PDF.
     */
    private static final float RIGHT_MARGIN = 50;

    /**
     * Maximum width available for field values.
     */
    private static final float VALUE_MAX_WIDTH =
            PDRectangle.A4.getWidth()
                    - VALUE_X_POSITION
                    - RIGHT_MARGIN;

    /**
     * Standard line spacing for wrapped field values.
     */
    private static final float LINE_SPACING = 15;


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
                BOLD_FONT,
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
                BOLD_FONT,
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
     * @return unchanged vertical position
     * @throws IOException when PDF content cannot be written
     */
    private float writeSectionTitle(
            PDPageContentStream contentStream,
            String title,
            float y
    ) throws IOException {

        contentStream.beginText();

        contentStream.setFont(
                BOLD_FONT,
                12
        );

        contentStream.newLineAtOffset(
                50,
                y
        );

        contentStream.showText(
                sanitizeForPdf(title, BOLD_FONT)
        );

        contentStream.endText();

        return y;
    }


    /**
     * Writes a label/value field and wraps the value when
     * it exceeds the available PDF width.
     *
     * @param contentStream PDF content stream
     * @param label field label
     * @param value field value
     * @param y starting vertical position
     * @return updated vertical position
     * @throws IOException when PDF content cannot be written
     */
    private float writeField(
            PDPageContentStream contentStream,
            String label,
            String value,
            float y
    ) throws IOException {

        String sanitizedLabel =
                sanitizeForPdf(label, BOLD_FONT);

        String sanitizedValue =
                sanitizeForPdf(value, REGULAR_FONT);

        List<String> lines =
                wrapText(
                        sanitizedValue,
                        REGULAR_FONT,
                        10,
                        VALUE_MAX_WIDTH
                );

        if (lines.isEmpty()) {
            lines = List.of("N/A");
        }


        /*
         * ----------------------------------------------------------
         * Write label
         * ----------------------------------------------------------
         */
        contentStream.beginText();

        contentStream.setFont(
                BOLD_FONT,
                10
        );

        contentStream.newLineAtOffset(
                50,
                y
        );

        contentStream.showText(
                sanitizedLabel + " :"
        );

        contentStream.endText();


        /*
         * ----------------------------------------------------------
         * Write wrapped value lines
         * ----------------------------------------------------------
         */
        float currentY = y;

        for (String line : lines) {

            contentStream.beginText();

            contentStream.setFont(
                    REGULAR_FONT,
                    10
            );

            contentStream.newLineAtOffset(
                    VALUE_X_POSITION,
                    currentY
            );

            contentStream.showText(line);

            contentStream.endText();

            currentY -= LINE_SPACING;
        }

        /*
         * Add a small extra gap after multi-line fields.
         */
        return currentY - 5;
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
                REGULAR_FONT,
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
            LocalDateTime dateTime
    ) {

        if (dateTime == null) {
            return "N/A";
        }

        return dateTime.format(DATE_TIME_FORMATTER);
    }


    /**
     * Sanitizes text according to the actual PDF font.
     *
     * <p>
     * PDFBox Standard 14 fonts have limited character support.
     * Instead of assuming a particular character encoding,
     * this method asks the actual PDF font whether each
     * Unicode code point can be encoded.
     *
     * <p>
     * Unsupported characters are replaced with '?' so that
     * PDF generation remains stable.
     * </p>
     *
     * @param value source text
     * @param font PDF font used to render the text
     * @return sanitized PDF-safe text
     * @throws IOException when font encoding cannot be checked
     */
    private String sanitizeForPdf(
            String value,
            PDFont font
    ) throws IOException {

        if (value == null || value.isBlank()) {
            return "N/A";
        }

        String normalized =
                value
                        .replace("\r", " ")
                        .replace("\n", " ")
                        .trim();

        StringBuilder sanitized =
                new StringBuilder();

        for (int offset = 0;
             offset < normalized.length();) {

            int codePoint =
                    normalized.codePointAt(offset);

            String character =
                    new String(
                            Character.toChars(codePoint)
                    );

            if (Character.isISOControl(codePoint)) {
                sanitized.append(' ');
            } else {
                try {
                    font.encode(character);
                    sanitized.append(character);
                } catch (IllegalArgumentException ex) {
                    sanitized.append('?');
                }
            }

            offset += Character.charCount(codePoint);
        }

        return sanitized.toString();
    }


    /**
     * Wraps text according to the available PDF width.
     *
     * <p>
     * Words are kept together whenever possible. If a single
     * word itself is wider than the available width, it is split
     * into smaller portions.
     * </p>
     *
     * @param text text to wrap
     * @param font PDF font
     * @param fontSize font size
     * @param maxWidth maximum allowed width
     * @return wrapped text lines
     * @throws IOException when font metrics cannot be calculated
     */
    private List<String> wrapText(
            String text,
            PDFont font,
            float fontSize,
            float maxWidth
    ) throws IOException {

        List<String> lines =
                new ArrayList<>();

        if (text == null || text.isBlank()) {
            lines.add("N/A");
            return lines;
        }

        String[] words =
                text.trim().split("\\s+");

        StringBuilder currentLine =
                new StringBuilder();

        for (String word : words) {

            if (currentLine.isEmpty()) {

                if (getTextWidth(
                        word,
                        font,
                        fontSize
                ) <= maxWidth) {

                    currentLine.append(word);

                } else {

                    lines.addAll(
                            splitLongWord(
                                    word,
                                    font,
                                    fontSize,
                                    maxWidth
                            )
                    );
                }

                continue;
            }

            String candidate =
                    currentLine
                            + " "
                            + word;

            if (getTextWidth(
                    candidate,
                    font,
                    fontSize
            ) <= maxWidth) {

                currentLine.append(" ")
                        .append(word);

            } else {

                lines.add(
                        currentLine.toString()
                );

                currentLine.setLength(0);

                if (getTextWidth(
                        word,
                        font,
                        fontSize
                ) <= maxWidth) {

                    currentLine.append(word);

                } else {

                    lines.addAll(
                            splitLongWord(
                                    word,
                                    font,
                                    fontSize,
                                    maxWidth
                            )
                    );
                }
            }
        }

        if (!currentLine.isEmpty()) {
            lines.add(
                    currentLine.toString()
            );
        }

        return lines;
    }


    /**
     * Splits a single word when the word itself exceeds the
     * available PDF width.
     *
     * @param word word to split
     * @param font PDF font
     * @param fontSize font size
     * @param maxWidth maximum allowed width
     * @return split lines
     * @throws IOException when font metrics cannot be calculated
     */
    private List<String> splitLongWord(
            String word,
            PDFont font,
            float fontSize,
            float maxWidth
    ) throws IOException {

        List<String> lines =
                new ArrayList<>();

        StringBuilder currentPart =
                new StringBuilder();

        for (int offset = 0;
             offset < word.length();) {

            int codePoint =
                    word.codePointAt(offset);

            String character =
                    new String(
                            Character.toChars(codePoint)
                    );

            String candidate =
                    currentPart.toString()
                            + character;

            if (getTextWidth(
                    candidate,
                    font,
                    fontSize
            ) <= maxWidth) {

                currentPart.append(character);

            } else {

                if (!currentPart.isEmpty()) {
                    lines.add(
                            currentPart.toString()
                    );
                }

                currentPart.setLength(0);
                currentPart.append(character);
            }

            offset += Character.charCount(codePoint);
        }

        if (!currentPart.isEmpty()) {
            lines.add(
                    currentPart.toString()
            );
        }

        return lines;
    }


    /**
     * Calculates the rendered width of text.
     *
     * @param text text to measure
     * @param font PDF font
     * @param fontSize font size
     * @return text width
     * @throws IOException when font metrics cannot be calculated
     */
    private float getTextWidth(
            String text,
            PDFont font,
            float fontSize
    ) throws IOException {

        return font.getStringWidth(text)
                / 1000
                * fontSize;
    }
}