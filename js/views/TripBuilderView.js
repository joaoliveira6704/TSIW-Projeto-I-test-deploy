// Importa os módulos necessários
import * as Flight from "../models/FlightModel.js";
import * as Helper from "../models/ModelHelper.js";
import * as User from "../models/UserModel.js";
import * as Tourism from "../models/TourismtypeModel.js";

// Inicializa os dados de voos, tipos de turismo e utilizadores
Flight.init();
Tourism.init();
User.init();

let oldTrip; // Guarda o estado anterior da lista de destinos

/* Botões de alternância entre mapa e lista */
const mapViewBtn = document.getElementById("mapViewBtn");
const listViewBtn = document.getElementById("listViewBtn");
const priceSlider = document.getElementById("steps-range");
const maxPrice = document.getElementById("maxPrice");

/* Células do grid */
const mapCell = document.getElementById("map");
const listViewCell = document.getElementById("mapListView");
const poiCell = document.getElementById("poiCards");
const poiDisplay = document.getElementById("poiTitle");

/* Listas ordenáveis */
const tripList = document.getElementById("destinationSortableList");
const destinationList = document.getElementById("destinationSortableListView");
const trashCan = document.getElementById("trashCan");
const clearBtn = document.getElementById("clearListBtn");
const submitBtn = document.getElementById("submitBtn");

/* Texto das milhas */
const milesText = document.getElementById("miles");

const tripName = document.getElementById("tripName");

let maxPriceValue;

/* Ícones do mapa */
let iconGroup;
let pathGroup;
let poiGroup;

let user = User.getUserLogged();
let tourismTypeId;
let departureDate;
/* Objeto de origem */
let originObj;
let originName;

/* Mapa */
var map;
let outOfBounds = document.getElementById("outOfBoundsAlert");
let iconArray = [];

/* Definição dos ícones do mapa */
const mapOriginIcon = L.icon({
  iconUrl: "/img/icons/other/compassPin.png",
  iconSize: [32, 50],
  iconAnchor: [16, 50],
});
const destinIcon = L.icon({
  iconUrl: "/img/icons/other/normalPin.png",
  iconSize: [20, 30],
  iconAnchor: [10, 15],
});
const favIcon = L.icon({
  iconUrl: "/img/icons/other/favIcon.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const pathIcon = L.icon({
  iconUrl: "/img/icons/other/pathLastPoint.png",
  iconSize: [16, 25],
  iconAnchor: [8, 25],
});
const ballIcon = L.icon({
  iconUrl: "/img/icons/other/pathPoint.png",
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});
const poiIcon = L.icon({
  iconUrl: "/img/icons/other/poiPin.png",
  iconSize: [20, 25],
  iconAnchor: [10, 12.5],
});

/* Alternância entre vista de mapa e lista */
let mapView = true;
mapViewBtn.addEventListener("click", function () {
  if (!mapView) {
    mapCell.classList.toggle("hidden");
    listViewCell.classList.toggle("hidden");
    mapViewBtn.classList.toggle("bg-blue-100");
    mapViewBtn.classList.toggle("bg-white");
    mapViewBtn.classList.toggle("border-3");
    mapViewBtn.classList.toggle("border-2");
    listViewBtn.classList.toggle("border-3");
    listViewBtn.classList.toggle("border-2");
    listViewBtn.classList.toggle("bg-blue-100");
    listViewBtn.classList.toggle("bg-white");
    mapView = true;
  }
});

listViewBtn.addEventListener("click", function () {
  if (mapView) {
    mapCell.classList.toggle("hidden");
    listViewCell.classList.toggle("hidden");
    mapViewBtn.classList.toggle("bg-blue-100");
    mapViewBtn.classList.toggle("bg-white");
    mapViewBtn.classList.toggle("border-3");
    mapViewBtn.classList.toggle("border-2");
    listViewBtn.classList.toggle("border-3");
    listViewBtn.classList.toggle("border-2");
    listViewBtn.classList.toggle("bg-blue-100");
    listViewBtn.classList.toggle("bg-white");
    mapView = false;
  }
});

/* Configuração das listas ordenáveis com SortableJS */
new Sortable(destinationList, {
  group: {
    name: "Map",
    put: false,
    pull: "Trip",
  },
  sort: false,
  dragClass: "destinationGhost",
  animation: 150,

  onStart: function () {
    tripList.classList.add(
      "outline-2",
      "outline-offset-2",
      "outline-solid",
      "outline-blue-500"
    );
  },

  onEnd: function () {
    tripList.classList.remove(
      "outline-2",
      "outline-offset-2",
      "outline-solid",
      "outline-blue-500"
    );
  },
});

new Sortable(tripList, {
  group: {
    name: "Trip",
    put: ["Map"],
    pull: "Trash",
  },

  animation: 150,
  dragClass: "tripGhost",

  onAdd: function (cell) {
    requestAnimationFrame(() => {
      let item = cell.item;
      let itemValue = item.getAttribute("value");
      const child = item.querySelector("p");
      const favIcon = item.querySelector(".favoriteBtn");

      if (item && item.classList) {
        item.removeChild(child);
        item.removeChild(favIcon);
        item.classList.remove("bg-white", "px-4", "rounded", "h-fit", "py-2");
        item.classList.add(
          "px-2",
          "py-2",
          "bg-[#39578A]",
          "text-white",
          "lg:pl-5",
          "lg:pr-10",
          "lg:h-20",
          "lg:min-h-20",
          "lg:w-full",
          "h-full",
          "w-25",
          "min-w-25",
          "flex",
          "items-center",
          "lg:justify-between",
          "justify-center",
          "rounded-lg"
        );

        item.insertAdjacentHTML(
          "afterbegin",
          ` <div class="flex gap-5 inline-flex w-fit">
                <img
                  src="../img/icons/white/destinationElipse.svg"
                  alt="startingPoint"
                  class="hidden lg:flex"
                />
                <p id="destinationName" class="truncate">${itemValue}</p>
              </div>
              
                <div
                  id="drag"
                  class="cursor-pointer hidden lg:flex"
                >
                  <img
                    src="../img/icons/white/menu.svg"
                    alt="trashIcon"
                    class="h-5"
                  />
              </div>`
        );
      }
      updateMap();
      tripList.scrollTop = tripList.scrollHeight;
    });
  },

  onSort: function () {
    updateMap();
  },

  onStart: function () {
    trashCan.classList.remove("opacity-30");
    // Guarda o estado anterior da lista de destinos
    oldTrip = Array.from(tripList.childNodes).map((node) =>
      node.cloneNode(true)
    );
    saveTripList();
  },
  onEnd: function (evt) {
    trashCan.classList.add("opacity-30");
    // Obtém os destinos atuais da lista
    let tripStrings = Array.from(tripList.getElementsByTagName("li")).map(
      (item) =>
        item.getAttribute("value") ||
        item.querySelector("#destinationName")?.textContent ||
        item.textContent.trim()
    );
    tripStrings.unshift(originName);
    simulateFlights(tripStrings);
  },
});

/**
 * Função para simular a viagem e validar se todos os segmentos têm voos disponíveis.
 * Se não houver voo direto, tenta encontrar rota alternativa.
 * Se não encontrar, repõe a lista anterior.
 */
function simulateFlights(tripStrings) {
  // Primeiro, valida se todos os segmentos têm voos disponíveis
  for (let i = 0; i < tripStrings.length - 1; i++) {
    const currentLocation = tripStrings[i];
    const nextLocation = tripStrings[i + 1];
    if (currentLocation === nextLocation) {
      restoreOldTrip();
      return false;
    }
    const flightsForLeg = Flight.getAllFlightsByLeg(
      currentLocation,
      nextLocation
    );

    if (flightsForLeg.length === 0) {
      let newFlights = Flight.findAlternateLeg(
        currentLocation,
        nextLocation,
        tripStrings
      );

      if (newFlights && newFlights.length > 0) {
        // Chama recursivamente com a nova rota (inclui pontos de ligação)
        return simulateFlights(newFlights);
      } else {
        restoreOldTrip();
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Não foram encontrados voos de ligação :/",
        });
        return false; // Indica falha
      }
    }
  }

  // Se chegou aqui, todos os segmentos têm voos disponíveis

  // Limpa a lista atual
  tripList.innerHTML = "";

  // Constrói a lista de viagem com os voos reais
  for (let i = 0; i < tripStrings.length - 1; i++) {
    const from = tripStrings[i];
    const to = tripStrings[i + 1];
    const flight = Flight.getAllFlightsByLeg(from, to)[0]; // Primeiro voo disponível

    if (flight) {
      tripList.insertAdjacentHTML(
        "beforeend",
        `<li id="${flight.id}" tabindex="1" class="px-2 py-2 lg:pr-10 lg:pl-5 bg-[#39578A] text-white lg:h-20 lg:min-h-20 lg:w-full h-full w-25 min-w-25 flex items-center lg:justify-between justify-center rounded-lg">
          <div class="flex gap-5 inline-flex">
            <img src="../img/icons/white/destinationElipse.svg" alt="startingPoint" class="hidden lg:flex">
            <p id="destinationName" class="truncate">${flight.destinationName}</p>
          </div>
          <div class="flex hide gap-5">
            <div id="drag" class="cursor-pointer hidden lg:flex">
              <img src="../img/icons/white/menu.svg" alt="trashIcon" class="h-5">
            </div>
          </div>
        </li>`
      );
    }
  }

  // Atualiza o mapa com a nova rota
  updateMap();
  return true; // Indica sucesso
}

/**
 * Função auxiliar para repor a viagem anterior se a validação falhar.
 * Remove duplicados com base no ID do elemento.
 */
function restoreOldTrip() {
  if (oldTrip && oldTrip.length > 0) {
    tripList.innerHTML = "";

    // Remove duplicados com base no ID do elemento
    const seenIds = new Set();
    const uniqueTrip = [];

    oldTrip.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const nodeId = node.id;
        if (nodeId && !seenIds.has(nodeId)) {
          seenIds.add(nodeId);
          uniqueTrip.push(node);
        } else if (!nodeId) {
          // Mantém elementos sem ID (não podem ser duplicados por ID)
          uniqueTrip.push(node);
        }
      }
    });

    // Adiciona os elementos únicos à lista de viagem
    uniqueTrip.forEach((node) => {
      tripList.appendChild(node);
    });

    updateMap();
  }
}

// Configuração do Sortable para o lixo (trash)
new Sortable(trashCan, {
  group: {
    name: "Trash",
    put: ["Trip"],
  },
  onAdd: function (event) {
    oldTrip = Array.from(tripList.childNodes).map((node) =>
      node.cloneNode(true)
    );
    event.item.remove();
    let tripStrings = Array.from(tripList.getElementsByTagName("li")).map(
      (item) =>
        item.getAttribute("value") ||
        item.querySelector("#destinationName")?.textContent ||
        item.textContent.trim()
    );
    tripStrings.unshift(originName);
    simulateFlights(tripStrings);
  },
  emptyInsertThreshold: 0,
});

/* Ao carregar a página */
document.addEventListener("DOMContentLoaded", () => {
  if (!sessionStorage.getItem("userQuery")) {
    location.href = "../index.html";
  }

  const userQuery = JSON.parse(sessionStorage.getItem("userQuery"));
  departureDate = Helper.formatDateToYMD(userQuery.date);
  tourismTypeId = Tourism.getTourismId(userQuery.typeOfTourism);
  priceSlider.value = 100;
  maxPrice.textContent = `100 €`;
  maxPriceValue = 100;

  createMap(Flight.getFlightsByOrigin(userQuery.origin)[0]);

  loadMap(userQuery.origin);

  originName = Flight.getOriginName(userQuery.origin);

  document.getElementById("origin").textContent = userQuery.origin;
});

/**
 * Cria o mapa Leaflet e adiciona o marcador de origem.
 */
const createMap = function (origin) {
  map = L.map("map").setView([origin.originLat, origin.originLong], 5);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 12,
    minZoom: 4,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright"></a>',
  }).addTo(map);

  /* Grupos de marcadores e polígonos */
  iconGroup = L.layerGroup().addTo(map);
  pathGroup = L.layerGroup().addTo(map);
  poiGroup = L.layerGroup().addTo(map);

  originObj = Helper.createDestinObj(
    origin.origin,
    origin.originLat,
    origin.originLong,
    origin.poi
  );

  /* Marcador de origem */
  var originMarker = L.marker([origin.originLat, origin.originLong], {
    icon: mapOriginIcon,
    zIndexOffset: 1000,
  }).addTo(map);

  map.addEventListener("move", function () {});
};

/**
 * Carrega os destinos e pontos de interesse no mapa e na lista.
 */
function loadMap(origin) {
  iconArray = [];
  user = User.getUserLogged();

  const flightList = Flight.getFlightsByOrigin(origin);
  const miles = calculateActiveTripMiles();
  Flight.filterByTourismId(flightList, tourismTypeId);

  milesText.textContent = `${miles}`;

  iconGroup.clearLayers();
  poiGroup.clearLayers();
  pathGroup.clearLayers();
  destinationList.innerHTML = "";

  /* Ciclo para cada voo */
  flightList.forEach((flight) => {
    let favoriteSrc = user.favorites.includes(flight.destinationName)
      ? "../img/icons/blue/heartFilled.svg"
      : "../img/icons/blue/heart.svg";

    let formatedDepartureTime = Date.parse(
      flight.departureTime.split("T")[0].split("-").join(",")
    );
    let expression;
    if (maxPriceValue < 1000) {
      expression =
        departureDate < formatedDepartureTime && flight.price <= maxPriceValue;
    } else {
      document.getElementById("maxPrice").innerText = "1000€ +";
      expression = departureDate < formatedDepartureTime && flight.price > 0;
    }
    if (expression) {
      /* Preenche a lista de destinos */
      destinationList.insertAdjacentHTML(
        "beforeend",
        `<li id="${flight.id}"class="flex items-center justify-between border-2 border-blue-800 bg-white px-4 py-2 rounded shadow-lg h-fit" value="${flight.destinationName}" id="${flight.id}">
        <p class="truncate">${flight.destinationName} <span class="opacity-60 text-xs">${flight.destination}</span></p>
        <div
                  data-id="${flight.id}"
                  class="cursor-pointer favoriteBtn"
                >
                  <img
                    src=${favoriteSrc}
                    alt="favIcon"
                    class="h-5"
                  />
                </div>
      </li>`
      );

      /* Preenche o mapa com marcadores */
      let pin = user.favorites.includes(flight.destinationName)
        ? favIcon
        : destinIcon;

      const marker = L.marker([flight.destinationLat, flight.destinationLong], {
        icon: pin,
        zIndexOffset: 900,
      }).addTo(iconGroup);

      iconArray.push(marker);

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
            <div class="flex justify-center items-center gap-3 backdrop-blur-sm h-10 rounded-t-lg">
             <p class="">${flight.destinationName}</p>
             <div
                  data-id="${flight.id}"
                  class="cursor-pointer favoriteBtn h-fit"
                >
                  <img
                    src=${favoriteSrc}
                    alt="favIcon"
                    class="h-5"
                  />
                </div>
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

      marker.on("popupopen", (e) => {
        setTimeout(() => {
          const favBtn = e.popup._contentNode.querySelector(".favoriteBtn");

          favBtn.addEventListener("click", function (e) {
            const flightId = parseInt(this.getAttribute("data-id"));
            const destinationName =
              Flight.getFlightById(flightId).destinationName;
            User.toggleFavorite(destinationName);
            loadMap(Flight.getFlightById(flightId).origin);
          });
        }, 100);
      });

      marker.on("mouseover", function () {
        poiCards.innerHTML = "";
        poiDisplay.textContent = `${flight.destinationName} - Pontos de Interesse`;

        flight.poi.forEach((poi) => {
          const apiKey =
            "NpYuyyJzclnrvUUkVK1ISyi2FGnrw4p9sNg9CCODQGsiFc0nWvuUJJMN";
          fetch(
            `https://api.pexels.com/v1/search?query=${poi.name}&per_page=2`,
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

              poiCards.insertAdjacentHTML(
                "beforeend",
                ` <div class="group border-2 border-blue-800 bg-[url(${image})] bg-cover w-30 h-30 rounded-lg">
                  <div class=" hidden group-hover:flex p-2 justify-center items-center text-center w-full h-full flex bg-[#6C6EA0] opacity-75 rounded-lg">
                    <span class="text-white flex">${poi.name}</span>
                  </div>
                </div>
              `
              );
            });
        });
      });

      flight.poi.forEach((poi) => {
        const poiMarker = L.marker([poi.latitude, poi.long], {
          icon: poiIcon,
          zIndexOffset: 200,
        }).addTo(poiGroup);

        poiMarker.bindTooltip(`${poi.name}`, {
          permanent: false,
          direction: "top",
          offset: [0, -10],
        });
      });
    }
    let mapBounds = map.getBounds();
    let inView = iconArray.every((icon) => {
      let iconCoord = icon.getLatLng();
      return mapBounds.contains(iconCoord);
    });

    if (inView) {
      if (outOfBounds.classList.contains("hidden")) {
      } else {
        outOfBounds.classList.add("hidden");
      }
    } else {
      if (outOfBounds.classList.contains("hidden")) {
        outOfBounds.classList.remove("hidden");
      }
    }
    mapLine();
  });

  let btnList = document.querySelectorAll(".favoriteBtn");
  btnList.forEach((btn) => {
    btn.addEventListener("click", function () {
      const flightId = parseInt(this.getAttribute("data-id"));
      const destinationName = Flight.getFlightById(flightId).destinationName;
      User.toggleFavorite(destinationName);

      loadMap(Flight.getFlightById(flightId).origin);
    });
  });

  map.addEventListener("drag zoom", function () {
    let mapBounds = map.getBounds();
    let inView = iconArray.every((icon) => {
      let iconCoord = icon.getLatLng();
      return mapBounds.contains(iconCoord);
    });

    if (inView) {
      if (outOfBounds.classList.contains("hidden")) {
      } else {
        outOfBounds.classList.add("hidden");
      }
    } else {
      if (outOfBounds.classList.contains("hidden")) {
        outOfBounds.classList.remove("hidden");
      }
    }
  });
}

//Adiciona um destino à lista de viagens

function addToList(id) {
  const flight = Flight.getFlightById(id);
  const itemHTML = `
    <li id="${flight.id}" tabindex="1" class="px-2 py-2 lg:pr-10 lg:pl-5 bg-[#39578A]  text-white lg:h-20 lg:min-h-20 lg:w-full h-full w-25 min-w-25 flex items-center lg:justify-between justify-center rounded-lg">
        <div class="flex gap-5 inline-flex">
                <img
                  src="../img/icons/white/destinationElipse.svg"
                  alt="startingPoint"
                  class="hidden lg:flex"
                />
                <p id="destinationName" class="truncate">${flight.destinationName}</p>
              </div>
              <div class="flex hide gap-5">
              
                <div
                  id="drag"
                  class="cursor-pointer hidden lg:flex"
                >
                  <img
                    src="../img/icons/white/menu.svg"
                    alt="trashIcon"
                    class="h-5"
                  />
                </div>
              </div>
    </li>
  `;

  tripList.insertAdjacentHTML("beforeend", itemHTML);

  loadMap(flight.destination);
  tripList.scrollTop = tripList.scrollHeight;
  tripList.scrollTop = tripList.scrollWidth;
  updateMap();
}

/**
 * Desenha as linhas e pontos da rota no mapa.
 */
function mapLine() {
  const createMapPoints = function (obj, index, arrLeng) {
    if (index != 0) {
      const pin = index == arrLeng - 1 ? pathIcon : ballIcon;
      const flightPin = L.marker([obj.lat, obj.long], {
        icon: pin,
        zIndexOffset: 1000,
      }).addTo(pathGroup);
    }
  };

  const createMapLines = function (obj, index, arr) {
    if (index != 0) {
      const flightLine = L.polyline(
        [
          [obj.lat, obj.long],
          [arr[index - 1].lat, arr[index - 1].long],
        ],
        {
          color: "red",
          weight: 1,
          dashArray: "6, 6",
        }
      ).addTo(pathGroup);
    }
  };

  let liArray = Array.from(tripList.getElementsByTagName("li"));
  let pointsObjArray = [];

  pointsObjArray.push(originObj);

  /* Cria objetos de destino */
  liArray.forEach((element, index) => {
    let flight = Flight.getFlightById(parseInt(element.getAttribute("id")));

    const destinObj = Helper.createDestinObj(
      flight.destination,
      flight.destinationLat,
      flight.destinationLong,
      flight.poi
    );

    pointsObjArray.push(destinObj);
  });

  pointsObjArray.forEach((element, idx) => {
    createMapPoints(element, idx, pointsObjArray.length);
    createMapLines(element, idx, pointsObjArray);
  });
}

// Calcula as milhas da viagem ativa.
function calculateActiveTripMiles() {
  let tripItems = Array.from(tripList.getElementsByTagName("li"));

  let totalMiles = Flight.calculateMiles(tripItems);

  return totalMiles;
}

// Atualiza o mapa e o estado dos botões.
function updateMap() {
  mapLine();

  let tripItems = Array.from(tripList.getElementsByTagName("li"));
  const activeTripMiles = calculateActiveTripMiles();
  milesText.textContent = activeTripMiles > 0 ? `${activeTripMiles}` : `0`;

  if (tripItems.length == 0) {
    const userQuery = JSON.parse(sessionStorage.getItem("userQuery"));
    departureDate = Helper.formatDateToYMD(userQuery.date);

    clearBtn.classList.add("disabled", "cursor-not-allowed");
    submitBtn.classList.add("disabled", "cursor-not-allowed");
    loadMap(originObj.objName);
  } else {
    const lastFlightId = parseInt(
      tripItems[tripItems.length - 1].getAttribute("id")
    );
    const lastFlight = Flight.getFlightById(lastFlightId);
    departureDate = Helper.formatDateToYMD(lastFlight.arrivalTime);

    clearBtn.classList.remove("disabled", "cursor-not-allowed");
    submitBtn.classList.remove("disabled", "cursor-not-allowed");
    clearBtn.classList.add("cursor-pointer");
    submitBtn.classList.add("cursor-pointer");
    clearBtn.classList.add("cursor-pointer");
    submitBtn.classList.add("cursor-pointer");
    loadMap(lastFlight.destination);
  }
}

//Função para guardar a lista de viagem.
const saveTripList = function () {
  let liArray = Array.from(tripList.getElementsByTagName("li"));
};

/* Botão para limpar a lista de viagem */
clearBtn.addEventListener("click", function () {
  tripList.innerHTML = "";
  updateMap();
});

/* Slider de preço máximo */
priceSlider.addEventListener("input", function () {
  maxPrice.textContent = `${priceSlider.value}€`;
  maxPriceValue = parseInt(priceSlider.value);
  updateMap();
});

/* Validação do nome da viagem */
tripName.addEventListener("click", () => {
  if (tripName.classList.contains("border-4")) {
    tripName.classList.remove("border-4");
  }
});

/* Submissão da viagem */
submitBtn.addEventListener("click", () => {
  if (submitBtn.classList.contains("disabled")) {
    return;
  }
  if (!tripName.validity.valid || tripName.value.length < 5) {
    tripName.classList.add("border-4");
    return;
  }
  let flightArray = Array.from(tripList.getElementsByTagName("li"));
  Helper.setFlightData(
    tripName.value,
    flightArray,
    originName,
    parseInt(milesText.innerText)
  );
  location.href = "./select-flight.html";
});
