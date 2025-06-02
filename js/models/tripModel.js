let trips;

// Load trips from localstorage
export function init() {
  trips = localStorage.trips ? JSON.parse(localStorage.trips) : [];
}

// Return all trips
export function getAllTrips() {
  return trips;
}

// Filter trips by ID
export function getTripById(ids) {
  let trips = getAllTrips();
  return trips.filter((trip) => ids.includes(trip.id));
}

// Delete tourism type by ID
export function deleteTrip(id) {
  const numId = typeof id === "string" ? Number(id) : id;

  const index = trips.findIndex((trip) => trip.id === numId);

  trips.splice(index, 1);
  localStorage.setItem("trips", JSON.stringify(trips));
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
  company = "";
  duration = "";
  startDate = "";
  endDate = "";
  description = "";
  isPack = true;
  flights = [];

  constructor(
    id,
    name,
    typesOfTourism = [],
    origin,
    destination,
    price = 0,
    company = "",
    duration = "",
    startDate = "",
    endDate = "",
    description = "",
    isPack = false,
    flights = [],
  ) {
    this.id = id;
    this.name = name;
    this.typesOfTourism = typesOfTourism;
    this.origin = origin;
    this.destination = destination;
    this.price = price;
    this.company = company;
    this.duration = duration;
    this.startDate = startDate;
    this.endDate = endDate;
    this.description = description;
    this.isPack = isPack;
    this.flights = flights;
  }
}
