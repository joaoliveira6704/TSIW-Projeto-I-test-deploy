import * as Flight from "../models/flightModel.js";

Flight.init();

const mapViewBtn = document.getElementById("mapViewBtn");
const listViewBtn = document.getElementById("listViewBtn");

const mapCell = document.getElementById("map");
const listViewCell = document.getElementById("mapListView");

let mapView = true;

mapViewBtn.addEventListener("click", function () {
  if (!mapView) {
    mapCell.classList.toggle("hidden");
    listViewCell.classList.toggle("hidden");
    mapViewBtn.classList.toggle("border-b-0");
    listViewBtn.classList.toggle("border-b-0");
    mapView = true;
  }
});

listViewBtn.addEventListener("click", function () {
  if (mapView) {
    mapCell.classList.toggle("hidden");
    listViewCell.classList.toggle("hidden");
    mapViewBtn.classList.toggle("border-b-0");
    listViewBtn.classList.toggle("border-b-0");
    mapView = false;
  }
});

/* Sortable lists */
const tripList = document.getElementById("destinationSortableList");
const destinationList = document.getElementById("destinationSortableListView");

new Sortable(tripList, {
  group: {
    name: "destinationListGroup",
  },

  animation: 150,

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
              </div>`
        );

        item.insertAdjacentHTML(
          "beforeend",
          `<div class="flex hide gap-5">
                <button
                  id="deleteDestination"
                  class="cursor-pointer p-2 rounded-lg hover:shadow-lg"
                >
                  <img
                    src="../img/icons/white/trash.svg"
                    alt="trashIcon"
                    class="h-5"
                  />
                </button>
                <button
                  id="dragDestination"
                  class="cursor-pointer p-2 rounded-lg hover:shadow-lg"
                >
                  <img
                    src="../img/icons/white/menu.svg"
                    alt="trashIcon"
                    class="h-5"
                  />
                </button>
              </div>`
        );
      }
    });
  },
});

new Sortable(destinationList, {
  group: {
    name: "destinationListGroup",
    put: "false",
  },
  sort: false,
  animation: 150,

  onStart: function () {
    console.log("drag started");

    tripList.classList.add(
      "outline-2",
      "outline-offset-2",
      "outline-solid",
      "outline-blue-500"
    );
  },

  onEnd: function () {
    console.log("drag finished");

    tripList.classList.remove(
      "outline-2",
      "outline-offset-2",
      "outline-solid",
      "outline-blue-500"
    );
  },
});

/* Map */
var map = L.map("map").setView([51.505, -0.09], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 10,
  minZoom: 3,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

/* map line */
/* var polygon = L.polygon([
  [51.505, -0.09],
  [51.503, -0.06],
]).addTo(map); */

document.addEventListener("DOMContentLoaded", () => {
  if (!sessionStorage.getItem("userQuery")) {
    location.href = "../index.html";
  }
  const userQuery = JSON.parse(sessionStorage.getItem("userQuery"));

  loadMap(userQuery.origin);
});

const markerGroup = L.layerGroup().addTo(map);

function loadMap(origin) {
  const flightList = Flight.getFlightsByOrigin(origin);
  console.log(flightList);

  destinationList.innerHTML = "";

  /* flight loop */

  flightList.forEach((flight) => {
    destinationList.insertAdjacentHTML(
      "beforeend",
      `<li class="bg-white p-4 rounded shadow-lg" value="${flight.destinationName}">
        <p id="destination" class="truncate">${flight.destinationName}</p>
      </li>`
    );

    /* marker creation */
    const marker = L.marker([flight.destinLat, flight.destinLong]).addTo(
      markerGroup
    );

    marker.bindPopup(`
        <div>
        <p>${flight.destinationName}</p>
        <button 
        data-id="${flight.id}" 
        class="popup-add-btn px-3 py-1 bg-blue-500 text-white rounded">
        Add to List
        </button>
        </div>
        `);

    marker.on("popupopen", () => {
      // Wait for DOM to attach
      setTimeout(() => {
        const btn = document.querySelector(".popup-add-btn");
        if (btn) {
          btn.addEventListener("click", function () {
            const flightId = parseInt(this.getAttribute("data-id"));
            addToList(flightId);
          });
        }
      }, 100);
    });
  });
}

function addToList(id) {
  const flight = Flight.getFlightById(id);

  const itemHTML = `
    <li id="flight-${id}" class="pr-10 pl-5 bg-[#39578A] focus:bg-[#6C6EA0] text-white h-20 w-full flex items-center justify-between rounded-lg">
        <div class="flex gap-5 inline-flex">
                <img
                  src="../img/icons/white/destinationElipse.svg"
                  alt="startingPointIcon"
                />
                <p id="destinationName" class="truncate">${flight.destinationName}</p>
              </div>
              <div class="flex hide gap-5">
                <button
                  id="deleteDestination"
                  class="cursor-pointer p-2 rounded-lg hover:shadow-lg"
                >
                  <img
                    src="../img/icons/white/trash.svg"
                    alt="trashIcon"
                    class="h-5"
                  />
                </button>
                <button
                  id="dragDestination"
                  class="cursor-pointer p-2 rounded-lg hover:shadow-lg"
                >
                  <img
                    src="../img/icons/white/menu.svg"
                    alt="trashIcon"
                    class="h-5"
                  />
                </button>
        </div>
    </li>
  `;

  tripList.insertAdjacentHTML("beforeend", itemHTML);
  markerGroup.clearLayers();
  console.log(id);
  loadMap(flight.destination);
}

let oldFlight;
