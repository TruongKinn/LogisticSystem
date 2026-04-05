package vn.logistic.driver.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.logistic.driver.common.DriverStatus;
import vn.logistic.driver.controller.request.CreateDriverRequest;
import vn.logistic.driver.controller.response.DriverResponse;
import vn.logistic.driver.exception.BusinessConflictException;
import vn.logistic.driver.exception.ResourceNotFoundException;
import vn.logistic.driver.model.Driver;
import vn.logistic.driver.repository.DriverRepository;
import vn.logistic.driver.service.DriverService;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class DriverServiceImpl implements DriverService {

    private final DriverRepository driverRepository;

    @Override
    public List<DriverResponse> getAllDrivers() {
        return driverRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DriverResponse getDriverById(Long id) {
        return driverRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + id));
    }

    @Override
    public DriverResponse getDriverByEmployeeCode(String employeeCode) {
        return driverRepository.findByEmployeeCode(employeeCode)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found by employeeCode: " + employeeCode));
    }

    @Override
    public List<DriverResponse> getDriversByStatus(DriverStatus status) {
        return driverRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DriverResponse> getAvailableDriversByZone(String zone) {
        return driverRepository.findByZoneAndStatus(zone, DriverStatus.AVAILABLE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DriverResponse createDriver(CreateDriverRequest request) {
        Driver driver = Driver.builder()
                .employeeCode(request.getEmployeeCode())
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .licenseNo(request.getLicenseNo())
                .licenseType(request.getLicenseType())
                .zone(request.getZone())
                .status(DriverStatus.AVAILABLE)
                .rating(BigDecimal.valueOf(5.0))
                .totalDeliveries(0)
                .build();

        Driver savedDriver = driverRepository.save(driver);
        return mapToResponse(savedDriver);
    }

    @Override
    public DriverResponse updateStatus(Long id, DriverStatus status) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + id));

        if (status == DriverStatus.BUSY && driver.getStatus() != DriverStatus.AVAILABLE) {
            throw new BusinessConflictException(
                    "Driver " + id + " is in status " + driver.getStatus() + " and cannot be moved to BUSY");
        }

        driver.setStatus(status);
        return mapToResponse(driverRepository.save(driver));
    }

    private DriverResponse mapToResponse(Driver driver) {
        return DriverResponse.builder()
                .id(driver.getId())
                .employeeCode(driver.getEmployeeCode())
                .fullName(driver.getFullName())
                .phone(driver.getPhone())
                .email(driver.getEmail())
                .licenseNo(driver.getLicenseNo())
                .licenseType(driver.getLicenseType())
                .status(driver.getStatus())
                .zone(driver.getZone())
                .rating(driver.getRating())
                .totalDeliveries(driver.getTotalDeliveries())
                .createdAt(driver.getCreatedAt())
                .build();
    }

    @Override
    public int importDrivers(org.springframework.web.multipart.MultipartFile file) {
        try {
            org.apache.poi.ss.usermodel.Workbook workbook = org.apache.poi.ss.usermodel.WorkbookFactory.create(file.getInputStream());
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.getSheetAt(0);
            java.util.Iterator<org.apache.poi.ss.usermodel.Row> rows = sheet.iterator();

            if (!rows.hasNext()) {
                throw new IllegalArgumentException("File Excel rỗng.");
            }
            
            if (rows.hasNext()) rows.next(); // Skip row 0 (Title)
            if (rows.hasNext()) rows.next(); // Skip row 1 (Instruction)
            
            if (!rows.hasNext()) {
                throw new IllegalArgumentException("File Excel thiếu dòng tiêu đề chính.");
            }
            
            org.apache.poi.ss.usermodel.Row headerRow = rows.next(); // Row 2 is Header
            String[] expectedHeaders = {"Mã NV (*)", "Họ Tên (*)", "SĐT (*)", "Email", "CCCD", "Hạng Bằng", "Khu Vực"};
            for (int i = 0; i < expectedHeaders.length; i++) {
                String headerStr = getCellValue(headerRow.getCell(i));
                if (!expectedHeaders[i].equalsIgnoreCase(headerStr)) {
                    throw new IllegalArgumentException("File Excel sai định dạng template. Cột thứ " + (i + 1) + " phải là '" + expectedHeaders[i] + "', hiện tại đang là '" + headerStr + "'.");
                }
            }

            int count = 0;
            while (rows.hasNext()) {
                org.apache.poi.ss.usermodel.Row currentRow = rows.next();

                String employeeCode = getCellValue(currentRow.getCell(0));
                if (employeeCode == null || employeeCode.trim().isEmpty()) {
                    continue;
                }

                if (driverRepository.findByEmployeeCode(employeeCode).isPresent()) {
                    continue; // Skip duplicates
                }

                String fullName = getCellValue(currentRow.getCell(1));
                String phone = getCellValue(currentRow.getCell(2));
                String email = getCellValue(currentRow.getCell(3));
                String licenseNo = getCellValue(currentRow.getCell(4)); // CCCD/LicenseNo
                String licenseType = getCellValue(currentRow.getCell(5)); // Hạng bằng
                String zone = getCellValue(currentRow.getCell(6));

                if (fullName.isEmpty() || phone.isEmpty()) {
                    continue; // Skip invalid records
                }

                Driver driver = Driver.builder()
                        .employeeCode(employeeCode)
                        .fullName(fullName)
                        .phone(phone)
                        .email(email)
                        .licenseNo(licenseNo)
                        .licenseType(licenseType)
                        .zone(zone)
                        .status(DriverStatus.AVAILABLE)
                        .rating(BigDecimal.valueOf(5.0))
                        .totalDeliveries(0)
                        .build();

                driverRepository.save(driver);
                count++;
            }
            workbook.close();
            return count;
        } catch (java.io.IOException e) {
            throw new RuntimeException("Lỗi đọc file Excel: " + e.getMessage());
        }
    }

    private String getCellValue(org.apache.poi.ss.usermodel.Cell cell) {
        if (cell == null) {
            return "";
        }
        org.apache.poi.ss.usermodel.DataFormatter formatter = new org.apache.poi.ss.usermodel.DataFormatter();
        return formatter.formatCellValue(cell).trim();
    }

    @Override
    public byte[] generateImportTemplate() {
        try (org.apache.poi.ss.usermodel.Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook();
             java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
            
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("Drivers Template");
            
            // --- Title Row (Row 0) ---
            org.apache.poi.ss.usermodel.Row titleRow = sheet.createRow(0);
            titleRow.setHeightInPoints(30);
            org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("MẪU IMPORT DANH SÁCH TÀI XẾ");
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 6));

            org.apache.poi.ss.usermodel.CellStyle titleStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font titleFont = workbook.createFont();
            titleFont.setFontName("Arial");
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 11);
            titleFont.setColor(org.apache.poi.ss.usermodel.IndexedColors.DARK_BLUE.getIndex());
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(org.apache.poi.ss.usermodel.HorizontalAlignment.CENTER);
            titleStyle.setVerticalAlignment(org.apache.poi.ss.usermodel.VerticalAlignment.CENTER);
            titleCell.setCellStyle(titleStyle);

            // --- Instruction Row (Row 1) ---
            org.apache.poi.ss.usermodel.Row instrRow = sheet.createRow(1);
            instrRow.setHeightInPoints(20);
            org.apache.poi.ss.usermodel.Cell instrCell = instrRow.createCell(0);
            instrCell.setCellValue("Lưu ý: Các cột có dấu (*) là bắt buộc. Không tự ý đổi tên hoặc xóa cột.");
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(1, 1, 0, 6));

            org.apache.poi.ss.usermodel.CellStyle instrStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font instrFont = workbook.createFont();
            instrFont.setFontName("Arial");
            instrFont.setItalic(true);
            instrFont.setFontHeightInPoints((short) 11);
            instrFont.setColor(org.apache.poi.ss.usermodel.IndexedColors.RED.getIndex());
            instrStyle.setFont(instrFont);
            instrStyle.setAlignment(org.apache.poi.ss.usermodel.HorizontalAlignment.CENTER);
            instrStyle.setVerticalAlignment(org.apache.poi.ss.usermodel.VerticalAlignment.CENTER);
            instrCell.setCellStyle(instrStyle);

            // --- Header Style (Row 2) ---
            org.apache.poi.ss.usermodel.CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(org.apache.poi.ss.usermodel.IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(org.apache.poi.ss.usermodel.HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(org.apache.poi.ss.usermodel.VerticalAlignment.CENTER);
            
            headerStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            headerStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            headerStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            headerStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setFontName("Arial");
            headerFont.setBold(true);
            headerFont.setColor(org.apache.poi.ss.usermodel.IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            
            // --- Data Style ---
            org.apache.poi.ss.usermodel.CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            dataStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            dataStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            dataStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            
            // --- Create Header Row ---
            org.apache.poi.ss.usermodel.Row headerRowExport = sheet.createRow(2);
            headerRowExport.setHeightInPoints(24);
            String[] headers = {"Mã NV (*)", "Họ Tên (*)", "SĐT (*)", "Email", "CCCD", "Hạng Bằng", "Khu Vực"};
            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRowExport.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // --- Create Sample Row ---
            org.apache.poi.ss.usermodel.Row dataRow = sheet.createRow(3);
            String[] sampleData = {"TX001", "Nguyễn Văn A", "0901234567", "nva@gmail.com", "001092123456", "C", "Miền Bắc"};
            for (int i = 0; i < sampleData.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = dataRow.createCell(i);
                cell.setCellValue(sampleData[i]);
                cell.setCellStyle(dataStyle);
            }
            
            // --- Auto Size Columns ---
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                // Add a little padding to the auto size
                int currentWidth = sheet.getColumnWidth(i);
                sheet.setColumnWidth(i, currentWidth + 1000);
            }
            
            // Freeze pane below headers
            sheet.createFreezePane(0, 3);
            
            workbook.write(out);
            return out.toByteArray();
        } catch (java.io.IOException e) {
            throw new RuntimeException("Lỗi tạo template Excel: " + e.getMessage());
        }
    }
}
