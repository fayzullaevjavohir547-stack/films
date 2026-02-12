/* global films */
/**
 * films массив берётcя из films.js (глобальная переменная films)
 */

const els = {
  row: document.getElementById("filmsRow"),
  search: document.getElementById("searchInput"),
  empty: document.getElementById("emptyState"),
  clear: document.getElementById("btnClear"),
  favViewBtn: document.getElementById("btnFavView"),
  heroFavBtn: document.getElementById("heroFavBtn"),
};

const LS_KEY = "watch_favs_v1";
const state = {
  query: "",
  onlyFavs: false,
  favs: new Set(loadFavs()),
  heroFav: false,
};

function loadFavs() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveFavs() {
  localStorage.setItem(LS_KEY, JSON.stringify([...state.favs]));
}

function yearFromUnixSeconds(sec) {
  if (!sec) return "—";
  const d = new Date(sec * 1000);
  return String(d.getUTCFullYear());
}

function formatGenres(genres) {
  if (!Array.isArray(genres) || genres.length === 0) return "Action";
  return genres.slice(0, 2).join(" • ");
}

function createCard(film) {
  const card = document.createElement("article");
  card.className = "card";

  const img = document.createElement("div");
  img.className = "card__img";
  img.style.backgroundImage = `url("${film.poster}")`;

  const shade = document.createElement("div");
  shade.className = "card__shade";

  const fav = document.createElement("button");
  fav.type = "button";
  fav.className = "card__fav";
  fav.setAttribute("aria-label", "Add to favourites");
  fav.textContent = state.favs.has(film.id) ? "♥" : "♡";
  if (state.favs.has(film.id)) fav.classList.add("isFav");

  fav.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFav(film.id);
  });

  const body = document.createElement("div");
  body.className = "card__body";

  const title = document.createElement("div");
  title.className = "card__title";
  title.textContent = film.title;

  const meta = document.createElement("div");
  meta.className = "card__meta";
  meta.textContent = `${yearFromUnixSeconds(film.release_date)} | ${formatGenres(film.genres)}`;

  const pill = document.createElement("div");
  pill.className = "card__pill";
  pill.textContent = "Action info";

  body.appendChild(title);
  body.appendChild(meta);
  body.appendChild(pill);

  card.appendChild(img);
  card.appendChild(shade);
  card.appendChild(fav);
  card.appendChild(body);

  // optional: click to show overview
  card.addEventListener("click", () => {
    const text = film.overview ? film.overview : "No overview.";
    alert(`${film.title}\n\n${text}`);
  });

  return card;
}

function toggleFav(id) {
  if (state.favs.has(id)) state.favs.delete(id);
  else state.favs.add(id);
  saveFavs();
  render();
}

function getFilteredFilms() {
  const q = state.query.trim().toLowerCase();

  let list = Array.isArray(films) ? [...films] : [];

  if (q) {
    list = list.filter((f) => {
      const t = (f.title || "").toLowerCase();
      const g = Array.isArray(f.genres) ? f.genres.join(" ").toLowerCase() : "";
      return t.includes(q) || g.includes(q);
    });
  }

  if (state.onlyFavs) {
    list = list.filter((f) => state.favs.has(f.id));
  }

  return list;
}

function render() {
  const list = getFilteredFilms();

  els.row.innerHTML = "";
  list.forEach((film) => els.row.appendChild(createCard(film)));

  els.empty.hidden = list.length !== 0;

  // update favourites nav state
  if (state.onlyFavs) els.favViewBtn.classList.add("nav__item--active");
  else els.favViewBtn.classList.remove("nav__item--active");
}

function bind() {
  els.search.addEventListener("input", (e) => {
    state.query = e.target.value || "";
    render();
  });

  els.clear.addEventListener("click", () => {
    state.query = "";
    els.search.value = "";
    render();
  });

  els.favViewBtn.addEventListener("click", (e) => {
    e.preventDefault();
    state.onlyFavs = !state.onlyFavs;
    render();
  });

  // hero favourites (просто визуально как на макете)
  els.heroFavBtn.addEventListener("click", () => {
    state.heroFav = !state.heroFav;
    els.heroFavBtn.textContent = state.heroFav ? "♥" : "♡";
    els.heroFavBtn.classList.toggle("isFav", state.heroFav);
  });
}

bind();
render();
