// Variável para armazenar os tipos de turismo em memória
let tourismTypes;

// Carrega os tipos de turismo do localStorage
export function init() {
  tourismTypes = localStorage.tourismTypes
    ? JSON.parse(localStorage.tourismTypes)
    : [];
}

// Adiciona um novo tipo de turismo
export function add(name) {
  let tourismTypes = getAll();
  // Verifica se já existe um tipo de turismo com o mesmo nome (case insensitive)
  if (
    tourismTypes.some(
      (type) => String(type.name).toLowerCase() === name.toLowerCase()
    )
  ) {
    throw new Error(`Já existe um tipo de turismo com o nome "${name}"!`);
  }

  const id = Date.now();
  const newType = new TourismType(id, name);
  tourismTypes.push(newType);
  localStorage.setItem("tourismTypes", JSON.stringify(tourismTypes));
}

// Devolve todos os tipos de turismo
export function getAll() {
  return tourismTypes;
}

// Elimina um tipo de turismo pelo ID
export function deleteTourismType(id) {
  const numId = typeof id === "string" ? Number(id) : id;

  const index = tourismTypes.findIndex(
    (tourismType) => tourismType.id === numId
  );

  tourismTypes.splice(index, 1);
  localStorage.setItem("tourismTypes", JSON.stringify(tourismTypes));
}

// Função para pesquisa de tipos de turismo (exemplo: retorna true se for "Todos")
export function searchAllTypes(value) {
  if (value === "Todos") {
    return true;
  } else {
    return false;
  }
}

export function getTourismId(tourismQuery) {
  if (tourismQuery === "Todos" || tourismQuery === "Turismo") {
    return "todos";
  }
  let allTourismTypes = getAll();
  return allTourismTypes.find((type) => type.name === tourismQuery).id;
}

// Classe que representa um tipo de turismo
class TourismType {
  id = null;
  name = "";

  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}
