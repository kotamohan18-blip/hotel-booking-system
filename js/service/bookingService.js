import API_BASE_URL from "./apiConfig.js";
import { ApiException } from "../../exception/apiException.js";

export async function createBooking(bookingData) {
    try {
        const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData);

        return response.data;
    } catch (error) {
        console.error("Error creating booking:", error);
        throw new ApiException("Failed to create booking. Please try again.", error);
    }
}

export async function getBookingsByUserId(userId) {
    try {
        const response = await axios.get(`${API_BASE_URL}/bookings?userId=${userId}`);

        return response.data;
    } catch (error) {
        console.error(`Error fetching bookings for user ${userId}:`, error);
        throw new ApiException("Failed to fetch booking history.", error);
    }
}

export async function getBookingById(bookingId) {
    try {
        const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`);

        return response.data;
    } catch (error) {
        console.error(`Error fetching booking with ID ${bookingId}:`, error);
        throw new ApiException(`Failed to fetch booking with ID ${bookingId}.`, error);
    }
}

export async function cancelBooking(bookingId) {
    try {
        // Fetch current booking object to preserve all existing fields
        const booking = await getBookingById(bookingId);

        const updatedBooking = {
            ...booking,
            status: "Cancelled"
        };

        const response = await axios.put(`${API_BASE_URL}/bookings/${bookingId}`, updatedBooking);

        return response.data;
    } catch (error) {
        console.error(`Error cancelling booking with ID ${bookingId}:`, error);
        throw new ApiException("Failed to cancel booking.", error);
    }
}
