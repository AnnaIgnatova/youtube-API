const API_KEY = "AIzaSyA_bG8spMRcutwfSysl27z4hFHMfqD0yXQ";
const CLIENT_ID =
  "443700420763-ljvbqrjpgpdit7br60thgrqc95b7k8s1.apps.googleusercontent.com";
const MY_CHANNEL = "UCREqTwuLE3-mIj4SjjYDeWw";

// headers.append("Access-Control-Allow-Origin", "https://youtube-js.com/");
// headers.append("Access-Control-Allow-Credentials", "true");

const nbsplvList = document.querySelector(".nbsplv-list");
const trendingList = document.querySelector(".trending-list");
const musicList = document.querySelector(".music-list");
const navMenuMore = document.querySelector(".nav-menu-more");
const showMore = document.querySelector(".show-more");
const formSearch = document.querySelector(".form-search");

const createCard = (dataVideo) => {
  const imgUrl = dataVideo.snippet.thumbnails.high.url;
  const videoId =
    typeof dataVideo.id === "string" ? dataVideo.id : dataVideo.id.videoId;
  const titleVideo = dataVideo.snippet.title;
  const dateVideo = dataVideo.snippet.publishedAt;
  const channelTitle = dataVideo.snippet.channelTitle;
  const viewsCount = dataVideo.statistics
    ? `<span class="video-views">${dataVideo.statistics.viewCount.slice(
        0,
        2
      )}k views</span>`
    : "";
  const card = document.createElement("div");

  card.classList.add("video-card");
  card.innerHTML = `
    <div class="video-thumb">
        <a class="link-video youtube-modal" href="https://youtu.be/${videoId}">
          <img src="${imgUrl}" alt="" class="thumbnail">
        </a>
    </div>
    <h3 class="video-title">${titleVideo}</h3>
    <div class="video-info">
        <span class="video-counter">
          ${viewsCount}
          <span class="video-date">${dateVideo}</span>
        </span>
        <span class="video-channel">${channelTitle}</span>
    </div>
  `;
  return card;
};

const createList = (wrapper, listVideo) => {
  wrapper.textContent = "";
  listVideo.forEach((item) => {
    const card = createCard(item);
    wrapper.append(card);
  });
};

const changePlaylistItem = (e) => {
  let target = e.target;
  if (e.target.classList.contains("update-btn")) {
    updatePlaylistItem(target);
  }
  if (e.target.classList.contains("delete-playlist")) {
    deletePlaylistItem(target);
  }
};

const updatePlaylistName = (newTitle, playlistId) => {
  console.log(playlistId);
  let xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.open(
    "PUT",
    `https://www.googleapis.com/youtube/v3/playlists?part=snippet`
  );
  xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xhr.setRequestHeader("Authorization", `Bearer ${ACCESS_TOKEN}`);
  xhr.responseType = "json";
  xhr.send(
    JSON.stringify({
      id: playlistId,
      snippet: {
        title: newTitle,
      },
    })
  );
  xhr.onload = () => {
    console.log(xhr.status);
    if (xhr.status !== 200) {
      showModal(`Error`);
    } else {
      showModal("You've successfully update playlist");
    }
  };

  // gapi.client.youtube.playlists
  //   .update({
  //     part: "snippet",
  //     resource: {
  //       snippet: {
  //         title: newTitle,
  //         channelId: MY_CHANNEL,
  //       },
  //       id: playlistId,
  //     },
  //   })
  //   .execute((response) => {
  //     console.log(response);
  //   });
};

const deletePlaylist = (playlistId) => {
  let xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.open(
    "DELETE",
    `https://www.googleapis.com/youtube/v3/playlists?id=${playlistId}`
  );
  xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xhr.setRequestHeader("Authorization", `Bearer ${ACCESS_TOKEN}`);
  xhr.responseType = "json";
  xhr.send();
  xhr.onload = () => {
    console.log(xhr.status);
    if (xhr.status !== 204) {
      showModal(`Ошибка`);
    } else {
      showModal("You've successfully delete playlist");
    }
  };
};

function showModal(message) {
  const modalWrapper = document.createElement("div");
  modalWrapper.className = "modal-wrapper";
  modalWrapper.innerHTML = `<div class="modal">${message}<button class="close-btn">close</button></div>`;
  document.documentElement.append(modalWrapper);

  const closeBtn = modalWrapper.querySelector(".close-btn");
  closeBtn.addEventListener("click", () => {
    document.documentElement.removeChild(modalWrapper);
  });
}

const updatePlaylistItem = (target) => {
  let inputValue = target.parentNode.children[0].value;
  let playlistId = target.parentNode.id;
  updatePlaylistName(inputValue, playlistId);
};

const deletePlaylistItem = (target) => {
  let playlistId = target.parentNode.id;
  deletePlaylist(playlistId);
  target.parentNode.remove();
};

const createPlaylistItem = (dataPlaylist) => {
  const playlistTitle = dataPlaylist.snippet.title;
  const playlistId = dataPlaylist.id;

  const playlist = document.createElement("div");
  playlist.classList.add("playlist");
  playlist.id = playlistId;
  playlist.innerHTML = `
    <input type="text" class="playlist-title" value="${playlistTitle}"/>
    <button class="change-name-btn update-btn">Update</button>
    <button class="change-name-btn delete-playlist">Delete</button>
  `;
  playlist.addEventListener("click", changePlaylistItem);
  return playlist;
};

const requestSearch = (searchText, callback, maxResults = 12) => {
  gapi.client.youtube.search
    .list({
      part: "snippet",
      q: searchText,
      maxResults,
      order: "relevance",
    })
    .execute((response) => {
      callback(response.items);
    });
};

showMore.addEventListener("click", (e) => {
  e.preventDefault();
  navMenuMore.classList.toggle("nav-menu-more-show");
});

formSearch.addEventListener("submit", (e) => {
  e.preventDefault();
  let value = formSearch.elements.search.value;
  requestSearch(value, (data) => {
    createList(nbsplvList, data);
  });
});

// -------------------------youtube API

const authBtn = document.querySelector(".auth-btn");
const userAvatar = document.querySelector(".user-avatar");
const playlistBtn = document.querySelector(".playlist-btn");
const playlistsContainer = document.querySelector(".playlists-wrapper");

const handleSuccessAuth = (data) => {
  authBtn.classList.add("hide");
  userAvatar.classList.remove("hide");
  userAvatar.src = data.getImageUrl();
  userAvatar.alt = data.getName();
};

const handleNoAuth = () => {
  authBtn.classList.remove("hide");
  userAvatar.classList.add("hide");
  userAvatar.src = "";
  userAvatar.alt = "";
};

const handleAuth = () => {
  gapi.auth2.getAuthInstance().signIn();
};
const handleSignOut = () => {
  gapi.auth2.getAuthInstance().signOut();
};

const updateStatusAuth = (data) => {
  data.isSignedIn.listen(() => {
    updateStatusAuth(data);
  });
  if (data.isSignedIn.get()) {
    const userData = data.currentUser.get().getBasicProfile();
    handleSuccessAuth(userData);
  } else {
    handleNoAuth();
  }
};

let SCOPES = "https://www.googleapis.com/auth/youtube.force-ssl";
let ACCESS_TOKEN = "";
var GoogleAuth; // Google Auth object.

function initClient() {
  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      scope: SCOPES,
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
      ],
    })
    .then(() => {
      ACCESS_TOKEN = gapi.auth2
        .getAuthInstance()
        .currentUser.get()
        .getAuthResponse().access_token;

      updateStatusAuth(gapi.auth2.getAuthInstance());
      authBtn.addEventListener("click", handleAuth);
      userAvatar.addEventListener("click", handleSignOut);
    })
    .then(loadScreen);
}

gapi.load("client:auth2", initClient);

const createPlaylist = (channelId, playlistName, callback) => {
  let xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.open(
    "POST",
    "https://www.googleapis.com/youtube/v3/playlists?part=snippet"
  );
  xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xhr.setRequestHeader("Authorization", `Bearer ${ACCESS_TOKEN}`);
  xhr.responseType = "json";
  xhr.send(
    JSON.stringify({
      snippet: { channelId: channelId, title: playlistName },
    })
  );
  xhr.onload = () => callback(xhr.response);
};

const getChannel = () => {
  gapi.client.youtube.channels
    .list({
      part: "snippet, statistics",
      id: "UCQPeGbxmEqxNWidQgCdsJrQ",
    })
    .execute((response) => {
      console.log(response);
    });
};

const requestVideosFromChannel = (channelId, callback, maxResults = 6) => {
  function getData(url = "") {
    fetch(url)
      .then((res) => res.json())
      .then((data) => callback(data.items));
  }

  getData(
    `https://www.googleapis.com/youtube/v3/search?maxResults=${maxResults}&part=snippet&channelId=${channelId}&key=${API_KEY}`
  );
};

const requestTrending = (callback, maxResults = 6) => {
  let xhr = new XMLHttpRequest();
  xhr.open(
    "GET",
    `https://www.googleapis.com/youtube/v3/videos?regionCode=RU&maxResults=${maxResults}&part=snippet&chart=mostPopular&key=${API_KEY}`
  );
  xhr.responseType = "json";
  xhr.send();

  xhr.onload = function () {
    let responseObj = xhr.response;
    callback(responseObj.items);
  };
};

const requestMusic = (callback, maxResults = 6) => {
  function getData(url = "") {
    fetch(url)
      .then((res) => res.json())
      .then((data) => callback(data.items));
  }

  getData(
    `https://www.googleapis.com/youtube/v3/videos?chart=mostPopular&regionCode=RU&videoCategoryId=10&maxResults=${maxResults}&part=snippet&key=${API_KEY}`
  );

  // gapi.client.youtube.videos
  //   .list({
  //     part: "snippet, statistics",
  //     chart: "mostPopular",
  //     regionCode: "RU",
  //     maxResults,
  //     videoCategoryId: "10",
  //   })
  //   .execute((response) => {
  //     callback(response.items);
  //   });
};

const playlistInput = document.querySelector(".playlist-input");

const loadScreen = () => {
  // requestVideosFromChannel("UCQPeGbxmEqxNWidQgCdsJrQ", (data) => {
  //   createList(nbsplvList, data);
  // });
  playlistBtn.addEventListener("click", () => {
    createPlaylist("UCREqTwuLE3-mIj4SjjYDeWw", playlistInput.value, (data) => {
      playlistsContainer.append(createPlaylistItem(data));
      playlistInput.value = "";
    });
  });

  requestTrending((data) => {
    createList(trendingList, data);
  });

  requestMusic((data) => {
    createList(musicList, data);
  });
};
