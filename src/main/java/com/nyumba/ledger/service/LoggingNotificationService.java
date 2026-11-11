package com.nyumba.ledger.service;

import com.nyumba.ledger.domain.Invoice;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class LoggingNotificationService implements NotificationService {
    private static final Logger log = LoggerFactory.getLogger(LoggingNotificationService.class);

    @Override
    public void invoiceSent(Invoice invoice) {
        log.info("Invoice {} for {} ({}) sent to {} - delivery is simulated.",
                invoice.getNo(), invoice.getPeriod(), invoice.getAmount(), invoice.getTenantName());
    }
}
