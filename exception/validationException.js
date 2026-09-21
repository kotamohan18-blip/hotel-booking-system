export class ValidationException extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationException";
    }
}

export function validateBooking(checkIn, checkOut, guests) {
    if (!checkIn) {
        throw new ValidationException("Please select a check-in date.");
    }

    if (!checkOut) {
        throw new ValidationException("Please select a check-out date.");
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
        throw new ValidationException("Check-out date must be after check-in date.");
    }

    const guestsCount = parseInt(guests, 10);
    if (isNaN(guestsCount) || guestsCount < 1) {
        throw new ValidationException("Number of guests must be at least 1.");
    }

    return true;
}

export function calculateNights(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}
