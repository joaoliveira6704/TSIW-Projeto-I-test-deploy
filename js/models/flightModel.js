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

export function getFlightByTripId(ids) {
  let flights = getAllFlights();
  return flights.filter((trip) => ids.includes(trip.id));
}

export function getFlightById(id) {
  const flights = getAllFlights();
  return flights.find((flight) => flight.id === id);
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

export function getFlightsByOrigin(originGet) {
  const flights = getAllFlights();

  const filteredFlights = flights.filter(
    (flight) => flight.origin === originGet
  );

  return filteredFlights;
}

class Flight {
  id = null;
  origin = "";
  destination = "";
  destinationName = "";
  departureTime = "";
  arrivalTime = "";
  price = 0;
  duration = "";
  company = "";
  distance = 0;
  poi = [];
  destinLat = 0;
  destinLong = 0;

  constructor(
    id,
    origin,
    destination,
    destinationName,
    departureTime,
    arrivalTime,
    price = 0,
    duration = "",
    company = "",
    distance = 0,
    poi = [],
    destinLat,
    destinLong
  ) {
    this.id = id;
    this.origin = origin;
    this.destination = destination;
    this.destinationName = destinationName;
    this.departureTime = departureTime;
    this.arrivalTime = arrivalTime;
    this.price = price;
    this.duration = duration;
    this.company = company;
    this.distance = distance;
    this.poi = poi;
    this.destinLat = destinLat;
    this.destinLong = destinLong;
  }
  addPoi(name, lat, long, tourismTypes = []) {
    this.poi.push({
      name,
      lat,
      long,
      tourismTypes,
    });
  }
}
