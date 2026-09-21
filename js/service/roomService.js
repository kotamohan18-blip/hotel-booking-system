import API_BASE_URL from "./apiConfig.js";
import { ApiException } from "../../exception/apiException.js";

export async function getRoomsByHotelId(hotelId) {
    try {
        const response = await axios.get(`${API_BASE_URL}/rooms?hotelId=${hotelId}`);

        return response.data;
    } catch (error) {
        console.error("Error fetching rooms:", error);
        throw new ApiException("Failed to fetch rooms.", error);
    }
}

export async function getRoomById(roomId) {
    try {
        const response = await axios.get(`${API_BASE_URL}/rooms/${roomId}`);

        return response.data;
    } catch (error) {
        console.error(`Error fetching room with ID ${roomId}:`, error);
        throw new ApiException(`Failed to fetch room details.`, error);
    }
}

export async function updateRoomStatus(roomId, status) {
    try {
        // Fetch the full room object first to preserve all existing fields
        const room = await getRoomById(roomId);

        const updatedRoom = {
            ...room,
            status: status
        };

        const response = await axios.put(`${API_BASE_URL}/rooms/${roomId}`, updatedRoom);

        return response.data;
    } catch (error) {
        console.error(`Error updating room status for room ${roomId}:`, error);
        throw new ApiException("Failed to update room status.", error);
    }
}
