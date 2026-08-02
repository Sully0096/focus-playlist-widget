// Focus Playlist widget — corrected YouTube IFrame Player API integration.
// Fixes vs. the reference implementation this was adapted from:
//   - uses the current documented iframe_api / onYouTubeIframeAPIReady
//     bootstrap instead of the retired player_api / onYouTubePlayerAPIReady
//   - no jQuery dependency
//   - a single click listener per control, registered once in onPlayerReady,
//     with play/pause state read from onStateChange instead of re-registering
//     listeners on every state change
//   - configurable playlist ID in one place

var PLAYLIST_ID = "PLgWT3kw4BFonWWKxr32XlDVqBIXs25oRQ";

var player = null;
var isPlaying = false;

var playPauseBtn = document.getElementById("playPauseBtn");
var prevBtn = document.getElementById("prevBtn");
var nextBtn = document.getElementById("nextBtn");
var volumeSlider = document.getElementById("volumeSlider");
var trackTitle = document.getElementById("trackTitle");
var trackIndex = document.getElementById("trackIndex");

function loadYouTubeIframeAPI() {
  var tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player("yt-player-mount", {
    height: "1",
    width: "1",
    playerVars: {
      listType: "playlist",
      list: PLAYLIST_ID,
      enablejsapi: 1,
      playsinline: 1
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError
    }
  });
};

function setPlayPauseUI(playing) {
  isPlaying = playing;
  playPauseBtn.textContent = playing ? "⏸" : "▶";
  playPauseBtn.title = playing ? "Pause" : "Play";
  playPauseBtn.setAttribute("aria-label", playPauseBtn.title);
}

function updateNowPlaying() {
  try {
    var data = player.getVideoData();
    trackTitle.textContent = (data && data.title) ? data.title : "Focus Playlist";
    var idx = player.getPlaylistIndex();
    var list = player.getPlaylist();
    if (typeof idx === "number" && idx >= 0 && list) {
      trackIndex.textContent = "Track " + (idx + 1) + " of " + list.length;
    }
  } catch (e) {
    // Player not fully initialized yet — safe to ignore.
  }
}

function onPlayerReady() {
  player.setVolume(Number(volumeSlider.value));
  updateNowPlaying();

  playPauseBtn.disabled = false;
  prevBtn.disabled = false;
  nextBtn.disabled = false;

  playPauseBtn.addEventListener("click", function () {
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  });

  prevBtn.addEventListener("click", function () {
    player.previousVideo();
  });

  nextBtn.addEventListener("click", function () {
    player.nextVideo();
  });

  volumeSlider.addEventListener("input", function () {
    player.setVolume(Number(this.value));
  });
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    setPlayPauseUI(true);
    updateNowPlaying();
  } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
    setPlayPauseUI(false);
  } else if (event.data === YT.PlayerState.CUED) {
    updateNowPlaying();
  }
}

function onPlayerError(event) {
  // 2 = invalid param, 5 = HTML5 error, 100 = not found,
  // 101 / 150 = embedding disabled by the video owner.
  var skippable = [100, 101, 150];
  if (skippable.indexOf(event.data) !== -1) {
    trackTitle.textContent = "Video unavailable — skipping…";
    player.nextVideo();
  } else {
    trackTitle.textContent = "Playback error";
  }
}

// playPauseBtn/prevBtn/nextBtn start disabled until the player reports ready.
playPauseBtn.disabled = true;
prevBtn.disabled = true;
nextBtn.disabled = true;

loadYouTubeIframeAPI();
