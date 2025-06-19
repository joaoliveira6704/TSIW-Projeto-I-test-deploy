// Importa módulos de utilizadores e funções auxiliares
import * as Users from "../models/userModel.js";
import * as Helper from "../models/ModelHelper.js";
import * as Flights from "../models/flightModel.js";
import * as Trips from "../models/tripModel.js";

// Inicializa os dados de voos, utilizadores e viagens
Flights.init();
Users.init();
Trips.init();

// Obtém os parâmetros da URL (por exemplo, id da viagem)
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// Seleciona elementos do DOM para manipulação posterior
const milesLabel = document.getElementById("milesLabel");
const priceLabel = document.getElementById("priceLabel");
const milesCheckbox = document.getElementById("milesCheckbox");
const accumMiles = document.getElementById("accumMiles");
const form = document.querySelector("form");
const cancelBtn = document.getElementById("cancelBtn");

cancelBtn.addEventListener("click", () => (location.href = "./resume.html"));

// Inicializa dados do utilizador e obtém o utilizador autenticado
Users.init();
const user = Users.getUserLogged();

// Verifica se o utilizador está autenticado
if (!user) {
  window.location.href = "../index.html";
  // Termina a execução do script
  throw new Error("Utilizador não autenticado");
}

// Variáveis para guardar a viagem e os voos associados
let trip;
let flightsTrip;

// Se existir parâmetro id, obtém a viagem correspondente
if (id) {
  trip = Trips.getSingleTripById(id);
} else {
  // Caso contrário, tenta obter a viagem do sessionStorage
  const currentTripData = sessionStorage.getItem("currentTrip");
  if (currentTripData) {
    try {
      trip = JSON.parse(currentTripData);
    } catch (error) {
      trip = null;
    }
  }
}

// Se não houver dados da viagem, redireciona para o perfil
if (!trip) {
  window.location.href = "./profile.html";
}

// Guarda os voos da viagem
flightsTrip = Array.from(trip.flights);

/* MOCK DATA */
let finalPrice = trip.price;
let acummulatingMiles = trip.miles;
let tripName = trip.name;

// Quando a página carrega, preenche os dados de pagamento e configurações iniciais
window.addEventListener("DOMContentLoaded", () => {
  populatePayment();
  checkValue();
  populateAccumMiles();
  changePageTitle();
});

// Atualiza o label das milhas e verifica valor do preço
function populatePayment() {
  if (user && user.miles && user.miles.available !== undefined) {
    milesLabel.innerText = `Aplicar Milhas (${user.miles["available"]} disponíveis)`;

    checkValue();
  } else {
    milesLabel.innerText = "Aplicar Milhas (0 disponíveis)";
  }
  milesLabel.insertAdjacentHTML(
    "beforeend",
    `<span class="text-blue-600"> **</span>`
  );
}

// Atualiza o preço exibido na tela
function populatePrice(price) {
  priceLabel.innerText = price + "€";
}

// Altera o título da página para incluir o nome da viagem
function changePageTitle() {
  document.title = tripName + " - " + "Pagamento";
}

// Atualiza o campo de milhas acumuladas
function populateAccumMiles() {
  accumMiles.innerText = acummulatingMiles + " milhas";
}

// Formatação automática do número do cartão
document.getElementById("cardNumber").addEventListener("input", function () {
  let value = this.value.replace(/\D/g, ""); // Remove tudo que não for número
  value = value.replace(/(.{4})/g, "$1 ").trim(); // Adiciona espaço a cada 4 dígitos
  this.value = value;
});

// Permite apenas números no campo CVV
document.getElementById("cvv").addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, ""); // Remove tudo que não for número
});

// Formatação automática da data de validade no formato MM/AA
document.getElementById("expireDate").addEventListener("input", function () {
  let value = this.value.replace(/\D/g, ""); // Remove tudo que não for número
  if (value.length > 2) {
    value = value.slice(0, 2) + "/" + value.slice(2, 4); // Adiciona a barra após o mês
  }
  this.value = value.slice(0, 5); // Limita a 5 caracteres (MM/AA)
});

// Quando o checkbox de milhas é clicado, recalcula o valor do preço
milesCheckbox.addEventListener("click", () => {
  checkValue();
});

// Verifica se as milhas devem ser aplicadas e atualiza o preço exibido
function checkValue() {
  if (milesCheckbox.checked) {
    // Verifica se o utilizador tem milhas disponíveis
    if (user && user.miles && user.miles.available > 0) {
      // Aplica desconto usando milhas disponíveis do utilizador
      let discountedPrice = Helper.calculateDiscount(
        user.miles.available,
        finalPrice
      );
      populatePrice(discountedPrice);
    } else {
      // Se não tem milhas, desmarca o checkbox e exibe preço normal
      milesCheckbox.checked = false;
      populatePrice(finalPrice);
    }
  } else {
    // Exibe o preço normal
    populatePrice(finalPrice);
  }
}

// Handler do submit do formulário de pagamento
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Obtém o número do cartão
  const cardNumber = document.getElementById("cardNumber").value;

  // Valida os campos do formulário
  if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
    document
      .getElementById("cardNumber")
      .classList.add("border-red-300", "border-2");
    return;
  }

  // Calcula milhas a serem descontadas
  let milesToDraw = milesCheckbox.checked ? user.miles.available : 0;

  // Se não existir parâmetro id, significa que é uma nova viagem a ser criada
  if (!trip.id) {
    try {
      const flightObjects = Flights.getFlightsByIds(flightsTrip);
      const flightBadges = Flights.getFlightBadges(flightObjects);

      Users.addBadgestoUser(user.id, flightBadges);

      if (flightObjects.length === 0) {
        throw new Error("Voos não encontrados");
      }

      // Cria a viagem com os objetos de voo
      const newTrip = Trips.addTrip(
        flightObjects,
        flightsTrip,
        tripName,
        accumMiles
      );

      Users.addTripToUser(user.id, newTrip.id);

      // Atualiza as milhas
      Users.updateUserMiles(user.id, milesToDraw, acummulatingMiles);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Erro ao processar :/",
      });
      return;
    }
  } else {
    // Para viagem existente, apenas atualiza as milhas
    Users.updateUserMiles(user.id, milesToDraw, acummulatingMiles);
    Users.addTripToUser(user.id, trip.id);
  }

  let timerInterval;
  Swal.fire({
    title: "Pagamento Realizado com Sucesso",
    icon: "suceess",
    html: "O teu pagamento foi realizado com sucesso.<br/>Não te esqueças de deixar a tua avaliação na página da tua nova viagem.<br/>Obrigado por comprares connosco. Aproveita a tua viagem.",
    timer: 3000,
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
      Helper.clearSessionstorage();
      window.location.href = "./profile.html";
    },
  });
});
