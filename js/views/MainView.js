import * as Trips from "../models/TripModel.js";

Trips.init();

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
        const image = data.photos[0]?.src.medium || "../img/images/fallback.jpg";

        swiperPacks.insertAdjacentHTML(
          "beforeend",
          `<div class="swiper-slide relative cursor-drag">
            <img src="${image}" alt="${
            pack.name
          }" class="w-full h-auto rounded-t-lg" />
            <div class="absolute backdrop-blur-sm bottom-0 left-0 p-5 w-full h-30 bg-white bg-opacity-80 text-black p-2">
                <div class="flex gap-6 items-center font-space font-light mb-3">
                    <p class="text-lg">${pack.name}</p>
                    <p class="text-sm">${formatDateToLabel(
                      pack.startDate
                    )} - ${formatDateToLabel(pack.endDate)}</p>
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
                    <p class="font-space font-light text-sm">${formatDateToLabel(
                      pack.startDate
                    )} - ${formatDateToLabel(pack.endDate)}</p>
                  </div>
                  <div class="text-sm font-light">
                    <ul>
                      <li>location</li>
                      <li>location</li>
                      <li>location</li>
                      <li>location</li>
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

function formatDateToLabel(dateString) {
  const [year, month, day] = dateString.split("-");
  const currentYear = new Date().getFullYear().toString();

  if (year === currentYear) {
    return `${day}/${month}`;
  } else {
    return `${day}/${month}/${year}`;
  }
}
