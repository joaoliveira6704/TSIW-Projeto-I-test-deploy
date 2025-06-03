import * as User from "../models/UserModel.js";
import * as TourismTypes from "../models/TourismtypeModel.js";
import * as Flights from "../models/flightModel.js";

TourismTypes.init();
Flights.init();

const openLoginModalBtn = document.getElementById("openLoginModalBtn");

const closeModalBtn = document.getElementById("closeModalBtn");
const closeRegisterModalBtn = document.getElementById("closeRegisterModalBtn");

const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");

const modalContent = document.getElementById("modalContent");
const modalRegisterContent = document.getElementById("modalRegisterContent");

const reopenRegisterBtn = document.getElementById("signUpText");
const reopenLoginBtn = document.getElementById("signInText");

const profileBtn = document.getElementById("profileBtn");
const logoutBtn = document.getElementById("logoutBtn");

const logoutListSection = document.getElementById("logoutListSection");
const loggedModalList = document.getElementById("loggedModalList");

const packsOffersBtn = document.getElementById("packsOffersBtn");
const contactsBtn = document.getElementById("contactsBtn");

const today = new Date().toLocaleDateString("pt-PT");

/* --- Shared Logic --- */

function setupLogoutButton(selector) {
  const logoutBtn = document.getElementById(selector);
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      User.logout();
      closeSidebar();
      loggedModal?.classList?.add("hidden");
    });
  }
}

function setupAdminButton(selector) {
  const adminBtn = document.getElementById(selector);
  if (adminBtn) {
    adminBtn.addEventListener("click", () => {
      location.href = "./html/admin.html";
    });
  }
}

/* --- Login Modal --- */

openLoginModalBtn.addEventListener("click", () => {
  if (User.isLogged()) {
    const adminModalSection = document.getElementById("adminModalSection");

    if (User.isAdmin(User.getUserLogged())) {
      logoutListSection.classList.remove("last:rounded-b-xl");
      if (!adminModalSection) {
        loggedModalList.insertAdjacentHTML(
          "beforeend",
          `<li id="adminModalSection" class="hover:bg-gray-300 first:rounded-t-xl last:rounded-b-xl">
            <button id="adminBtn" class="flex w-full items-center gap-3 justify-between px-4 py-2 cursor-pointer">
              <span>Admin</span>
              <img src="./img/icons/blue/users.svg" alt="Admin" class="w-4 h-4"/>
            </button>
          </li>`
        );
        setupAdminButton("adminBtn");
      }
    } else if (adminModalSection) {
      adminModalSection.remove();
      logoutListSection.classList.add("last:rounded-b-xl");
    }

    loggedModal.classList.toggle("hidden");

    document.addEventListener("click", (e) => {
      if (
        !loggedModal.contains(e.target) &&
        !profileBtn.contains(e.target) &&
        !loginModal.contains(e.target) &&
        !openLoginModalBtn.contains(e.target)
      ) {
        loggedModal.classList.add("hidden");
      }
    });

    packsOffersBtn.addEventListener("click", () => {
      closeAndRedirect("desktop", "#packsOffers");
    });
    contactsBtn.addEventListener("click", () => {
      closeAndRedirect("desktop", "#contactsSect");
    });

    if (!loggedModal.classList.contains("hidden")) {
      onClickOutside(loggedModal, () => {
        loggedModal.classList.add("hidden");
      });
    }
  } else {
    loginModal.classList.remove("hidden");
    setTimeout(() => {
      modalContent.classList.remove("opacity-0", "scale-95");
      modalContent.classList.add("opacity-100", "scale-100");
    }, 10);
  }
});

profileBtn.addEventListener("click", () => {
  location.href = "./html/profile.html";
});

logoutBtn.addEventListener("click", () => {
  User.logout();
  loggedModal.classList.add("hidden");
});

/* --- Register Modal --- */

reopenRegisterBtn.addEventListener("click", () => {
  loginModal.classList.add("hidden");
  registerModal.classList.remove("hidden");
  setTimeout(() => {
    modalContent.classList.remove("opacity-100", "scale-100");
    modalContent.classList.add("opacity-0", "scale-95");
    modalRegisterContent.classList.remove("opacity-0", "scale-95");
    modalRegisterContent.classList.add("opacity-100", "scale-100");
  }, 10);
});

reopenLoginBtn.addEventListener("click", () => {
  registerModal.classList.add("hidden");
  loginModal.classList.remove("hidden");
  setTimeout(() => {
    modalRegisterContent.classList.remove("opacity-100", "scale-100");
    modalRegisterContent.classList.add("opacity-0", "scale-95");
    modalContent.classList.remove("opacity-0", "scale-95");
    modalContent.classList.add("opacity-100", "scale-100");
  }, 10);
});

/* --- Close Modals --- */

closeModalBtn.addEventListener("click", closeLoginModal);
closeRegisterModalBtn.addEventListener("click", closeRegisterModal);

window.addEventListener("click", (e) => {
  if (e.target === loginModal) {
    closeLoginModal();
  } else if (e.target === registerModal) {
    closeRegisterModal();
  }
});

function closeLoginModal() {
  modalContent.classList.remove("opacity-100", "scale-100");
  modalContent.classList.add("opacity-0", "scale-95");
  setTimeout(() => {
    loginModal.classList.add("hidden");
  }, 300);
}

function closeRegisterModal() {
  modalRegisterContent.classList.remove("opacity-100", "scale-100");
  modalRegisterContent.classList.add("opacity-0", "scale-95");
  setTimeout(() => {
    registerModal.classList.add("hidden");
  }, 300);
}

/* --- Sidebar --- */

const sideBar = document.getElementById("sidebar");
const navButtons = document.getElementById("navButtons");
const openProfileDropdownBtn = document.getElementById("profileSidebar");
const openFormDropdownBtn = document.getElementById("formSidebar");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");

let currentSidebarContent = null;

function openSidebar(contentType) {
  sidebarBackdrop.classList.remove("hidden");
  sidebarBackdrop.classList.add("block");
  sideBar.classList.remove("translate-x-full");
  navButtons.style.right = "14rem";
  currentSidebarContent = contentType;
}

function closeSidebar() {
  sideBar.classList.add("translate-x-full");
  navButtons.style.right = "0";
  currentSidebarContent = null;
  sideBar.innerHTML = "";
  openProfileDropdownBtn.classList.remove("activeSideBar");
  openFormDropdownBtn.classList.remove("activeSideBar");
  sidebarBackdrop.classList.add("hidden");
  sidebarBackdrop.classList.remove("block");
}

function populateProfileContent() {
  sideBar.innerHTML = `
    <div id="anchorDiv" class="right-0 transition">
      <ul id="loggedModalList">
        <li class="hover:bg-gray-300">
          <button onclick="location.href='./html/profile.html'" class="flex w-full items-center justify-between px-4 py-2 cursor-pointer">
            <span class="color-primary">Perfil</span>
            <img src="./img/icons/blue/profile.svg" alt="Perfil" class="w-4 h-4" />
          </button>
        </li>
        <li>
          <button
            id="packsOffersBtnMobile"
            class="flex hover:bg-gray-300 color-primary cursor-pointer gap-2 w-full items-center justify-between px-4 py-2"
          >
            <span>Packs e Ofertas</span>
            <img src="./img/icons/blue/coins.svg" alt="Log Out" class="w-4 h-4" />
          </button>
        </li>
        <li>
          <button
            id="contactsBtnMobile"
            class="flex hover:bg-gray-300 color-primary cursor-pointer gap-2 w-full items-center justify-between px-4 py-2"
          >
            <span>Contactos</span>
            <img src="./img/icons/blue/phone.svg" alt="Log Out" class="w-4 h-4" />
          </button>
        </li>
        <li id="logoutListSection" class="hover:bg-gray-300">
          <button id="logoutBtnMobile" class="flex w-full items-center justify-between px-4 py-2 cursor-pointer">
            <span class="color-primary">Terminar Sessão</span>
            <img src="./img/icons/blue/log-out.svg" alt="Perfil" class="w-4 h-4" />
          </button>
        </li>
      </ul>
    </div>
  `;

  packsOffersBtnMobile.addEventListener("click", () => {
    closeAndRedirect("mobile", "#packsOffers");
  });
  contactsBtnMobile.addEventListener("click", () => {
    closeAndRedirect("mobile", "#contactsSect");
  });

  if (User.isAdmin(User.getUserLogged())) {
    if (!document.getElementById("adminBtnMobile")) {
      sideBar.insertAdjacentHTML(
        "beforeend",
        `<li id="adminModalSection" class="color-primary list-none hover:bg-gray-300">
          <button id="adminBtnMobile" class="flex w-full items-center gap-3 justify-between px-4 py-2 cursor-pointer">
            <span>Admin</span>
            <img src="./img/icons/blue/users.svg" alt="Admin" class="w-4 h-4"/>
          </button>
        </li>`
      );
    }
    setupAdminButton("adminBtnMobile");
  }

  setupLogoutButton("logoutBtnMobile");

  openProfileDropdownBtn.classList.add("activeSideBar");
  openFormDropdownBtn.classList.remove("activeSideBar");
}

function populateFormContent() {
  sideBar.innerHTML = `
    <div class="flex justify-center bg-blue-900 w-full h-fit p-2 text-white">Procurar Viagens</div>
    <ul class="flex flex-col gap-1">
      <li class="flex flex-col p-3 gap-2 border-b-1 border-blue-900 text-blue-900 w-[95%] mx-auto">
        <div class="flex gap-3">
          <p>Selecionar Data</p>
          <img src="./img/icons/blue/calendar.svg" alt="calendarIcon" class="w-4" />
        </div>
        <input datepicker id="navbar-datepicker" type="text" datepicker-orientation="left" class="cursor-pointer" value="${today}" />
      </li>
      <li class="flex flex-col p-3 gap-2 border-b-1 border-blue-900 text-blue-900 w-[95%] mx-auto">
        <div class="flex gap-3">
          <p>Ponto de Partida</p>
          <img src="./img/icons/blue/pin.svg" alt="pinIcon" class="w-4" />
        </div>
        <input
    id="inputOriginSearchMobile"
    type="text"
    placeholder="Ex:'OPO'"
    class="border p-2"
    autocomplete = "off"
  />
      </li>
      <li class="flex flex-col p-3 gap-2 border-b-1 border-blue-900 text-blue-900 w-[95%] mx-auto">
        <div class="flex gap-3">
          <p>Turismo</p>
          <img src="./img/icons/blue/turism.svg" alt="turismIcon" class="w-4" />
        </div>
        <select id="tourismInput">
        </select>
      </li>
      <li class="flex flex-col p-3 gap-4 border-b-1 border-blue-900 text-blue-900 w-[95%] mx-auto">
        <div class="flex gap-3">
          <p>Nº Passageiros</p>
          <img src="./img/icons/blue/users.svg" alt="passengersIcon" class="w-4" />
        </div>
        <div class="flex items-center justify-center">
          <button type="button" id="mobileDecrementBtn" data-input-counter-decrement="mobile-counter-input" class="bg-gray-100 hover:bg-gray-200 inline-flex items-center justify-center border rounded-md h-fit w-fit p-1">
            <img src="./img/icons/blue/minus.svg" alt="minuesIcon" class="w-4" />
          </button>
          <input type="text" id="mobile-counter-input" data-input-counter class="shrink-0 text-blue-900 border-0 bg-transparent max-w-[2.5rem] text-center" value="1" required />
          <button type="button" id="mobileIncrementBtn" data-input-counter-increment="mobile-counter-input" class="bg-gray-100 hover:bg-gray-200 inline-flex items-center justify-center border rounded-md h-fit w-fit p-1">
            <img src="./img/icons/blue/plus.svg" alt="plusIcon" class="w-4" />
          </button>
        </div>
      </li>
      <li class="flex w-full justify-content">
        <button id="searchMobileBtn" class="mx-auto bg-blue-500 px-4 py-2 rounded-sm hover:bg-blue-700">Procurar</button>
      </li>
    </ul>
  `;

  openProfileDropdownBtn.classList.remove("activeSideBar");
  openFormDropdownBtn.classList.add("activeSideBar");

  const input = document.getElementById("navbar-datepicker");

  new Datepicker(input, {
    autohide: true,
    format: "dd-mm-yyyy",
    minDate: today,
  });

  const searchMobileBtn = document.getElementById("searchMobileBtn");
  searchMobileBtn.addEventListener("click", () => {
    sendFormQuery();
  });
}

function sendFormQuery() {
  const selectedDate = document.getElementById("navbar-datepicker").value;
  const origin = document.getElementById("inputOriginSearchMobile").value;
  const passengersCount = document.getElementById("mobile-counter-input").value;

  const typeOfTourism = document.getElementById("tourismInput").value;
  User.setUserQuery(selectedDate, origin, typeOfTourism, passengersCount);
  location.href = "./html/tripBuilder.html";
}

function closeAndRedirect(type, section) {
  if (type == "mobile") {
    closeSidebar();
  } else {
    loggedModal.classList.add("hidden");
  }
  location.href = section;
}

/* --- Sidebar Triggers --- */

openProfileDropdownBtn.addEventListener("click", () => {
  if (!User.isLogged()) {
    loginModal.classList.remove("hidden");
    setTimeout(() => {
      modalContent.classList.remove("opacity-0", "scale-95");
      modalContent.classList.add("opacity-100", "scale-100");
    }, 10);
    return;
  }

  if (currentSidebarContent === "profile") {
    closeSidebar();
  } else {
    populateProfileContent();
    openSidebar("profile");
  }
});

openFormDropdownBtn.addEventListener("click", () => {
  if (!User.isLogged()) {
    loginModal.classList.remove("hidden");
    setTimeout(() => {
      modalContent.classList.remove("opacity-0", "scale-95");
      modalContent.classList.add("opacity-100", "scale-100");
    }, 10);
    return;
  }

  if (currentSidebarContent === "form") {
    closeSidebar();
  } else {
    populateFormContent();
    openSidebar("form");
    populateData();
  }
});
const airportNameCache = {};

document.addEventListener("click", function (e) {
  const input = document.getElementById("inputOriginSearchMobile");
  const list = document.getElementById("mobileAirportsList");

  if (list && !list.contains(e.target) && e.target !== input) {
    list.remove();
  }
});

function populateData() {
  const tourismSelect = document.getElementById("tourismInput");
  const tourismTypes = TourismTypes.getAll();

  tourismSelect.innerHTML = `<option disabled selected>Selecionar</option>`;
  tourismTypes.forEach((type) => {
    tourismSelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${type.name}">${type.name}</option>`
    );
  });

  const inputOriginSearchMobile = document.getElementById(
    "inputOriginSearchMobile"
  );
  inputOriginSearchMobile.addEventListener("input", () => {
    const filterText = inputOriginSearchMobile.value;
    const filteredOrigins = Flights.getFilteredOrigins(filterText);
    renderMobileAirportList(filteredOrigins);
  });

  function renderMobileAirportList(origins) {
    const existingList = document.getElementById("mobileAirportsList");
    if (existingList) existingList.remove();

    const ul = document.createElement("ul");
    ul.id = "mobileAirportsList";
    ul.className =
      "absolute bg-white shadow-md w-full right-5 max-h-48 overflow-y-auto z-10 mt-20";

    const uniqueOrigins = [...new Set(origins)];
    const fetchPromises = uniqueOrigins.map((iata) => {
      if (airportNameCache[iata]) {
        return Promise.resolve({ iata, name: airportNameCache[iata] });
      }

      return fetchAirportName(iata).then((name) => {
        const safeName = name || "Unknown Airport";
        airportNameCache[iata] = safeName;
        return { iata, name: safeName };
      });
    });

    Promise.all(fetchPromises).then((airports) => {
      airports.forEach(({ iata, name }) => {
        const li = document.createElement("li");
        li.className =
          "hover:bg-gray-200 cursor-pointer px-4 py-2 text-blue-900";
        li.textContent = `${iata} - ${name}`;
        li.addEventListener("click", () => {
          inputOriginSearchMobile.value = iata;
          ul.remove();
        });
        ul.appendChild(li);
      });

      inputOriginSearchMobile.parentElement.appendChild(ul);
    });
  }
  const decrementBtn = document.getElementById("mobileDecrementBtn");
  const incrementBtn = document.getElementById("mobileIncrementBtn");
  const counterInput = document.getElementById("mobile-counter-input");

  decrementBtn.addEventListener("click", () => {
    let value = parseInt(counterInput.value) || 1;
    if (value > 1) counterInput.value = value - 1;
  });

  incrementBtn.addEventListener("click", () => {
    let value = parseInt(counterInput.value) || 1;
    counterInput.value = value + 1;
  });
}

sidebarBackdrop.addEventListener("click", () => {
  if (currentSidebarContent === "form" || currentSidebarContent === "profile") {
    closeSidebar();
  }
});

function fetchAirportName(iataCode) {
  const url = `https://airport-info.p.rapidapi.com/airport?iata=${iataCode}`;

  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "5a7f871babmsh993b19d7060d6f6p1efa56jsncee69110043c",
      "X-RapidAPI-Host": "airport-info.p.rapidapi.com",
    },
  };

  return fetch(url, options)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data.name;
    });
}
