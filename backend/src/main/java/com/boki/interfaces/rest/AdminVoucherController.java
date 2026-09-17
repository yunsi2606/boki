package com.boki.interfaces.rest;

import com.boki.infrastructure.persistence.entity.VoucherJpaEntity;
import com.boki.infrastructure.persistence.repository.VoucherJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/vouchers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminVoucherController {

    private final VoucherJpaRepository voucherRepository;

    @GetMapping
    public ResponseEntity<List<VoucherJpaEntity>> getAllVouchers() {
        return ResponseEntity.ok(voucherRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<VoucherJpaEntity> createVoucher(@RequestBody VoucherJpaEntity voucher) {
        if (voucher.getId() == null || voucher.getId().isBlank()) {
            voucher.setId(UUID.randomUUID().toString().substring(0, 8));
        }
        VoucherJpaEntity saved = voucherRepository.save(voucher);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VoucherJpaEntity> updateVoucher(@PathVariable String id, @RequestBody VoucherJpaEntity voucher) {
        voucher.setId(id);
        VoucherJpaEntity saved = voucherRepository.save(voucher);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable String id) {
        voucherRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
