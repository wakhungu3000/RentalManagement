package com.nyumba.ledger.service;

/** A mistake the user can fix. The message is shown to them as-is, so write it for people. */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) { super(message); }
}
