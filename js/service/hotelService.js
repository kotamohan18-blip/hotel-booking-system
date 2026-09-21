import API_BASE_URL from "./apiConfig.js";
import { ApiException } from "../../exception/apiException.js";

export async function getHotels() {
    try {
        const response = await axios.get(`${API_BASE_URL}/hotels`);

        return response.data;
    } catch (error) {
        console.error("Error fetching hotels:", error);
        throw new ApiException("Failed to fetch hotels.", error);
    }
}

export async function getHotelById(hotelId) {
    try {
        const response = await axios.get(`${API_BASE_URL}/hotels/${hotelId}`);

        return response.data;
    } catch (error) {
        console.error("Error fetching hotel:", error);
        throw new ApiException(`Failed to fetch hotel with ID ${hotelId}.`, error);
    }
}