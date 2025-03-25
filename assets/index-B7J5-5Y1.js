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
let searchInputValue = "";
let searchResults = [];
let totalResults = 0;
const setMovies = (newMovies) => {
  movies = newMovies;
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
let isLoading = true;
const setIsLoading = (value) => {
  isLoading = value;
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
  )}`
};
const useGetMoreMovieList = () => {
  const fetchMoreMovies = async (callback) => {
    const nextPage = currentPage + 1;
    if (searchInputValue.trim()) {
      try {
        const response = await fetch(url.more(nextPage), options);
        const data = await response.json();
        appendSearchResults(data.results);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setIsMoreError(true);
      }
    } else {
      const newMovies = await callback(nextPage);
      if (newMovies) {
        appendMovies(newMovies);
      }
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
      return data.results;
    } catch (error) {
      setIsError(true);
      console.error("Error fetching data in App:", error);
    }
    return null;
  };
  return { fetchMovies };
};
const Button = (props) => {
  const { attribute, children } = props;
  return `
    <button ${attribute ? parseAttribute(attribute) : ""}" >${children}</button>`;
};
const images = {
  logo: "./logo.png",
  starEmpty: "./star_empty.png",
  woowacourse: "./woowacourse_logo.png",
  search: "./search.png"
};
const Footer = () => {
  return `
    <footer class="footer">
        <p>&copy; 우아한테크코스 All Rights Reserved.</p>
        <p><img src="${images.woowacourse}" width="180" /></p>
    </footer>
  `;
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
  const { rate, title, src } = props;
  const { fetchSearchMovieList } = useGetSearchMovieList();
  const { handleInputChange } = useInputChange(
    ".search-input",
    setSearchInputValue
  );
  const [addEvent] = useEvents(".background-container");
  addEvent("click", ".search-button-icon", (e) => {
    e.preventDefault();
    handleInputChange();
    fetchSearchMovieList(searchInputValue);
  });
  return `
    <header class="header">
        <div class="background-container">
          <div class="overlay" aria-hidden="true">
            <img src="https://image.tmdb.org/t/p/w500${src}" alt="background" />
          </div>
          <div class="top-rated-container">
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
            <h1 class="logo">
              <img src="${images.logo}" alt="MovieList" />
            </h1>
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
  const { title, rate, src } = props;
  return `
              <li>
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
const App = () => {
  var _a, _b, _c;
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
    fetchMovies(1).then((results) => {
      if (results) {
        setMovies(results);
      }
    });
  }
  const displayMovieList = searchInputValue.trim().length > 0 ? searchResults : movies;
  return ` ${isError || !movies.length ? `<div class="movie-list-error">에러가 발생했습니다. 다시 시도해주세요.</div>` : Header({
    rate: ((_a = movies[0]) == null ? void 0 : _a.vote_count) ?? 0,
    title: ((_b = movies[0]) == null ? void 0 : _b.title) ?? "",
    src: ((_c = movies[0]) == null ? void 0 : _c.backdrop_path) ?? ""
  })}
  
    <div class="app-layout">
      <h1 class="sub-title">${searchInputValue.length > 0 ? `${searchInputValue} 검색 결과` : "지금 인기 있는 영화"}</h1>

      ${isSearchError ? `<div class="search-server-error">검색 결과를 불러오는데 실패하였습니다.</div>` : ""}
      ${searchInputValue.length > 0 && displayMovieList.length === 0 ? `<div class="no-results">검색 결과가 없습니다.</div>` : isLoading ? `<ul class="thumbnail-list">
      ${Array.from({ length: 20 }).map((_) => Skeleton()).join("")}
          </ul>` : `<ul class="thumbnail-list">
              ${displayMovieList.map((movie) => {
    return MovieItem({
      title: movie.title,
      rate: movie.vote_count,
      src: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    });
  }).join("")}
            </ul>
      ${isMoreError ? `<div class='more-error'>영화 목록을 불러오는 데 실패했습니다.</div>` : ""}
    ${displayMovieList.length < totalResults ? Button({
    attribute: {
      class: "primary detail more-button"
    },
    children: "더 보기"
  }) : ""}`}
    </div>
    ${Footer()}
    `;
};
render(App, $("#app"));
