package com.nyumba.ledger.service;

import com.nyumba.ledger.domain.Invoice;

/**
 * The one place that talks to the outside world (email / SMS).
 * Today it only writes to the log. To send real messages, add another
 * implementation (for example one using an SMS or email provider) and
 * mark it @Primary - no other code needs to change.
 */
public interface NotificationService {
    void invoiceSent(Invoice invoice);
}
