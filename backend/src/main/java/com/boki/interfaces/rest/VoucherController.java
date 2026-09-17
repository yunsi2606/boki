package com.boki.interfaces.rest;

import com.boki.infrastructure.persistence.entity.VoucherJpaEntity;
import com.boki.infrastructure.persistence.repository.VoucherJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VoucherController {

    private final VoucherJpaRepository voucherRepository;

    @GetMapping
    public ResponseEntity<List<VoucherJpaEntity>> getActiveVouchers() {
        return ResponseEntity.ok(voucherRepository.findByIsActiveTrue());
    }
}
