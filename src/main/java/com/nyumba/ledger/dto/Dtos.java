package com.nyumba.ledger.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDate;
import java.util.List;

/**
 * Shapes sent to the browser. Ids are strings so they match the values
 * the page scripts get from HTML form controls. Dates are ISO (yyyy-MM-dd).
 */
public final class Dtos {
    private Dtos() {}

    public record HouseDto(String id, String number, String type, String location, long rent, String status, String tenantId) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record TenantDto(String id, String name, String phone, String email, String idNo, String houseId,
                            LocalDate moveIn, String username, String password) {}

    public record InvoiceDto(String id, String no, String tenantId, String tenantName, String houseNumber, String period,
                             long amount, long paid, LocalDate issued, LocalDate due, String note) {}

    public record PaymentDto(String id, String tenantId, String tenantName, String houseNumber, long amount,
                             LocalDate date, String method, String ref, String status) {}

    public record RequestDto(String id, String tenantId, String tenantName, String houseNumber, String category,
                             String priority, String desc, LocalDate date, String status) {}

    public record Snapshot(List<HouseDto> houses, List<TenantDto> tenants, List<InvoiceDto> invoices,
                           List<PaymentDto> payments, List<RequestDto> requests) {}

    public record Me(String role, String name, String tenantId) {}

    /** Wrapper the browser expects: {"ok":true,"item":{...}} */
    public record Result<T>(boolean ok, T item) {
        public static <T> Result<T> of(T item) { return new Result<>(true, item); }
    }
}
