export function getAllCountries() {
  return fetch("https://restcountries.com/v3.1/all")
    .then((response) => response.json())
    .then((data) => data.map((country) => country.cca2));
}
