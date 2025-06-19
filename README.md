# 🌍 Compass - Aplicação Web de Viagens

Uma aplicação web moderna e responsiva para descobrir, reservar e gerir experiências de viagem — com uma interface apelativa, personalização de utilizador e painel administrativo para gestão de utilizadores e voos.

---

## 📖 Índice

- [Introdução](#introdução)
- [Funcionalidades](#funcionalidades)
- [Instalação](#instalação)
- [Utilização](#utilização)
- [Dependências](#dependências)
- [Contribuidores](#contribuidores)
- [Licença](#licença)

---

## 🧭 Introdução

**Compass** é uma plataforma web de viagens que permite aos utilizadores:

- Explorar destinos e ofertas de viagem
- Gerir o seu perfil, favoritos e milhas acumuladas
- Visualizar medalhas/passaporte digital
- Administrar utilizadores e voos (modo admin)

Foi construída com foco em responsividade, experiência de utilizador e tecnologias modernas como **Tailwind CSS**, **SwiperJS**, **Choices.js** e **SweetAlert2**.

---

## ✨ Funcionalidades

### Utilizador

- Painel de perfil com estatísticas e edição de dados
- Listagem de destinos favoritos e medalhas
- Visualização dinâmica de ofertas
- Modais interativos (Favoritos e Passaporte)

### Admin

- Adição, edição e remoção de utilizadores
- Gestão de voos com dados completos (origem, destino, companhia, distância, etc.)
- Interface em acordeão com suporte para modais

### Interface

- Totalmente responsiva (mobile, tablet, desktop)
- Compatibilidade com modo escuro
- Animações suaves e navegação moderna
- Secção de landing com imagem ou vídeo

---

## 🛠 Instalação

1. Clonar o repositório:

```bash
git clone https://github.com/teu-utilizador/compass-viagens.git
cd compass-viagens
```

2. Abrir com liveServer:

```bash
127.0.0.1:5500
```

---

## ▶️ Utilização

### Páginas principais

- index.html: Página de entrada com formulário de pesquisa de voos, ofertas, secção "Sobre" e contactos.

- profile.html: Área do utilizador com estatísticas, favoritos e viagens.

- admin.html: Interface de administração (CRUD): Gerir voos, tipos de turismo, viagens e utilizadores.

- tripBuilder.html: Página de construção de voos. Inclui listas interativas, mapa de pesquisa, etc...

- select-flight.html: Página de seleção de voos.

- resume.html: Página com resumo de voos, antes do pagamento ou após a compra de viagem. Função de impressão e reviews.

- payment.html: Área de pagamento da viagem.

### Navegação

- Barra de navegação e sidebar para mobile.

- Suporte para modais de passaporte e favoritos.

- Sliders/carrosséis com SwiperJS para ofertas e funcionalidades

---

## 📦 Dependências e tecnologias

- TailwindCSS: Estilização.

- SwiperJS: Sliders/Carrosséis.

- SweetAlert2: Modais personalizados.

- Scratchcard-js: Raspadinha para ganhar milhas.

- Pexels: API de imagens para as viagens e pontos de interesse.

- RapidAPI (Airport Info): Obter nomes de aeroportos.

- SortableJS: Listas arrastáveis.

- Leaflet: Mapa interativo.

- GTranslate: Tradução do website.

---

## 👥 Contribuidores

- 🧑‍💻 João Oliveira [![GitHub - joaoliveira6704](https://img.shields.io/badge/GitHub-joaoliveira6704-181717?style=flat&logo=github&logoColor=white)](https://github.com/joaoliveira6704)

- 🧑‍💻 Miguel Neto [![GitHub - migueljc-neto](https://img.shields.io/badge/GitHub-migueljc--neto-181717?style=flat&logo=github&logoColor=white)](https://github.com/migueljc-neto)

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Consulta o ficheiro LICENSE.md para mais detalhes.
