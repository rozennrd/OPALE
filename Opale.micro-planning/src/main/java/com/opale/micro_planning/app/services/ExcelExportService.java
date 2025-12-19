package com.opale.micro_planning.app.services;

import com.opale.micro_planning.app.dtos.SchedulingResult;
import com.opale.micro_planning.app.exceptions.SchedulingException;
import com.opale.micro_planning.domain.entities.Cours;
import com.opale.micro_planning.domain.entities.Salle;
import com.opale.micro_planning.domain.entities.ScheduledSlot;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Combined data structure for course scheduling information
 */
record ScheduledCourseInfo(
    Cours course,
    ScheduledSlot slot,
    Salle salle
) {}

/**
 * Service for exporting scheduling results to Excel format
 * Creates weekly sheets with time × promotion matrix layout
 */
@Service
public class ExcelExportService {

    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("EEE MMM d, HH:mm");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    /**
     * Export scheduling result to Excel bytes
     */
    public byte[] exportScheduleToExcel(SchedulingResult result, String promotionName) {
        if (!result.isSuccess()) {
            throw new SchedulingException("Cannot export failed scheduling result");
        }

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            // Combine schedule and room assignments data
            List<ScheduledCourseInfo> courseInfos = combineScheduleData(result);

            // Group by week
            Map<Integer, List<ScheduledCourseInfo>> infosByWeek = groupByWeek(courseInfos);

            // Create sheet for each week
            for (Map.Entry<Integer, List<ScheduledCourseInfo>> weekEntry : infosByWeek.entrySet()) {
                createWeeklyMatrixSheet(workbook, weekEntry.getKey(), weekEntry.getValue());
            }

            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (IOException e) {
            throw new SchedulingException("Failed to generate Excel file: " + e.getMessage(), e);
        }
    }

    /**
     * Combine schedule and room assignment data into ScheduledCourseInfo objects
     */
    @SuppressWarnings("unchecked")
    private List<ScheduledCourseInfo> combineScheduleData(SchedulingResult result) {
        Map<String, Object> scheduleData = result.getSchedule();
        Map<Cours, ScheduledSlot> schedule = (Map<Cours, ScheduledSlot>) scheduleData.get("schedule");
        Map<Cours, Salle> roomAssignments = (Map<Cours, Salle>) scheduleData.get("assignments");

        return schedule.entrySet().stream()
            .map(entry -> new ScheduledCourseInfo(
                entry.getKey(),           // course
                entry.getValue(),         // slot
                roomAssignments.get(entry.getKey()) // salle
            ))
            .collect(Collectors.toList());
    }

    /**
     * Group scheduled course infos by week number
     */
    private Map<Integer, List<ScheduledCourseInfo>> groupByWeek(List<ScheduledCourseInfo> courseInfos) {
        return courseInfos.stream()
            .collect(Collectors.groupingBy(info -> {
                // Use ISO week of year
                return info.slot().getDate().get(java.time.temporal.IsoFields.WEEK_OF_WEEK_BASED_YEAR);
            }));
    }

    /**
     * Create a weekly matrix sheet with time × promotion layout
     */
    private void createWeeklyMatrixSheet(Workbook workbook, int weekNumber, List<ScheduledCourseInfo> courseInfos) {
        Sheet sheet = workbook.createSheet("Week " + weekNumber);

        // Get unique promotions
        Set<String> promotions = courseInfos.stream()
            .map(info -> getPromotionName(info))
            .collect(Collectors.toSet());
        List<String> promotionList = new ArrayList<>(promotions);
        Collections.sort(promotionList);

        // Create header row
        createHeaderRow(sheet, promotionList);

        // Sort course infos by datetime
        List<ScheduledCourseInfo> sortedInfos = courseInfos.stream()
            .sorted(Comparator.comparing(info -> info.slot().getStart()))
            .collect(Collectors.toList());

        // Create matrix rows
        int currentRow = 1; // Start after header
        for (ScheduledCourseInfo info : sortedInfos) {
            currentRow = addCourseRow(sheet, currentRow, info, promotionList);
        }

        // Auto-size columns
        for (int i = 0; i <= promotionList.size(); i++) {
            sheet.autoSizeColumn(i);
            // Set minimum width
            if (sheet.getColumnWidth(i) < 3000) {
                sheet.setColumnWidth(i, 3000);
            }
            // Set maximum width
            if (sheet.getColumnWidth(i) > 8000) {
                sheet.setColumnWidth(i, 8000);
            }
        }

        // Freeze first column
        sheet.createFreezePane(1, 1);
    }

    /**
     * Create header row with datetime and promotion columns
     */
    private void createHeaderRow(Sheet sheet, List<String> promotions) {
        Row headerRow = sheet.createRow(0);

        // Create header cell style
        CellStyle headerStyle = sheet.getWorkbook().createCellStyle();
        Font headerFont = sheet.getWorkbook().createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        // Datetime column header
        Cell datetimeCell = headerRow.createCell(0);
        datetimeCell.setCellValue("Datetime");
        datetimeCell.setCellStyle(headerStyle);

        // Promotion column headers
        for (int i = 0; i < promotions.size(); i++) {
            Cell promotionCell = headerRow.createCell(i + 1);
            promotionCell.setCellValue(promotions.get(i));
            promotionCell.setCellStyle(headerStyle);
        }
    }

    /**
     * Add a row for a scheduled course across all promotion columns
     */
    private int addCourseRow(Sheet sheet, int startRow, ScheduledCourseInfo info, List<String> promotions) {
        String coursePromotion = getPromotionName(info);
        int promotionIndex = promotions.indexOf(coursePromotion);

        // Create 4 rows for this time slot (subject, teacher, room, duration)
        for (int rowOffset = 0; rowOffset < 4; rowOffset++) {
            Row row = sheet.createRow(startRow + rowOffset);

            // Datetime column (only on first row of the block)
            if (rowOffset == 0) {
                Cell datetimeCell = row.createCell(0);
                datetimeCell.setCellValue(formatDateTime(info.slot().getStart(), info.slot().getEnd()));

                // Merge cells for the datetime column across 4 rows
                sheet.addMergedRegion(new CellRangeAddress(
                    startRow, startRow + 3, 0, 0));
            }

            // Promotion columns - only fill the column for this promotion
            for (int col = 0; col < promotions.size(); col++) {
                Cell cell = row.createCell(col + 1);

                if (col == promotionIndex) {
                    // Fill this promotion's column with course details
                    String cellValue = getCellValueForRow(info, rowOffset);
                    cell.setCellValue(cellValue);

                    // Style based on row type
                    cell.setCellStyle(getCellStyle(sheet.getWorkbook(), rowOffset));
                }
                // Other promotion columns remain empty for this time slot
            }
        }

        return startRow + 4; // Return next available row
    }

    /**
     * Format datetime range for display
     */
    private String formatDateTime(LocalDateTime start, LocalDateTime end) {
        return start.format(DATETIME_FORMATTER) + "-" + end.format(TIME_FORMATTER);
    }

    /**
     * Get promotion name from course info
     */
    private String getPromotionName(ScheduledCourseInfo info) {
        // Extract promotion name from course
        return info.course().getMatiere().getPromotion().getNom();
    }

    /**
     * Get cell value based on row offset within the 4-row block
     */
    private String getCellValueForRow(ScheduledCourseInfo info, int rowOffset) {
        return switch (rowOffset) {
            case 0 -> info.course().getMatiere().getNom(); // Subject
            case 1 -> info.course().getProf().getNom() + " " + info.course().getProf().getPrenom(); // Teacher
            case 2 -> info.salle().getNom() + " (" + info.salle().getType() + ", Cap: " + info.salle().getCapacite() + ")"; // Room
            case 3 -> "Duration: " + info.course().getDurationMinutes() + " min"; // Duration
            default -> "";
        };
    }

    /**
     * Get cell style based on row type
     */
    private CellStyle getCellStyle(Workbook workbook, int rowOffset) {
        CellStyle style = workbook.createCellStyle();

        switch (rowOffset) {
            case 0 -> { // Subject - bold
                Font font = workbook.createFont();
                font.setBold(true);
                style.setFont(font);
                style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
                style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            }
            case 1 -> { // Teacher - italic
                Font font = workbook.createFont();
                font.setItalic(true);
                style.setFont(font);
                style.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
                style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            }
            case 2 -> { // Room - normal
                style.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
                style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            }
            case 3 -> { // Duration - smaller font
                Font font = workbook.createFont();
                font.setFontHeightInPoints((short) 9);
                style.setFont(font);
                style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
                style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            }
        }

        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);

        return style;
    }
}
