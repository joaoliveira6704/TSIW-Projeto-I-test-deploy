// Variável para armazenar os dados dos países em memória
let countriesData;

// Vai buscar todos os países à API externa e guarda em memória
export function getAllCountries() {
  return fetch("https://restcountries.com/v3.1/all?fields=cca2,continents")
    .then((response) => response.json())
    .then((data) => {
      countriesData = data;
      return data;
    });
}

// Formata uma data para o formato dd/mm ou dd/mm/aaaa
export function formatDateToLabel(dateString) {
  const [year, month, day] = dateString.split("-");
  const currentYear = new Date().getFullYear().toString();

  if (year === currentYear) {
    return `${day}/${month}`;
  } else {
    return `${day}/${month}/${year}`;
  }
}

// Função auxiliar para obter a data de amanhã (à meia-noite)
export function getTomorrow() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  return d;
}

// Validação dos dados do formulário de voo
export function validateFormData(formData) {
  const errors = [];

  // Validação básica dos campos obrigatórios
  if (!formData.origin || formData.origin.trim() === "") {
    errors.push("Origem é obrigatória");
  }

  if (!formData.destination || formData.destination.trim() === "") {
    errors.push("Destino é obrigatório");
  }

  if (!formData.price || formData.price <= 0)
    errors.push("O preço deve ser maior que zero");

  // Validação das datas
  if (formData.departureTime && formData.arrivalTime) {
    const departure = new Date(formData.departureTime);
    const arrival = new Date(formData.arrivalTime);

    if (arrival <= departure) {
      errors.push("A data de chegada deve ser posterior à partida");
    }
  }

  // Validação de coordenadas
  const lat1 = parseFloat(formData.originLat);
  const long1 = parseFloat(formData.originLong);
  const lat2 = parseFloat(formData.destinLat);
  const long2 = parseFloat(formData.destinLong);

  if (lat1 < -90 || lat1 > 90)
    errors.push("Latitude de origem inválida (-90 a 90)");
  if (long1 < -180 || long1 > 180)
    errors.push("Longitude de origem inválida (-180 a 180)");
  if (lat2 < -90 || lat2 > 90)
    errors.push("Latitude de destino inválida (-90 a 90)");
  if (long2 < -180 || long2 > 180)
    errors.push("Longitude de destino inválida (-180 a 180)");

  // Validação das coordenadas dos POIs
  if (formData.pois && Array.isArray(formData.pois)) {
    formData.pois.forEach((poi, index) => {
      const poiLat = parseFloat(poi.lat);
      const poiLong = parseFloat(poi.long);

      if (poiLat < -90 || poiLat > 90) {
        errors.push(`POI ${index + 1}: Latitude inválida (-90 a 90)`);
      }
      if (poiLong < -180 || poiLong > 180) {
        errors.push(`POI ${index + 1}: Longitude inválida (-180 a 180)`);
      }
      if (poi.name.trim() === "") {
        errors.push(`POI ${index + 1}: Nome é obrigatório`);
      }
    });
  }

  return errors;
}

// Função para formatar hora (ex: "14:30")
export function formatTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Devolve o código IATA da companhia aérea (para mostrar o logo)
export function getIata(company) {
  // Mapeamento de nomes de companhias para códigos IATA (para mostrar o logo)
  const IATA_CODES = {
    TAP: "TP",
    Vueling: "VY",
    Iberia: "IB",
    "Air France": "AF",
    "British Airways": "BA",
    Lufthansa: "LH",
    Ryanair: "FR",
    Swiss: "LX",
    "Austrian Airlines": "OS",
    SAS: "SK",
    Norwegian: "DY",
    "Aer Lingus": "EI",
    Aegean: "A3",
    "Turkish Airlines": "TK",
    Finnair: "AY",
    "ITA Airways": "AZ",
    easyJet: "U2",
    Alitalia: "AZ",
    LOT: "LO",
    "Wizz Air": "W6",
    TAROM: "RO",
    Eurowings: "EW",
    Transavia: "HV",
  };
  return IATA_CODES[company] || company;
}

// Formata uma data ISO para "Dia mês"
export function formatDate(isoString) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "long",
  }).format(date);
}

// Calcula desconto: para cada 200 milhas, desconta 5€ do preço final. Devolve 0 se o preço final for negativo
export function calculateDiscount(miles, finalPrice) {
  if (finalPrice - (miles / 200) * 5 > 0) {
    return finalPrice - (miles / 200) * 5;
  } else {
    return 0;
  }
}

export function clearSessionstorage() {
  sessionStorage.removeItem("currentTrip");
  sessionStorage.removeItem("tripData");
  sessionStorage.removeItem("userQuery");
}

/* Funções para scratchoff (raspadinha) */
// Cria um evento de rato personalizado
export function mouseEvent(type, sx, sy, cx, cy) {
  var evt;
  var e = {
    bubbles: true,
    cancelable: type != "mousemove",
    view: window,
    detail: 0,
    screenX: sx,
    screenY: sy,
    clientX: cx,
    clientY: cy,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0,
    relatedTarget: undefined,
  };
  if (typeof document.createEvent == "function") {
    evt = document.createEvent("MouseEvents");
    evt.initMouseEvent(
      type,
      e.bubbles,
      e.cancelable,
      e.view,
      e.detail,
      e.screenX,
      e.screenY,
      e.clientX,
      e.clientY,
      e.ctrlKey,
      e.altKey,
      e.shiftKey,
      e.metaKey,
      e.button,
      document.body.parentNode
    );
  } else if (document.createEventObject) {
    evt = document.createEventObject();
    for (prop in e) {
      evt[prop] = e[prop];
    }
    evt.button = { 0: 1, 1: 4, 2: 2 }[evt.button] || evt.button;
  }
  return evt;
}

// Dispara um evento de rato num elemento
export function dispatchEvent(el, evt) {
  if (el.dispatchEvent) {
    el.dispatchEvent(evt);
  } else if (el.fireEvent) {
    el.fireEvent("on" + type, evt);
  }
  return evt;
}

export function formatDateTimeToLabel(dateTimeString) {
  const date = new Date(dateTimeString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);

  return `${day}/${month}/${year}`;
}

// Vai buscar o nome do aeroporto a uma API externa
export function fetchAirportName(iataCode) {
  const url = `https://airport-info.p.rapidapi.com/airport?iata=${iataCode}`;

  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "64760f03c0msh7ee6b39d8565e2dp1c0847jsnc47c37b50d04",
      "X-RapidAPI-Host": "airport-info.p.rapidapi.com",
    },
  };

  return fetch(url, options)
    .then((response) => {
      if (!response.ok)
        throw new Error("Network response was not ok: " + response.status);
      return response.json();
    })
    .then((data) => {
      return data.name;
    })
    .catch((error) => {
      return null;
    });
}

// Cria um objeto de destino com nome, latitude, longitude e POIs
export function createDestinObj(destinName, latitude, longitude, poi) {
  const obj = {
    objName: destinName,
    lat: latitude,
    long: longitude,
    pois: poi,
  };

  return obj;
}

// Gera a quantidade de estrelas do rating (0-5)
export function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = "";

  // Estrelas cheias
  for (let i = 0; i < fullStars; i++) {
    stars += '<span class="text-yellow-400">★</span>';
  }

  // Meia estrela
  if (hasHalfStar) {
    stars += '<span class="text-yellow-400">☆</span>';
  }

  // Estrelas vazias
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars += '<span class="text-gray-300">★</span>';
  }

  return stars;
}

// Formata uma data para o formato YYYY-MM-DD
export function formatDateToYMD(dateString) {
  if (dateString.includes("T") || dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
    const dateOnly = dateString.split("T")[0];
    const [year, month, day] = dateOnly.split("-");
    return Date.parse(`${year},${month},${day}`);
  } else {
    const [day, month, year] = dateString.split("-");
    return Date.parse(`${year},${month},${day}`);
  }
}

// Formata a data de um voo (função placeholder)
export function formatFlightTime(dateString) {
  const date = dateString.split("T")[0];
}

// Carrega as views de destinos e mapa (exemplo de integração com o mapa e lista)
export function loadViews(flight) {
  //Loop de voos

  let formatedDepartureTime = Date.parse(
    flight.departureTime.split("T")[0].split("-").join(",")
  );

  if (departureDate < formatedDepartureTime) {
    // Adiciona à lista de destinos
    destinationList.insertAdjacentHTML(
      "beforeend",
      `<li id="${flight.id}"class="border-2 border-blue-800 bg-white p-4 rounded shadow-lg last" value="${flight.destinationName}" id="${flight.id}">
          <p class="truncate">${flight.destinationName} <span class="opacity-60 text-xs">${flight.destination}</span></p>
        </li>`
    );

    // Adiciona ao mapa
    let pin = user.favorites.includes(flight.destinationName)
      ? favIcon
      : destinIcon;

    const marker = L.marker([flight.destinationLat, flight.destinationLong], {
      icon: pin,
      zIndexOffset: 900,
    }).addTo(iconGroup);

    const apiKey = "NpYuyyJzclnrvUUkVK1ISyi2FGnrw4p9sNg9CCODQGsiFc0nWvuUJJMN";
    fetch(
      `https://api.pexels.com/v1/search?query=${flight.destinationName}&per_page=2`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        const image =
          data.photos[1]?.src.medium || "../img/images/fallback.jpg";
        marker.bindPopup(
          `
              <div class="flex justify-center backdrop-blur-sm h-10 rounded-t-lg">
               <p class="">${flight.destinationName}</p>
              </div>
              <div class="w-40 h-30 bg-[url(${image})] bg-cover bg-center flex flex-col justify-between">
                
                </div>
                <div 
                  data-id="${flight.id}" 
                  class="popup-add-btn px-10 py-3 w-40 h-10 bg-blue-600  text-white flex justify-center items-center rounded-b-lg">
                  <p class="w-fit fle text-center mb-2">Adicionar à lista</p>
                </div>
              `
        );
      });

    marker.on("popupopen", (e) => {
      setTimeout(() => {
        const btn = e.popup._contentNode.querySelector(".popup-add-btn");

        btn.addEventListener("click", function (e) {
          const flightId = parseInt(this.getAttribute("data-id"));
          addToList(flightId);
        });
      }, 100);
    });

    marker.on("mouseover", function () {
      poiCards.innerHTML = "";
      poiDisplay.textContent = `${flight.destinationName} pontos de interesse`;

      flight.poi.forEach((poi) => {
        const apiKey =
          "NpYuyyJzclnrvUUkVK1ISyi2FGnrw4p9sNg9CCODQGsiFc0nWvuUJJMN";
        fetch(`https://api.pexels.com/v1/search?query=${poi.name}&per_page=2`, {
          headers: {
            Authorization: apiKey,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            const image =
              data.photos[1]?.src.medium || "../img/images/fallback.jpg";

            poiCards.insertAdjacentHTML(
              "beforeend",
              ` <div class="group border-2 border-blue-800 bg-[url(${image})] bg-cover w-30 h-30 rounded-lg">
                    <div class=" hidden group-hover:flex p-2 items-center text-center w-full h-full flex bg-[#6C6EA0] opacity-75 rounded-lg">
                      <span class="text-white">${poi.name}</span>
                    </div>
                  </div>
                `
            );
          });
      });
    });
  }
  mapLine();
}

// Calcula a duração a partir dos minutos (retorna hhmm)
export function calculateDuration(duration) {
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return `${hours}h${minutes}m`;
}

// Adiciona os dados do voo à sessionstorage para passar entre páginas
export function setFlightData(tripName, flightArray, originName, milesValue) {
  let flightTexts = flightArray.map((li) => li.textContent.trim());

  flightTexts.unshift(originName);

  const tripData = {
    name: tripName,
    destinations: flightTexts,
    miles: milesValue,
  };

  sessionStorage.setItem("tripData", JSON.stringify(tripData));
}

// Devolve o ID do tipo de turismo a partir do nome
export function getTurismTypeId(tourismType) {
  let tourismTypesArray = JSON.parse(localStorage.getItem("tourismTypes"));
  for (const [id, type] of Object.entries(tourismTypesArray)) {
    if (tourismType === type) {
      return id;
    }
  }
}

export function focusPoi() {
  console.log(poi.name);
}
