initdata();

function initdata() {
  // USERS
  if (!localStorage.users) {
    const users = [
      {
        id: 1,
        name: "Alice",
        email: "alice@teste.com",
        password: "alice1234",
        isAdmin: false,
        homeAirport: "OPO",
        miles: {
          available: 236,
          total: 4300,
        },
        trips: [1],
        badges: ["us", "fr", "jp", "de"],
        favorites: ["Porto", "Barcelona"],
      },
      {
        id: 2,
        name: "Bob",
        email: "bob@teste.com",
        password: "bob1234",
        isAdmin: true,
        homeAirport: "LAX",
        miles: {
          available: 465,
          total: 2020,
        },
        trips: [2],
        badges: ["br", "pt", "es"],
        favorites: ["Rio Grande do Sul", "Cidade do México", "Roménia"],
      },
      {
        id: 3,
        name: "Charlie",
        email: "charlie@teste.com",
        password: "charlie1234",
        isAdmin: false,
        homeAirport: "LIS",
        miles: {
          available: 200,
          total: 1300,
        },
        trips: [1, 2],
        badges: ["it", "ca", "mx", "nl"],
        favorites: ["Nova Iorque", "Las Vegas"],
      },
      {
        id: 4,
        name: "teste",
        email: "boba@teste.com",
        password: "123",
        isAdmin: false,
        homeAirport: "SFO",
        miles: {
          available: 10,
          total: 1240,
        },
        trips: [2],
        badges: ["au", "ch", "se"],
        favorites: ["Andorra", "Madrid"],
      },
    ];
    console.log("Injecting Data");
    localStorage.setItem("users", JSON.stringify(users));
  }

  // TOURISM TYPE
  if (!localStorage.tourismTypes) {
    const tourismTypes = [
      { id: 1, name: "Aventura" },
      { id: 2, name: "Praia" },
      { id: 3, name: "Religioso" },
      { id: 4, name: "Gastronómico" },
    ];
    localStorage.setItem("tourismTypes", JSON.stringify(tourismTypes));
    console.log("Tourism types initialized");
  }

  // FLIGHTS
  if (!localStorage.flights) {
    const flights = [
      {
        id: 1,
        origin: "OPO",
        destination: "LIS",
        departureTime: "2025-06-01T09:00",
        arrivalTime: "2025-06-01T10:00",
        price: 70,
        duration: "1h",
        company: "TAP",
        distance: 313,
      },
      {
        id: 2,
        origin: "LIS",
        destination: "BCN",
        departureTime: "2025-06-05T14:00",
        arrivalTime: "2025-06-05T16:00",
        price: 120,
        duration: "2h",
        company: "Vueling",
        distance: 1006,
      },
      {
        id: 3,
        origin: "LAX",
        destination: "JFK",
        departureTime: "2025-07-01T07:00",
        arrivalTime: "2025-07-01T15:30",
        price: 350,
        duration: "5h 30m",
        company: "Delta",
        distance: 3983,
      },
    ];
    localStorage.setItem("flights", JSON.stringify(flights));
    console.log("Flights initialized");
  }

  // TRIPS
  if (!localStorage.trips) {
    const trips = [
      {
        id: 1,
        name: "Férias em Barcelona",
        typesOfTourism: [2, 4],
        origin: "OPO",
        destination: "BCN",
        price: 500,
        company: "TAP",
        duration: "7 dias",
        startDate: "2025-06-05",
        endDate: "2025-06-12",
        description: "Descubra as praias e a gastronomia de Barcelona.",
        isPack: true,
        flights: [2],
      },
      {
        id: 2,
        name: "Tour pelos EUA",
        typesOfTourism: [1, 4],
        origin: "LAX",
        destination: "JFK",
        price: 1200,
        company: "Delta",
        duration: "10 dias",
        startDate: "2025-07-01",
        endDate: "2025-07-11",
        description: "Viagem pelas principais cidades americanas.",
        isPack: false,
        flights: [3],
      },
      {
        id: 2,
        name: "Semana na Suíça",
        typesOfTourism: [1, 4],
        origin: "OPO",
        destination: "ZRH",
        price: 300,
        company: "Swiss Air",
        duration: "7 dias",
        startDate: "2025-07-01",
        endDate: "2025-07-11",
        description: "Descubra as montanhas.",
        isPack: true,
        flights: [2],
      },
      {
        id: 3,
        name: "Visita ao Iceberg",
        typesOfTourism: [1, 4],
        origin: "OPO",
        destination: "ICE",
        price: 3200,
        company: "Icelandair",
        duration: "10 dias",
        startDate: "2025-07-01",
        endDate: "2025-07-11",
        description: "Descubra a Islândia.",
        isPack: true,
        flights: [1],
      },
    ];
    localStorage.setItem("trips", JSON.stringify(trips));
    console.log("Trips initialized");
  }
}
