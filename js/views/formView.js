import * as TourismTypes from "../models/TourismtypeModel.js";
import * as Flights from "../models/flightModel.js";
import * as User from "../models/UserModel.js";
import * as Helper from "../models/ModelHelper.js"

// Inicializa os dados de tipos de turismo, voos e utilizadores
TourismTypes.init();
Flights.init();

const mainForm = document.getElementById("mainForm");
const tourismFormSection = document.getElementById("tourismDropdown");
const airportList = document.getElementById("airportsUl");
const today = new Date().toLocaleDateString("pt-PT");
const inputOriginSearch = document.getElementById("inputOriginSearch");

// Ao carregar o DOM, inicializa o formulário e os dropdowns
document.addEventListener("DOMContentLoaded", (event) => {
  // Adiciona o campo de data com datepicker ao formulário
  mainForm.insertAdjacentHTML(
    "afterbegin",
    `<div
    class="group flex gap-3 h-fit w-fit bg-white hover:outline-blue-600 hover:outline-3 hover:border- px-6 py-3 cursor transition rounded-l-full"
    >
    <input
      datepicker
      datepicker-autohide
      id="form-datepicker"
      type="text"
      placeholder="Data"
      class="cursor-pointer w-[10ch]"
      autocomplete="off"
     />
     <img
      src="./img/icons/blue/calendar.svg"
      alt="calendarIcon"
      class="w-4"
     />
    </div>`
  );

  const datePicker = document.getElementById("form-datepicker");

  // Inicializa o datepicker com as opções pretendidas
  new Datepicker(datePicker, {
    autohide: true,
    format: "dd-mm-yyyy",
    minDate: today,
    orientation: "top",
    autoSelectToday: 1,
  });

  // Carrega os tipos de turismo e preenche o dropdown
  const tourismTypes = TourismTypes.getAll();
  tourismFormSection.innerHTML = "";

  tourismTypes.forEach((tourismType) => {
    tourismFormSection.insertAdjacentHTML(
      "beforeend",
      `<li class="list-none">
              <button
              data-id="${tourismType.name}"
                class="block px-4 py-2 w-full hover:first:rounded-t-md last:hover:rounded-b-md hover:bg-gray-200"
                >${tourismType.name}</button
              >
            </li>`
    );
  });
  tourismFormSection.insertAdjacentHTML(
    "beforeend",
    `<li class="list-none"><button
              data-id="Todos"
                class="block px-4 py-2 w-full hover:first:rounded-t-md last:hover:rounded-b-md hover:bg-gray-200"
                >Todos</button
              >
            </li>`
  );

  // Carrega as origens dos voos e mostra a lista
  const origins = Flights.getAllUniqueOrigins();
  renderOriginList(origins);

  // Filtro de pesquisa de aeroportos
  inputOriginSearch.addEventListener("input", () => {
    const filterText = inputOriginSearch.value;
    const filteredOrigins = Flights.getFilteredOrigins(filterText);
    renderOriginList(filteredOrigins);
  });
});

// Seleção do tipo de turismo no dropdown
const tourismText = document.getElementById("tourismText");
tourismFormSection.addEventListener("click", (event) => {
  const setBtn = event.target.closest("button");
  if (setBtn && setBtn.dataset.id) {
    const selectedType = setBtn.dataset.id;
    tourismText.innerHTML = selectedType;
    tourismFormSection.classList.add("hidden");
  }
});

const airportDropdown = document.getElementById("airportDropdown");
const airportNameCache = {}; // Cache simples para nomes de aeroportos

// Renderiza a lista de aeroportos de origem
function renderOriginList(origins) {
  airportList.innerHTML = "";

  // Garante que não há duplicados
  const uniqueOrigins = [...new Set(origins)];

  // Vai buscar os nomes dos aeroportos em paralelo
  const fetchPromises = uniqueOrigins.map((iata) => {
    if (airportNameCache[iata]) {
      return Promise.resolve({ iata, name: airportNameCache[iata] });
    }

    return Helper.fetchAirportName(iata).then((name) => {
      const safeName = name || "Unknown Airport";
      airportNameCache[iata] = safeName;
      return { iata, name: safeName };
    });
  });

  Promise.all(fetchPromises).then((airports) => {
    airports.forEach(({ iata, name }) => {
      airportList.insertAdjacentHTML(
        "beforeend",
        `<li>
          <button
            class="block has-tooltip px-4 py-2 truncate cursor-pointer w-full text-left hover:first:rounded-t-md hover:last:rounded-b-md rounded-b-md rounded-t-md bg-gray-100 hover:bg-gray-200"
            data-id="${iata}"
          >${iata} - ${name}</button>`
      );
    });
  });
}

// Seleção de aeroporto de origem
airportList.addEventListener("click", (event) => {
  const setBtn = event.target.closest("button");
  if (setBtn && setBtn.dataset.id) {
    const selectedOrigin = setBtn.dataset.id;
    inputOriginSearch.value = selectedOrigin;
    airportDropdown.classList.add("hidden");
  }
});

// Lógica para mover o formulário entre o footer e o topo consoante a secção visível
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("main > section");
  const mainForm = document.getElementById("mainForm");
  const formNavContainer = document.getElementById("formNavContainer");
  const footer = document.querySelector("footer");
  const logo = document.getElementById("logo");
  const logoImg = logo.querySelectorAll("img");
  const tourismText = document.getElementById("tourismText");
  const originText = document.getElementById("originText");
  const header = document.querySelector("header");
  const favoritesText = header.querySelector("#favoritesText");
  const passportText = header.querySelector("#passportText");
  const favoritesBtn = header.querySelector("#favoritesBtn");
  const passportBtn = header.querySelector("#passportBtn");
  const firstSection = sections[0];

  let currentSectionIndex = 0;

  const observerOptions = {
    root: null,
    threshold: 0.5,
  };

  // Observa que secção está visível para ajustar o formulário e o header
  const observer = new IntersectionObserver((entries) => {
    const datePicker = document.getElementById("form-datepicker");
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = Array.from(sections).indexOf(entry.target);
        currentSectionIndex = index;
        if (currentSectionIndex === 0) {
          // Se está na primeira secção, mete o formulário no footer
          if (!footer.contains(mainForm)) {
            footer.appendChild(mainForm);
          }

          formNavContainer.classList.add("hidden");
          passportText.classList.remove("hidden");
          favoritesText.classList.remove("hidden");
          favoritesBtn.classList.remove("p-3");
          favoritesBtn.classList.add("px-4", "py-2");
          passportBtn.classList.remove("p-3");
          passportBtn.classList.add("px-4", "py-2");
          new Datepicker(datePicker, {
            autohide: true,
            format: "dd-mm-yyyy",
            minDate: today,
            orientation: "top",
            autoSelectToday: 1,
          });
          logoImg.forEach((img) => {
            img.src = "./img/logos/logoDarkmode_logotipo darkmode.png";
          });
        } else {
          if (currentSectionIndex === 1) {
            logoImg.forEach((img) => {
              img.src = "./img/logos/logo-12.png";
            });
          } else {
            logoImg.forEach((img) => {
              img.src = "./img/logos/logoDarkmode_logo darkmode.png";
            });
          }
          // Nas outras secções, mete o formulário no topo e ajusta o header
          if (!formNavContainer.contains(mainForm)) {
            formNavContainer.appendChild(mainForm);
          }
          if (window.innerWidth < 1024) {
            formNavContainer.classList.add("hidden");
          } else {
            formNavContainer.classList.remove("hidden");
          }
          new Datepicker(datePicker, {
            autohide: true,
            format: "dd-mm-yyyy",
            minDate: today,
            orientation: "bottom",
            autoSelectToday: 1,
          });
          passportText.classList.add("hidden");
          favoritesBtn.classList.add("p-3");
          favoritesBtn.classList.remove("px-4", "py-2");
          passportBtn.classList.add("p-3");
          passportBtn.classList.remove("px-4", "py-2");
          favoritesText.classList.add("hidden");
        }
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
});

// Mostra ou esconde a navegação do formulário consoante o tamanho do ecrã
window.addEventListener("resize", () => {
  const formNavContainer = document.getElementById("formNavContainer");
  if (window.innerWidth < 1024) {
    formNavContainer.classList.add("hidden");
  } else {
    formNavContainer.classList.remove("hidden");
  }
});


const searchFlightBtn = document.getElementById("searchFlightBtn");

// Só permite pesquisar voos se o utilizador estiver autenticado
searchFlightBtn.addEventListener("click", () => {
  User.isLogged() ? sendFormQuery() : false;
});

// Envia os dados do formulário para a próxima página
function sendFormQuery(platform) {
  const datePicker = document.getElementById("form-datepicker");
  const selectedDate = datePicker.value;
  const origin = inputOriginSearch.value;
  const passengerCounter = document.getElementById("counter-input");
  const passengersCount = passengerCounter.value;

  const typeOfTourism = tourismText.innerHTML;
  User.setUserQuery(selectedDate, origin, typeOfTourism, passengersCount);
  location.href = "./html/tripBuilder.html";
}
