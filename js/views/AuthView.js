import * as User from "../models/UserModel.js";

// Inicializa os dados dos utilizadores
User.init();

// Seleciona o formulário de login
const loginForm = document.getElementById("loginForm");

// Evento de submissão do formulário de login
loginForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Impede o comportamento padrão do formulário
  try {
    // Tenta autenticar o utilizador com os dados introduzidos
    User.login(
      document.getElementById("emailLogin").value,
      document.getElementById("passwordLogin").value,
      document.getElementById("keepSigned").checked
    );

    // Se o login for bem-sucedido, esconde o modal de login
    const loginModal = document.getElementById("loginModal");
    loginModal.classList.add("hidden");
  } catch (e) {
    // Se houver erro, mostra a mensagem de erro no formulário
    displayMessage(e.message);
  }
});

// Função para mostrar mensagens de erro ou sucesso nos formulários
function displayMessage(message, type = "error") {
  // Remove mensagens antigas do formulário de login
  const oldMessage = loginForm.querySelector(".text-red-500");
  if (oldMessage) {
    oldMessage.remove();
  }

  // Mostra mensagem no formulário de login
  loginForm.insertAdjacentHTML(
    "beforeend",
    `<p class='text-red-500 mt-2'>${message}</p>`
  );
  // Mostra mensagem no formulário de registo (se aplicável)
  const colorClass = type === "error" ? "text-red-500" : "text-green-500";
  registerForm.insertAdjacentHTML(
    "beforeend",
    `<p class='${colorClass} mt-2'>${message}</p>`
  );
}

// Seleciona o formulário de registo
const registerForm = document.getElementById("registerForm");

// Evento de submissão do formulário de registo
registerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  clearMessages(); // Limpa mensagens antigas
  const name = document.getElementById("nameRegister").value.trim();
  const email = document.getElementById("emailRegister").value.trim();
  const password = document.getElementById("passwordRegister").value;
  const passwordConfirm = document.getElementById("passwordConfirm").value;

  try {
    // Tenta adicionar o novo utilizador
    User.add(name, email, password, passwordConfirm);
    displayMessage("Registo efetuado com sucesso!", "success");
    registerForm.reset();
    setTimeout(() => {
      registerFormClose();
      User.login(email, password, false);
    }, 1000);
  } catch (error) {
    // Mostra mensagem de erro se falhar o registo
    displayMessage(error.message);
  }
});

// Função para limpar mensagens antigas do formulário de registo
function clearMessages() {
  const existing = registerForm.querySelector(".text-red-500, .text-green-500");
  if (existing) existing.remove();
}

// Função para fechar o modal de registo com animação
function registerFormClose() {
  modalRegisterContent.classList.remove("opacity-100", "scale-100");
  modalRegisterContent.classList.add("opacity-0", "scale-95");
  setTimeout(() => {
    registerModal.classList.add("hidden");
  }, 300);
}
