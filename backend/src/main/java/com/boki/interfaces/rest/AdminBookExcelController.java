package com.boki.interfaces.rest;

import com.boki.application.dto.excel.BookExcelImportResultResponse;
import com.boki.application.service.AdminBookExcelApplicationService;
import com.boki.application.service.BookExcelTemplateGenerator;
import com.boki.infrastructure.security.AuthenticatedUser;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/books/excel")
@PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
public class AdminBookExcelController {

    private final BookExcelTemplateGenerator templateGenerator;
    private final AdminBookExcelApplicationService excelService;

    public AdminBookExcelController(
            BookExcelTemplateGenerator templateGenerator,
            AdminBookExcelApplicationService excelService
    ) {
        this.templateGenerator = templateGenerator;
        this.excelService = excelService;
    }

    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() throws Exception {
        byte[] excelBytes = templateGenerator.generateTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=boki_bieu_mau_them_sach.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BookExcelImportResultResponse> importBooks(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "dryRun", defaultValue = "false") boolean dryRun,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) throws Exception {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        BookExcelImportResultResponse result = excelService.processImport(
                file.getInputStream(), images, dryRun, principal.email()
        );
        return ResponseEntity.ok(result);
    }
}
