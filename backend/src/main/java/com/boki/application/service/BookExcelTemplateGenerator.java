package com.boki.application.service;

import com.boki.infrastructure.persistence.entity.CategoryJpaEntity;
import com.boki.infrastructure.persistence.repository.CategoryJpaRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Component
public class BookExcelTemplateGenerator {

    private final CategoryJpaRepository categoryRepository;

    public BookExcelTemplateGenerator(CategoryJpaRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public byte[] generateTemplate() throws Exception {
        Workbook wb = new XSSFWorkbook();
        createSheet1(wb);
        createSheet2(wb);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        wb.write(baos);
        wb.close();
        return baos.toByteArray();
    }

    private void createSheet1(Workbook wb) {
        Sheet ws1 = wb.createSheet("Biểu mẫu nhập sách");
        ws1.setDisplayGridlines(true);

        CellStyle headerBookStyle = createHeaderStyle(wb, IndexedColors.CORAL.getIndex());
        CellStyle headerVariantStyle = createHeaderStyle(wb, IndexedColors.GREY_80_PERCENT.getIndex());
        CellStyle sampleStyle = createTextStyle(wb);

        String[] headers = {
                "Tên sách (*)", "Tác giả (*)", "Danh mục", "Mã ISBN", "Nhà xuất bản",
                "Đơn vị phát hành", "Năm xuất bản", "Hình thức bìa", "Số trang", "Tình trạng (*)",
                "Giá bán sách (*)", "Giá gốc / bìa", "Số lượng tồn (*)", "Ảnh bìa sách (Tên file / URL)", "Ảnh chi tiết (Tên file / URL)",
                "Tên phân loại", "Mã SKU phân loại", "Giá bán phân loại", "Giá gốc phân loại", "Tồn kho phân loại", "Ảnh phân loại (Tên file / URL)",
                "Đặt trước (Có/Không)", "Ngày đặt trước", "Giới hạn mua", "Mô tả chi tiết"
        };

        Row headerRow = ws1.createRow(0);
        headerRow.setHeightInPoints(32);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(i >= 15 && i <= 20 ? headerVariantStyle : headerBookStyle);
            ws1.setColumnWidth(i, 18 * 256);
        }

        // Sample Row 1 (Parent book with Variant 1)
        Row r1 = ws1.createRow(1);
        r1.setHeightInPoints(22);
        String[] sample1 = {
                "Thám Tử Lừng Danh Conan - Tập 100", "Gosho Aoyama", "Truyện Tranh, Thiếu nhi", "978-604-2-21234-5", "NXB Kim Đồng",
                "Kim Đồng", "2023", "Bìa mềm áo", "192", "MỚI",
                "45000", "50000", "130", "conan100_bia.jpg", "conan100_1.jpg, conan100_2.jpg",
                "Bản Thường", "CONAN-100-STD", "45000", "50000", "100", "conan100_std.jpg",
                "KHÔNG", "", "5", "Tập kỷ niệm 100 của manga Conan."
        };
        for (int i = 0; i < sample1.length; i++) {
            Cell c = r1.createCell(i);
            c.setCellValue(sample1[i]);
            c.setCellStyle(sampleStyle);
        }

        // Sample Row 2 (Variant 2 of Conan)
        Row r2 = ws1.createRow(2);
        r2.setHeightInPoints(22);
        String[] sample2 = {
                "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
                "Bản Đặc Biệt (Kèm Standee)", "CONAN-100-LTD", "65000", "75000", "30", "conan100_standee.jpg",
                "", "", "", ""
        };
        for (int i = 0; i < sample2.length; i++) {
            Cell c = r2.createCell(i);
            c.setCellValue(sample2[i]);
            c.setCellStyle(sampleStyle);
        }
    }

    private void createSheet2(Workbook wb) {
        Sheet ws2 = wb.createSheet("Hướng dẫn & Danh mục mẫu");
        ws2.setDisplayGridlines(true);

        CellStyle titleStyle = wb.createCellStyle();
        Font titleFont = wb.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 13);
        titleStyle.setFont(titleFont);

        Row titleRow = ws2.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("HƯỚNG DẪN NHẬP SÁCH & DANH MỤC THAM KHẢO");
        titleCell.setCellStyle(titleStyle);

        CellStyle textStyle = createTextStyle(wb);
        String[] guides = {
                "1. Quy tắc phân loại: Dòng đầu điền thông tin chung + phân loại 1. Các dòng kế tiếp để trống thông tin chung và chỉ điền phân loại 2, 3...",
                "2. Quy tắc ảnh (100% tự động đưa lên Cloudflare R2):",
                "   - Cách 1: Để trống ảnh, hệ thống tự động tra cứu bìa theo ISBN và đẩy lên R2.",
                "   - Cách 2: Điền tên file ảnh (VD: conan.jpg), sau đó chọn tải các file ảnh lẻ trên Web Modal. Hệ thống tự upload R2.",
                "   - Cách 3: Điền link web (http/https). Hệ thống tự tải về và lưu vào R2.",
                "3. Tình trạng sách chấp nhận: MỚI, NHƯ MỚI, TỐT, KHÁ, CŨ (hoặc NEW, LIKE_NEW, GOOD, FAIR, POOR)."
        };
        for (int i = 0; i < guides.length; i++) {
            Row r = ws2.createRow(i + 2);
            Cell c = r.createCell(0);
            c.setCellValue(guides[i]);
            c.setCellStyle(textStyle);
        }

        // Section: Categories from DB
        int catStart = 10;
        Row catTitleRow = ws2.createRow(catStart);
        Cell catTitleCell = catTitleRow.createCell(0);
        catTitleCell.setCellValue("BẢNG DANH MỤC THỰC TẾ TRONG HỆ THỐNG");
        catTitleCell.setCellStyle(titleStyle);

        Row hRow = ws2.createRow(catStart + 1);
        String[] catHeaders = {"ID", "Tên Danh Mục", "Slug"};
        CellStyle hStyle = createHeaderStyle(wb, IndexedColors.GREY_50_PERCENT.getIndex());
        for (int i = 0; i < catHeaders.length; i++) {
            Cell c = hRow.createCell(i);
            c.setCellValue(catHeaders[i]);
            c.setCellStyle(hStyle);
        }

        List<CategoryJpaEntity> categories = categoryRepository.findAll();
        for (int i = 0; i < categories.size(); i++) {
            CategoryJpaEntity cat = categories.get(i);
            Row r = ws2.createRow(catStart + 2 + i);
            r.createCell(0).setCellValue(cat.getId());
            r.createCell(1).setCellValue(cat.getName());
            r.createCell(2).setCellValue(cat.getSlug());
        }

        ws2.setColumnWidth(0, 10 * 256);
        ws2.setColumnWidth(1, 26 * 256);
        ws2.setColumnWidth(2, 26 * 256);
    }

    private CellStyle createHeaderStyle(Workbook wb, short colorIndex) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(colorIndex);
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createTextStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setFontHeightInPoints((short) 10);
        style.setFont(font);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }
}
