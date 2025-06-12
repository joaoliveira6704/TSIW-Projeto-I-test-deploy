// Importa módulos de utilizadors e funções auxiliares
import * as Users from "../models/userModel.js";
import * as Helper from "../models/ModelHelper.js";

// Seleciona elementos do DOM para manipulação posterior
const milesLabel = document.getElementById("milesLabel");
const priceLabel = document.getElementById("priceLabel");
const milesCheckbox = document.getElementById("milesCheckbox");
const accumMiles = document.getElementById("accumMiles");

// Inicializa dados do utilizador e obtém o utilizador logado
Users.init();
const user = Users.getUserLogged();

// Quando a página carrega, popula os dados de pagamento e configurações iniciais
window.addEventListener("DOMContentLoaded", () => {
  populatePayment();
  checkValue();
  populateAccumMiles();
  changePageTitle();
});

/* MOCK DATA */
let finalPrice = 679;
let acummulatingMiles = 642;
let tripName = "Viagem à Islândia";

// Atualiza o label das milhas e verifica valor do preço
function populatePayment() {
  milesLabel.innerText = `Aplicar Milhas (${user.miles["available"]} disponíveis)`;
  checkValue();
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
    // Aplica desconto usando milhas disponíveis do utilizador
    let discountedPrice = Helper.calculateDiscount(
      user.miles["available"],
      finalPrice
    );
    populatePrice(discountedPrice);
  } else {
    // Exibe o preço normal
    populatePrice(finalPrice);
  }
}
