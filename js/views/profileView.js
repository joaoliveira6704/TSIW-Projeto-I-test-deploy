import * as User from "../models/UserModel.js";
import * as Trips from "../models/TripModel.js";
import * as Helper from "../models/ModelHelper.js";

// Inicializa os dados de viagens e utilizadores
Trips.init();
User.init();

// Esconde o corpo da página até os dados estarem carregados
document.body.classList.add("hidden");

// Vai buscar o utilizador atualmente autenticado
const user = User.getUserLogged();

// Seletores para os elementos do perfil
const userNameLabel = document.getElementById("userNameLabel");
const userEmailLabel = document.getElementById("userEmailLabel");
const userMilesLabel = document.getElementById("userMilesLabel");
const userTotalMilesLabel = document.getElementById("userTotalMilesLabel");
const userTripsLabel = document.getElementById("userTripsLabel");

const flagWrapper = document.getElementById("flagWrapper");
const tripsWrapper = document.getElementById("tripsWrapper");
const profileImg = document.getElementById("profileImg");
const profileEditBtn = document.getElementById("profileEditBtn");

// Ao carregar a página, preenche os dados do perfil do utilizador
window.addEventListener("load", (event) => {
  // Escolhe um avatar aleatório
  let avatarInt = Math.floor(Math.random() * 5) + 1;
  profileImg.src = `../img/avatar${avatarInt}.png`;

  // Se não houver utilizador autenticado, redireciona para o index
  if (user === null) {
    window.location.href = "../index.html";
  }

  // Preenche os dados do utilizador no perfil
  document.title = `Compass - ${user.name}`;
  userNameLabel.insertAdjacentText("beforeend", ` ${user.name}`);
  userEmailLabel.insertAdjacentText("beforeend", ` ${user.email}`);
  userMilesLabel.insertAdjacentText("beforeend", ` ${user.miles["available"]}`);
  userTotalMilesLabel.insertAdjacentText(
    "beforeend",
    ` ${user.miles["total"]}`
  );
  userTripsLabel.insertAdjacentText("beforeend", ` ${user.trips.length}`);
  document.body.classList.remove("hidden");

  // Mostra as badges (países visitados) do utilizador
  renderBadges();

  // Favoritos
  renderFavorites();

  renderTrips("all");

  // Seleciona os botões Passados e Próximas
  const tripsSection = document.querySelector("section:has(#tripsWrapper)");
  if (tripsSection) {
    const [pastBtn, nextBtn] = tripsSection.querySelectorAll("button.w-fit");

    if (pastBtn && nextBtn) {
      pastBtn.addEventListener("click", () => renderTrips("past"));
      nextBtn.addEventListener("click", () => renderTrips("next"));
    }
  }
});

// Botões para abrir o modal do passaporte
const passportBtns = document.querySelectorAll(
  '[data-modal-target="passport-modal"]'
);

// Botões para abrir o modal de favoritos
const favoritesBtns = document.querySelectorAll(
  '[data-modal-target="favorites-modal"]'
);

// Função para renderizar badges (medalhas de países visitados)
function renderBadges() {
  const user = User.getUserLogged();
  const flagWrapper = document.getElementById("flagWrapper");
  flagWrapper.innerHTML = "";

  if (!user || !user.badges || user.badges.length === 0) {
    flagWrapper.insertAdjacentHTML(
      "beforeend",
      `<div class="w-full flex justify-center">
        <p class="text-gray-600 text-center">Nenhum país visitado.</p>
      </div>`
    );
    return;
  }

  let regionNames = new Intl.DisplayNames(["pt"], { type: "region" });
  user.badges.slice(0, 12).forEach((element) => {
    flagWrapper.insertAdjacentHTML(
      "beforeend",
      `<div class="has-tooltip w-12 h-12 rounded overflow-hidden flex items-center justify-center">
        <span class='tooltip rounded shadow-lg p-1 bg-gray-100 text-black -mt-8'>${regionNames.of(
          element.toUpperCase()
        )}</span>
        <img src="../img/flags/${element}.svg" alt="${element}" class="object-contain w-full h-full"/>
      </div>`
    );
  });
}

function renderFavorites() {
  const user = User.getUserLogged();
  const favoritesWrapper = document.getElementById("favoritesWrapper");
  favoritesWrapper.innerHTML = "";

  if (!user || !user.favorites || user.favorites.length === 0) {
    favoritesWrapper.insertAdjacentHTML(
      "beforeend",
      `<div class="w-full flex justify-center items-center col-span-full">
        <p class="text-gray-600 text-center">Nenhum destino favorito.</p>
      </div>`
    );
    return;
  }

  user.favorites.slice(0, 4).forEach((favorite) => {
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
        favoritesWrapper.insertAdjacentHTML(
          "beforeend",
          `<div class="has-tooltip flex bg-white rounded-lg shadow-md overflow-hidden h-24">
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
          </div>`
        );
      });
  });
}

// Função para renderizar o grid de favoritos no modal
function renderFavoritesGrid() {
  const user = User.getUserLogged();
  const favoritesModalGrid = document.getElementById("favoritesModalGrid");
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

// Adiciona eventos aos botões de favoritos para abrir o modal e renderizar o grid
favoritesBtns.forEach((favoritesBtn) => {
  favoritesBtn.addEventListener("click", () => {
    renderFavoritesGrid();
  });
});

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

// Ao clicar, mostra o grid de países visitados e não visitados
passportBtns.forEach((passportBtn) => {
  Helper.getAllCountries().then((data) => {
    allCountriesData = data;
    renderPassportGrid();
    continentFilter.onchange = () => renderPassportGrid(continentFilter.value);
  });
});

/* Editar Utilizador */

// Modal e formulário de edição do utilizador
const userEditForm = document.getElementById("userEditForm");

// Cria um modal de edição
const userEditModal = new Modal(document.getElementById("userEditModal"), {
  backdrop: false,
  backdropClasses: "hidden", // Esconde completamente o backdrop
  closable: true,
  onHide: () => {
    // Limpa qualquer overlay residual
    const overlays = document.querySelectorAll('[class*="bg-gray-900/50"]');
    overlays.forEach((overlay) => {
      if (overlay.classList.contains("fixed")) {
        overlay.remove();
      }
    });
  },
});

// Ao clicar no botão de editar perfil, mostra o modal e preenche os campos
profileEditBtn.addEventListener("click", (event) => {
  const user = User.getUserLogged();
  userEditModal.show();
  if (user) {
    document.getElementById("editName").value = user.name;
    document.getElementById("editEmail").value = user.email;

    userEditForm.onsubmit = function (e) {
      e.preventDefault();

      const updatedUser = {
        name: document.getElementById("editName").value,
        email: document.getElementById("editEmail").value,
        password: user.password,
        isAdmin: user.isAdmin,
      };

      try {
        User.updateUser(user.id, updatedUser);
        try {
          User.updateLoggedUser(user.id);
        } catch (e) {
          displayMessage(userEditForm, err.message);
        }
        location.reload();
      } catch (err) {
        displayMessage(userEditForm, err.message);
      }
    };
  }
});

const continentFilter = document.getElementById("continentFilter");

let allCountriesData;

// Renderiza o grid de países visitados e não visitados no modal do passaporte
function renderPassportGrid(continent = "") {
  const user = User.getUserLogged();
  const passportModalGrid = document.getElementById("passportModalGrid");
  let regionNames = new Intl.DisplayNames(["pt"], { type: "region" });
  passportModalGrid.innerHTML = "";

  let userCountries = [];
  if (user && user.badges) {
    userCountries = user.badges.map((c) => c.toLowerCase());
  }

  // Filtra países pelo continente selecionado
  const filteredCountries = allCountriesData.filter((country) => {
    const code = country.cca2?.toLowerCase();
    const countryContinents = country.continents || [];
    if (!code) return false;
    if (continent && !countryContinents.includes(continent)) return false;
    return true;
  });

  // Separa países visitados e não visitados
  const visited = filteredCountries.filter((country) =>
    userCountries.includes(country.cca2.toLowerCase())
  );
  const notVisited = filteredCountries.filter(
    (country) => !userCountries.includes(country.cca2.toLowerCase())
  );

  // Mostra países visitados (sem grayscale)
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

  // Mostra países não visitados (com grayscale)
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

// Mostra mensagens de erro ou sucesso no formulário de edição
function displayMessage(form, message, type = "error") {
  const oldMessage = form.querySelector(".text-red-500, .text-green-500");
  if (oldMessage) {
    oldMessage.remove();
  }
  if (type === "clear" || !message) return;
  const colorClass = type === "error" ? "text-red-500" : "text-green-500";
  form.insertAdjacentHTML(
    "beforeend",
    `<p class='${colorClass} mt-2'>${message}</p>`
  );
}

// Função para renderizar viagens do utilizador, filtrando por passado/próximo
function renderTrips(filter = "all") {
  const user = User.getUserLogged();
  const tripsWrapper = document.getElementById("tripsWrapper");
  tripsWrapper.innerHTML = "";

  if (!user || !user.trips || user.trips.length === 0) {
    tripsWrapper.classList.add("items-center");
    tripsWrapper.classList.remove("grid");
    tripsWrapper.insertAdjacentHTML(
      "beforeend",
      `<p class="text-gray-600 text-center">Nenhuma viagem associada.</p>`
    );
    return;
  }

  const allTrips = Trips.getTripById(user.trips);

  let filteredTrips = Trips.filteredTrips(allTrips, filter);

  if (filteredTrips.length === 0) {
    tripsWrapper.classList.add("items-center");
    tripsWrapper.classList.remove("grid");
    tripsWrapper.insertAdjacentHTML(
      "beforeend",
      `<p class="text-gray-600 text-center">Nenhuma viagem encontrada.</p>`
    );
    return;
  }

  tripsWrapper.classList.remove("items-center");
  tripsWrapper.classList.add("grid");

  // Renderiza cada viagem
  filteredTrips.forEach((trip) => {
    const query = `${trip.name}`;
    const apiKey = "NpYuyyJzclnrvUUkVK1ISyi2FGnrw4p9sNg9CCODQGsiFc0nWvuUJJMN";
    fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=1`, {
      headers: { Authorization: apiKey },
    })
      .then((response) => response.json())
      .then((data) => {
        let image = "../img/images/fallback.jpg";
        if (data.photos && data.photos.length > 0) {
          image = data.photos[0].src.medium;
        }

        tripsWrapper.insertAdjacentHTML(
          "beforeend",
          `<button onclick="location.href='./resume.html?id=${
            trip.id
          }'" class="cursor-pointer transition transform hover:-translate-y-1">
            <div class="has-tooltip flex bg-white rounded-lg shadow-md overflow-hidden h-24">
              <span class='tooltip rounded shadow-lg p-1 bg-gray-100 text-black mt-10'>${
                trip.name
              }</span>
              <div class="w-2/5">
                <img src="${image}" alt="${
            trip.name
          }" class="w-full h-full object-cover"/>
              </div>
              <div class="w-3/5 p-3 flex flex-col justify-center">
                <p class="font-bold text-gray-800 truncate">${trip.name}</p>
                <p class="text-sm text-gray-600">${Helper.formatDateToLabel(
                  trip.startDate
                )}<br>${Helper.formatDateToLabel(trip.endDate)}</p>
              </div>
            </div>
          </button>`
        );
      })
      .catch((error) => {
        tripsWrapper.insertAdjacentHTML(
          "beforeend",
          `<button onclick="location.href='./resume.html?id=${
            trip.id
          }'" class="cursor-pointer transition transform hover:-translate-y-1">
            <div class="has-tooltip flex bg-white rounded-lg shadow-md overflow-hidden h-24">
              <span class='tooltip rounded shadow-lg p-1 bg-gray-100 text-black mt-10'>${
                trip.name
              }</span>
              <div class="w-2/5">
                <img src="../img/images/fallback.jpg" alt="${
                  trip.name
                }" class="w-full h-full object-cover"/>
              </div>
              <div class="w-3/5 p-3 flex flex-col justify-center">
                <p class="font-bold text-gray-800 truncate">${trip.name}</p>
                <p class="text-sm text-gray-600">${Helper.formatDateToLabel(
                  trip.startDate
                )}<br>${Helper.formatDateToLabel(trip.endDate)}</p>
              </div>
            </div>
          </button>`
        );
      });
  });
}
