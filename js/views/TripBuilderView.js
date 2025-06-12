import * as Flight from "../models/flightModel.js";
import * as Helper from "../models/ModelHelper.js";
import * as User from "../models/userModel.js";
Flight.init();

/* Map and list view buttons */
const mapViewBtn = document.getElementById("mapViewBtn");
const listViewBtn = document.getElementById("listViewBtn");

/* Grid Cells */
const mapCell = document.getElementById("map");
const listViewCell = document.getElementById("mapListView");
const poiCell = document.getElementById("poiCards");
const poiDisplay = document.getElementById("poiTitle");

/* Sortable lists */
const tripList = document.getElementById("destinationSortableList");
const destinationList = document.getElementById("destinationSortableListView");
const trashCan = document.getElementById("trashCan");

/* map icons */
let iconGroup;
let pathGroup;
let poiGroup;

const user = User.getUserLogged();
let tourismTypeQuery;
let departureDate;
/* Origin Obj */
let originObj;

/* Map */
var map;

/* Map Icons */
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
  iconSize: [20, 20],
  iconAnchor: [10, 10],
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
  iconSize: [10, 15],
  iconAnchor: [5, 7.5],
});

/* Map and list view toggle */
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

/* sortable js  lists setup */
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

      if (item && item.classList) {
        item.removeChild(child);
        item.setAttribute("tabindex", "1");
        item.classList.remove("bg-white", "p-4", "rounded");
        item.classList.add(
          "pr-10",
          "pl-5",
          "bg-[#39578A]",
          "focus:bg-[#6C6EA0]",
          "text-white",
          "h-20",
          "w-full",
          "flex",
          "items-center",
          "justify-between",
          "rounded-lg"
        );

        item.insertAdjacentHTML(
          "afterbegin",
          ` <div class="flex gap-5 inline-flex">
                <img
                  src="../img/icons/white/destinationElipse.svg"
                  alt="startingPoint"
                />
                <p id="destinationName" class="truncate">${itemValue}</p>
              </div>
              <div class="flex hide gap-5">
                <div
                  id="drag"
                  class="cursor-pointer"
                >
                  <img
                    src="../img/icons/white/menu.svg"
                    alt="trashIcon"
                    class="h-5"
                  />
                </div>
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
    saveTripList();
  },
  onEnd: function () {
    trashCan.classList.add("opacity-30");
  },
});

new Sortable(trashCan, {
  group: {
    name: "Trash",
    put: ["Trip"],
  },
  onAdd: function (event) {
    event.item.remove();
    updateMap();
  },
  emptyInsertThreshold: 0,
});

/* onLoad */
document.addEventListener("DOMContentLoaded", () => {
  if (!sessionStorage.getItem("userQuery")) {
    location.href = "../index.html";
  }

  const userQuery = JSON.parse(sessionStorage.getItem("userQuery"));
  tourismTypeQuery = JSON.parse(localStorage.getItem("tourismTypes")).filter(
    (type) => type.name === userQuery.typeOfTourism
  )[0].id;
  createMap(Flight.getFlightsByOrigin(userQuery.origin)[0]);
  departureDate = Helper.formatDateToYMD(userQuery.date);
  console.log(departureDate);

  loadMap(userQuery.origin);

  document.getElementById("origin").textContent = userQuery.origin;
});

const createMap = function (origin) {
  var map = L.map("map").setView([origin.originLat, origin.originLong], 5);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 12,
    minZoom: 4,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright"></a>',
  }).addTo(map);

  /* marker and polygon groups */
  iconGroup = L.layerGroup().addTo(map);
  pathGroup = L.layerGroup().addTo(map);
  poiGroup = L.layerGroup().addTo(map);

  originObj = Helper.createDestinObj(
    origin.origin,
    origin.originLat,
    origin.originLong,
    origin.poi
  );

  /* origin marker */
  var originMarker = L.marker([origin.originLat, origin.originLong], {
    icon: mapOriginIcon,
    zIndexOffset: 1000,
  }).addTo(map);
};

function loadMap(origin) {
  const flightList = Flight.getFlightsByOrigin(origin);

  iconGroup.clearLayers();
  poiGroup.clearLayers();
  pathGroup.clearLayers();
  destinationList.innerHTML = "";

  /* flight loop */
  flightList.forEach((flight) => {
    let flightTourismType = [];
    flight.poi.forEach((poi) => flightTourismType.push(...poi.tourismTypes));
    let formatedDepartureTime = Date.parse(
      flight.departureTime.split("T")[0].split("-").join(",")
    );

    console.log(formatedDepartureTime);

    console.log(1751324400000 > 1749596400000);
    if (
      /* flightTourismType.includes(tourismTypeQuery) && */

      departureDate < formatedDepartureTime
    ) {
      /* populate listView */
      destinationList.insertAdjacentHTML(
        "beforeend",
        `<li id="${flight.id}"class="border-2 border-blue-800 bg-white p-4 rounded shadow-lg last" value="${flight.destinationName}" id="${flight.id}">
        <p class="truncate">${flight.destinationName} <span class="opacity-60 text-xs">${flight.destination}</span></p>
      </li>`
      );

      /* populate mapView */
      let pin = user.favorites.includes(flight.destinationName)
        ? favIcon
        : destinIcon;

      const marker = L.marker([flight.destinLat, flight.destinLong], {
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

        /* flight.poi.forEach((poi) => {
      const html = `<img />`;
      const poiMarker = L.marker([poi.latitude, poi.long], {
        icon: poiIcon,
        zIndexOffset: 200,
      }).addTo(poiGroup);
    }); */
      });

      marker.on("mouseover", function () {
        poiCards.innerHTML = "";
        poiDisplay.textContent = `${flight.destinationName} points of interest`;

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
  });
}

function addToList(id) {
  const flight = Flight.getFlightById(id);

  const itemHTML = `
    <li id="${flight.id}" tabindex="1" class="pr-10 pl-5 bg-[#39578A] focus:bg-[#6C6EA0] text-white h-20 w-full flex items-center justify-between rounded-lg">
        <div class="flex gap-5 inline-flex">
                <img
                  src="../img/icons/white/destinationElipse.svg"
                  alt="startingPoint"
                />
                <p id="destinationName" class="truncate">${flight.destinationName}</p>
              </div>
              <div class="flex hide gap-5">
                <div
                  id="drag"
                  class="cursor-pointer"
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
}

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
  const createTripPoi = function (obj, index, arrLeng) {
    console.log(obj.pois);

    if (index != 0) {
      const flightPin = L.marker([obj.lat, obj.long], {
        icon: poiIcon,
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

  /* create destinObj */
  liArray.forEach((element, index) => {
    let flight = Flight.getFlightById(parseInt(element.getAttribute("id")));

    const destinObj = Helper.createDestinObj(
      flight.destination,
      flight.destinLat,
      flight.destinLong,
      flight.poi
    );

    pointsObjArray.push(destinObj);
  });

  pointsObjArray.forEach((element, idx) => {
    createMapPoints(element, idx, pointsObjArray.length);
    createMapLines(element, idx, pointsObjArray);
  });
}

function updateMap() {
  mapLine();
  let origin = Array.from(tripList.getElementsByTagName("li"));
  if (origin.length == 0) {
    loadMap(originObj.objName);
  } else {
    loadMap(
      Flight.getFlightById(
        parseInt(origin[origin.length - 1].getAttribute("id"))
      ).destination
    );
  }
}

const saveTripList = function () {
  let liArray = Array.from(tripList.getElementsByTagName("li"));
  console.log(liArray);
};
