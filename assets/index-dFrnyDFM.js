(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const timeoutDebounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    return new Promise((resolve) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const result = await fn(...args);
        resolve(result);
      }, delay);
    });
  };
};
const $ = (selector, scope = document) => {
  if (!selector) throw new Error("Selector is not selected");
  return scope.querySelector(selector);
};
const $$ = (selector, scope = document) => {
  if (!selector) throw new Error("Selector is not selected");
  return scope.querySelectorAll(selector);
};
const parseAttribute = (attribute) => {
  return Object.entries(attribute).map(([key, value]) => `${key}="${value}"`).join("");
};
const isTarget = (target, {
  targetSelector,
  parentSelector
}) => {
  const children = $$(targetSelector, $(parentSelector));
  if (target instanceof Element && children)
    return [...children].includes(target) || target.closest(targetSelector);
  return false;
};
function Core() {
  const options2 = {
    events: [],
    root: null,
    rootComponent: null
  };
  const _render = timeoutDebounce(() => {
    const { root, rootComponent } = options2;
    if (!root || !rootComponent) return;
    root.innerHTML = rootComponent();
    _addEvent();
    options2.events = [];
  }, 100);
  function render2(rootComponent, root) {
    options2.root = root;
    options2.rootComponent = rootComponent;
    _render();
  }
  function useEvents2(parentSelector) {
    function addEvent(event, targetSelector, callback) {
      const { events } = options2;
      events.push({ event, targetSelector, parentSelector, callback });
    }
    return [addEvent];
  }
  function _addEvent() {
    options2.events.forEach(
      ({ parentSelector, targetSelector, event, callback }) => {
        var _a;
        (_a = $(parentSelector)) == null ? void 0 : _a.addEventListener(event, (e) => {
          const $parent = $(parentSelector);
          if (isTarget(e.target, { targetSelector, parentSelector }) && $parent)
            callback(e);
        });
      }
    );
  }
  function reRender2() {
    _render();
  }
  return { useEvents: useEvents2, render: render2, reRender: reRender2 };
}
const { useEvents, render, reRender } = Core();
let currentPage = 1;
let movies = [];
let movieDetail;
let searchInputValue = "";
let searchResults = [];
let totalResults = 0;
const setMovies = (newMovies) => {
  movies = newMovies;
  reRender();
};
const setMovieDetail = (detail) => {
  movieDetail = detail;
  reRender();
};
const setSearchInputValue = (value) => {
  searchInputValue = value;
  reRender();
};
const setSearchResults = (results) => {
  searchResults = results;
  reRender();
};
const setTotalResults = (total) => {
  totalResults = total;
  reRender();
};
const appendMovies = (newMovies) => {
  movies = [...movies, ...newMovies];
  currentPage += 1;
  reRender();
};
const appendSearchResults = (newResults) => {
  searchResults = [...searchResults, ...newResults];
  currentPage += 1;
  reRender();
};
const resetPage = () => {
  currentPage = 1;
};
const setIsLoading = (value) => {
  reRender();
};
let isError = false;
const setIsError = (value) => {
  isError = value;
  reRender();
};
let isMoreError = false;
const setIsMoreError = (value) => {
  isMoreError = value;
  reRender();
};
let isSearchError = false;
const setIsSearchError = (value) => {
  isSearchError = value;
  reRender();
};
let isModalOpen = false;
const setIsModalOpen = (value) => {
  isModalOpen = value;
  reRender();
};
const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwOTNjMDVjNDZlNDcyN2MxY2FmMWE2NDg3MzdjMjc1OSIsIm5iZiI6MTc0MjQ0NjIzNy40MTI5OTk5LCJzdWIiOiI2N2RiOWU5ZDA4Y2I1ZWI3MjdlNzk2YzQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Now1gxm-JGqrn9JDSOavAZRtoCFKXiNiy4-Ib-VA8Do"}`
  }
};
const url = {
  popular: (page) => `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=ko-KR&page=${page}&sort_by=popularity.desc`,
  search: (query) => `https://api.themoviedb.org/3/search/movie?include_adult=false&language=ko-KR&page=1&query=${encodeURIComponent(
    query
  )}`,
  more: (page) => `https://api.themoviedb.org/3/search/movie?include_adult=false&language=ko-KR&page=${page}&query=${encodeURIComponent(
    searchInputValue
  )}`,
  detail: (id) => `https://api.themoviedb.org/3/movie/${id}?language=ko-KR`
};
const initMovie = {
  adult: false,
  backdrop_path: "",
  genre_ids: [],
  id: 0,
  original_language: "",
  original_title: "",
  overview: "",
  popularity: 0,
  poster_path: "",
  release_date: "",
  title: "",
  video: false,
  vote_average: 0,
  vote_count: 0,
  isLoading: true
};
const useGetMoreMovieList = () => {
  const fetchMoreMovies = async (callback) => {
    const nextPage = currentPage + 1;
    if (searchInputValue.trim()) {
      try {
        const response = await fetch(url.more(nextPage), options);
        const data = await response.json();
        appendSearchResults(data.results);
        return data.results;
      } catch (error) {
        console.error("Error fetching search results:", error);
        setIsMoreError(true);
      }
      return null;
    } else {
      const newMovies = await callback(nextPage);
      if (newMovies) {
        appendMovies(newMovies);
      }
      return newMovies;
    }
  };
  return { fetchMoreMovies };
};
const useGetMovieList = () => {
  const fetchMovies = async (page) => {
    try {
      const response = await fetch(url.popular(page), options);
      const data = await response.json();
      if (data) {
        setIsLoading(false);
      }
      setTotalResults(data.total_results);
      return data.results.map((result) => ({ ...result, isLoading: false }));
    } catch (error) {
      setIsError(true);
      console.error("Error fetching data in App:", error);
    }
    return null;
  };
  return { fetchMovies };
};
const images = {
  logo: "./logo.png",
  starEmpty: "./star_empty.png",
  starFull: "./star_filled.png",
  woowacourse: "./woowacourse_logo.png",
  search: "./search.png"
};
const observeLastMovie = () => {
  const { fetchMovies } = useGetMovieList();
  const { fetchMoreMovies } = useGetMoreMovieList();
  setTimeout(() => {
    const movieItems = document.querySelectorAll(".thumbnail-list li");
    const lastMovie = movieItems[movieItems.length - 1];
    if (!lastMovie) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.unobserve(lastMovie);
          fetchMoreMovies(fetchMovies).then((result) => {
            if (result.length !== 0) {
              setTimeout(observeLastMovie, 500);
            }
          });
        }
      },
      { threshold: 1 }
    );
    observer.observe(lastMovie);
  }, 100);
};
const VOTE_TEXT = [
  "최악이에요(2/10)",
  "별로예요(4/10)",
  "보통이예요(6/10)",
  "재밌었어요(8/10)",
  "명작이예요(10/10)"
];
const MovieDetail = () => {
  const [addEvent] = useEvents(".modal");
  const handleEscapeKey = (event) => {
    if (event.key === "Escape") {
      setIsModalOpen(false);
      document.removeEventListener("keydown", handleEscapeKey);
      observeLastMovie();
    }
  };
  document.addEventListener("keydown", handleEscapeKey);
  addEvent("click", ".close-modal", () => {
    $(".modal-background").classList.remove("active");
    setIsModalOpen(false);
    setTimeout(() => {
      observeLastMovie();
    }, 500);
  });
  addEvent("click", ".my-vote-star", (event) => {
    const target = event.target.closest(
      ".my-vote-star"
    );
    if (!target || !target.dataset.index) return;
    if (movieDetail)
      window.localStorage.setItem(
        JSON.stringify(movieDetail.id),
        target.dataset.index
      );
  });
  addEvent("mouseover", ".my-vote-star", (event) => {
    const target = event.target.closest(
      ".my-vote-star"
    );
    if (!target || !target.dataset.index) return;
    const index = Number(target.dataset.index);
    const starElements = $$(".my-vote-star");
    const starTextElement = $(".my-vote-text");
    starElements.forEach((element, i) => {
      if (i <= index) {
        element.src = images.starFull;
        starTextElement.textContent = VOTE_TEXT[i];
      } else element.src = images.starEmpty;
    });
  });
  addEvent("mouseout", ".my-vote-star", () => {
    if (movieDetail) {
      const vIndex = Number(
        window.localStorage.getItem(JSON.stringify(movieDetail.id))
      );
      const starElements = $$(".my-vote-star");
      starElements.forEach((element) => {
        if (!element.dataset.index) return;
        const index = parseInt(element.dataset.index);
        if (vIndex >= index) element.src = images.starFull;
        else element.src = images.starEmpty;
      });
      $(".my-vote-text").textContent = VOTE_TEXT[vIndex];
    }
  });
  if (!movieDetail) return;
  const voteIndex = Number(window.localStorage.getItem(JSON.stringify(movieDetail.id))) || -1;
  return `
        <button class="close-modal" id="closeModal">
          <img src=/modal_button_close.png />
        </button>
        <div class="modal-container">
          <div class="modal-image">
            <img
              src="https://image.tmdb.org/t/p/original//${movieDetail.poster_path}"
            />
          </div>
          <div class="modal-description">
            <h2>${movieDetail.title}</h2>
            <p class="category">
              ${movieDetail.release_date.split("-")[0]} · ${movieDetail.genres.map((genre) => genre.name).join(", ")}
            </p>
            <p class="rate">
              <img src=${images.starFull} class="star" /><span
                >${movieDetail.vote_average.toFixed(1)}</span
              >
            </p>
            <hr />
            <h4>내 별점</h4>
            <div class="my-vote-container">
            <div class="star-container">
              ${Array.from(
    { length: 5 },
    (_, index) => `<img src=${voteIndex < index ? images.starEmpty : images.starFull} class="star my-vote-star" data-index="${index}" />`
  ).join("")}
              </div>
              <span class="my-vote-text">${VOTE_TEXT[voteIndex] || ""}</span>
            </div>
            <hr />
            <h4>줄거리</h4>
            <p class="detail">
              ${movieDetail.overview}
            </p>
          </div>
        </div>
  `;
};
const Modal = () => {
  return `
      <div class="modal-background ${isModalOpen && "active"}" id="modalBackground">
        <div class="modal">
          ${MovieDetail()}
        </div>
      </div>
  `;
};
const Footer = () => {
  return `
    <footer class="footer">
        <p>&copy; 우아한테크코스 All Rights Reserved.</p>
        <p><img src="${images.woowacourse}" width="180" /></p>
    </footer>
  `;
};
const Button = (props) => {
  const { attribute, children } = props;
  return `
    <button ${attribute ? parseAttribute(attribute) : ""}" >${children}</button>`;
};
const useGetMovieDetail = () => {
  const fetchMovieDetail = async (id) => {
    const detailUrl = url.detail;
    try {
      const response = await fetch(detailUrl(id), options);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data in App:", error);
    }
    return null;
  };
  return { fetchMovieDetail };
};
const useGetSearchMovieList = () => {
  const fetchSearchMovieList = async (query) => {
    const searchUrl = url.search(query);
    try {
      const response = await fetch(searchUrl, options);
      const data = await response.json();
      const results = data.results || [];
      setTotalResults(data.total_results);
      setSearchResults(results);
      resetPage();
      return results;
    } catch (error) {
      setIsSearchError(true);
      console.error("Error fetching data:", error);
    }
    return null;
  };
  return { fetchSearchMovieList };
};
const useInputChange = (selector, setSearchInputValue2) => {
  const handleInputChange = () => {
    const inputElement = $(selector);
    const inputValue = inputElement.value;
    if (!inputValue.trim()) return;
    setSearchInputValue2(inputValue);
  };
  return { handleInputChange };
};
const Input = (props) => {
  const { attribute } = props;
  return `
  <input ${attribute ? parseAttribute(attribute) : ""} />
 `;
};
const Header = (props) => {
  const { id, rate, title, src } = props;
  const { fetchSearchMovieList } = useGetSearchMovieList();
  const { fetchMovieDetail } = useGetMovieDetail();
  const { handleInputChange } = useInputChange(
    ".search-input",
    setSearchInputValue
  );
  const [addEvent] = useEvents(".background-container");
  addEvent("click", ".search-button-icon", async (e) => {
    e.preventDefault();
    handleInputChange();
    await fetchSearchMovieList(searchInputValue);
    observeLastMovie();
  });
  addEvent("click", `.detail`, async () => {
    if (!isModalOpen) {
      setIsModalOpen(true);
    }
    const detail = await fetchMovieDetail(id);
    setMovieDetail(detail);
  });
  return `
    <header class="header">
        <div class="background-container">
          <div class="overlay" aria-hidden="true">
            <img src="https://image.tmdb.org/t/p/w500${src}" alt="background" />
          </div>
          <div class="top-rated-container">
          <div class="logo-search-container">
            <h1 class="logo">
              <img src="${images.logo}" alt="MovieList" />
            </h1>
            <div class="input-container">
              <form>
            ${Input({
    attribute: {
      class: "search-input",
      type: "text",
      placeholder: "검색어를 입력하세요",
      value: searchInputValue
    }
  })}
              
              ${Button({
    attribute: {
      class: "search-button-icon"
    },
    children: `<img src="${images.search}" alt="search" />`
  })}
              </form>
            </div>
            </div>
            <div class="top-rated-movie">
              <div class="rate">
                <img src="${images.starEmpty}" class="star" />
                <span class="rate-value">${rate}</span>
              </div>
              <div class="title">${title}</div>
              ${Button({
    attribute: {
      class: "primary detail"
    },
    children: "자세히 보기"
  })}
            </div>
          </div>
        </div>
      </header>
  `;
};
const MovieItem = (props) => {
  const { id, title, rate, src } = props;
  const { fetchMovieDetail } = useGetMovieDetail();
  const [addEvent] = useEvents(`.thumbnail-list`);
  addEvent("click", `#_${id}`, async () => {
    if (!isModalOpen) {
      setIsModalOpen(true);
    }
    const detail = await fetchMovieDetail(id);
    setMovieDetail(detail);
  });
  return `
              <li id="_${id}">
                <div class="item">
                  <img
                    class="thumbnail"
                    src="${src}"
                    alt="${title}"
                  />
                  <div class="item-desc">
                    <p class="rate">
                      <img src="${images.starEmpty}" class="star" />
                      <span>${rate}</span>
                    </p>
                    <strong>${title}</strong>
                  </div>
                </div>
              </li>
  `;
};
const Skeleton = () => {
  return `
    <li>
      <div class="skeleton-item skeleton">
      <div class="skeleton-thumbnail"></div>
      <div class="skeleton-item-desc">
        <p class="skeleton-rate">
          <div class="skeleton-star"></div>
          <div class="skeleton-text"></div>
        </p>
        <div class="skeleton-title"></div>
      </div>
    </div>
  </li>
  `;
};
const headerRender = () => {
  var _a, _b, _c, _d;
  if (isError || !movies.length)
    return `<div class="movie-list-error">에러가 발생했습니다. 다시 시도해주세요.</div>`;
  else
    return Header({
      id: ((_a = movies[0]) == null ? void 0 : _a.id) ?? "",
      rate: ((_b = movies[0]) == null ? void 0 : _b.vote_count) ?? 0,
      title: ((_c = movies[0]) == null ? void 0 : _c.title) ?? "",
      src: ((_d = movies[0]) == null ? void 0 : _d.backdrop_path) ?? ""
    });
};
const subTitleRenderer = () => {
  if (searchInputValue.length > 0) return `${searchInputValue} 검색 결과`;
  else return "지금 인기 있는 영화";
};
const movieListRenderer = () => {
  const displayMovieList = searchInputValue.trim().length > 0 ? searchResults : movies;
  if (searchInputValue.length > 0 && displayMovieList.length === 0)
    return `<div class="no-results">검색 결과가 없습니다.</div>`;
  else {
    return `<ul class="thumbnail-list">
              ${displayMovieList.map((movie) => {
      return movie.isLoading ? Skeleton() : MovieItem({
        id: movie.id,
        title: movie.title,
        rate: movie.vote_count,
        src: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      });
    }).join("")}
            </ul>`;
  }
};
const moreButtonRenderer = () => {
  const displayMovieList = searchInputValue.trim().length > 0 ? searchResults : movies;
  if (displayMovieList.length < totalResults)
    return Button({
      attribute: {
        class: "primary detail more-button"
      },
      children: "더 보기"
    });
  else return "";
};
const serverSearchError = () => {
  if (isSearchError)
    return `<div class="search-server-error">검색 결과를 불러오는데 실패하였습니다.</div>`;
  else return "";
};
const moreMovieServerError = () => {
  if (isMoreError)
    return `<div class='more-error'>영화 목록을 불러오는 데 실패했습니다.</div>`;
  else return "";
};
const App = () => {
  const { fetchMovies } = useGetMovieList();
  const { fetchMoreMovies } = useGetMoreMovieList();
  const [addEvent] = useEvents(".app-layout");
  addEvent(
    "click",
    ".more-button",
    timeoutDebounce(() => {
      fetchMoreMovies(fetchMovies);
    }, 500)
  );
  if (movies.length === 0) {
    setMovies(
      Array.from({ length: 20 }).map((_) => {
        return initMovie;
      })
    );
    fetchMovies(1).then((results) => {
      if (results) {
        setMovies(results);
        observeLastMovie();
      }
    });
  }
  const mutationObserver = new MutationObserver(() => {
    observeLastMovie();
  });
  setTimeout(() => {
    const movieListElement = document.querySelector(".thumbnail-list");
    if (movieListElement) {
      mutationObserver.observe(movieListElement, { childList: true });
    }
  }, 0);
  return ` 
  ${headerRender()}
    <div class="app-layout">
      <h1 class="sub-title">${subTitleRenderer()}</h1>
      ${serverSearchError()}
      ${movieListRenderer()}
      ${moreMovieServerError()}
    ${moreButtonRenderer()}
    </div>
    ${Modal()}
    ${Footer()}
    `;
};
render(App, $("#app"));
