let trips;

// Load trips from localstorage
export function init() {
  trips = localStorage.trips ? JSON.parse(localStorage.trips) : [];
}

// Return all trips
export function getAllTrips() {
  return trips;
}

export function getAllNonPacks() {
  const trips = getAllTrips();
  return trips.filter((trip) => !trip.isPack);
}

// Admin set pack and price
export function setPackAndPrice(tripId, newPrice) {
  const trip = trips.find((trip) => String(trip.id) === String(tripId));
  if (!trip) {
    throw new Error("Viagem não encontrada!");
  }

  trip.isPack = true;
  trip.price = newPrice;
  localStorage.setItem("trips", JSON.stringify(trips));
}

// Add New Trip
export function addTrip(flightsArray, name, description = "") {
  let allTourismTypes = [];
  flightsArray.forEach((flight) => {
    if (Array.isArray(flight.tourismTypes)) {
      flight.tourismTypes.forEach((type) => {
        if (!allTourismTypes.includes(type)) {
          allTourismTypes.push(type);
        }
      });
    }
  });

  const origin = flightsArray[0].origin;
  const destination = flightsArray[flightsArray.length - 1].destination;

  const price = flightsArray.reduce(
    (total, flight) => total + (flight.price || 0),
    0
  );

  const startDate = flightsArray[0].departureTime;
  const endDate = flightsArray[flightsArray.length - 1].arrivalTime;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end - start;
  const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const duration = `${durationDays} dias`;

  const flights = flightsArray.map((flight) => flight.id);

  const id = Date.now();
  const newTrip = new Trip(
    id,
    name,
    allTourismTypes,
    origin,
    destination,
    price,
    duration,
    startDate,
    endDate,
    description,
    false,
    flights
  );

  trips.push(newTrip);
  localStorage.setItem("trips", JSON.stringify(trips));
}

// Filter trips by ID
export function getTripById(ids) {
  let trips = getAllTrips();
  return trips.filter((trip) => ids.includes(trip.id));
}

// Delete tourism type by ID
export function deleteTrip(id) {
  const numId = typeof id === "string" ? Number(id) : id;
  const trip = trips.find((trip) => trip.id === numId);
  if (trip) {
    trip.isPack = false;
    localStorage.setItem("trips", JSON.stringify(trips));
  }
}

// Get all trips that are packs
export function getAllPacks() {
  const trips = getAllTrips();
  return trips.filter((trip) => trip.isPack);
}

class Trip {
  id = null;
  name = "";
  typesOfTourism = [];
  origin = "";
  destination = "";
  price = 0;
  duration = "";
  startDate = "";
  endDate = "";
  description = "";
  isPack = false;
  flights = [];

  constructor(
    id,
    name,
    typesOfTourism = [],
    origin,
    destination,
    price = 0,
    duration = "",
    startDate = "",
    endDate = "",
    description = "",
    isPack = false,
    flights = []
  ) {
    this.id = id;
    this.name = name;
    this.typesOfTourism = typesOfTourism;
    this.origin = origin;
    this.destination = destination;
    this.price = price;
    this.duration = duration;
    this.startDate = startDate;
    this.endDate = endDate;
    this.description = description;
    this.isPack = isPack;
    this.flights = flights;
  }
}
