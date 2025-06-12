let countriesData;

export function getAllCountries() {
  return fetch("https://restcountries.com/v3.1/all?fields=cca2,continents")
    .then((response) => response.json())
    .then((data) => {
      countriesData = data;
      return data;
    });
}

export function formatDateToLabel(dateString) {
  const [year, month, day] = dateString.split("-");
  const currentYear = new Date().getFullYear().toString();

  if (year === currentYear) {
    return `${day}/${month}`;
  } else {
    return `${day}/${month}/${year}`;
  }
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
    KLM: "KL",
    "Swiss Air": "LX",
    "Austrian Airlines": "OS",
    SAS: "SK",
    Norwegian: "DY",
    "Aer Lingus": "EI",
    "Aegean Airlines": "A3",
    "Turkish Airlines": "TK",
    "Brussels Airlines": "SN",
    "Czech Airlines": "OK",
    Finnair: "AY",
    "ITA Airways": "AZ",
    Icelandair: "FI",
    "Air Europa": "UX",
    EasyJet: "U2",
    Delta: "DL",
  };

  return IATA_CODES[company] || company;
}

export function formatDate(isoString) {
  const date = new Date(isoString);

  return new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "long",
  }).format(date);
}

// Calcula desconto: para cada 100 milhas, desconta 20€ do preço final
export function calculateDiscount(miles, finalPrice) {
  return finalPrice - Math.floor(miles / 100) * 20;
}

/* Scratchoff */
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
export function dispatchEvent(el, evt) {
  if (el.dispatchEvent) {
    el.dispatchEvent(evt);
  } else if (el.fireEvent) {
    el.fireEvent("on" + type, evt);
  }
  return evt;
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
      console.error("Error fetching airport info:", error);
      return null;
    });
}

export function createDestinObj(destinName, latitude, longitude, poi) {
  const obj = {
    objName: destinName,
    lat: latitude,
    long: longitude,
    pois: poi,
  };

  return obj;
}

export function formatDateToYMD(dateString) {
  const [day, month, year] = dateString.split("-");

  return Date.parse(`${year},${month},${day}`);
}

export function formatFlightTime(dateString) {
  const date = dateString.split("T")[0];
}

export function loadViews(flight) {
  /* flight loop */

  let formatedDepartureTime = Date.parse(
    flight.departureTime.split("T")[0].split("-").join(",")
  );

  if (departureDate < formatedDepartureTime) {
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

export function getTurismTypeId(tourismType) {
  let tourismTypesArray = JSON.parse(localStorage.getItem("tourismTypes"));
  for (const [id, type] of Object.entries(tourismTypesArray)) {
    if (tourismType === type) {
      console.log(id);

      return id;
    }
  }
}
