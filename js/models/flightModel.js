let flights;

// Load flights from localstorage
export function init() {
  flights = localStorage.flights ? JSON.parse(localStorage.flights) : [];
}

export function addFlight(flight) {
  flights.push(flight);
  localStorage.setItem("flights", JSON.stringify(flights));
}

export function updateFlight(updatedFlight) {
  const index = flights.findIndex((f) => f.id === updatedFlight.id);
  if (index > -1) {
    flights[index] = updatedFlight;
    localStorage.setItem("flights", JSON.stringify(flights));
  }
}

export function getAllFlights() {
  return flights;
}

export function getFlightById(ids) {
  let flights = getAllFlights();
  return flights.filter((trip) => ids.includes(trip.id));
}

// Delete Flight type by ID
export function deleteFlight(id) {
  const numId = typeof id === "string" ? Number(id) : id;

  const index = flights.findIndex((flight) => flight.id === numId);

  flights.splice(index, 1);
  localStorage.setItem("flights", JSON.stringify(flights));
}

// Get unique airports from available flights
export function getAllUniqueOrigins() {
  const flights = getAllFlights();

  const origins = flights.map((flight) => flight.origin);

  const uniqueOrigins = [...new Set(origins)];

  return uniqueOrigins;
}

export function getFilteredOrigins(filterText) {
  let uniqueOrigins = getAllUniqueOrigins();

  return uniqueOrigins.filter((origin) =>
    origin.toLowerCase().includes(filterText.toLowerCase())
  );
}

class Flight {
  id = null;
  origin = "";
  destination = "";
  departureTime = "";
  arrivalTime = "";
  price = 0;
  duration = "";
  company = "";
  distance = 0;

  constructor(
    id,
    origin,
    destination,
    departureTime,
    arrivalTime,
    price = 0,
    duration = "",
    company = "",
    distance = 0
  ) {
    this.id = id;
    this.origin = origin;
    this.destination = destination;
    this.departureTime = departureTime;
    this.arrivalTime = arrivalTime;
    this.price = price;
    this.duration = duration;
    this.company = company;
    this.distance = distance;
  }
}
