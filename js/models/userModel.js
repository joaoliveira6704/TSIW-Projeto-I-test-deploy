let users;

// Load users from localstorage
export function init() {
  users = localStorage.users ? JSON.parse(localStorage.users) : [];
}

// Returns all users
export function getAllUsers() {
  return users;
}

// Returns user object by id
export function getUserById(id) {
  const numId = typeof id === "string" ? Number(id) : id;
  return users.find((user) => user.id === numId) || null;
}

export function userHasScratch(userCheck) {
  if (!userCheck) {
    return false;
  }
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return oneWeekAgo.toISOString().split("T")[0] >= userCheck.lastScratch; // YYYY-MM-DD format
}

// Updates a user by id
export function updateUser(id, { name, email, password, isAdmin }) {
  const numId = typeof id === "string" ? Number(id) : id;
  const user = users.find((user) => user.id === numId);
  if (users.some((user) => user.email === email && user.id !== numId)) {
    throw Error(`Já existe um utilizador com o email "${email}"!`);
  }
  user.name = name;
  user.email = email;
  if (password !== "") {
    user.password = password;
  }
  user.isAdmin = isAdmin === true || isAdmin === "true";

  localStorage.setItem("users", JSON.stringify(users));
}

// Updates the logged user
export function updateLoggedUser(id) {
  const user = users.find((u) => String(u.id) === String(id));
  if (!user) throw Error("Utilizador não encontrado!");

  localStorage.setItem("loggedUser", JSON.stringify(user));
  sessionStorage.setItem("loggedUser", JSON.stringify(user));
}

export function updateScratch(userCheck, milesWon) {
  const user = users.find((u) => String(u.id) === String(userCheck.id));
  const today = new Date();
  today.setDate(today.getDate());
  user.lastScratch = today.toISOString().split("T")[0];

  user.miles["available"] += milesWon;
  user.miles["total"] += milesWon;

  if (localStorage.getItem("loggedUser")) {
    localStorage.setItem("loggedUser", JSON.stringify(user));
  } else {
    sessionStorage.setItem("loggedUser", JSON.stringify(user));
  }
  localStorage.setItem("users", JSON.stringify(users));
}

// Add User
export function add(name, email, password, passwordConfirm) {
  if (password !== passwordConfirm) {
    throw Error("As Passwords não coincidem!");
  }

  if (users.some((user) => user.email === email)) {
    throw Error(`Já existe um utilizador com o email "${email}"!`);
  }

  const id = Date.now();
  users.push(new User(id, name, email, password));
  localStorage.setItem("users", JSON.stringify(users));
}

// User Login
export function login(email, password, keepSigned) {
  const user = users.find((user) => user.email === email);

  if (!user) {
    throw new Error("Não existe nenhum utilizador com o email introduzido!");
  }

  if (user.password !== password) {
    throw new Error("Password Incorreta!");
  }

  if (keepSigned) {
    localStorage.setItem("loggedUser", JSON.stringify(user));
  } else {
    sessionStorage.setItem("loggedUser", JSON.stringify(user));
  }
  return true;
}

// User Logout
export function logout() {
  sessionStorage.removeItem("loggedUser") ||
    localStorage.removeItem("loggedUser");
}

export function setUserQuery(date, origin, typeOfTourism, passengers) {
  const userQuery = {
    date: date || "",
    origin: origin || "",
    typeOfTourism: typeOfTourism || "",
    passengers: passengers || 1,
  };
  sessionStorage.setItem("userQuery", JSON.stringify(userQuery));
}

// Checks if user is logged in
export function isLogged() {
  return (
    !!sessionStorage.getItem("loggedUser") ||
    !!localStorage.getItem("loggedUser")
  );
}

// Checks if user is Admin
export function isAdmin(user) {
  return user.isAdmin;
}

// Returns the logged user
export function getUserLogged() {
  let user = sessionStorage.getItem("loggedUser");
  if (!user) {
    user = localStorage.getItem("loggedUser");
  }
  return user ? JSON.parse(user) : null;
}

// Delete user by ID
export function deleteUser(id) {
  const numId = typeof id === "string" ? Number(id) : id;

  const index = users.findIndex((user) => user.id === numId);

  users.splice(index, 1);
  localStorage.setItem("users", JSON.stringify(users));
}

// Delete pack from user
export function deletePack(id) {
  const packId = typeof id === "string" ? Number(id) : id;

  users.forEach((user) => {
    for (let i = user.trips.length - 1; i >= 0; i--) {
      if (user.trips[i].id === packId) {
        user.trips.splice(i, 1);
      }
    }
  });
  localStorage.setItem("users", JSON.stringify(users));
}

/**
 * User class
 */
class User {
  id = null;
  name = "";
  email = "";
  password = "";
  isAdmin = false;
  homeAirport = "";
  miles = { available: 0, total: 0 };
  trips = 0;
  badges = [];
  favorites = [];
  trips = [];
  lastScratch = "";
  tourismTypes = [];

  constructor(
    id,
    name,
    email,
    password,
    isAdmin,
    homeAirport,
    miles = { available: 0, total: 0 },
    badges = [],
    favorites = [],
    trips = [],
    lastScratch,
    tourismTypes = []
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.isAdmin = isAdmin;
    this.homeAirport = homeAirport;
    this.miles = miles;
    this.badges = badges;
    this.favorites = favorites;
    this.trips = trips;
    this.lastScratch = lastScratch;
    this.tourismTypes = tourismTypes;
  }
}
