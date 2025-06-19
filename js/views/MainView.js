import * as Trips from "../models/TripModel.js";
import * as Helper from "../models/modelHelper.js";
import * as User from "../models/UserModel.js";
import * as Flights from "../models/flightModel.js";

// Inicializa os dados de packs de viagens e utilizadores
Trips.init();
User.init();
let timerInterval;
const scratchModal = document.getElementById("scratchModal");

// Quando a página carrega, prepara os slides dos packs
window.addEventListener("load", () => {
  const today = new Date().toLocaleDateString("pt-PT");
  const datePicker = document.getElementById("form-datepicker");
  new Datepicker(datePicker, {
    autohide: true,
    format: "dd-mm-yyyy",
    minDate: today,
    orientation: "top",
    autoSelectToday: 1,
  });

  const soldTrips = document.getElementById("soldTrips");
  const soldFlights = document.getElementById("soldFlights");
  const activeUsers = document.getElementById("activeUsers");

  activeUsers.innerText = `${User.getAllUsers().length}+`;

  soldTrips.innerText = `${User.getSoldTrips().length}+`;

  soldFlights.innerText = `${Flights.getAllUniqueDestins().length}+`;

  let userHasScratch = User.userHasScratch(User.getUserLogged());
  if (!userHasScratch || !User.isLogged()) {
    scratchModal.classList.add("hidden");
  }

  const packs = Trips.getFilteredPacks(User.getUserLogged());
  const swiperPacks = document.getElementById("swiperPacks");
  const swiperDesktop = document.getElementById("swiperDesktopWrapper");
  const apiKey = "NpYuyyJzclnrvUUkVK1ISyi2FGnrw4p9sNg9CCODQGsiFc0nWvuUJJMN";

  // Para cada pack, vai buscar uma imagem à API do Pexels e constrói o slide
  const fetchSlides = packs.map((pack) => {
    const query = `${pack.name} city`;

    return fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=1`, {
      headers: { Authorization: apiKey },
    })
      .then((response) => response.json())
      .then((data) => {
        // Usa a imagem da API ou um fallback se não houver
        const image =
          data.photos[0]?.src.medium || "../img/images/fallback.jpg";

        let ratingValue = Trips.calculateRating(pack.id);
        let rating = generateStars(ratingValue);
        // Adiciona o slide ao swiper mobile
        swiperPacks.insertAdjacentHTML(
          "beforeend",
          `<div id="packBtn" 
        data-id="${pack.id}" 
        class="swiper-slide shadow-lg relative cursor-pointer"
        role="button" 
        tabindex="0">
    <img src="${image}" alt="${pack.name}" class="w-full h-auto rounded-t-lg" />
    <div class="absolute backdrop-blur-sm bottom-0 left-0 p-5 w-full h-30 bg-white color-primary p-2">
      <div class="flex gap-6 justify-between font-space font-light mb-3">
        <p class="text-md">${pack.name}</p>
        <p class="text-sm">${Helper.formatDateToLabel(
          pack.startDate
        )}<br/>${Helper.formatDateToLabel(pack.endDate)}</p>
        
      </div>
      <p>${rating}</p>
      <div class="color-primary font-light">${pack.price}€</div>
    </div>
  </div>`
        );
        // Adiciona o slide ao swiper desktop
        swiperDesktop.insertAdjacentHTML(
          "beforeend",
          `<div class="swiper-slide rounded-lg w-[400px]! h-[420px] flex flex-col overflow-hidden shadow-xl cursor-drag color-primary">
            <img src="${image}" alt="${
            pack.name
          }" class="w-full h-[220px] object-cover rounded-t-lg" />
            <div class="bg-white bg-opacity-90 p-4 color-primary flex flex-col justify-between h-full w-full backdrop-blur-md">
              <div>
                <div class="flex gap-4 mb-5 justify-between">
                  <div>
                    <p class="font-space font-light text-lg">${pack.name}</p>
                    <p class="font-space font-light text-sm">${Helper.formatDateToLabel(
                      pack.startDate
                    )} - ${Helper.formatDateToLabel(pack.endDate)}</p>
                    <p>${rating}</p>
                  </div>
                  <div class="text-sm font-light">
                    <ul id="locationCardText-${pack.id}">
                    </ul>
                  </div>
                </div>
              </div>
              <div class="flex justify-between items-center text-primary font-light">
                <span>${pack.price}€</span>
                <button id="packBtn" data-id=${
                  pack.id
                } class="cursor-pointer btn-std font-bold border-2">Ver Pack</button>
              </div>
            </div>
          </div>`
        );
        document.addEventListener("click", function (event) {
          if (
            event.target.id === "packBtn" ||
            event.target.closest("#packBtn")
          ) {
            const packButton =
              event.target.id === "packBtn"
                ? event.target
                : event.target.closest("#packBtn");
            const packId = packButton.dataset.id;
            if (packId && User.isLogged()) {
              Trips.setTrip(packId);
              location.href = "./html/resume.html";
            } else {
              Swal.fire({
                title: "Sem sessão iniciada",
                icon: "error",
                html: "Para veres ou comprares este pack, faz login ou cria uma conta.",
                timer: 2000,
                timerProgressBar: true,
                didOpen: () => {
                  Swal.showLoading();
                  const timer = Swal.getPopup().querySelector("b");
                  timerInterval = setInterval(() => {
                    timer.textContent = `${Swal.getTimerLeft()}`;
                  }, 100);
                },
                willClose: () => {
                  clearInterval(timerInterval);
                },
              });
            }
          }
        });

        // Junta todas as cidades de origem e destino dos voos do pack
        let locations = [];
        pack.flights.forEach((flight) => {
          const flightObj = Flights.getFlightById(flight);
          if (!flightObj) return;
          locations.push(flightObj.originName, flightObj.destinationName);
        });
        // Remove duplicados
        locations = [...new Set(locations)];

        // Se houver mais que cinco, adicionar "..." na ultima posição e remover os restantes
        if (locations.length > 5) {
          locations = locations.slice(0, 4);
          locations.push("...");
        }

        // Adiciona as localizações à lista do card
        locations.forEach((location) => {
          document
            .getElementById(`locationCardText-${pack.id}`)
            .insertAdjacentHTML(
              "beforeend",
              `<li class="text-right">${location}</li>`
            );
        });
      });
  });

  // Só inicializa o Swiper depois de todas as imagens estarem carregadas
  Promise.all(fetchSlides).then(() => {
    var swiper = new Swiper(".mobileFeatures", {
      effect: "coverflow",
      pagination: {
        el: ".swiper-pagination",
      },
      autoplay: true,
      loop: true,
      spaceBetween: 0,
      setWrapperSize: true,
    });

    new Swiper(".mySwiper", {
      effect: "cards",
      grabCursor: true,
    });

    // Swiper para desktop
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

  let marquee1 = document.getElementById("marquee1");
  let marquee2 = document.getElementById("marquee2");
  let marquee3 = document.getElementById("marquee3");

  const uniqueDestinations = Flights.getAllUniqueDestinationNames();
  marquee1.innerHTML = "";
  marquee2.innerHTML = "";
  marquee3.innerHTML = "";

  uniqueDestinations.forEach(() => {
    marquee1.insertAdjacentHTML(
      "beforeend",
      `<span class="text-4xl mx-4">•</span>
              <span class="text-4xl mx-4">${
                uniqueDestinations[
                  Math.floor(Math.random() * uniqueDestinations.length)
                ]
              }</span>`
    );
    marquee2.insertAdjacentHTML(
      "beforeend",
      `<span class="text-4xl mx-4">•</span>
              <span class="text-4xl mx-4">${
                uniqueDestinations[
                  Math.floor(Math.random() * uniqueDestinations.length)
                ]
              }</span>`
    );
    marquee3.insertAdjacentHTML(
      "beforeend",
      `<span class="text-4xl mx-4">•</span>
              <span class="text-4xl mx-4">${
                uniqueDestinations[
                  Math.floor(Math.random() * uniqueDestinations.length)
                ]
              }</span>`
    );
  });
  uniqueDestinations.forEach(() => {
    marquee1.insertAdjacentHTML(
      "beforeend",
      `<span class="text-4xl mx-4">•</span>
              <span class="text-4xl mx-4">${
                uniqueDestinations[
                  Math.floor(Math.random() * uniqueDestinations.length)
                ]
              }</span>`
    );
    marquee2.insertAdjacentHTML(
      "beforeend",
      `<span class="text-4xl mx-4">•</span>
              <span class="text-4xl mx-4">${
                uniqueDestinations[
                  Math.floor(Math.random() * uniqueDestinations.length)
                ]
              }</span>`
    );
    marquee3.insertAdjacentHTML(
      "beforeend",
      `<span class="text-4xl mx-4">•</span>
              <span class="text-4xl mx-4">${
                uniqueDestinations[
                  Math.floor(Math.random() * uniqueDestinations.length)
                ]
              }</span>`
    );
  });
});
// Função para gerar estrelas de avaliação
function generateStars(rating) {
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
// Função para renderizar o grid de favoritos no modal
function renderFavoritesGrid() {
  const favoritesModalGrid = document.getElementById("favoritesModalGrid");
  if (!User.isLogged()) {
    favoritesModalGrid.innerHTML = "";
    favoritesModalGrid.insertAdjacentHTML(
      "beforeend",
      `<div class="w-full flex justify-center items-center col-span-full">
        <p class="text-gray-600 text-center">Faz login ou cria uma conta e começa a juntar favoritos.</p>
      </div>`
    );
    return;
  }

  const user = User.getUserLogged();
  favoritesModalGrid.innerHTML = "";

  const userFavorites = user.favorites;

  if (!userFavorites || userFavorites.length === 0) {
    favoritesModalGrid.insertAdjacentHTML(
      "beforeend",
      `<div class="w-full flex justify-center items-center col-span-full">
        <p class="text-gray-600 text-center">Nenhum destino favorito.</p>
      </div>`
    );
    return;
  }

  userFavorites.forEach((favorite) => {
    const apiKey = "NpYuyyJzclnrvUUkVK1ISyi2FGnrw4p9sNg9CCODQGsiFc0nWvuUJJMN";

    fetch(`https://api.pexels.com/v1/search?query=${favorite}&per_page=2`, {
      headers: {
        Authorization: apiKey,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const image =
          data.photos[1]?.src.medium || "../img/images/fallback.jpg";

        favoritesModalGrid.insertAdjacentHTML(
          "beforeend",
          `<div class="has-tooltip flex bg-white rounded-lg shadow-md overflow-hidden h-24 relative group" data-favorite="${favorite}">
            <span class='tooltip rounded shadow-lg p-1 bg-gray-100 text-black mt-10'>${favorite}</span>
            <div class="w-2/5">
              <img
                src="${image}"
                alt="${favorite}"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="w-3/5 p-3 flex flex-col justify-center">
              <p class="font-bold text-gray-800">${favorite}</p>
            </div>
            <button 
              class="absolute cursor-pointer top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-30 group-hover:opacity-100 transition-opacity duration-200"
              data-action="remove-favorite"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>`
        );
      });
  });
}
// Evento para remover um favorito do utilizador ao clicar no botão de remover
document.addEventListener("click", function (e) {
  if (e.target.closest('[data-action="remove-favorite"]')) {
    const favoriteItem = e.target.closest("[data-favorite]");
    const destination = favoriteItem.getAttribute("data-favorite");

    // Remove o favorito dos dados do utilizador
    const currentUser = User.getUserLogged();
    currentUser.favorites = currentUser.favorites.filter(
      (fav) => fav !== destination
    );
    User.updateUserByObject(currentUser); // Atualiza o utilizador

    // Re-renderiza o grid de favoritos
    renderFavoritesGrid();

    renderFavorites();
  }
});
const favoritesBtn = document.querySelector("#favoritesBtn");

favoritesBtn.addEventListener("click", () => {
  renderFavoritesGrid();
});

// Lida com o modal do passaporte (badges de países visitados)
const passportBtn = document.getElementById("passportBtn");
const continentFilter = document.getElementById("continentFilter");

let allCountriesData;

// Ao clicar no botão do passaporte, carrega os países e mostra o grid
passportBtn.addEventListener("click", () => {
  Helper.getAllCountries().then((data) => {
    allCountriesData = data;
    renderPassportGrid();
    continentFilter.onchange = () => renderPassportGrid(continentFilter.value);
  });
});

// Renderiza o grid de países visitados e não visitados
function renderPassportGrid(continent = "") {
  const user = User.getUserLogged();
  const passportModalGrid = document.getElementById("passportModalGrid");
  let regionNames = new Intl.DisplayNames(["pt"], { type: "region" });
  passportModalGrid.innerHTML = "";

  let userCountries = [];
  if (user && user.badges) {
    userCountries = user.badges.map((c) => c.toLowerCase());
  }

  // Filtra os países pelo continente selecionado (se houver)
  const filteredCountries = allCountriesData.filter((country) => {
    const code = country.cca2?.toLowerCase();
    const countryContinents = country.continents || [];
    if (!code) return false;
    if (continent && !countryContinents.includes(continent)) return false;
    return true;
  });

  // Separa os países visitados dos não visitados
  const visited = filteredCountries.filter((country) =>
    userCountries.includes(country.cca2.toLowerCase())
  );
  const notVisited = filteredCountries.filter(
    (country) => !userCountries.includes(country.cca2.toLowerCase())
  );

  // Mostra os países visitados (sem grayscale)
  visited.forEach((country) => {
    const code = country.cca2.toLowerCase();
    passportModalGrid.insertAdjacentHTML(
      "beforeend",
      `
      <div class="has-tooltip col-span-2 sm:col-span-1 p-1">
        <span class='tooltip rounded shadow-lg p-1 bg-gray-100 text-black -mt-8'>
          ${regionNames.of(code.toUpperCase())}
        </span>
        <img 
          class="w-8 h-8 object-contain transition-all" 
          src="../img/flags/${code}.svg"
          alt="${code}"
          title="${code}"
        >
      </div>
      `
    );
  });

  // Mostra os países não visitados (com grayscale)
  notVisited.forEach((country) => {
    const code = country.cca2.toLowerCase();
    passportModalGrid.insertAdjacentHTML(
      "beforeend",
      `
      <div class="has-tooltip col-span-2 sm:col-span-1 p-1">
        <span class='tooltip rounded shadow-lg p-1 bg-gray-100 text-black -mt-8'>
          ${regionNames.of(code.toUpperCase())}
        </span>
        <img 
          class="w-8 h-8 object-contain grayscale hover:grayscale-0 transition-all" 
          src="../img/flags/${code}.svg"
          alt="${code}"
          title="${code}"
        >
      </div>
      `
    );
  });
}
let applyMilesBtn = document.getElementById("applyMilesBtn");
let cancelMilesBtn = document.getElementById("cancelMilesBtn");

let canApply = false;

applyMilesBtn.addEventListener("click", () => {
  if (canApply) {
    User.updateScratch(User.getUserLogged(), milesWon);
    scratchModal.classList.add("hidden");
  }
});

cancelMilesBtn.addEventListener("click", () => {
  scratchModal.classList.add("hidden");
});

/* ScratchCard */
let milesWon = Math.floor(Math.random() * 100);
const scContainer = document.getElementById("canvas-test");
const sc = new ScratchCard(scContainer, {
  scratchType: SCRATCH_TYPE.CIRCLE,
  containerWidth: scContainer.offsetWidth,
  containerHeight: scContainer.offsetHeight,
  imageForwardSrc: "../img/images/pattern.png",
  brushSrc: "https://switchy.a.cdnify.io/served/brush.png",

  htmlBackground: `<p class="flex text-black text-xl text-center items-center"><strong>Ganhaste ${milesWon} milhas!</strong></p>`,
  clearZoneRadius: 20,
  percentToFinish: 30, // When the percent exceeds 40 on touchend event the callback will be exec.
  callback: function () {
    canApply = true;
  },
});

sc.init().then(() => {
  sc.canvas.addEventListener("scratch.move", () => {
    this.percent = sc.getPercent().toFixed(2);
  });
});

const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();

  Swal.fire({
    title: "Mensagem Enviada",
    icon: "success",
    html: "A tua mensagem foi recebida pela nossa equipa.<br/>Por favor aguarda pacientemente a tua resposta.<br/>Verifica a tua caixa de spam.",
    showClass: {
      popup: `
      animate__animated
      animate__fadeInUp
      animate__faster
    `,
    },
    hideClass: {
      popup: `
      animate__animated
      animate__fadeOutDown
      animate__faster
    `,
    },
  }).then(() => contactForm.reset());
});
