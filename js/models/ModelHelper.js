export function getAllCountries() {
  return fetch("https://restcountries.com/v3.1/all")
    .then((response) => response.json())
    .then((data) => data.map((country) => country.cca2));
}

export function formatDateToLabel(dateString) {
  const [year, month, day] = dateString.split("-");
  const currentYear = new Date().getFullYear().toString();

  if (year === currentYear) {
    return `${day}/${month}`;
  } else {
    return `${day}/${month}/${year}`;
  }
}
