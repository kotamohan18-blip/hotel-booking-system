import { getHotelById } from "./service/hotelService.js";
import { getRoomsByHotelId, updateRoomStatus } from "./service/roomService.js";
import { createBooking } from "./service/bookingService.js";
import { validateBooking, calculateNights } from "../exception/validationException.js";

// DOM Elements - Hotel details
const hotelImage = document.getElementById("hotel-image");
const hotelName = document.getElementById("hotel-name");
const hotelLocation = document.getElementById("hotel-location");
const hotelRating = document.getElementById("hotel-rating");
const hotelPrice = document.getElementById("hotel-price");
const roomsList = document.getElementById("rooms-list");

// DOM Elements - Booking modal & form
const bookingModal = document.getElementById("booking-modal");
const bookingForm = document.getElementById("booking-form");
const bookingRoomImage = document.getElementById("booking-room-image");
const bookingRoomTitle = document.getElementById("booking-room-title");
const bookingRoomPrice = document.getElementById("booking-room-price");
const checkInInput = document.getElementById("check-in-date");
const checkOutInput = document.getElementById("check-out-date");
const guestsInput = document.getElementById("guests-count");
const bookingSummary = document.getElementById("booking-summary");
const bookingError = document.getElementById("booking-error");
const cancelBookingBtn = document.getElementById("cancel-booking-btn");

// DOM Elements - Confirmation modal
const confirmationModal = document.getElementById("confirmation-modal");
const confirmationDetails = document.getElementById("confirmation-details");
const closeConfirmationBtn = document.getElementById("close-confirmation-btn");

// Current state
let currentHotel = null;
let currentRooms = [];
let selectedRoom = null;

function displayHotelDetails(hotel) {
    if (hotel.image && hotelImage) {
        hotelImage.src = hotel.image;
        hotelImage.alt = hotel.name;
        hotelImage.style.display = "block";
    }
    hotelName.textContent = hotel.name;
    hotelLocation.textContent = hotel.location;
    hotelRating.textContent = `Rating: ⭐ ${hotel.rating}`;
    hotelPrice.textContent = `From ₹${hotel.price} per night`;
}

function displayRooms(rooms, selectedHotelId) {
    roomsList.innerHTML = "";

    const matchingRooms = rooms.filter(
        (room) => String(room.hotelId) === String(selectedHotelId)
    );

    if (matchingRooms.length === 0) {
        roomsList.innerHTML = "<p>No rooms available for this hotel.</p>";
        return;
    }

    matchingRooms.forEach((room) => {
        const roomCard = document.createElement("div");
        roomCard.className = "room-card";

        const isAvailable = room.status.toLowerCase() === "available";
        const roomImgHtml = room.image
            ? `<img src="${room.image}" alt="Room ${room.roomNumber} - ${room.roomType}" class="room-card-img">`
            : "";

        roomCard.innerHTML = `
            ${roomImgHtml}
            <div class="room-card-content">
                <h3>Room ${room.roomNumber}</h3>
                <p><strong>Type:</strong> ${room.roomType}</p>
                <p><strong>Price:</strong> ₹${room.price} per night</p>
                <p class="room-status status-${room.status.toLowerCase()}">${room.status}</p>
                ${
                    isAvailable
                        ? `<button class="book-room-btn" data-room-id="${room.id}">Book Room</button>`
                        : `<button class="book-room-btn disabled" disabled>Booked</button>`
                }
            </div>
        `;

        roomsList.appendChild(roomCard);
    });
}

function openBookingForm(room) {
    selectedRoom = room;
    if (room.image && bookingRoomImage) {
        bookingRoomImage.src = room.image;
        bookingRoomImage.alt = `Room ${room.roomNumber}`;
        bookingRoomImage.style.display = "block";
    } else if (bookingRoomImage) {
        bookingRoomImage.style.display = "none";
    }
    bookingRoomTitle.textContent = `Book Room ${room.roomNumber} (${room.roomType})`;
    bookingRoomPrice.textContent = `Price: ₹${room.price} per night`;
    bookingForm.reset();
    guestsInput.value = 1;
    bookingSummary.textContent = "";
    bookingError.textContent = "";
    bookingModal.classList.remove("hidden");
}

function closeBookingForm() {
    bookingModal.classList.add("hidden");
    if (bookingRoomImage) {
        bookingRoomImage.style.display = "none";
    }
    selectedRoom = null;
}

function updateBookingCalculation() {
    const checkIn = checkInInput.value;
    const checkOut = checkOutInput.value;

    if (checkIn && checkOut && selectedRoom) {
        const nights = calculateNights(checkIn, checkOut);
        if (nights > 0) {
            const total = selectedRoom.price * nights;
            bookingSummary.textContent = `${nights} night(s) × ₹${selectedRoom.price} = Total: ₹${total}`;
            return;
        }
    }
    bookingSummary.textContent = "";
}

function showConfirmation(hotel, room, booking) {
    confirmationDetails.innerHTML = `
        <p><strong>Hotel:</strong> ${hotel.name}</p>
        <p><strong>Room:</strong> ${room.roomNumber}</p>
        <p><strong>Check-in:</strong> ${booking.checkIn}</p>
        <p><strong>Check-out:</strong> ${booking.checkOut}</p>
        <p><strong>Guests:</strong> ${booking.guests}</p>
        <p><strong>Total:</strong> ₹${booking.totalAmount}</p>
    `;
    confirmationModal.classList.remove("hidden");
}

async function handleBookingSubmit(event) {
    event.preventDefault();
    bookingError.textContent = "";

    if (!selectedRoom || !currentHotel) {
        bookingError.textContent = "No room selected.";
        return;
    }

    const checkIn = checkInInput.value;
    const checkOut = checkOutInput.value;
    const guests = guestsInput.value;

    try {
        // 1. Validate dates and guests
        validateBooking(checkIn, checkOut, guests);

        // 2. Calculate number of nights and total amount
        const nights = calculateNights(checkIn, checkOut);
        const totalAmount = selectedRoom.price * nights;

        // 3. Prepare booking object
        const bookingData = {
            userId: 1,
            hotelId: Number(currentHotel.id),
            roomId: Number(selectedRoom.id),
            checkIn: checkIn,
            checkOut: checkOut,
            guests: Number(guests),
            totalAmount: totalAmount,
            status: "Confirmed"
        };

        // 4. Send POST /bookings
        const createdBooking = await createBooking(bookingData);

        // 5. Update room status to Booked only AFTER successful booking
        await updateRoomStatus(selectedRoom.id, "Booked");

        // 6. Close the form modal
        closeBookingForm();

        // 7. Show confirmation details
        showConfirmation(currentHotel, selectedRoom, createdBooking);

        // 8. Refresh rooms list from API
        await refreshRooms();

    } catch (error) {
        bookingError.textContent = error.message;
    }
}

async function refreshRooms() {
    const params = new URLSearchParams(window.location.search);
    const hotelId = params.get("hotelId");

    const rooms = await getRoomsByHotelId(hotelId);
    currentRooms = rooms;
    displayRooms(rooms, hotelId);
}

// Setup Event Listeners
roomsList.addEventListener("click", (event) => {
    const button = event.target.closest(".book-room-btn:not([disabled])");
    if (button) {
        const roomId = button.dataset.roomId;
        const room = currentRooms.find((r) => String(r.id) === String(roomId));
        if (room) {
            openBookingForm(room);
        }
    }
});

checkInInput.addEventListener("change", updateBookingCalculation);
checkOutInput.addEventListener("change", updateBookingCalculation);
bookingForm.addEventListener("submit", handleBookingSubmit);
cancelBookingBtn.addEventListener("click", closeBookingForm);
closeConfirmationBtn.addEventListener("click", () => {
    confirmationModal.classList.add("hidden");
});

async function loadHotelDetails() {
    const params = new URLSearchParams(window.location.search);
    const hotelId = params.get("hotelId");

    if (!hotelId) {
        console.error("No hotel ID found in the URL.");
        return;
    }

    try {
        currentHotel = await getHotelById(hotelId);
        displayHotelDetails(currentHotel);

        currentRooms = await getRoomsByHotelId(hotelId);
        displayRooms(currentRooms, hotelId);
    } catch (error) {
        console.error("Error loading hotel details or rooms:", error);
    }
}

loadHotelDetails();
