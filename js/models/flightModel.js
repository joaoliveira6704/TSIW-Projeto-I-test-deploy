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

export function findAlternateLeg(from, to, flightList) {
  const flights = getAllFlights();

  // Encontra o voo de escala (legFlight) que termina em 'to'
  let legFlight = flights.find((flight) => flight.destination === to);

  console.log(legFlight);

  // Encontra o voo alternativo que parte de 'from' e chega ao ponto de partida do legFlight
  let newFlight = flights.find(
    (flight) =>
      flight.destination == legFlight.origin &&
      flight.origin == from &&
      legFlight.departureTime > flight.arrivalTime
  );
  console.log(newFlight);
  // Encontra o índice do 'from' na lista de destinos
  const index = flightList.findIndex((destination) => destination === to);

  // Só faz a alteração se o índice for válido e o destino seguinte for 'to'
  if (index !== -1) {
    const array1 = flightList.slice(0, index);
    const array2 = flightList.slice(index, flightList.length);

    array2.unshift(newFlight.destination);

    let newArray = array1.concat(array2);
    console.log(newArray);
    return newArray;
  }
}

export function getAllFlightsByLeg(from, to) {
  const allFlights = getAllFlights();
  return allFlights.filter((f) => f.origin === from && f.destination === to);
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
  originName = "";
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
    originName,
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
    this.originName = originName;
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
