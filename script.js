
"use strict";

// ==========================================
// SAMPLE TRANSPORT DATA
// ==========================================

const transportData = [
    {
        type: "Flight",
        icon: "✈️",
        price: 4500,
        duration: 2,
        comfort: 9
    },
    {
        type: "Train",
        icon: "🚆",
        price: 1200,
        duration: 10,
        comfort: 7
    },
    {
        type: "Bus",
        icon: "🚌",
        price: 700,
        duration: 12,
        comfort: 5
    }
];


// ==========================================
// PATTERN 1: BUILDER
// Builds a trip step by step.
// ==========================================

class TripBuilder {
    constructor() {
        this.trip = {
            id: "TRIP-" + Date.now(),
            name: "",
            origin: "",
            startDate: "",
            endDate: "",
            stops: [],
            transport: null,
            booking: null
        };
    }

    setName(name) {
        this.trip.name = name;
        return this;
    }

    setOrigin(origin) {
        this.trip.origin = origin;
        return this;
    }

    setDates(startDate, endDate) {
        this.trip.startDate = startDate;
        this.trip.endDate = endDate;
        return this;
    }

    addStop(destination, activity, day) {
        this.trip.stops.push({
            id: "STOP-" + Date.now() + "-" +
                Math.random().toString(36).slice(2, 7),
            destination,
            activity,
            day
        });

        return this;
    }

    build() {
        return this.trip;
    }
}


// ==========================================
// PATTERN 2: STRATEGY
// Different strategies for comparing travel.
// ==========================================

class CheapestStrategy {
    sort(options) {
        return [...options].sort((a, b) => a.price - b.price);
    }
}

class FastestStrategy {
    sort(options) {
        return [...options].sort((a, b) => a.duration - b.duration);
    }
}

class ComfortStrategy {
    sort(options) {
        return [...options].sort((a, b) => b.comfort - a.comfort);
    }
}

class TravelStrategy {
    constructor() {
        this.strategies = {
            cheapest: new CheapestStrategy(),
            fastest: new FastestStrategy(),
            comfort: new ComfortStrategy()
        };

        this.current = this.strategies.cheapest;
    }

    setStrategy(name) {
        this.current = this.strategies[name] ||
            this.strategies.cheapest;
    }

    compare(options) {
        return this.current.sort(options);
    }
}


// ==========================================
// PATTERN 3: FACTORY METHOD
// Creates transport option objects.
// ==========================================

class TransportOption {
    constructor(type, icon, price, duration, comfort, from, to) {
        this.id = type.toLowerCase();
        this.type = type;
        this.icon = icon;
        this.price = price;
        this.duration = duration;
        this.comfort = comfort;
        this.from = from;
        this.to = to;
    }
}

class TransportFactory {
    static createOptions(from, to) {
        return transportData.map(item =>
            new TransportOption(
                item.type,
                item.icon,
                item.price,
                item.duration,
                item.comfort,
                from,
                to
            )
        );
    }
}


// ==========================================
// PATTERN 4: FACADE
// One simple interface coordinates trip,
// comparison, selection and booking.
// ==========================================

class TravelPlannerFacade {
    constructor() {
        this.trip = null;
        this.strategy = new TravelStrategy();
        this.options = [];
        this.selectedTransport = null;
    }

    createTrip(name, origin, startDate, endDate) {
        this.trip = new TripBuilder()
            .setName(name)
            .setOrigin(origin)
            .setDates(startDate, endDate)
            .build();

        this.selectedTransport = null;
        this.trip.transport = null;
        this.trip.booking = null;

        return this.trip;
    }

    addDestination(destination, activity, day) {
        if (!this.trip) {
            throw new Error("Create your trip first.");
        }

        const stop = {
            id: "STOP-" + Date.now() + "-" +
                Math.random().toString(36).slice(2, 7),
            destination,
            activity,
            day
        };

        this.trip.stops.push(stop);
        this.trip.booking = null;

        return stop;
    }

    removeDestination(stopId) {
        if (!this.trip) return;

        this.trip.stops = this.trip.stops.filter(
            stop => stop.id !== stopId
        );

        this.trip.booking = null;
    }

    compareTransport(from, to, preference) {
        this.options = TransportFactory.createOptions(from, to);
        this.strategy.setStrategy(preference);

        return this.strategy.compare(this.options);
    }

    selectTransport(optionId) {
        if (!this.trip) {
            throw new Error("Create your trip first.");
        }

        const option = this.options.find(
            item => item.id === optionId
        );

        if (!option) {
            throw new Error("Please compare travel options first.");
        }

        this.selectedTransport = option;
        this.trip.transport = option;
        this.trip.booking = null;

        return option;
    }

    calculateTotal() {
        if (!this.trip) return 0;

        const transportCost = this.selectedTransport
            ? this.selectedTransport.price
            : 0;

        return transportCost;
    }

    confirmBooking() {
        if (!this.trip) {
            throw new Error("Create your trip first.");
        }

        if (this.trip.stops.length === 0) {
            throw new Error("Add at least one destination.");
        }

        if (!this.selectedTransport) {
            throw new Error("Select a transport option first.");
        }

        if (!this.trip.booking) {
            this.trip.booking = {
                id: "TW-" + Date.now().toString().slice(-8),
                status: "Demo Confirmed",
                createdAt: new Date().toLocaleString()
            };
        }

        return this.trip.booking;
    }

    reset() {
        this.trip = null;
        this.options = [];
        this.selectedTransport = null;
    }
}


// ==========================================
// APPLICATION SETUP
// ==========================================

const planner = new TravelPlannerFacade();

const $ = id => document.getElementById(id);

const tripForm = $("tripForm");
const startDateInput = $("startDate");
const endDateInput = $("endDate");
const stopDaySelect = $("stopDay");

let displayedOptions = [];


// ==========================================
// DATE INITIALIZATION
// ==========================================

const today = new Date();
const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

startDateInput.min = todayString;
endDateInput.min = todayString;

startDateInput.value = todayString;

const defaultEnd = new Date(today);
defaultEnd.setDate(defaultEnd.getDate() + 2);

endDateInput.value = [
    defaultEnd.getFullYear(),
    String(defaultEnd.getMonth() + 1).padStart(2, "0"),
    String(defaultEnd.getDate()).padStart(2, "0")
].join("-");

startDateInput.addEventListener("change", () => {
    endDateInput.min = startDateInput.value;

    if (endDateInput.value < startDateInput.value) {
        endDateInput.value = startDateInput.value;
    }

    updateDayOptions();
});

endDateInput.addEventListener("change", updateDayOptions);


// ==========================================
// HELPER FUNCTIONS
// ==========================================

function showMessage(elementId, message) {
    $(elementId).textContent = message;
}

function getTripDays() {
    if (!planner.trip) return 1;

    const start = new Date(planner.trip.startDate + "T00:00:00");
    const end = new Date(planner.trip.endDate + "T00:00:00");

    return Math.round((end - start) / 86400000) + 1;
}

function updateDayOptions() {
    const start = startDateInput.value;
    const end = endDateInput.value;

    if (!start || !end || end < start) return;

    const first = new Date(start + "T00:00:00");
    const last = new Date(end + "T00:00:00");

    const days = Math.round((last - first) / 86400000) + 1;

    if (days > 30) {
        showMessage("formMessage", "Trips can be at most 30 days.");
        return;
    }

    stopDaySelect.innerHTML = "";

    for (let day = 1; day <= days; day++) {
        const option = document.createElement("option");
        option.value = day;
        option.textContent = `Day ${day}`;
        stopDaySelect.appendChild(option);
    }

    if (planner.trip) {
        stopDaySelect.value = Math.min(
            Number(stopDaySelect.value) || 1,
            days
        );
    }
}

function formatDate(date) {
    if (!date) return "Not set";

    return new Date(date + "T00:00:00").toLocaleDateString(
        "en-IN",
        { day: "numeric", month: "short", year: "numeric" }
    );
}

function addTextElement(parent, tag, text, className = "") {
    const element = document.createElement(tag);
    element.textContent = text;

    if (className) element.className = className;

    parent.appendChild(element);
    return element;
}


// ==========================================
// CREATE TRIP AND ADD DESTINATIONS
// ==========================================

tripForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = $("tripName").value.trim();
    const origin = $("origin").value.trim();
    const start = startDateInput.value;
    const end = endDateInput.value;
    const destination = $("destination").value.trim();
    const activity = $("activity").value;
    const day = Number(stopDaySelect.value);

    if (!name || !origin || !destination || !start || !end) {
        showMessage("formMessage", "Please fill in all required fields.");
        return;
    }

    if (start < todayString || end < start) {
        showMessage("formMessage", "Please choose valid future trip dates.");
        return;
    }

    const days = Math.round(
        (new Date(end + "T00:00:00") -
         new Date(start + "T00:00:00")) / 86400000
    ) + 1;

    if (days > 30) {
        showMessage("formMessage", "Trips can be at most 30 days.");
        return;
    }

    if (day < 1 || day > days) {
        showMessage("formMessage", "Select a valid trip day.");
        return;
    }

    if (!planner.trip) {
        planner.createTrip(name, origin, start, end);
    } else {
        const existing = planner.trip;

        // Do not silently change dates after destinations are added.
        if (
            existing.name !== name ||
            existing.origin !== origin ||
            existing.startDate !== start ||
            existing.endDate !== end
        ) {
            showMessage(
                "formMessage",
                "Trip details are already set. Use Start New Trip to change them."
            );
            return;
        }
    }

    planner.addDestination(destination, activity, day);

    showMessage("formMessage", `${destination} added to your itinerary!`);

    $("destination").value = "";

    renderItinerary();
    renderSummary();

    $("transportFrom").value = planner.trip.origin;
    $("transportTo").value = destination;

    $("itinerary").scrollIntoView({ behavior: "smooth" });
});


// ==========================================
// RENDER ITINERARY
// ==========================================

function renderItinerary() {
    const container = $("itineraryList");
    const overview = $("tripOverview");

    container.replaceChildren();
    overview.replaceChildren();

    if (!planner.trip) {
        addTextElement(
            container,
            "p",
            "Your itinerary will appear here after you create a trip.",
            "empty"
        );
        return;
    }

    const trip = planner.trip;

    const overviewItems = [
        ["Trip", trip.name],
        ["Duration", `${getTripDays()} day(s)`],
        ["Destinations", trip.stops.length]
    ];

    overviewItems.forEach(([label, value]) => {
        const card = document.createElement("div");
        card.className = "overview-card";

        addTextElement(card, "span", label);
        addTextElement(card, "strong", String(value));

        overview.appendChild(card);
    });

    addTextElement(
        container,
        "p",
        `${trip.origin} · ${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`
    );

    for (let day = 1; day <= getTripDays(); day++) {
        const stops = trip.stops.filter(stop => stop.day === day);

        const card = document.createElement("article");
        card.className = "day-card";

        const heading = document.createElement("div");
        heading.className = "day-heading";

        addTextElement(heading, "h3", `Day ${day}`);
        addTextElement(
            heading,
            "span",
            `${stops.length} stop(s)`
        );

        card.appendChild(heading);

        if (stops.length === 0) {
            addTextElement(card, "p", "No destinations added yet.", "empty");
        }

        stops.forEach(stop => {
            const item = document.createElement("div");
            item.className = "stop-item";

            const details = document.createElement("div");

            addTextElement(details, "strong", stop.destination);
            addTextElement(details, "p", stop.activity);

            const remove = document.createElement("button");
            remove.className = "remove-btn";
            remove.type = "button";
            remove.textContent = "Remove";

            remove.addEventListener("click", () => {
                planner.removeDestination(stop.id);
                renderItinerary();
                renderSummary();
                showMessage("formMessage", "Destination removed.");
            });

            item.append(details, remove);
            card.appendChild(item);
        });

        container.appendChild(card);
    }
}


// ==========================================
// COMPARE TRANSPORT
// STRATEGY + FACTORY METHOD
// ==========================================

$("compareBtn").addEventListener("click", () => {
    const from = $("transportFrom").value.trim();
    const to = $("transportTo").value.trim();
    const preference = $("travelPreference").value;

    if (!from || !to) {
        showMessage("bookingMessage", "Enter both starting city and destination.");
        return;
    }

    if (from.toLowerCase() === to.toLowerCase()) {
        showMessage("bookingMessage", "Choose two different cities.");
        return;
    }

    displayedOptions = planner.compareTransport(
        from,
        to,
        preference
    );

    renderTransport();
    showMessage("bookingMessage", "");

    $("transportList").scrollIntoView({ behavior: "smooth" });
});

function renderTransport() {
    const container = $("transportList");
    container.replaceChildren();

    displayedOptions.forEach((option, index) => {
        const card = document.createElement("article");
        card.className = "transport-card";

        if (index === 0) {
            card.classList.add("recommended");
            addTextElement(card, "span", "Best match", "recommended-label");
        }

        addTextElement(card, "div", option.icon, "transport-icon");
        addTextElement(card, "h3", option.type);
        addTextElement(card, "p", `${option.from} → ${option.to}`);
        addTextElement(card, "p", `Estimated duration: ${option.duration} hours`);
        addTextElement(card, "p", `Comfort score: ${option.comfort}/10`);
        addTextElement(
            card,
            "strong",
            `₹${option.price.toLocaleString("en-IN")}`,
            "transport-price"
        );

        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-primary full-width";
        button.textContent = planner.selectedTransport?.id === option.id
            ? "Selected"
            : "Select Transport";

        button.addEventListener("click", () => {
            if (!planner.trip) {
                showMessage(
                    "bookingMessage",
                    "Create your trip and add a destination first."
                );
                $("planner").scrollIntoView({ behavior: "smooth" });
                return;
            }

            planner.selectTransport(option.id);

            renderTransport();
            renderSummary();

            showMessage(
                "bookingMessage",
                `${option.type} selected. Review your trip summary.`
            );
        });

        card.appendChild(button);
        container.appendChild(card);
    });
}


// ==========================================
// TRIP AND COST SUMMARY
// ==========================================

function renderSummary() {
    const details = $("tripDetails");
    const costs = $("costDetails");

    details.replaceChildren();
    costs.replaceChildren();

    if (!planner.trip) {
        addTextElement(details, "p", "Create a trip to see your details.", "empty");
        addTextElement(costs, "p", "No transport selected.", "empty");
        $("grandTotal").textContent = "₹0";
        $("bookBtn").disabled = true;
        $("bookingConfirmation").hidden = true;
        return;
    }

    const trip = planner.trip;

    [
        `Trip: ${trip.name}`,
        `Starting City: ${trip.origin}`,
        `Travel Dates: ${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`,
        `Destinations: ${trip.stops.length}`
    ].forEach(line => addTextElement(details, "p", line));

    if (planner.selectedTransport) {
        const option = planner.selectedTransport;

        addTextElement(costs, "p", `Transport: ${option.type}`);
        addTextElement(costs, "p", `${option.from} → ${option.to}`);
        addTextElement(
            costs,
            "p",
            `Transport cost: ₹${option.price.toLocaleString("en-IN")}`
        );
    } else {
        addTextElement(costs, "p", "Select a transport option to calculate costs.");
    }

    // Only transport has a sample price in this demo.
    addTextElement(costs, "p", "Activities and accommodation: Not included");

    $("grandTotal").textContent =
        `₹${planner.calculateTotal().toLocaleString("en-IN")}`;

    $("bookBtn").disabled =
        trip.stops.length === 0 || !planner.selectedTransport;

    $("bookingConfirmation").hidden = !trip.booking;
}


// ==========================================
// CONFIRM DEMO BOOKING
// ==========================================

$("bookBtn").addEventListener("click", () => {
    try {
        const booking = planner.confirmBooking();
        const trip = planner.trip;

        const confirmation = $("confirmationDetails");
        confirmation.replaceChildren();

        [
            `Reference: ${booking.id}`,
            `Trip: ${trip.name}`,
            `From: ${trip.origin}`,
            `Destinations: ${trip.stops.map(s => s.destination).join(", ")}`,
            `Transport: ${planner.selectedTransport.type}`,
            `Estimated cost: ₹${planner.calculateTotal().toLocaleString("en-IN")}`,
            `Status: ${booking.status}`,
            `Created: ${booking.createdAt}`
        ].forEach(line => addTextElement(confirmation, "p", line));

        $("bookingConfirmation").hidden = false;

        showMessage(
            "bookingMessage",
            "Demo booking created successfully."
        );

        renderSummary();

        $("bookingConfirmation").scrollIntoView({
            behavior: "smooth"
        });
    } catch (error) {
        showMessage("bookingMessage", error.message);
    }
});


// ==========================================
// RESET TRIP
// ==========================================

$("resetBtn").addEventListener("click", () => {
    planner.reset();

    tripForm.reset();

    startDateInput.value = todayString;

    const end = new Date();
    end.setDate(end.getDate() + 2);

    endDateInput.value = [
        end.getFullYear(),
        String(end.getMonth() + 1).padStart(2, "0"),
        String(end.getDate()).padStart(2, "0")
    ].join("-");

    $("transportFrom").value = "";
    $("transportTo").value = "";
    $("transportList").replaceChildren();

    displayedOptions = [];

    updateDayOptions();
    renderItinerary();
    renderSummary();

    showMessage("formMessage", "Ready to plan a new trip.");
    showMessage("bookingMessage", "");

    $("planner").scrollIntoView({ behavior: "smooth" });
});


// ==========================================
// INITIALIZE WEBSITE
// ==========================================

updateDayOptions();
renderItinerary();
renderSummary();
