import * as Trips from "../models/TripModel.js";
import * as Helper from "../models/modelHelper.js";
import * as User from "../models/UserModel.js";
import * as Flights from "../models/flightModel.js";

Trips.init();
User.init();

window.addEventListener("load", () => {
  const packs = Trips.getAllPacks();
  const swiperPacks = document.getElementById("swiperPacks");
  const swiperDesktop = document.getElementById("swiperDesktopWrapper");
  const apiKey = "NpYuyyJzclnrvUUkVK1ISyi2FGnrw4p9sNg9CCODQGsiFc0nWvuUJJMN";

  const fetchSlides = packs.map((pack) => {
    const query = `${pack.name} city`;

    return fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=1`, {
      headers: { Authorization: apiKey },
    })
      .then((response) => response.json())
      .then((data) => {
        const image =
          data.photos[0]?.src.medium || "../img/images/fallback.jpg";

        swiperPacks.insertAdjacentHTML(
          "beforeend",
          `<div class="swiper-slide relative cursor-drag">
            <img src="${image}" alt="${
            pack.name
          }" class="w-full h-auto rounded-t-lg" />
            <div class="absolute backdrop-blur-sm bottom-0 left-0 p-5 w-full h-30 bg-white text-black p-2">
                <div class="flex gap-6 items-center font-space font-light mb-3">
                    <p class="text-lg">${pack.name}</p>
                    <p class="text-sm">${Helper.formatDateToLabel(
                      pack.startDate
                    )} - ${Helper.formatDateToLabel(pack.endDate)}</p>
                </div>
                <div class="color-primary font-light">${pack.price}€</div>
            </div>
          </div>`
        );
        swiperDesktop.insertAdjacentHTML(
          "beforeend",
          `<div class="swiper-slide rounded-lg w-[400px]! h-[420px] flex flex-col overflow-hidden cursor-drag">
            <img src="${image}" alt="${
            pack.name
          }" class="w-full h-[220px] object-cover rounded-t-lg" />
            <div class="bg-white bg-opacity-90 p-4 color-primary flex flex-col justify-between h-full w-full backdrop-blur-md">
              <div>
                <div class="flex gap-4 mb-5 items-center justify-between">
                  <div>
                    <p class="font-space font-light text-lg">${pack.name}</p>
                    <p class="font-space font-light text-sm">${Helper.formatDateToLabel(
                      pack.startDate
                    )} - ${Helper.formatDateToLabel(pack.endDate)}</p>
                  </div>
                  <div class="text-sm font-light">
                    <ul id="locationCardText-${pack.id}">
                    </ul>
                  </div>
                </div>
              </div>
              <div class="flex justify-between items-center text-primary font-light">
                <span>${pack.price}€</span>
                <button class="btn-std cursor-pointer">Ver Pack</button>
              </div>
            </div>
          </div>`
        );

        let locations = [];
        pack.flights.forEach((flight) => {
          const flightObj = Flights.getFlightById(flight);
          if (!flightObj) return;
          locations.push(flightObj.origin, flightObj.destination);
        });
        locations = [...new Set(locations)];

        locations.forEach((location) => {
          document
            .getElementById(`locationCardText-${pack.id}`)
            .insertAdjacentHTML("beforeend", `<li>${location}</li>`);
        });
      });
  });

  Promise.all(fetchSlides).then(() => {
    new Swiper(".mySwiper", {
      effect: "cards",
      grabCursor: true,
    });

    // Desktop Swiper
    new Swiper(".packsDesktop", {
      slidesPerView: "auto",
      centeredSlides: true,
      spaceBetween: 55,
      initialSlide: 1,
      resistanceRatio: 0,
      slideToClickedSlide: true,
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
        disabledClass: "swiper-button-disabled",
      },
      breakpoints: {
        800: {
          spaceBetween: 55,
          slidesPerView: 2,
        },
        1024: {
          spaceBetween: 55,
          slidesPerView: 3,
        },
      },
    });
  });
});

const passportBtn = document.getElementById("passportBtn");

passportBtn.addEventListener("click", () => {
  const user = User.getUserLogged();

  const passportModalGrid = document.getElementById("passportModalGrid");
  let regionNames = new Intl.DisplayNames(["pt"], { type: "region" });
  passportModalGrid.innerHTML = "";

  let userCountries = [];
  if (user && user.badges) {
    userCountries = user.badges;
    userCountries.forEach((country) => {
      passportModalGrid.insertAdjacentHTML(
        "beforeend",
        `
        <div class="has-tooltip col-span-2 sm:col-span-1 p-1">
        <span class='tooltip rounded shadow-lg p-1 bg-gray-100 text-black -mt-8'>${regionNames.of(
          country.toUpperCase()
        )}</span>
          <img 
            class="w-8 h-8 object-contain transition-all" 
            src="./img/flags/${country.toLowerCase()}.svg"
            alt="${country}"
            title="${country}"
          >
        </div>`
      );
    });
  }

  Helper.getAllCountries().then((countries) => {
    countries.forEach((country) => {
      if (!userCountries.includes(country.toLowerCase())) {
        passportModalGrid.insertAdjacentHTML(
          "beforeend",
          `<div class="has-tooltip col-span-2 sm:col-span-1 p-1">
            <span class='tooltip rounded shadow-lg p-1 bg-gray-100 text-black -mt-8'>${regionNames.of(
              country.toUpperCase()
            )}</span>
          <img 
            class="w-8 h-8 object-contain grayscale hover:grayscale-0 transition-all" 
            src="./img/flags/${country.toLowerCase()}.svg"
            alt="${country}"
            title="${country}"
          >
        </div>`
        );
      }
    });
  });
});

document.getElementById("logo").addEventListener("click", () => {
  location.href = "#landingSect";
});
