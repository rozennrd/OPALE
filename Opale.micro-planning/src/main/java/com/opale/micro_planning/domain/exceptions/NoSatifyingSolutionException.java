package com.opale.micro_planning.domain.exceptions;

public class NoSatifyingSolutionException extends RuntimeException {
    public NoSatifyingSolutionException(String message) {
        super(message);
    }
}
