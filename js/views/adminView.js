import * as User from "../models/UserModel.js";
import * as TourismTypes from "../models/TourismtypeModel.js";
import * as Flights from "../models/flightModel.js";
import * as Trips from "../models/TripModel.js";

User.init();
TourismTypes.init();
Flights.init();
Trips.init();

const body = document.querySelector("body");

const userTableList = document.getElementById("userTableList");
const tourismTypeTableList = document.getElementById("tourismTypeList");
const flightTableList = document.getElementById("flightTableList");
const packsTableList = document.getElementById("packsTableList");

window.addEventListener("load", (event) => {
  const isAdmin = User.isAdmin(User.getUserLogged());
  if (!isAdmin) {
    location.href = "../index.html";
  } else {
    body.classList.remove("hidden");
  }
  /* Users */
  const users = User.getAllUsers();

  userTableList.innerHTML = "";

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
          <button class="text-blue-500 hover:text-blue-300 rounded-md py-0.5 cursor-pointer edit-btn" data-id="${user.id}" data-modal-target="userEditModal"
                  data-modal-toggle="userEditModal">
            Editar
          </button>
          <button id="userDeleteBtn" class="text-blue-500 hover:text-blue-300 rounded-md py-0.5 cursor-pointer delete-btn" data-id="${user.id}">
            Apagar
          </button>
        </div>
      </td>
    `;

    userTableList.appendChild(row);
  });
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
              class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5"
            >
              <!-- Modal header -->
              <div
                class="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600"
              >
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Adicionar Utilizador
                </h3>
                <button
                  type="button"
                  class="text-gray-400 cursor-pointer bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  data-modal-target="userEditModal"
                  data-modal-toggle="userEditModal"
                >
                  <svg
                    aria-hidden="true"
                    class="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  <span class="sr-only">Fechar</span>
                </button>
              </div>
              <!-- Modal body -->
              <form id="userEditForm" class="p-4 md:p-5">
                <input type="hidden" id="editUserId" />
                <div class="grid gap-4 mb-4 sm:grid-cols-2">
                  <div>
                    <label
                      for="editName"
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Nome</label
                    >
                    <input
                      type="text"
                      name="name"
                      id="editName"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      for="editEmail"
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Email</label
                    >
                    <input
                      type="email"
                      name="email"
                      id="editEmail"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      for="editPassword"
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Password (opcional)</label
                    >
                    <input
                      type="password"
                      name="password"
                      id="editPassword"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      placeholder="Deixe em branco para manter"
                    />
                  </div>
                  <div>
                    <label
                      for="editIsAdmin"
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Tipo de Utilizador</label
                    >
                    <select
                      id="editIsAdmin"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
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

  const editUserBtn = document.getElementById("editUserBtn");
  const userEditForm = document.getElementById("userEditForm");
  const userEditModal = new Modal(document.getElementById("userEditModal"));

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
            isAdmin: document.getElementById("editIsAdmin").value,
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
      User.deleteUser(id);
      location.reload();
    }
  });

  /* Tourism Type */
  const tourismTypes = TourismTypes.getAll();

  tourismTypeTableList.innerHTML = "";

  tourismTypes.forEach((tourismType) => {
    const row = document.createElement("tr");
    row.className = "border-t py-3";

    row.innerHTML = `
      <td>${tourismType.id}</td>
      <td>${tourismType.name}</td>
      <td class="text-right">
          <button class="text-blue-500 hover:text-blue-300 rounded-md py-0.5 cursor-pointer delete-btn" data-id="${tourismType.id}">
            Apagar
          </button>
      </td>
    `;
    tourismTypeTableList.appendChild(row);
  });

  tourismTypeTableList.addEventListener("click", (event) => {
    const deleteBtn = event.target.closest(".delete-btn");
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      TourismTypes.deleteTourismType(id);
      location.reload();
    }
  });

  /* Flights */
  const flights = Flights.getAllFlights();
  flightTableList.innerHTML = "";

  flights.forEach((flight) => {
    const row = document.createElement("tr");
    row.className = "border-t py-3";

    row.innerHTML = `
      <td>${flight.id}</td>
      <td>${flight.origin}</td>
      <td>${flight.destination}</td>
      <td>${flight.price}€</td>
      <td>${formatDateToLabel(flight.departureTime)}</td>
      <td class="text-right">
        <button class="text-blue-500 hover:text-blue-300 rounded-md py-0.5 cursor-pointer delete-btn" data-id="${
          flight.id
        }">
            Apagar
          </button>
      </td>
    `;
    flightTableList.appendChild(row);
  });

  flightTableList.addEventListener("click", (event) => {
    const deleteBtn = event.target.closest(".delete-btn");
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      Flights.deleteFlight(id);
      location.reload();
    }
  });

  /* Packs */
  const packs = Trips.getAllPacks();
  packsTableList.innerHTML = "";

  packs.forEach((pack) => {
    const row = document.createElement("tr");
    row.className = "border-t py-3";

    row.innerHTML = `
      <td>${pack.id}</td>
      <td>${pack.name}</td>
      <td>${pack.price}€</td>
      <td>${formatDateToLabel(pack.startDate)} - ${formatDateToLabel(
      pack.endDate
    )}</td>
      <td class="text-right">
        <div class="inline-flex gap-4">
          <button class="text-blue-500 hover:text-blue-300 rounded-md py-0.5 cursor-pointer delete-btn" data-id="${
            pack.id
          }">
            Apagar
          </button>
        </div>
      </td>
    `;
    packsTableList.appendChild(row);
  });
  packsTableList.addEventListener("click", (event) => {
    const deleteBtn = event.target.closest(".delete-btn");
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      Trips.deleteTrip(id);
      User.deletePack(id);
      location.reload();
    }
  });
});

function formatDateToLabel(dateString) {
  const [datePart] = dateString.split("T");
  const [year, month, day] = datePart.split("-");
  const currentYear = new Date().getFullYear().toString();

  if (year === currentYear) {
    return `${day}/${month}`;
  } else {
    return `${day}/${month}/${year}`;
  }
}

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

function fillPackTripSelect() {
  const select = document.getElementById("packTripSelect");
  select.innerHTML = "";
  const trips = Trips.getAllNonPacks();
  trips.forEach((trip) => {
    const option = document.createElement("option");
    option.value = trip.id;
    option.textContent = `${trip.name} (${trip.price}€)`;
    select.appendChild(option);
  });
}

document
  .getElementById("packAddModal")
  .addEventListener("click", fillPackTripSelect);

const addPackForm = document.getElementById("addPackForm");

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
