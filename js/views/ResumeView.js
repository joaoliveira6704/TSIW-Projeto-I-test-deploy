// Importa os módulos necessários
import * as Flights from "../models/flightModel.js";
import * as Helper from "../models/ModelHelper.js";
import * as Trips from "../models/tripModel.js";
import * as Users from "../models/userModel.js";

// Inicializa os dados de voos e viagens
Flights.init();
Trips.init();

// Variáveis para guardar a viagem e os voos associados
let trip;
let flightsTrip;

// Obtém o parâmetro id da viagem da URL
const params = new URLSearchParams(window.location.search);
let id = params.get("id");

// Quando a página carregar, executa a função para preencher os dados
window.addEventListener("DOMContentLoaded", () => {
  // Se o utilizador não estiver autenticado, redireciona para o index
  if (!Users.isLogged()) {
    location.href = "../index.html";
    return;
  }
  id = id ? parseInt(id, 10) : null;
  // Apenas executa se houver parâmetro de id
  if (id) {
    trip = Trips.getSingleTripById(id);
  } else {
    // Se não houver id, tenta obter do sessionStorage
    const currentTripData = sessionStorage.getItem("currentTrip");
    if (currentTripData) {
      try {
        trip = JSON.parse(currentTripData);
      } catch (error) {
        console.error(
          "Erro ao converter currentTrip do sessionStorage:",
          error
        );
        trip = null;
      }
    }
  }

  if (!trip) {
    // Se não houver dados da viagem, redireciona para o perfil
    console.error("Sem dados da viagem");
    window.location.href = "./profile.html";
    return;
  }

  // Só define flightsTrip depois de confirmar que trip existe
  flightsTrip = Array.from(trip.flights);

  // Preenche os dados do resumo
  populateData();
});

// Elemento onde será inserido o resumo dos voos
const flightResume = document.getElementById("flightResume");

// Função principal para preencher o resumo da viagem
async function populateData() {
  if (!trip) {
    console.error("Dados da viagem não disponíveis em populateData");
    return;
  }

  // Limpa o conteúdo anterior
  flightResume.innerHTML = "";

  // Insere o título do resumo da viagem
  flightResume.insertAdjacentHTML(
    "beforeend",
    `<h1 class="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#3b3b3b] mb-10">Resumo da Viagem - ${trip.name}</h1>`
  );
  document.title = `${trip.name} - Resumo`;

  // Processa todos os voos da viagem
  for (let index = 0; index < flightsTrip.length; index++) {
    const flight = flightsTrip[index];
    await processFlightCard(flight, index);
  }

  // Mostra o destino final da viagem (último voo)
  await addFinalDestinationCard();

  // Adiciona os botões de ação (imprimir, pagar)
  addActionButtons();
}

// Função para processar cada cartão de voo
async function processFlightCard(flight, index) {
  try {
    let flightData = Flights.getFlightById(flight); // Dados do voo atual

    // Pega o próximo voo, se existir, para calcular a data de chegada
    let nextFlightData = null;
    let arrivalDate = "";
    if (index < flightsTrip.length - 1) {
      nextFlightData = Flights.getFlightById(flightsTrip[index + 1]);
      arrivalDate = Helper.formatDate(nextFlightData.departureTime);
    } else {
      // Se for o último voo, usa a data de partida dele próprio
      arrivalDate = Helper.formatDate(flightData.departureTime);
    }

    // Formata as datas e horas de partida/chegada
    let departureDate = Helper.formatDate(flightData.arrivalTime);
    let arrivalTime = Helper.formatTime(flightData.arrivalTime);
    let departureTime = Helper.formatTime(flightData.departureTime);

    // Cria a string de datas para mostrar no cartão
    let dateString;
    if (departureDate == arrivalDate) {
      dateString = departureDate;
    } else {
      dateString = departureDate + " - " + arrivalDate;
    }

    // Usa o código IATA para mostrar o logo da companhia aérea
    const iata = Helper.getIata(flightData.company);
    const logoUrl = `https://images.daisycon.io/airline/?width=100&height=40&color=ffffff&iata=${iata}`;

    // Aguarda os nomes dos aeroportos (origem e destino)
    const [departureName, arrivalName] = await getFlightNames(flightData);
    let duration = Helper.calculateDuration(flightData.duration);

    // Insere o cartão do voo no resumo
    flightResume.insertAdjacentHTML(
      "beforeend",
      `<div class="mb-2" id="legCard">
        <div
          class="bg-[#39578A] flex justify-between text-white items-center px-7 py-7 rounded-lg mb-2"
        >
          <div class="text-xl font-semibold items-center flex gap-5">
            <img
              src="../img/icons/white/startTrip.svg"
              alt="startpointIcon"
              width="15"
              height="10"
            />
            <p class="text-lg md:text-xl">${flightData.originName}</p>
          </div>
          <p class="text-xs sm:text-sm md:text-base">${dateString}</p>
        </div>
        <div class="bg-white rounded-lg shadow-lg text-white rounded-lg">
          <div class="bg-[#6C6EA0] px-6 py-4 text-white rounded-t-lg">
            <div class="flex justify-between items-center">
              <p class="text-sm md:text-md md:text-lg">
                ${flightData.originName} - ${flightData.destinationName}<span class="font-light text-sm">: ${duration}</span>
              </p>
              <p class="text-sm">${departureDate}</p>
            </div>
          </div>

          <div class="py-4 px-3 xs:px-5 sm:px-10">
            <div class="flex justify-between items-center">
            <div class="flex gap-3">
                <p class="flex text-base md:text-lg text-[#39578A]">${flightData.origin}</p>
                <img src="../img/icons/blue/plane.svg" alt="Flight Icon" />
                <p class="flex text-base md:text-lg text-[#39578A]">${flightData.destination}</p></div>
              <div class="fitems-center">
                <img
                  src="${logoUrl}"
                  alt=""
                  srcset=""
                />
              </div>
            </div>

            <div class="py-4 flex flex-col gap-8 relative">
              <!-- Origem -->
              <div
                class="items-center flex justify-between text-lg text-[#39578A] relative"
              >
                <div class="flex items-center gap-2">
                  <div class="relative">
                    <p class="text-4xl relative z-10 bg-white">•</p>
                    <div
                      class="absolute top-6 left-1/2 -translate-x-1/2 w-0.5 h-16 z-10 bg-[#39578A]"
                    ></div>
                  </div>
                  <div>
                    <p class="text-base md:text-lg">${flightData.originName} (${flightData.origin})</p>
                    <p class="text-xs md:text-sm text-gray-500">
                      ${departureName}
                    </p>
                  </div>
                </div>
                <div><p class="text-sm md:text-base">${departureTime}h</p></div>
              </div>

              <!-- Destino -->
              <div
                class="items-center flex justify-between text-lg text-[#39578A]"
              >
                <div class="flex items-center gap-2">
                  <p class="text-4xl relative z-10 bg-white">•</p>
                  <div
                    class="absolute top-14 transform translate-x-2.5 w-0.5 h-14 md:h-16 z-10 bg-[#39578A]"
                  ></div>
                  <div>
                    <p class="text-base md:text-lg">${flightData.destinationName} (${flightData.destination})</p>
                    <p class="text-xs md:text-sm text-gray-500">
                      ${arrivalName}
                    </p>
                  </div>
                </div>
                <div><p class="text-sm md:text-base">${arrivalTime}h</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>`
    );
  } catch (error) {
    console.error("Erro ao processar voo:", error);
  }
}

// Função para adicionar o cartão de destino final
async function addFinalDestinationCard() {
  const lastFlight = Flights.getFlightById(flightsTrip[flightsTrip.length - 1]);
  const lastDepartureDate = Helper.formatDate(lastFlight.departureTime);
  const lastArrivalDate = Helper.formatDate(lastFlight.arrivalTime);
  const lastDateString =
    lastDepartureDate === lastArrivalDate
      ? lastDepartureDate
      : lastDepartureDate + " - " + lastArrivalDate;

  // Insere o cartão do destino final
  flightResume.insertAdjacentHTML(
    "beforeend",
    `<div class="mb-2" id="legCard">
      <div
        class="bg-[#39578A] flex justify-between text-white px-7 py-7 rounded-lg mb-2"
      >
        <div class="text-xl font-semibold items-center flex gap-5">
          <img
            src="../img/icons/white/destinationElipse.svg"
            alt="startpointIcon"
            width="15"
            height="10"
          />
          <p class="text-xl">${lastFlight.destinationName}</p>
        </div>
        <p>${lastDateString}</p>
      </div>
    </div>
    <div>
    <p class="mt-3 font-bold text-base">Preço: ${trip.price}€</p>
    </div>`
  );
}

// Função para adicionar os botões de ação (imprimir, pagar)
function addActionButtons() {
  if (!id) {
    // O URL não tem parametro de id
    flightResume.insertAdjacentHTML(
      "beforeend",
      `<div class="fixed print:hidden bottom-0 left-0 right-0 z-20 py-2 border-t-2 bg-white w-full mx-auto text-center">
  <div class="flex justify-around">
    <button class="w-fit cursor-pointer btn-std font-bold border-2 border-[#D12127] text-[#D12127] hover:bg-[#D12127] hover:bg-opacity-10" onClick="window.print()">Imprimir</button>
    <button id="payment-btn" class="w-fit cursor-pointer btn-std font-bold border-2 hover:bg-opacity-10">Pagar</button>
  </div>
</div>`
    );

    let paymentBtn = document.getElementById("payment-btn");
    paymentBtn.addEventListener("click", () => {
      location.href = "./payment.html";
    });
  } else {
    // O URL tem parametro de id
    flightResume.insertAdjacentHTML(
      "beforeend",
      `<div class="fixed print:hidden bottom-0 left-0 right-0 z-20 py-2 border-t-2 bg-white w-full mx-auto text-center">
  <div class="flex justify-around">
    <button class="w-fit cursor-pointer btn-std font-bold border-2 border-[#D12127] text-[#D12127] hover:bg-[#D12127] hover:bg-opacity-10" onClick="window.print()">Imprimir</button>
  </div>
</div>`
    );
  }

  // Se a viagem tem reviews e é um pack, mostra secção de reviews
  if (trip.reviews && trip.isPack) {
    flightResume.insertAdjacentHTML(
      "beforeend",
      `<h3 class="text-xl mt-10 mb-4 font-bold">Reviews</h3><div id="reviewSection"></div>`
    );
    renderReviews();
  }
}

// Função que retorna ambos os nomes dos aeroportos usando Promise.all
function getFlightNames(flightData) {
  return Promise.all([
    Helper.fetchAirportName(flightData.origin),
    Helper.fetchAirportName(flightData.destination),
  ]);
}

// Função para renderizar as reviews
function renderReviews() {
  let reviewSection = document.getElementById("reviewSection");

  if (id) {
    reviewSection.innerHTML = "";
    reviewSection.insertAdjacentHTML(
      "beforeend",
      `<form id="reviewForm" class="mb-4">
        <div class="flex flex-col space-y-5 mb-6">
          <label for="reviewInput">Deixa a tua avaliação</label>
          <textarea id="reviewInput" class="p-3 rounded-xl" name="reviewText" required placeholder="Escreve a tua opinião aqui..."></textarea>
          
          <!-- Star Rating Input -->
          <div class="flex flex-col space-y-2">
            <label>Classificação</label>
            <div class="flex space-x-1">
              ${[1, 2, 3, 4, 5]
                .map(
                  (star) =>
                    `<button type="button" class="star-btn text-2xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="${star}">★</button>`
                )
                .join("")}
            </div>
            <input type="hidden" id="rating" name="rating" value="0">
            <span id="ratingError" class="text-red-500 text-sm hidden">Por favor, seleciona uma classificação</span>
          </div>
        </div>
        <div>
          <button type="submit" class="btn-std">Enviar</button>
        </div>
      </form>`
    );

    // Lógica das estrelas de avaliação
    const starButtons = document.querySelectorAll(".star-btn");
    const ratingInput = document.getElementById("rating");

    starButtons.forEach((star, index) => {
      star.addEventListener("click", () => {
        const rating = index + 1;
        ratingInput.value = rating;

        starButtons.forEach((s, i) => {
          if (i < rating) {
            s.classList.remove("text-gray-300");
            s.classList.add("text-yellow-400");
          } else {
            s.classList.remove("text-yellow-400");
            s.classList.add("text-gray-300");
          }
        });
      });

      star.addEventListener("mouseenter", () => {
        const rating = index + 1;
        starButtons.forEach((s, i) => {
          if (i < rating) {
            s.classList.remove("text-gray-300");
            s.classList.add("text-yellow-400");
          } else {
            s.classList.remove("text-yellow-400");
            s.classList.add("text-gray-300");
          }
        });
      });
    });

    const starContainer = document.querySelector(".flex.space-x-1");
    starContainer.addEventListener("mouseleave", () => {
      const currentRating = parseInt(ratingInput.value);
      starButtons.forEach((s, i) => {
        if (i < currentRating) {
          s.classList.remove("text-gray-300");
          s.classList.add("text-yellow-400");
        } else {
          s.classList.remove("text-yellow-400");
          s.classList.add("text-gray-300");
        }
      });
    });

    // Submissão do formulário de review
    const reviewForm = document.getElementById("reviewForm");
    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const reviewText = document.getElementById("reviewInput").value.trim();
      const rating = parseInt(document.getElementById("rating").value);
      const ratingError = document.getElementById("ratingError");

      if (rating === 0) {
        ratingError.classList.remove("hidden");
        return;
      } else {
        ratingError.classList.add("hidden");
      }

      const newReview = {
        name: Users.getUserLogged().name,
        message: reviewText,
        rating: rating,
      };

      Trips.saveReview(id, newReview);

      trip = Trips.getSingleTripById(id);

      reviewForm.reset();
      document.getElementById("rating").value = "0";
      starButtons.forEach((s) => {
        s.classList.remove("text-yellow-400");
        s.classList.add("text-gray-300");
      });

      renderReviews();
    });
  }

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

  // Mostra reviews existentes, se houver
  if (trip.reviews && trip.reviews.length > 0) {
    reviewSection.insertAdjacentHTML(
      "beforeend",
      `<div id="existingReviews" class="mt-6"></div>`
    );

    const existingReviewsContainer = document.getElementById("existingReviews");

    // Mostra cada review com estrelas
    trip.reviews.forEach((review) => {
      existingReviewsContainer.insertAdjacentHTML(
        "beforeend",
        `<div class="mb-6">
          <p class="font-semibold">${review.name}</p>
          <div class="flex gap-x-5 p-6 bg-blue-200 rounded-xl justify-between items-start">
            <p class="flex-1">${review.message}</p>
            <div class="flex flex-col items-end">
              <div class="flex text-lg mb-1">
                ${generateStars(review.rating)}
              </div>
              <p class="text-sm text-gray-600">${review.rating}/5</p>
            </div>
          </div>
        </div>`
      );
    });
  }
}
