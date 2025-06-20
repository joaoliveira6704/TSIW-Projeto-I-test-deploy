// Importa os módulos necessários para gerir utilizadores, tipos de turismo, voos e viagens
import * as User from "../models/UserModel.js";
import * as TourismTypes from "../models/TourismtypeModel.js";
import * as Flights from "../models/FlightModel.js";
import * as Trips from "../models/TripModel.js";
import * as Helper from "../models/ModelHelper.js";
// Inicializa os dados das várias entidades
User.init();
TourismTypes.init();
Flights.init();
Trips.init();

const body = document.querySelector("body");

// Seletores das tabelas na página de administração
const userTableList = document.getElementById("userTableList");
const tourismTypeTableList = document.getElementById("tourismTypeList");
const flightTableList = document.getElementById("flightTableList");
const packsTableList = document.getElementById("packsTableList");

// Ao carregar a página, verifica se o utilizador é admin e preenche as tabelas
window.addEventListener("load", (event) => {
  setupFlightFormView();
  if (!User.getUserLogged()) {
    location.href = "../index.html";
  }
  const isAdmin = User.isAdmin(User.getUserLogged());
  if (!isAdmin) {
    // Se não for admin, redireciona para o index
    location.href = "../index.html";
  } else {
    body.classList.remove("hidden");
  }

  /* ----------- UTILIZADORES ----------- */
  const users = User.getAllUsers();
  userTableList.innerHTML = "";

  // Preenche a tabela de utilizadores
  users.forEach((user) => {
    let userType = User.isAdmin(user) ? "Admin" : "Normal";

    const row = document.createElement("tr");
    row.className = "border-t";

    row.innerHTML = `
      <td >${user.id}</td>
      <td class="text-center">${user.name}</td>
      <td class="text-center">${user.email}</td>
      <td class="text-center">${userType}</td>
      <td class="text-center">
        <div class="inline-flex gap-4">
          <button class="color-primary hover:opacity-60 rounded-md py-0.5 cursor-pointer edit-btn" data-id="${user.id}" data-modal-target="userEditModal"
                  data-modal-toggle="userEditModal">
            Editar
          </button>
          <button id="userDeleteBtn" class="color-primary hover:opacity-60 cursor-pointer delete-btn" data-id="${user.id}">
            Apagar
          </button>
        </div>
      </td>
    `;

    userTableList.appendChild(row);
  });

  // Modal de edição de utilizador (HTML inserido no body)
  body.insertAdjacentHTML(
    "beforeend",
    `<!-- User Edit -->
        <div
          id="userEditModal"
          tabindex="-1"
          aria-hidden="true"
          class="hidden backdrop-blur-sm bg-transparent overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full"
        >
          <div class="relative p-4 w-full max-w-2xl h-full md:h-auto">
            <!-- Modal content -->
            <div
              class="relative p-4 bg-blue-950 rounded-lg shadow sm:p-5"
            >
              <!-- Modal header -->
              <div
                class="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600"
              >
                <h3 class="text-lg font-semibold text-white dark:text-white">
                  Editar Utilizador
                </h3>
              </div>
              <!-- Modal body -->
              <form id="userEditForm" class="p-4 md:p-5">
                <input type="hidden" id="editUserId" />
                <div class="grid gap-4 mb-4 sm:grid-cols-2">
                  <div>
                    <label
                      for="editName"
                      class="block mb-2 text-sm font-medium text-white"
                      >Nome</label
                    >
                    <input
                      type="text"
                      name="name"
                      id="editName"
                      class="bg-gray-50 border bg-transparent border-gray-300 text-white text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                      required
                    />
                  </div>
                  <div>
                    <label
                      for="editEmail"
                      class="block mb-2 text-sm font-medium text-white"
                      >Email</label
                    >
                    <input
                      type="email"
                      name="email"
                      id="editEmail"
                      class="bg-gray-50 border bg-transparent border-gray-300 text-white text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      required
                    />
                  </div>
                  <div>
                    <label
                      for="editPassword"
                      class="block mb-2 text-sm font-medium text-white dark:text-white"
                      >Password (opcional)</label
                    >
                    <input
                      type="password"
                      name="password"
                      id="editPassword"
                      class="bg-gray-50 border border-gray-300 bg-transparent text-white text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      placeholder="Deixe em branco para manter"
                    />
                  </div>
                  <div>
                    <label
                      for="editIsAdmin"
                      class="block mb-2 text-sm font-medium text-white"
                      >Tipo de Utilizador</label
                    >
                    <select
                      id="editIsAdmin"
                      class="bg-gray-50 border border-gray-300 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 bg-transparent"
                    >
                      <option value="false">Normal</option>
                      <option value="true">Admin</option>
                    </select>
                  </div>
                </div>
                <button
                  id="editUserBtn"
                  class="btn-std cursor-pointer border-white! text-white! flex hover:bg-gray-400"
                >
                  <svg
                    class="mr-1 -ml-1 w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Guardar Alterações
                </button>
              </form>
            </div>
          </div>
        </div>`
  );

  // Seletores do modal de edição de utilizador
  const editUserBtn = document.getElementById("editUserBtn");
  const userEditForm = document.getElementById("userEditForm");
  const userEditModal = new Modal(document.getElementById("userEditModal"));

  // Eventos para editar ou apagar utilizadores
  userTableList.addEventListener("click", (event) => {
    const editBtn = event.target.closest(".edit-btn");
    if (editBtn) {
      event.preventDefault();

      const userId = editBtn.dataset.id;
      const user = User.getUserById(userId);
      userEditModal.show();
      if (user) {
        document.getElementById("editUserId").value = user.id;
        document.getElementById("editName").value = user.name;
        document.getElementById("editEmail").value = user.email;
        document.getElementById("editIsAdmin").value = User.isAdmin(user);
        document.getElementById("editPassword").value = "";

        userEditForm.onsubmit = function (e) {
          e.preventDefault();

          const updatedUser = {
            name: document.getElementById("editName").value,
            email: document.getElementById("editEmail").value,
            password: document.getElementById("editPassword").value,
            isAdmin: JSON.parse(document.getElementById("editIsAdmin").value),
          };

          try {
            User.updateUser(userId, updatedUser);
            location.reload();
          } catch (err) {
            displayMessage(userEditForm, err.message);
          }
        };
      }
    }

    const deleteBtn = event.target.closest(".delete-btn");
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      displayConfirmation(() => {
        try {
          const deleted = User.deleteUser(id);
          if (deleted) {
            location.reload();
          } else {
            Swal.fire({
              title: "Utilizador não encontrado!",
              icon: "warning",
              timer: 2000,
              timerProgressBar: true,
            });
          }
        } catch (e) {
          Swal.fire({
            title: "Ação Impossível!",
            icon: "error",
            html: "Não te podes apagar a ti próprio!",
            timer: 2000,
            timerProgressBar: true,
            showLoading: true,
          });
        }
      });
    }
  });

  /* ----------- VOOS -------------------- */

  const tourismTypeSelect = document.getElementById("tourismTypeSelect");
  const tourismTypesList = TourismTypes.getAll();

  tourismTypesList.forEach((tourismType) => {
    tourismTypeSelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${tourismType.id}">${tourismType.name}</option>`
    );
  });

  /* ----------- TIPOS DE TURISMO ----------- */
  const tourismTypes = TourismTypes.getAll();
  tourismTypeTableList.innerHTML = "";

  // Preenche a tabela de tipos de turismo
  tourismTypes.forEach((tourismType) => {
    const row = document.createElement("tr");
    row.className = "border-t py-3";

    row.innerHTML = `
      <td>${tourismType.id}</td>
      <td>${tourismType.name}</td>
      <td class="text-right">
          <button class="color-primary hover:opacity-60 cursor-pointer delete-btn" data-id="${tourismType.id}">
            Apagar
          </button>
      </td>
    `;
    tourismTypeTableList.appendChild(row);
  });

  // Evento para apagar tipos de turismo
  tourismTypeTableList.addEventListener("click", (event) => {
    const deleteBtn = event.target.closest(".delete-btn");
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      displayConfirmation(() => {
        TourismTypes.deleteTourismType(id);
        location.reload();
      });
    }
  });

  /* ----------- VOOS ----------- */
  const flights = Flights.getAllFlights();
  flightTableList.innerHTML = "";

  // Preenche a tabela de voos
  flights.forEach((flight) => {
    const row = document.createElement("tr");
    row.className = "border-t py-3";

    row.innerHTML = `
      <td>${flight.id}</td>
      <td>${flight.origin}</td>
      <td>${flight.destination}</td>
      <td>${flight.price}€</td>
      <td>${Helper.formatDateTimeToLabel(flight.departureTime)}</td>
      <td class="text-right">
        <button class="color-primary hover:opacity-60 cursor-pointer delete-btn" data-id="${
          flight.id
        }">
            Apagar
          </button>
      </td>
    `;
    flightTableList.appendChild(row);
  });

  // Evento para apagar voos
  flightTableList.addEventListener("click", (event) => {
    const deleteBtn = event.target.closest(".delete-btn");
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      displayConfirmation(() => {
        Flights.deleteFlight(id);
        location.reload();
      });
    }
  });

  /* ----------- PACKS ----------- */
  const packs = Trips.getAllPacks();
  packsTableList.innerHTML = "";

  // Preenche a tabela de packs
  packs.forEach((pack) => {
    const row = document.createElement("tr");
    row.className = "border-t py-3";

    row.innerHTML = `
      <td>${pack.id}</td>
      <td>${pack.name}</td>
      <td>${pack.price}€</td>
      <td>${Helper.formatDateToLabel(
        pack.startDate
      )} - ${Helper.formatDateToLabel(pack.endDate)}</td>
      <td class="text-right">
        <div class="inline-flex gap-4">
          <button class="color-primary hover:opacity-60 cursor-pointer delete-btn" data-id="${
            pack.id
          }">
            Apagar
          </button>
        </div>
      </td>
    `;
    packsTableList.appendChild(row);
  });

  // Evento para apagar packs
  packsTableList.addEventListener("click", (event) => {
    const deleteBtn = event.target.closest(".delete-btn");
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      displayConfirmation(() => {
        Trips.deleteTrip(id);
        location.reload();
      });
    }
  });
});

// Adicionar utilizador
const addUserBtn = document.getElementById("addUserBtn");
const userAddForm = document.getElementById("userAddForm");

addUserBtn.addEventListener("click", (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const passwordConfirm = document.getElementById("passwordConfirm").value;

  try {
    User.add(name, email, password, passwordConfirm);
  } catch (e) {
    displayMessage(userAddForm, e);
    return;
  }

  location.reload();
});

// Adicionar tipo de turismo
const addTourismTypeBtn = document.getElementById("addTourismTypeBtn");
const tourismTypeAddForm = document.getElementById("tourismTypeAddForm");

addTourismTypeBtn.addEventListener("click", (event) => {
  event.preventDefault();

  const nameInput = tourismTypeAddForm.querySelector("#name");
  const name = nameInput.value;

  displayMessage(tourismTypeAddForm, "", "clear");

  try {
    TourismTypes.add(name);
    location.reload();
  } catch (e) {
    displayMessage(tourismTypeAddForm, e.message || e);
  }
});

// Preenche o select de viagens para packs
function fillPackTripSelect() {
  const select = document.getElementById("packTripSelect");
  select.innerHTML = "";
  const input = document.getElementById("packPrice");
  const trips = Trips.getAllNonPacks();
  trips.forEach((trip) => {
    const option = document.createElement("option");
    option.value = trip.id;
    option.textContent = `${trip.name} (${trip.price}€)`;
    select.appendChild(option);
    option.addEventListener("click", () => {
      input.setAttribute("max", trip.price);
      input.value = trip.price;
    });
  });
}

// Evento para abrir o modal de adicionar pack e preencher o select
document
  .getElementById("addPack")
  .addEventListener("click", fillPackTripSelect);

const addPackForm = document.getElementById("addPackForm");

// Evento para adicionar um novo pack
addPackForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const tripId = document.getElementById("packTripSelect").value;
  const newPrice = Number(document.getElementById("packPrice").value);

  try {
    Trips.setPackAndPrice(tripId, newPrice);
    location.reload();
  } catch (e) {
    displayMessage(addPackForm, e.message);
  }
});

// Função para mostrar mensagens de erro ou sucesso nos formulários
function displayMessage(form, message, type = "error") {
  const oldMessage = form.querySelector(".text-red-500, .text-green-500");
  if (oldMessage) {
    oldMessage.remove();
  }

  if (type === "flight") {
    if (form.querySelector("#errorWrapper")) {
      form.querySelector("#errorWrapper").remove();
    }
    const colorClass = "text-red-500";
    form.insertAdjacentHTML("beforeend", `<div id="errorWrapper"></div>`);
    const errorWrapperNew = form.querySelector("#errorWrapper");

    // Garante que message é um array antes de usar forEach
    const messageArray = Array.isArray(message) ? message : [message];

    messageArray.forEach((part) => {
      errorWrapperNew.insertAdjacentHTML(
        "beforeend",
        `<p class='${colorClass} mt-2'>- ${part}</p>`
      );
    });
    return;
  }

  if (type === "clear" || !message) return;
  const colorClass = type === "error" ? "text-red-500" : "text-green-500";
  form.insertAdjacentHTML(
    "beforeend",
    `<p class='${colorClass} mt-2'>${message}</p>`
  );
}

let pendingDelete = null;

// Função que mostra o modal de confirmação antes de apagar um item
function displayConfirmation(onConfirm) {
  // Remove qualquer modal antigo de confirmação que possa existir
  const oldModal = document.querySelector("#confirmDeleteModal");
  if (oldModal) oldModal.remove();

  // Referência ao body
  const body = document.body;

  // Adiciona o HTML do modal de confirmação ao body
  body.insertAdjacentHTML(
    "beforeend",
    `<!-- Main modal -->
      <div id="confirmDeleteModal" tabindex="-1" class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-modal md:h-full">
          <div class="relative p-4 w-full max-w-md h-full md:h-auto">
              <div class="relative p-4 text-center bg-blue-950 rounded-lg shadowsm:p-5">
                  <button id="closeDeleteModal" type="button" class="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                      <span class="sr-only">Close modal</span>
                  </button>
                  <svg class="text-gray-400 dark:text-gray-500 w-11 h-11 mb-3.5 mx-auto" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                  <p class="mb-4 text-gray-500 dark:text-gray-300">Apagar Item?</p>
                  <div class="flex justify-center items-center space-x-4">
                  <button id="deleteConfirmBtn" class="py-2 px-3 text-sm cursor-pointer font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900">
                          Apagar
                      </button>    
                  <button id="deleteCancelBtn" type="button" class="py-2 px-3 text-sm font-medium text-white cursor-pointer rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10">
                         Cancelar
                      </button>
                  </div>
              </div>
          </div>
      </div>`
  );

  const modal = document.getElementById("confirmDeleteModal");
  modal.classList.remove("hidden");

  // Se o utilizador confirmar, remove o modal e executa a função de confirmação
  document.getElementById("deleteConfirmBtn").onclick = function () {
    modal.remove();
    if (typeof onConfirm === "function") onConfirm();
  };

  // Se cancelar, remove o modal e limpa o pendingDelete
  document.getElementById("deleteCancelBtn").onclick = function () {
    modal.remove();
    pendingDelete = null;
  };

  // Se fechar o modal no X, também remove e limpa o pendingDelete
  document.getElementById("closeDeleteModal").onclick = function () {
    modal.remove();
    pendingDelete = null;
  };
}

const flightForm = document.getElementById("flightAddForm");
const addPoiBtn = document.getElementById("addPoiBtn");
const poiWrapper = document.getElementById("poiWrapper");

// Adiciona campos para pontos de interesse (POI) ao formulário de voo
if (addPoiBtn && poiWrapper) {
  addPoiBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Conta atual de POIs para IDs únicos
    const poiCount = poiWrapper.querySelectorAll("[data-poi-container]").length;

    poiWrapper.insertAdjacentHTML(
      "beforeend",
      `<div class="block sm:flex gap-4 mb-4 p-4 border border-gray-300 rounded-lg" data-poi-container>
        <div class="flex-1">
          <label for="poiName${poiCount}" class="block mb-2 text-sm font-medium dark:text-white">
            Nome do POI
          </label>
          <input
            type="text"
            name="poiName${poiCount}"
            id="poiName${poiCount}"
            class="border border-gray-300 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 text-white bg-transparent"
            placeholder="Nome do ponto de interesse"
            required
          />
        </div>
        <div class="flex-1">
          <label for="poiLat${poiCount}" class="block mb-2 text-sm font-medium dark:text-white">
            Latitude
          </label>
          <input
            type="number"
            step="0.000001"
            name="poiLat${poiCount}"
            id="poiLat${poiCount}"
            class="border border-gray-300 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 text-white bg-transparent"
            placeholder="Latitude"
            required
          />
        </div>
        <div class="flex-1">
          <label for="poiLong${poiCount}" class="block mb-2 text-sm font-medium dark:text-white">
            Longitude
          </label>
          <input
            type="number"
            step="0.000001"
            name="poiLong${poiCount}"
            id="poiLong${poiCount}"
            class="border border-gray-300 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 text-white bg-transparent"
            placeholder="Longitude"  
            required
          />
        </div>
        <div class="flex items-end">
          <button type="button" class="remove-poi-btn px-3 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700">
            Remover
          </button>
        </div>
      </div>`
    );

    // Adiciona evento ao botão de remover POI
    const removeButtons = poiWrapper.querySelectorAll(".remove-poi-btn");
    const lastRemoveButton = removeButtons[removeButtons.length - 1];
    lastRemoveButton.addEventListener("click", function () {
      this.closest("[data-poi-container]").remove();
    });
  });
}

// Extrai os dados do formulário de voo
function extractFormData() {
  const formData = {
    origin: document.getElementById("origin").value.toUpperCase(),
    originName: document.getElementById("originName").value,
    destination: document.getElementById("dest").value.toUpperCase(),
    destinationName: document.getElementById("destinName").value,
    departureTime: document.getElementById("departureTime").value,
    arrivalTime: document.getElementById("arrivalTime").value,
    price: document.getElementById("price").value,
    duration: Flights.calculateDurationInMinutes(
      document.getElementById("departureTime").value,
      document.getElementById("arrivalTime").value
    ),
    company: document.getElementById("company").value,
    distance: document.getElementById("distance").value,
    originLat: document.getElementById("originLat").value,
    originLong: document.getElementById("originLong").value,
    destinLat: document.getElementById("destLat").value,
    destinLong: document.getElementById("destLong").value,
    tourismTypes: getTourismTypesFromForm(),
    poi: getPoisFromForm(),
    badge: document.getElementById("badge").value,
  };

  return formData;
}

// Extrai os tipos de turismo selecionados do formulário
function getTourismTypesFromForm() {
  const tourismSelect = document.getElementById("tourismTypeSelect");
  const selectedOptions = Array.from(tourismSelect.selectedOptions);
  const tourismTypes = selectedOptions.map((option) => parseInt(option.value));
  return tourismTypes;
}

// Extrai todos os pontos de interesse do formulário
function getPoisFromForm() {
  const poiWrapper = document.getElementById("poiWrapper");
  if (!poiWrapper) return [];

  const poiContainers = poiWrapper.querySelectorAll("[data-poi-container]");
  const pois = [];

  poiContainers.forEach((container, index) => {
    const nameInput =
      container.querySelector(`[name="poiName${index}"]`) ||
      container.querySelector(`[name*="poiName"]`);
    const latInput =
      container.querySelector(`[name="poiLat${index}"]`) ||
      container.querySelector(`[name*="poiLat"]`);
    const longInput =
      container.querySelector(`[name="poiLong${index}"]`) ||
      container.querySelector(`[name*="poiLong"]`);

    if (
      nameInput &&
      latInput &&
      longInput &&
      nameInput.value.trim() &&
      latInput.value.trim() &&
      longInput.value.trim()
    ) {
      pois.push({
        name: nameInput.value.trim(),
        latitude: parseFloat(latInput.value),
        long: parseFloat(longInput.value),
      });
    }
  });

  return pois;
}

// Dá reset ao formulário e fecha o modal
function resetFormAndCloseModal() {
  // Fecha o modal de adicionar voo
  const modal = document.getElementById("flightAddModal");
  if (modal) {
    modal.classList.add("hidden");
  }

  // Dá reset ao formulário
  if (flightForm) {
    flightForm.reset();
    location.reload();
    // Limpa os POIs
    if (poiWrapper) {
      poiWrapper.innerHTML = "";
    }
    // Limpa mensagens de erro
    displayMessage(flightForm, null, "clear");
  }
}

// Mostra mensagem de sucesso ao adicionar voo
function showSuccessMessage(flight) {
  alert(
    `Voo ${flight.originName} → ${flight.destinationName} adicionado com sucesso!`
  );
}

// Handler principal para submissão do formulário de voo
function handleFormSubmission(e) {
  e.preventDefault();

  try {
    // Extrai os dados do formulário
    const formData = extractFormData();

    // Valida os dados
    const validationErrors = Helper.validateFormData(formData);

    if (validationErrors.length > 0) {
      displayMessage(flightForm, validationErrors, "flight");
      return;
    }

    // Verifica se o serviço de voos está disponível
    if (typeof Flights === "undefined" || !Flights.saveFlightFromData) {
      throw new Error("Flights service not available");
    }

    // Guarda o voo através do modelo
    const savedFlight = Flights.saveFlightFromData(formData);

    // Mostra sucesso e faz reset ao formulário
    showSuccessMessage(savedFlight);
    resetFormAndCloseModal();
  } catch (error) {
    displayMessage(flightForm, [error.message || error.toString()], "flight");
  }
}

// Configura os listeners do formulário de voo
export function setupFlightFormView() {
  if (flightForm) {
    flightForm.addEventListener("submit", handleFormSubmission);
  }
}

const backdrop = flightAddModal.querySelector(".backdrop-blur-sm");
const closeFlightModal = flightAddModal.querySelector("#closeFlightModal");
const flightOpenBtn = flightAddModal.querySelector("#addFlight");

// Function to close modal and handle cleanup
function closeModalAndReopen() {
  flightAddModal.removeAttribute("role");
  flightAddModal.classList.remove("flex");
  const bgGray = document.querySelectorAll(".dark\\:bg-gray-900\\/80");
  flightAddModal.classList.add("hidden");
  bgGray.forEach((bg) => bg.remove());
  body.classList.remove("overflow-hidden");

  // Auto-click the flight open button after closing
  setTimeout(() => {
    if (flightOpenBtn) {
      flightOpenBtn.click();
    }
  }, 100);
}

// Backdrop click handler
backdrop.addEventListener("click", closeModalAndReopen);

// Close button click handler
closeFlightModal.addEventListener("click", closeModalAndReopen);

// Inicializa o setup do formulário de voo quando o DOM está pronto
document.addEventListener("DOMContentLoaded", function () {});
