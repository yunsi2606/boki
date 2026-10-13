package com.boki.application.service;

import com.boki.application.dto.excel.*;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.*;

@Component
public class BookExcelParser {

    public List<BookExcelGroupedBook> parseWorkbook(InputStream is, List<BookExcelRowError> errors) throws Exception {
        List<BookExcelGroupedBook> books = new ArrayList<>();
        Workbook workbook = WorkbookFactory.create(is);
        Sheet sheet = workbook.getSheetAt(0);
        if (sheet == null || sheet.getLastRowNum() < 1) {
            errors.add(new BookExcelRowError(0, "", "File", "Tập tin Excel không có dữ liệu để xử lý"));
            workbook.close();
            return books;
        }

        BookExcelGroupedBook currentBook = null;
        for (int r = 1; r <= sheet.getLastRowNum(); r++) {
            Row row = sheet.getRow(r);
            if (row == null || isRowEmpty(row)) continue;
            int rowNum = r + 1;

            String title = getCellString(row.getCell(0));
            String author = getCellString(row.getCell(1));
            String variantName = getCellString(row.getCell(15));

            // If new book row
            if (!title.isBlank() || currentBook == null) {
                currentBook = parseBookRow(row, rowNum, errors);
                books.add(currentBook);
            }

            // Check variant
            if (!variantName.isBlank()) {
                BookExcelVariantData variant = parseVariantData(row, rowNum, currentBook, errors);
                currentBook.getVariants().add(variant);
            }
        }

        workbook.close();
        return books;
    }

    private BookExcelGroupedBook parseBookRow(Row row, int rowNum, List<BookExcelRowError> errors) {
        BookExcelGroupedBook b = new BookExcelGroupedBook();
        b.setRowNumber(rowNum);
        b.setTitle(getCellString(row.getCell(0)));
        b.setAuthor(getCellString(row.getCell(1)));

        if (b.getTitle().isBlank()) {
            errors.add(new BookExcelRowError(rowNum, b.getTitle(), "Tên sách", "Tên sách không được để trống"));
        }
        if (b.getAuthor().isBlank()) {
            errors.add(new BookExcelRowError(rowNum, b.getTitle(), "Tác giả", "Tên tác giả không được để trống"));
        }

        String cats = getCellString(row.getCell(2));
        if (!cats.isBlank()) {
            b.setCategoryNames(Arrays.stream(cats.split("[,;]")).map(String::trim).filter(s -> !s.isEmpty()).toList());
        }
        b.setIsbn(getCellString(row.getCell(3)));
        b.setPublisher(getCellString(row.getCell(4)));
        b.setSupplier(getCellString(row.getCell(5)));
        b.setPublicationYear(getCellString(row.getCell(6)));
        b.setCoverType(getCellString(row.getCell(7)));
        b.setPageCount(getCellInteger(row.getCell(8)));

        String cond = getCellString(row.getCell(9));
        b.setCondition(cond.isBlank() ? "GOOD" : cond);

        b.setPrice(getCellBigDecimal(row.getCell(10)));
        b.setOriginalPrice(getCellBigDecimal(row.getCell(11)));
        Integer stock = getCellInteger(row.getCell(12));
        b.setStockQuantity(stock != null ? Math.max(0, stock) : 0);

        b.setCoverImageRef(getCellString(row.getCell(13)));
        String detailImgs = getCellString(row.getCell(14));
        if (!detailImgs.isBlank()) {
            b.setDetailImagesRef(Arrays.stream(detailImgs.split("[,;]")).map(String::trim).filter(s -> !s.isEmpty()).toList());
        }

        String preOrderStr = getCellString(row.getCell(21));
        b.setPreOrder(preOrderStr.equalsIgnoreCase("CÓ") || preOrderStr.equalsIgnoreCase("TRUE") || preOrderStr.equals("1"));
        b.setPreOrderDays(getCellInteger(row.getCell(22)));
        b.setMaxOrderQuantity(getCellInteger(row.getCell(23)));
        b.setDescription(getCellString(row.getCell(24)));

        return b;
    }

    private BookExcelVariantData parseVariantData(Row row, int rowNum, BookExcelGroupedBook parent, List<BookExcelRowError> errors) {
        String name = getCellString(row.getCell(15));
        String sku = getCellString(row.getCell(16));
        BigDecimal price = getCellBigDecimal(row.getCell(17));
        if (price == null && parent != null) price = parent.getPrice();
        BigDecimal origPrice = getCellBigDecimal(row.getCell(18));
        if (origPrice == null && parent != null) origPrice = parent.getOriginalPrice();

        Integer stock = getCellInteger(row.getCell(19));
        int stockQty = stock != null ? Math.max(0, stock) : 0;
        String imgRef = getCellString(row.getCell(20));

        if (price == null || price.compareTo(BigDecimal.ZERO) < 0) {
            errors.add(new BookExcelRowError(rowNum, parent != null ? parent.getTitle() : "", "Giá phân loại", "Giá bán phân loại '" + name + "' không hợp lệ"));
        }

        return new BookExcelVariantData(rowNum, name, sku, price, origPrice, stockQty, imgRef, null);
    }

    private boolean isRowEmpty(Row row) {
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) return false;
        }
        return true;
    }

    private String getCellString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                double val = cell.getNumericCellValue();
                yield val == (long) val ? String.valueOf((long) val) : String.valueOf(val);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> "";
        };
    }

    private BigDecimal getCellBigDecimal(Cell cell) {
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC) return BigDecimal.valueOf(cell.getNumericCellValue());
            if (cell.getCellType() == CellType.STRING) {
                String str = cell.getStringCellValue().replaceAll("[^0-9.]", "").trim();
                return str.isBlank() ? null : new BigDecimal(str);
            }
        } catch (Exception ignored) {}
        return null;
    }

    private Integer getCellInteger(Cell cell) {
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC) return (int) cell.getNumericCellValue();
            if (cell.getCellType() == CellType.STRING) {
                String str = cell.getStringCellValue().replaceAll("[^0-9]", "").trim();
                return str.isBlank() ? null : Integer.parseInt(str);
            }
        } catch (Exception ignored) {}
        return null;
    }
}
