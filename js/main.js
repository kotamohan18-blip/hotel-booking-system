import { getHotels } from "./service/hotelService.js";

const hotelList = document.getElementById("hotel-list");

function renderHotels(hotels) {
    hotelList.innerHTML = "";

    hotels.forEach((hotel) => {
        const hotelCard = document.createElement("div");
        hotelCard.className = "hotel-card";

        hotelCard.innerHTML = `
            <img src="${hotel.image}" alt="${hotel.name}">
            <div class="hotel-content">
                <h2>${hotel.name}</h2>
                <p>Location: ${hotel.location}</p>
                <p>Rating: ⭐ ${hotel.rating}</p>
                <p>Price: ₹${hotel.price}</p>
                <button class="view-rooms-btn" data-hotel-id="${hotel.id}">
                    View Rooms
                </button>
            </div>
        `;

        hotelList.appendChild(hotelCard);
    });

    attachViewRoomsEvents();
}

function attachViewRoomsEvents() {
    const buttons = document.querySelectorAll(".view-rooms-btn");

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const hotelId = button.dataset.hotelId;
            window.location.href = `hotel-details.html?hotelId=${hotelId}`;
        });
    });
}

async function loadHotels() {
    try {
        const hotels = await getHotels();
        renderHotels(hotels);
    } catch (error) {
        console.error("Error loading hotels:", error);
    }
}

loadHotels();