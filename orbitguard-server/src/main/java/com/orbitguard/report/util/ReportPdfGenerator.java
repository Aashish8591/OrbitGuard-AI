
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
 * Generates PDF documents containing OrbitGuard AI report metadata.
 *
 * This component is responsible only for document presentation.
 * It does not access repositories, generate business codes,
 * or change report status.
 *
 * Long content is wrapped and continued across multiple pages.
 *
 * @author OrbitGuard AI Team
 * @version 1.1
 */
@Slf4j
@Component
public class ReportPdfGenerator {

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm:ss");

    private static final PDFont BOLD_FONT =
            new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

    private static final PDFont REGULAR_FONT =
            new PDType1Font(Standard14Fonts.FontName.HELVETICA);

    private static final PDRectangle PAGE_SIZE = PDRectangle.A4;

    private static final float LEFT_MARGIN = 50F;
    private static final float RIGHT_MARGIN = 50F;
    private static final float TOP_MARGIN = 50F;
    private static final float BOTTOM_MARGIN = 75F;

    private static final float VALUE_X_POSITION = 160F;

    private static final float VALUE_MAX_WIDTH =
            PAGE_SIZE.getWidth() - VALUE_X_POSITION - RIGHT_MARGIN;

    private static final float LINE_SPACING = 15F;
    private static final float FIELD_GAP = 5F;

    private static final float HEADER_FONT_SIZE = 20F;
    private static final float TITLE_FONT_SIZE = 16F;
    private static final float SECTION_FONT_SIZE = 12F;
    private static final float FIELD_FONT_SIZE = 10F;
    private static final float FOOTER_FONT_SIZE = 8F;

    /**
     * Generates a PDF for an existing report.
     *
     * @param report report entity
     * @return PDF bytes
     * @throws IllegalArgumentException if report is null
     * @throws IllegalStateException if PDF generation fails
     */
    public byte[] generate(Report report) {

        if (report == null) {
            throw new IllegalArgumentException(
                    "Report must not be null."
            );
        }

        String reportCode = safeValue(report.getReportCode());

        try (
                PDDocument document = new PDDocument();
                ByteArrayOutputStream outputStream =
                        new ByteArrayOutputStream()
        ) {
            PageWriter writer = new PageWriter(document);

            try {
                writeReportDetails(writer, report);
            } finally {
                writer.close();
            }

            document.save(outputStream);

            byte[] pdfBytes = outputStream.toByteArray();

            if (pdfBytes.length == 0) {
                throw new IOException(
                        "PDF generation produced an empty document."
                );
            }

            log.debug(
                    "Report PDF generated. reportCode={}, pages={}, bytes={}",
                    reportCode,
                    writer.getPageNumber(),
                    pdfBytes.length
            );

            return pdfBytes;

        } catch (IOException | RuntimeException ex) {
            log.error(
                    "Failed to generate PDF. reportCode={}",
                    reportCode,
                    ex
            );

            throw new IllegalStateException(
                    "Unable to generate report PDF.",
                    ex
            );
        }
    }

    /**
     * Writes report fields in their intended display order.
     */
    private void writeReportDetails(
            PageWriter writer,
            Report report
    ) throws IOException {

        writer.writeSectionTitle("Report Information");

        writer.writeField(
                "Report Code",
                safeValue(report.getReportCode())
        );

        writer.writeField(
                "Report Type",
                report.getReportType() != null
                        ? report.getReportType().name()
                        : "N/A"
        );

        writer.writeField(
                "Status",
                report.getStatus() != null
                        ? report.getStatus().name()
                        : "N/A"
        );

        writer.addSpacing(15F);

        writer.writeSectionTitle("Report Details");

        writer.writeField(
                "Title",
                safeValue(report.getTitle())
        );

        writer.writeField(
                "Description",
                safeValue(report.getDescription())
        );

        writer.addSpacing(15F);

        writer.writeSectionTitle("Timestamps");

        writer.writeField(
                "Created At",
                formatDateTime(report.getCreatedAt())
        );

        writer.writeField(
                "Updated At",
                formatDateTime(report.getUpdatedAt())
        );
    }

    private String safeValue(String value) {
        if (value == null || value.isBlank()) {
            return "N/A";
        }

        return value.trim();
    }

    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "N/A";
        }

        return dateTime.format(DATE_TIME_FORMATTER);
    }

    /**
     * Replaces unsupported characters so Standard 14 fonts do not
     * fail when report data contains unsupported Unicode characters.
     */
    private String sanitizeForPdf(
            String value,
            PDFont font
    ) throws IOException {

        if (value == null || value.isBlank()) {
            return "N/A";
        }

        String normalized = value
                .replace("\r", " ")
                .replace("\n", " ")
                .replace("\t", " ")
                .trim();

        StringBuilder result = new StringBuilder();

        for (int offset = 0; offset < normalized.length();) {
            int codePoint = normalized.codePointAt(offset);

            String character = new String(
                    Character.toChars(codePoint)
            );

            if (Character.isISOControl(codePoint)) {
                result.append(' ');
            } else {
                try {
                    font.encode(character);
                    result.append(character);
                } catch (IllegalArgumentException ex) {
                    result.append('?');
                }
            }

            offset += Character.charCount(codePoint);
        }

        return result.toString();
    }

    /**
     * Wraps text using the actual font metrics.
     */
    private List<String> wrapText(
            String text,
            PDFont font,
            float fontSize,
            float maxWidth
    ) throws IOException {

        List<String> lines = new ArrayList<>();

        if (text == null || text.isBlank()) {
            lines.add("N/A");
            return lines;
        }

        String[] words = text.trim().split("\\s+");
        StringBuilder currentLine = new StringBuilder();

        for (String word : words) {
            if (currentLine.isEmpty()) {
                if (getTextWidth(word, font, fontSize) <= maxWidth) {
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

            String candidate = currentLine + " " + word;

            if (getTextWidth(candidate, font, fontSize) <= maxWidth) {
                currentLine.append(" ").append(word);
            } else {
                lines.add(currentLine.toString());
                currentLine.setLength(0);

                if (getTextWidth(word, font, fontSize) <= maxWidth) {
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
            lines.add(currentLine.toString());
        }

        return lines;
    }

    /**
     * Splits a single long word when it cannot fit on one line.
     */
    private List<String> splitLongWord(
            String word,
            PDFont font,
            float fontSize,
            float maxWidth
    ) throws IOException {

        List<String> lines = new ArrayList<>();
        StringBuilder currentPart = new StringBuilder();

        for (int offset = 0; offset < word.length();) {
            int codePoint = word.codePointAt(offset);

            String character = new String(
                    Character.toChars(codePoint)
            );

            String candidate = currentPart + character;

            if (getTextWidth(candidate, font, fontSize) <= maxWidth) {
                currentPart.append(character);
            } else {
                if (!currentPart.isEmpty()) {
                    lines.add(currentPart.toString());
                }

                currentPart.setLength(0);
                currentPart.append(character);
            }

            offset += Character.charCount(codePoint);
        }

        if (!currentPart.isEmpty()) {
            lines.add(currentPart.toString());
        }

        return lines;
    }

    private float getTextWidth(
            String text,
            PDFont font,
            float fontSize
    ) throws IOException {

        return font.getStringWidth(text) / 1000F * fontSize;
    }

    /**
     * Manages the active page, page breaks, text positioning,
     * and page footers.
     */
    private final class PageWriter {

        private final PDDocument document;

        private PDPage page;
        private PDPageContentStream contentStream;
        private float currentY;
        private int pageNumber;
        private boolean closed;

        private PageWriter(PDDocument document) throws IOException {
            this.document = document;
            startNewPage(false);
        }

        private int getPageNumber() {
            return pageNumber;
        }

        private void writeSectionTitle(
                String title
        ) throws IOException {

            ensureSpace(30F);

            drawText(
                    LEFT_MARGIN,
                    currentY,
                    sanitizeForPdf(title, BOLD_FONT),
                    BOLD_FONT,
                    SECTION_FONT_SIZE
            );

            currentY -= 25F;
        }

        private void writeField(
                String label,
                String value
        ) throws IOException {

            String sanitizedLabel =
                    sanitizeForPdf(label, BOLD_FONT);

            String sanitizedValue =
                    sanitizeForPdf(value, REGULAR_FONT);

            List<String> lines = wrapText(
                    sanitizedValue,
                    REGULAR_FONT,
                    FIELD_FONT_SIZE,
                    VALUE_MAX_WIDTH
            );

            if (lines.isEmpty()) {
                lines = List.of("N/A");
            }

            /*
             * Keep the label and first value line together.
             */
            ensureSpace(LINE_SPACING + FIELD_GAP);

            drawText(
                    LEFT_MARGIN,
                    currentY,
                    sanitizedLabel + " :",
                    BOLD_FONT,
                    FIELD_FONT_SIZE
            );

            drawText(
                    VALUE_X_POSITION,
                    currentY,
                    lines.get(0),
                    REGULAR_FONT,
                    FIELD_FONT_SIZE
            );

            currentY -= LINE_SPACING;

            /*
             * Additional value lines can continue on a new page.
             */
            for (int i = 1; i < lines.size(); i++) {
                ensureSpace(LINE_SPACING);

                drawText(
                        VALUE_X_POSITION,
                        currentY,
                        lines.get(i),
                        REGULAR_FONT,
                        FIELD_FONT_SIZE
                );

                currentY -= LINE_SPACING;
            }

            currentY -= FIELD_GAP;
        }

        private void addSpacing(float spacing) throws IOException {
            ensureSpace(spacing);
            currentY -= spacing;
        }

        /**
         * Starts a new page when the next content would collide
         * with the footer or leave the printable page area.
         */
        private void ensureSpace(float requiredHeight)
                throws IOException {

            if (currentY - requiredHeight < BOTTOM_MARGIN) {
                startNewPage(true);
            }
        }

        private void startNewPage(boolean continuation)
                throws IOException {

            if (contentStream != null) {
                finishCurrentPage();
            }

            page = new PDPage(PAGE_SIZE);
            document.addPage(page);

            contentStream = new PDPageContentStream(
                    document,
                    page
            );

            pageNumber++;

            if (continuation) {
                drawText(
                        LEFT_MARGIN,
                        PAGE_SIZE.getHeight() - TOP_MARGIN,
                        "ORBITGUARD AI - REPORT (CONTINUED)",
                        BOLD_FONT,
                        12F
                );

                contentStream.moveTo(
                        LEFT_MARGIN,
                        PAGE_SIZE.getHeight() - TOP_MARGIN - 12F
                );

                contentStream.lineTo(
                        PAGE_SIZE.getWidth() - RIGHT_MARGIN,
                        PAGE_SIZE.getHeight() - TOP_MARGIN - 12F
                );

                contentStream.stroke();

                currentY = PAGE_SIZE.getHeight() - TOP_MARGIN - 35F;
            } else {
                writeFirstPageHeader();
                currentY = 680F;
            }
        }

        private void writeFirstPageHeader() throws IOException {
            drawText(
                    LEFT_MARGIN,
                    770F,
                    "ORBITGUARD AI",
                    BOLD_FONT,
                    HEADER_FONT_SIZE
            );

            drawText(
                    LEFT_MARGIN,
                    735F,
                    "REPORT",
                    BOLD_FONT,
                    TITLE_FONT_SIZE
            );

            contentStream.moveTo(
                    LEFT_MARGIN,
                    720F
            );

            contentStream.lineTo(
                    PAGE_SIZE.getWidth() - RIGHT_MARGIN,
                    720F
            );

            contentStream.stroke();
        }

        private void drawText(
                float x,
                float y,
                String text,
                PDFont font,
                float fontSize
        ) throws IOException {

            contentStream.beginText();
            contentStream.setFont(font, fontSize);
            contentStream.newLineAtOffset(x, y);
            contentStream.showText(text);
            contentStream.endText();
        }

        private void finishCurrentPage() throws IOException {
            if (contentStream == null) {
                return;
            }

            contentStream.moveTo(
                    LEFT_MARGIN,
                    55F
            );

            contentStream.lineTo(
                    PAGE_SIZE.getWidth() - RIGHT_MARGIN,
                    55F
            );

            contentStream.stroke();

            drawText(
                    LEFT_MARGIN,
                    40F,
                    "Generated by OrbitGuard AI",
                    REGULAR_FONT,
                    FOOTER_FONT_SIZE
            );

            String pageLabel = "Page " + pageNumber;

            float pageLabelWidth = getTextWidth(
                    pageLabel,
                    REGULAR_FONT,
                    FOOTER_FONT_SIZE
            );

            drawText(
                    PAGE_SIZE.getWidth() - RIGHT_MARGIN - pageLabelWidth,
                    40F,
                    pageLabel,
                    REGULAR_FONT,
                    FOOTER_FONT_SIZE
            );

            contentStream.close();
            contentStream = null;
        }

        private void close() throws IOException {
            if (closed) {
                return;
            }

            try {
                finishCurrentPage();
            } finally {
                closed = true;
            }
        }
    }
}
