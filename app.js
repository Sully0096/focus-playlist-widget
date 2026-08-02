// Focus Playlist widget — YouTube IFrame Player API, visible player.
//
// Earlier version hid the YouTube iframe and drove playback entirely
// through custom buttons. Inside Notion's embed (an iframe nested inside
// Notion's own iframe), outbound commands like playVideo() reached the
// player, but the onStateChange events reporting state back to this page
// did not reliably arrive — so custom play/pause/next/prev stopped
// reflecting reality, and with the player hidden there was no visible
// video to explain where the audio was coming from.
//
// Fix: show the real YouTube player and rely on its own native controls,
// which don't depend on any postMessage round-trip back to this page.

var PLAYLIST_ID = "PLgWT3kw4BFonWWKxr32XlDVqBIXs25oRQ";

var player = null;

function loadYouTubeIframeAPI() {
  var tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player("yt-player-mount", {
    height: "216",
    width: "372",
    playerVars: {
      listType: "playlist",
      list: PLAYLIST_ID,
      enablejsapi: 1,
      playsinline: 1
    },
    events: {
      onError: onPlayerError
    }
  });
};

function onPlayerError(event) {
  // 100 = not found, 101 / 150 = embedding disabled by the video owner.
  var skippable = [100, 101, 150];
  if (skippable.indexOf(event.data) !== -1 && player && player.nextVideo) {
    player.nextVideo();
  }
}

loadYouTubeIframeAPI();
