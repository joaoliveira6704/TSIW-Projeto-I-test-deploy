import * as Flights from "../models/FlightModel.js";
import * as Helper from "../models/ModelHelper.js";

// Inicializa os dados de voos no localStorage, se necessário
Flights.init();

// Lista de destinos para o percurso
const destinations = ["OPO", "LIS", "MAD", "ROM"];
const name = "Viagem Europeia";
const flightsSection = document.getElementById("flightsSection");
let totalPrice = 0; // Preço total dos voos selecionados
let selectedFlights = {}; // Guarda o id do voo selecionado em cada secção
let selectedCount = 0; // Quantos voos já foram selecionados
const totalSections = destinations.length - 1; // Número de secções

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

// Quando o DOM estiver pronto, começa a construir a interface
window.addEventListener("DOMContentLoaded", () => {
  populateView();
});

function populateView() {
  document.getElementById("flightName").innerHTML = " - " + name;
  const flightSections = [];

  // Função auxiliar para obter a data de amanhã (à meia-noite)
  function getTomorrow() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    return d;
  }

  // Para cada par de cidades, cria uma secção de voos
  for (let i = 0; i < destinations.length - 1; i++) {
    const from = destinations[i];
    const to = destinations[i + 1];

    // Filtra os voos que fazem este percurso
    const flights = Flights.getAllFlightsByLeg(from, to);

    if (flights.length === 0) continue;

    // Agrupa os voos por data e encontra o mais barato de cada dia
    const byDate = {};
    flights.forEach((flight) => {
      const depDate = new Date(flight.departureTime);
      const dateKey = depDate.toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "long",
      });

      if (!byDate[dateKey]) {
        byDate[dateKey] = {
          flights: [],
          minPrice: flight.price,
          dateObj: depDate,
        };
      }
      byDate[dateKey].flights.push(flight);
      if (flight.price < byDate[dateKey].minPrice) {
        byDate[dateKey].minPrice = flight.price;
      }
    });

    // Só mostra datas a partir de amanhã
    const tomorrow = getTomorrow();
    const dates = Object.keys(byDate)
      .filter((dateStr) => {
        return byDate[dateStr].dateObj >= tomorrow;
      })
      .sort((a, b) => byDate[a].dateObj - byDate[b].dateObj);

    const closestDate = dates[0];

    // Divide as datas em grupos de 3 para o carrossel
    const dateGroups = [];
    for (let j = 0; j < dates.length; j += 3) {
      dateGroups.push(dates.slice(j, j + 3));
    }

    // Gera o HTML dos slides do carrossel
    let slides = "";
    dateGroups.forEach((group, idx) => {
      let items = "";

      group.forEach((date) => {
        const dateObj = byDate[date].dateObj;
        const weekday = dateObj.toLocaleDateString("pt-PT", {
          weekday: "short",
        });

        items += `
    <div class="bg-white p-2 rounded shadow text-center w-[100px] sm:w-[180px] lg:w-[320px] mx-1 cursor-pointer hover:bg-gray-50 transition-colors" 
         data-date="${date}">
         <p class="text-sm">${date}</p>
      <p class="text-xs text-gray-500">${
        weekday.charAt(0).toUpperCase() + weekday.slice(1)
      }</p>
      <p class="font-bold text-blue-700">€${byDate[date].minPrice}</p>
    </div>
  `;
      });

      slides += `
        <div class="flex duration-700 ease-in-out justify-center" ${
          idx === 0 ? 'data-carousel-item="active"' : "data-carousel-item"
        }>
          ${items}
        </div>
      `;
    });

    const sectionId = `flight-section-${i}`;
    flightSections.push({
      id: sectionId,
      origin: from,
      destination: to,
      flightsByDate: byDate,
      sortedDates: dates,
      defaultFlight: closestDate ? byDate[closestDate].flights[0] : null,
      closestDate,
    });

    // Insere o HTML da secção no DOM
    flightsSection.insertAdjacentHTML(
      "beforeend",
      `<section id="${sectionId}" class="flex flex-col items-center" data-origin="${from}" data-destination="${to}" data-index="${i}">
        <div class="mb-4 w-full">
          <img src="../img/icons/blue/plane.svg" alt="plane icon" class="w-5 h-5" />
          <h2 class="text-xl font-semibold mb-2">${from} para ${to}</h2>
          
          <div id="carousel-${i}" class="relative w-full" data-carousel="static">
            <div class="relative overflow-hidden w-full h-[100px] sm:h-[80px]">
              <div class="flex duration-700 ease-in-out justify-center" data-carousel-inner>
                ${slides}
              </div>
            </div>
            
            <button type="button" class="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-1 cursor-pointer group focus:outline-none" data-carousel-prev>
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/30 group-hover:bg-white/50 group-focus:ring-2 group-focus:ring-gray-400 group-focus:outline-none">
                <svg class="w-4 h-4 text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/>
                </svg>
                <span class="sr-only">Previous</span>
              </span>
            </button>
            
            <button type="button" class="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-1 cursor-pointer group focus:outline-none" data-carousel-next>
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/30 group-hover:bg-white/50 group-focus:ring-2 group-focus:ring-gray-400 group-focus:outline-none">
                <svg class="w-4 h-4 text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                </svg>
                <span class="sr-only">Next</span>
              </span>
            </button>
          </div>
        </div>

        <div class="flight-cards-container max-h-[600px] max-w-[300px] sm:max-w-full w-full mb-6">
          <!-- Aqui vão aparecer os cards dos voos -->
        </div>
      </section>`
    );
  }

  // Adiciona os event listeners para seleção de datas no carrossel
  document.querySelectorAll("[data-date]").forEach((item) => {
    item.addEventListener("click", function () {
      const date = this.getAttribute("data-date");
      const section = this.closest("section");
      const sectionIndex = parseInt(section.getAttribute("data-index"));
      const sectionData = flightSections[sectionIndex];

      // Se já existe seleção na secção anterior, só permite datas pelo menos 1 dia depois
      if (sectionIndex > 0 && selectedFlights[sectionIndex - 1]) {
        const prevFlight = Flights.getFlightById(
          selectedFlights[sectionIndex - 1]
        );
        if (prevFlight) {
          const prevDate = new Date(prevFlight.departureTime);
          prevDate.setHours(0, 0, 0, 0);

          const clickedDateParts = date.split(" de ");
          const months = [
            "janeiro",
            "fevereiro",
            "março",
            "abril",
            "maio",
            "junho",
            "julho",
            "agosto",
            "setembro",
            "outubro",
            "novembro",
            "dezembro",
          ];
          const day = parseInt(clickedDateParts[0], 10);
          const month = months.indexOf(clickedDateParts[1]);
          const year = new Date().getFullYear();
          const clickedDate = new Date(year, month, day);
          clickedDate.setHours(0, 0, 0, 0);

          const diffDays = (clickedDate - prevDate) / (1000 * 60 * 60 * 24);
          if (diffDays < 1) {
            return; // Não deixa selecionar datas inválidas
          }
        }
      }

      // Remove seleção visual de todas as datas deste carrossel
      section.querySelectorAll("[data-date]").forEach((el) => {
        el.classList.remove("border-b-4", "border-blue-600");
      });
      // Adiciona seleção visual à data clicada
      this.classList.add("border-b-4", "border-blue-600");

      // Atualiza os cards dos voos para a data escolhida
      showFlights(section, sectionData.flightsByDate[date].flights);
    });
  });

  // Inicializa cada secção com a data mais próxima disponível
  flightSections.forEach((data, idx) => {
    const section = document.getElementById(data.id);
    const closest = data.closestDate;
    if (!closest) return;

    const flights = data.flightsByDate[closest].flights;
    showFlights(section, flights);

    setupCarousel(section.querySelector(`#carousel-${idx}`), closest);

    // Seleciona visualmente a data mais próxima
    const carousel = section.querySelector(`#carousel-${idx}`);
    if (carousel) {
      const dateItems = carousel.querySelectorAll("[data-date]");
      dateItems.forEach((el) => {
        if (el.getAttribute("data-date") === closest) {
          el.classList.add("border-b-4", "border-blue-600");
        } else {
          el.classList.remove("border-b-4", "border-blue-600");
        }
      });
    }
  });

  // Adiciona o rodapé com o total e o botão de pagamento
  flightsSection.insertAdjacentHTML(
    "beforeend",
    `<div class="flex flex-col sm:flex-row justify-end items-center mt-6 gap-4">
      <p class="text-xl font-semibold total-price">Valor Total: €0</p>
      <div class="flex items-center space-x-4">
        <button class="border-2 border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-50">
          Cancelar
        </button>
        <button id="payment-btn" class="bg-transparent border-2 border-gray-600 cursor-not-allowed opacity-50 text-gray-600 px-4 py-2 rounded flex items-center" disabled>
          <span>0/${totalSections}</span>
        </button>
      </div>
    </div>`
  );

  // Adiciona o event listener ao botão de pagamento
  const paymentBtn = document.getElementById("payment-btn");
  if (paymentBtn) {
    paymentBtn.addEventListener("click", function () {
      if (paymentBtn.disabled) return;

      const flightIds = [];
      for (let i = 0; i < totalSections; i++) {
        if (selectedFlights[i]) {
          flightIds.push(selectedFlights[i]);
        }
      }
      console.log("Selected flights:", flightIds);
    });
  }

  // Guarda as secções globalmente para outras funções
  window.flightSections = flightSections;
}

// Função para atualizar as secções seguintes quando se seleciona um voo
function updateNextSections(selectedIdx) {
  const selectedFlight = selectedFlights[selectedIdx]
    ? Flights.getFlightById(selectedFlights[selectedIdx])
    : null;

  if (!selectedFlight) return;

  const selectedDate = new Date(selectedFlight.departureTime);
  selectedDate.setHours(0, 0, 0, 0);

  for (let i = selectedIdx + 1; i < totalSections; i++) {
    const section = document.getElementById(`flight-section-${i}`);
    if (!section) continue;

    const sectionData = window.flightSections[i];
    if (!sectionData) continue;

    const existingFlightId = selectedFlights[i];
    let existingFlightDate = null;
    let keepExisting = false;

    if (existingFlightId) {
      const existingFlight = Flights.getFlightById(existingFlightId);
      if (existingFlight) {
        existingFlightDate = new Date(existingFlight.departureTime);
        existingFlightDate.setHours(0, 0, 0, 0);

        if (existingFlightDate <= selectedDate) {
          selectedFlights[i] = null;
          selectedCount--;
        } else {
          keepExisting = true;
        }
      }
    }

    // Atualiza a disponibilidade das datas no carrossel
    const carousel = section.querySelector(`[id^="carousel-"]`);
    if (carousel) {
      const dateItems = carousel.querySelectorAll("[data-date]");
      dateItems.forEach((dateEl) => {
        const dateStr = dateEl.getAttribute("data-date");
        const dateObj = sectionData.flightsByDate[dateStr]?.dateObj;

        if (dateObj) {
          const checkDate = new Date(dateObj);
          checkDate.setHours(0, 0, 0, 0);

          if (checkDate <= selectedDate) {
            // Desabilita esta data
            dateEl.classList.add(
              "opacity-50",
              "cursor-not-allowed",
              "pointer-events-none"
            );
            dateEl.classList.remove("hover:bg-gray-50", "cursor-pointer");
            if (dateEl.classList.contains("border-b-4")) {
              dateEl.classList.remove("border-b-4", "border-blue-600");
            }
          } else {
            // Habilita esta data
            dateEl.classList.remove(
              "opacity-50",
              "cursor-not-allowed",
              "pointer-events-none"
            );
            dateEl.classList.add("hover:bg-gray-50", "cursor-pointer");
          }
        }
      });
    }

    if (!keepExisting) {
      // Procura a primeira data disponível
      const availableDates = sectionData.sortedDates.filter((dateStr) => {
        const dateObj = sectionData.flightsByDate[dateStr]?.dateObj;
        if (!dateObj) return false;
        const checkDate = new Date(dateObj);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate > selectedDate;
      });

      if (availableDates.length > 0) {
        const firstAvailable = availableDates[0];

        // Seleciona visualmente a primeira data disponível
        const carousel = section.querySelector(`[id^="carousel-"]`);
        if (carousel) {
          const dateItems = carousel.querySelectorAll("[data-date]");
          dateItems.forEach((el) => {
            if (el.getAttribute("data-date") === firstAvailable) {
              el.classList.add("border-b-4", "border-blue-600");
            } else {
              el.classList.remove("border-b-4", "border-blue-600");
            }
          });
        }

        const flights = sectionData.flightsByDate[firstAvailable].flights;
        showFlights(section, flights);
      } else {
        const container = section.querySelector(".flight-cards-container");
        if (container) {
          container.innerHTML =
            "<p class='text-center text-gray-500'>Não há voos disponíveis.</p>";
        }
      }
    } else {
      // Mantém o voo já selecionado se for válido
      const currentDate = existingFlightDate.toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "long",
      });

      const flights = sectionData.flightsByDate[currentDate]?.flights || [];
      showFlights(section, flights);
    }
  }
}

// Mostra os cards dos voos para uma secção e data
function showFlights(section, flights) {
  const container = section.querySelector(".flight-cards-container");
  container.innerHTML = "";

  const sectionIdx = parseInt(section.getAttribute("data-index"));
  const selectedId = selectedFlights[sectionIdx];

  flights.forEach((flight) => {
    const isSelected = selectedId === flight.id;
    const depTime = Helper.formatTime(flight.departureTime);
    const arrTime = Helper.formatTime(flight.arrivalTime);

    // Usa o código IATA para mostrar o logo da companhia
    const iata = IATA_CODES[flight.company] || flight.company;
    const logoUrl = `https://images.daisycon.io/airline/?width=100&height=40&color=ffffff&iata=${iata}`;

    const html = `
  <div class="bg-white rounded-xl text-center shadow-md p-4 sm:p-6 mb-3 flex flex-col sm:flex-row justify-between items-center flight-card ${
    isSelected ? "border-2 border-indigo-500" : ""
  } mx-auto max-w-full" data-flight-id="${flight.id}">
    <img src="${logoUrl}" alt="${
      flight.company
    } Logo" class="w-[70px] h-[28px] object-contain mb-2 sm:mb-0" />
    <div class="flex items-center space-x-2 sm:space-x-6 mb-4 mb-0">
      <div class="text-center mx-2">
        <p class="text-sm font-bold">${depTime}</p>
        <p class="text-xs text-gray-500">${flight.origin}</p>
      </div>
      <div class="flex items-center space-x-2 my-2 sm:my-0">
        <div class="w-10 sm:w-16 h-px bg-blue-800"></div>
        <img src="../img/icons/blue/plane.svg" alt="plane icon" class="w-5 h-5" />
        <div class="w-10 sm:w-16 h-px bg-blue-800"></div>
      </div>
      <div class="text-center mx-2">
        <p class="text-sm font-bold">${arrTime}</p>
        <p class="text-xs text-gray-500">${flight.destination}</p>
      </div>
    </div>
    <div class="flex flex-col px-4 sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
      <p class="text-lg font-bold text-indigo-700">€${flight.price.toFixed(
        0
      )}/pax</p>
      <button class="${
        isSelected
          ? "bg-gray-500 hover:bg-gray-600"
          : "bg-indigo-500 hover:bg-indigo-600"
      } text-white text-sm font-semibold px-3 py-2 rounded-lg shadow-sm select-flight-btn">
        ${isSelected ? "Selecionado" : "Selecionar"}
      </button>
    </div>
  </div>
`;

    container.insertAdjacentHTML("beforeend", html);
  });

  // Adiciona os event listeners aos botões de selecionar voo
  container.querySelectorAll(".select-flight-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const card = this.closest(".flight-card");
      const flightId = parseInt(card.getAttribute("data-flight-id"));
      const section = this.closest("section");
      const sectionIdx = parseInt(section.getAttribute("data-index"));

      if (selectedFlights[sectionIdx] === flightId) {
        // Se já estava selecionado, desmarca
        selectedFlights[sectionIdx] = null;
        card.classList.remove("border-2", "border-indigo-500");
        this.textContent = "Selecionar";
        this.classList.remove("bg-gray-500", "hover:bg-gray-600");
        this.classList.add("bg-indigo-500", "hover:bg-indigo-600");
        selectedCount--;

        // Reativa todas as datas das secções seguintes
        for (let i = sectionIdx + 1; i < totalSections; i++) {
          const nextSection = document.getElementById(`flight-section-${i}`);
          if (nextSection) {
            const carousel = nextSection.querySelector(`[id^="carousel-"]`);
            if (carousel) {
              const dateItems = carousel.querySelectorAll("[data-date]");
              dateItems.forEach((dateEl) => {
                dateEl.classList.remove(
                  "opacity-50",
                  "cursor-not-allowed",
                  "pointer-events-none"
                );
                dateEl.classList.add("hover:bg-gray-50", "cursor-pointer");
              });
            }
          }
        }
      } else {
        // Se já havia outro selecionado nesta secção, desmarca-o
        if (selectedFlights[sectionIdx]) {
          const prevCard = container.querySelector(
            `.flight-card[data-flight-id="${selectedFlights[sectionIdx]}"]`
          );
          if (prevCard) {
            prevCard.classList.remove("border-2", "border-indigo-500");
            const prevBtn = prevCard.querySelector(".select-flight-btn");
            prevBtn.textContent = "Selecionar";
            prevBtn.classList.remove("bg-gray-500", "hover:bg-gray-600");
            prevBtn.classList.add("bg-indigo-500", "hover:bg-indigo-600");
          }
        } else {
          selectedCount++;
        }

        // Seleciona o novo voo
        selectedFlights[sectionIdx] = flightId;
        card.classList.add("border-2", "border-indigo-500");
        this.textContent = "Selecionado";
        this.classList.remove("bg-indigo-500", "hover:bg-indigo-600");
        this.classList.add("bg-gray-500", "hover:bg-gray-600");

        // Atualiza as secções seguintes
        updateNextSections(sectionIdx);
      }

      updateCounter();
      calcTotal();
    });
  });
}

// Função para configurar o carrossel (navegação entre slides)
function setupCarousel(carousel, closestDate = null) {
  const inner = carousel.querySelector("[data-carousel-inner]");
  const slides = carousel.querySelectorAll("[data-carousel-item]");
  const prev = carousel.querySelector("[data-carousel-prev]");
  const next = carousel.querySelector("[data-carousel-next]");

  const totalSlides = slides.length;
  let current = 0;

  // Procura o slide que tem a data mais próxima
  if (closestDate) {
    setTimeout(() => {
      let foundIdx = -1;
      slides.forEach((slide, slideIdx) => {
        const dateEls = slide.querySelectorAll("[data-date]");
        dateEls.forEach((dateEl) => {
          if (dateEl.getAttribute("data-date") === closestDate) {
            foundIdx = slideIdx;
          }
        });
      });

      if (foundIdx !== -1 && foundIdx !== current) {
        current = foundIdx;
        update();
      }
    }, 100);
  }

  // Atualiza o slide visível
  function update() {
    slides.forEach((slide, idx) => {
      if (idx === current) {
        slide.setAttribute("data-carousel-item", "active");
        slide.style.display = "flex";
      } else {
        slide.removeAttribute("data-carousel-item");
        slide.style.display = "none";
      }
    });
  }

  prev.addEventListener("click", () => {
    current = (current - 1 + totalSlides) % totalSlides;
    update();
  });

  next.addEventListener("click", () => {
    current = (current + 1) % totalSlides;
    update();
  });

  window.addEventListener("resize", update);
  update();
}

// Calcula o preço total dos voos selecionados
function calcTotal() {
  totalPrice = 0;

  Object.values(selectedFlights).forEach((flightId) => {
    if (flightId) {
      const flight = Flights.getFlightById(flightId);
      if (flight) {
        totalPrice += flight.price;
      }
    }
  });

  updateTotal();
}

// Atualiza o texto do preço total no rodapé
function updateTotal() {
  const el = document.querySelector(".total-price");
  if (el) {
    el.textContent = `Valor Total: €${totalPrice}`;
  }
}

// Atualiza o contador de voos selecionados e o botão de pagamento
function updateCounter() {
  const btn = document.getElementById("payment-btn");

  if (btn) {
    if (selectedCount === totalSections) {
      btn.innerHTML = `<span>Pagamento</span>`;
      btn.classList.remove(
        "bg-transparent",
        "border-gray-600",
        "cursor-not-allowed",
        "opacity-50",
        "text-gray-600"
      );
      btn.classList.add(
        "bg-green-500",
        "text-white",
        "hover:bg-green-600",
        "border-green-600"
      );
      btn.disabled = false;
    } else {
      btn.innerHTML = `<span>${selectedCount}/${totalSections}</span>`;
      btn.classList.add(
        "bg-transparent",
        "border-gray-600",
        "cursor-not-allowed",
        "opacity-50",
        "text-gray-600"
      );
      btn.classList.remove(
        "bg-green-500",
        "text-white",
        "hover:bg-green-600",
        "border-green-600"
      );
      btn.disabled = true;
    }
  }
}
