import { getBookingsByUserId, cancelBooking } from "./service/bookingService.js";
import { getHotelById } from "./service/hotelService.js";
import { getRoomById, updateRoomStatus } from "./service/roomService.js";

const bookingList = document.getElementById("booking-list");
const cancelModal = document.getElementById("cancel-modal");
const confirmCancelBtn = document.getElementById("confirm-cancel-btn");
const keepBookingBtn = document.getElementById("keep-booking-btn");

const CURRENT_USER_ID = 1;
let currentBookings = [];
let selectedBooking = null;

// Simple in-memory cache to prevent duplicate requests for same hotel/room
const hotelCache = new Map();
const roomCache = new Map();

async function getCachedHotel(hotelId) {
    if (!hotelCache.has(hotelId)) {
        hotelCache.set(hotelId, await getHotelById(hotelId));
    }
    return hotelCache.get(hotelId);
}

async function getCachedRoom(roomId) {
    if (!roomCache.has(roomId)) {
        roomCache.set(roomId, await getRoomById(roomId));
    }
    return roomCache.get(roomId);
}

function displayBookings(bookings) {
    currentBookings = bookings;
    bookingList.innerHTML = "";

    if (bookings.length === 0) {
        bookingList.innerHTML = "<p>No bookings found.</p>";
        return;
    }

    bookings.forEach((booking) => {
        const card = document.createElement("div");
        card.className = "booking-card";

        const isConfirmed = booking.status.toLowerCase() === "confirmed";
        const checkIn = booking.checkIn || booking.checkInDate || "N/A";
        const checkOut = booking.checkOut || booking.checkOutDate || "N/A";
        const hotelName = booking.hotel?.name || `Hotel #${booking.hotelId}`;
        const roomInfo = booking.room
            ? `Room ${booking.room.roomNumber} (${booking.room.roomType})`
            : `Room #${booking.roomId}`;

        const roomImgHtml = booking.room?.image
            ? `<img src="${booking.room.image}" alt="${roomInfo}" class="booking-card-img">`
            : "";

        card.innerHTML = `
            ${roomImgHtml}
            <div class="booking-card-content">
                <h3>${hotelName}</h3>
                <p><strong>Room:</strong> ${roomInfo}</p>
                <p><strong>Check-in:</strong> ${checkIn}</p>
                <p><strong>Check-out:</strong> ${checkOut}</p>
                <p><strong>Guests:</strong> ${booking.guests}</p>
                <p><strong>Total Amount:</strong> ₹${booking.totalAmount}</p>
                <p><strong>Status:</strong> <span class="booking-status status-${booking.status.toLowerCase()}">${booking.status}</span></p>
                ${
                    isConfirmed
                        ? `<button class="cancel-booking-btn btn-danger" data-booking-id="${booking.id}">Cancel Booking</button>`
                        : ""
                }
            </div>
        `;

        bookingList.appendChild(card);
    });
}

function closeCancelModal() {
    cancelModal.classList.add("hidden");
    selectedBooking = null;
}

async function handleConfirmCancel() {
    if (!selectedBooking) return;

    try {
        // Step 1: Update booking status to Cancelled (preserves booking record in DB)
        await cancelBooking(selectedBooking.id);

        // Step 2: Only after booking cancellation succeeds, update room status to Available
        await updateRoomStatus(selectedBooking.roomId, "Available");

        // Invalidate room cache so latest status is fetched
        roomCache.delete(selectedBooking.roomId);

        // Step 3: Close confirmation dialog
        closeCancelModal();

        // Step 4: Refresh booking history
        await loadBookingHistory();

    } catch (error) {
        console.error("Error cancelling booking:", error);
        alert("Failed to cancel booking. Please try again.");
    }
}

async function loadBookingHistory() {
    try {
        bookingList.innerHTML = "<p>Loading booking history...</p>";

        // 1. Fetch current user's bookings
        const bookings = await getBookingsByUserId(CURRENT_USER_ID);

        // 2. Resolve related Hotel and Room data using cache + Promise.all
        const resolvedBookings = await Promise.all(
            bookings.map(async (booking) => {
                try {
                    const hotel = await getCachedHotel(booking.hotelId);
                    const room = await getCachedRoom(booking.roomId);
                    return { ...booking, hotel, room };
                } catch (err) {
                    console.error("Error resolving details for booking ID:", booking.id, err);
                    return booking;
                }
            })
        );

        // 3. Render into DOM
        displayBookings(resolvedBookings);

    } catch (error) {
        console.error("Error loading booking history:", error);
        bookingList.innerHTML = "<p class='error-message'>Failed to load booking history.</p>";
    }
}

// Event Delegation for dynamically rendered Cancel Booking buttons
bookingList.addEventListener("click", (event) => {
    const button = event.target.closest(".cancel-booking-btn");
    if (button) {
        const bookingId = button.dataset.bookingId;
        const found = currentBookings.find((b) => String(b.id) === String(bookingId));

        if (found) {
            selectedBooking = found;
            cancelModal.classList.remove("hidden");
        }
    }
});

// Setup Modal Event Listeners
confirmCancelBtn.addEventListener("click", handleConfirmCancel);
keepBookingBtn.addEventListener("click", closeCancelModal);

// Initial Load
loadBookingHistory();