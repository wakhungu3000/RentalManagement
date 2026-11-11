package com.nyumba.ledger.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

/** Incoming data. Every rule here is enforced on the server, whatever the browser checked. */
public final class Requests {
    private Requests() {}

    public record HouseRequest(
            @NotBlank(message = "Enter the house number, for example B-12.") @Size(max = 20, message = "House number is too long.") String number,
            @NotBlank(message = "Choose the house type.") @Size(max = 40) String type,
            @NotBlank(message = "Enter where the house is, for example Milimani.") @Size(max = 60) String location,
            @Positive(message = "Enter the monthly rent as a number greater than 0.") long rent) {}

    public record TenantRequest(
            @NotBlank(message = "Enter the tenant’s full name.") @Size(max = 80) String name,
            @NotBlank(message = "Enter a phone number.") @Pattern(regexp = "^[0-9 +]{9,15}$", message = "Enter a phone number with 9 to 15 digits, for example 0712 345 678.") String phone,
            @Email(message = "Enter a valid email address, or leave it empty.") @Size(max = 80) String email,
            @Size(max = 20) String idNo,
            @NotBlank(message = "Choose a house for the tenant.") String houseId,
            @NotNull(message = "Choose the move-in date.") LocalDate moveIn) {}

    public record InvoiceRequest(
            @NotBlank(message = "Choose a tenant.") String tenantId,
            @NotBlank(message = "Enter what the invoice covers, for example December 2026 rent.") @Size(max = 60) String period,
            @Positive(message = "Enter an amount greater than 0.") long amount,
            @NotNull(message = "Choose a due date.") LocalDate due,
            @Size(max = 200) String note) {}

    public record BulkInvoiceRequest(
            @NotBlank(message = "Enter the period, for example December 2026.") @Size(max = 60) String period,
            @NotNull(message = "Choose a due date.") LocalDate due) {}

    /** tenantId is used only when the owner records a payment; a tenant always pays for themselves. */
    public record PaymentRequest(
            String tenantId,
            @Positive(message = "Enter the amount as a number greater than 0.") long amount,
            @NotBlank(message = "Choose a payment method.") @Pattern(regexp = "M-Pesa|Bank transfer|Cash", message = "Choose M-Pesa, Bank transfer or Cash.") String method,
            @Size(max = 30, message = "The reference is too long.") String ref) {}

    public record MaintenanceCreate(
            @NotBlank(message = "Choose a category.") @Size(max = 40) String category,
            @NotBlank @Pattern(regexp = "Low|Normal|Urgent", message = "Choose Low, Normal or Urgent.") String priority,
            @NotBlank @Size(min = 10, max = 500, message = "Describe the problem in at least 10 characters so the landlord knows what to fix.") String desc) {}

    public record StatusRequest(
            @NotBlank @Pattern(regexp = "pending|in progress|resolved", message = "Status must be pending, in progress or resolved.") String status) {}
}
