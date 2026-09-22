import { getHotels } from "./service/hotelService.js";

const hotelList = document.getElementById("hotel-list");
const searchInput = document.getElementById("search-input");
const locationFilter = document.getElementById("location-filter");
const priceFilter = document.getElementById("price-filter");
const clearFiltersBtn = document.getElementById("clear-filters-btn");

// In-memory store for loaded hotels
let allHotels = [];

function renderHotels(hotels) {
    hotelList.innerHTML = "";

    if (hotels.length === 0) {
        hotelList.innerHTML = `<p class="no-hotels-msg">No hotels found matching your search criteria.</p>`;
        return;
    }

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
}

// Event delegation for View Rooms buttons on dynamically rendered hotel cards
hotelList.addEventListener("click", (event) => {
    const button = event.target.closest(".view-rooms-btn");
    if (button) {
        const hotelId = button.dataset.hotelId;
        window.location.href = `hotel-details.html?hotelId=${hotelId}`;
    }
});

function populateLocationFilter(hotels) {
    // Generate unique locations from loaded hotels
    const locations = [...new Set(hotels.map((hotel) => hotel.location))];

    locations.forEach((location) => {
        const option = document.createElement("option");
        option.value = location;
        option.textContent = location;
        locationFilter.appendChild(option);
    });
}

function applyFilters() {
    const searchText = searchInput.value.trim().toLowerCase();
    const selectedLocation = locationFilter.value;
    const maxPrice = priceFilter.value.trim();

    // Filter in-memory without making new API requests
    const filteredHotels = allHotels.filter((hotel) => {
        const matchesSearch = hotel.name.toLowerCase().includes(searchText);
        const matchesLocation = selectedLocation === "" || hotel.location === selectedLocation;
        const matchesPrice = maxPrice === "" || hotel.price <= Number(maxPrice);

        return matchesSearch && matchesLocation && matchesPrice;
    });

    renderHotels(filteredHotels);
}

function clearFilters() {
    searchInput.value = "";
    locationFilter.value = "";
    priceFilter.value = "";
    renderHotels(allHotels);
}

// Event Listeners for Filters
searchInput.addEventListener("input", applyFilters);
locationFilter.addEventListener("change", applyFilters);
priceFilter.addEventListener("input", applyFilters);
clearFiltersBtn.addEventListener("click", clearFilters);

async function loadHotels() {
    try {
        allHotels = await getHotels();
        populateLocationFilter(allHotels);
        renderHotels(allHotels);
    } catch (error) {
        console.error("Error loading hotels:", error);
        hotelList.innerHTML = `<p class="error-message">Failed to load hotels. Please check if the server is running.</p>`;
    }
}

loadHotels();