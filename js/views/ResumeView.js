import * as Flights from "../models/flightModel.js";
import * as Helper from "../models/ModelHelper.js";

// Inicializa os voos a partir do localStorage ou fonte de dados
Flights.init();

// Objeto de exemplo de uma viagem (trip)
let trip = {
  id: 4,
  name: "Visita ao Iceberg",
  typesOfTourism: [1, 4],
  origin: "OPO",
  destination: "CDK",
  price: 3200,
  company: "Icelandair",
  duration: "10 dias",
  startDate: "2025-07-01",
  endDate: "2025-07-11",
  description: "Descubra a Islândia.",
  isPack: true,
  flights: [114, 116, 20], // IDs dos voos desta viagem
};

// Array com os IDs dos voos da viagem
let flightsTrip = Array.from(trip.flights);

// Quando a página carregar, executa a função para preencher os dados
window.addEventListener("DOMContentLoaded", () => {
  populateData();
});

// Elemento onde será inserido o resumo dos voos
const flightResume = document.getElementById("flightResume");

// Função principal para preencher o resumo da viagem
function populateData() {
  // Limpa o conteúdo anterior
  flightResume.innerHTML = "";

  // Insere o título do resumo da viagem
  flightResume.insertAdjacentHTML(
    "beforeend",
    `<h1 class="text-4xl font-semibold text-[#3b3b3b] mb-10">Resumo viagem - ${trip.name}</h1>
    `
  );

  // Percorre todos os voos da viagem
  flightsTrip.forEach((flight, index) => {
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

    // Insere o cartão do voo no resumo
    flightResume.insertAdjacentHTML(
      "beforeend",
      `<div class="mb-2" id="legCard">
        <div
          class="bg-[#39578A] flex justify-between text-white px-7 py-7 rounded-lg mb-2"
        >
          <div class="text-xl font-semibold items-center flex gap-5">
            <img
              src="../img/icons/white/startTrip.svg"
              alt="startpointIcon"
              width="15"
              height="10"
            />
            <p class="text-xl">${flightData.originName}</p>
          </div>
          <p>${dateString}</p>
        </div>
        <div class="bg-white rounded-lg shadow-lg text-white rounded-lg">
          <div class="bg-[#6C6EA0] px-6 py-4 text-white rounded-t-lg">
            <div class="flex justify-between items-center">
              <p class="text-lg">
                ${flightData.originName} - ${flightData.destinationName}<span class="font-light text-sm">: ${flightData.duration}</span>
              </p>
              <p class="text-sm">${departureDate}</p>
            </div>
          </div>

          <div class="py-4 px-10">
            <div class="flex justify-between items-center">
            <div class="flex gap-3">
                <p class="flex text-lg text-[#39578A]">${flightData.origin}</p>
                <img src="../img/icons/blue/plane.svg" alt="Flight Icon" />
                <p class="flex text-lg text-[#39578A]">${flightData.destination}</p></div>
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
                    <p>${flightData.originName} (${flightData.origin})</p>
                    <p class="text-sm text-gray-500">
                      Francisco Sá Carneiro Int Airport
                    </p>
                  </div>
                </div>
                <div><p>${departureTime}h</p></div>
              </div>

              <!-- Destino -->
              <div
                class="items-center flex justify-between text-lg text-[#39578A]"
              >
                <div class="flex items-center gap-2">
                  <p class="text-4xl relative z-10 bg-white">•</p>
                  <div
                    class="absolute top-14 transform translate-x-2.5 w-0.5 h-16 z-10 bg-[#39578A]"
                  ></div>
                  <div>
                    <p>${flightData.destinationName} (${flightData.destination})</p>
                    <p class="text-sm text-gray-500">
                      Adolfo Suárez Madrid–Barajas Airport
                    </p>
                  </div>
                </div>
                <div><p>${arrivalTime}h</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>`
    );
  });

  // Mostra o destino final da viagem (último voo)
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
    </div>`
  );

  // Insere os botões fixos no fundo da página para imprimir ou pagar
  flightResume.insertAdjacentHTML(
    "beforeend",
    `<div class="fixed print:hidden bottom-0 left-0 right-0 z-20 py-2 border-t-2 bg-white w-full mx-auto text-center">
  <div class="flex justify-around">
    <button class="border-2 border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-50" onClick="window.print()">Imprimir</button>
    <button class="border-2 border-blue-900 text-blue-900 px-4 py-2 rounded hover:bg-red-50">Pagar</button>
  </div>
</div>`
  );
}
