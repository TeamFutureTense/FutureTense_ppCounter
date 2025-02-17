// connecting to websocket
import WebSocketManager from './js/socket.js';
import anime from './js/anime.js';
const socket = new WebSocketManager('127.0.0.1:24050');

// cache values here to prevent constant updating
const cache = {
  h100: -1,
  h50: -1,
  h0: -1,
  accuracy: -1,
};

const ingame_currCounter = new CountUp(
  'ingame_currCounter', 
  0, 
  0, 
  2, 
  .5, 
  { 
    useEasing: true, 
    useGrouping: true, 
    separator: " ", 
    decimal: "." 
  }
);

const ingame_totalCounter = new CountUp(
  'ingame_totalCounter', 
  0, 
  0, 
  2, 
  .5, 
  { 
    useEasing: true, 
    useGrouping: true, 
    separator: " ", 
    decimal: "." 
  }
);

const songSelect_totalCounter = new CountUp(
  'songSelect_totalCounter', 
  0, 
  0, 
  2, 
  .5, 
  { 
    useEasing: true, 
    useGrouping: true, 
    separator: " ", 
    decimal: "." 
  }
);

const animDuration = 125;

function ingameFadeOut(callback) {
  anime({
    targets: '#ingame',
    opacity: 0,
    duration: animDuration,
    easing: 'easeOutQuad',
    complete: function() {
      document.getElementById('ingame').classList.add("hide");
      if (callback) callback();
    }
  });
}

function ingameFadeIn(callback) {
  document.getElementById('ingame').classList.remove("hide");
  anime({
    targets: '#ingame',
    opacity: 1,
    duration: animDuration,
    easing: 'easeOutQuad',
    complete: function() {
      if (callback) callback();
    }
  });
}

function songSelectFadeOut(callback) {
  anime({
    targets: '#songSelect',
    opacity: 0,
    duration: animDuration,
    easing: 'easeOutQuad',
    complete: function() {
      document.getElementById('songSelect').classList.add("hide");
      if (callback) callback();
    }
  });
}

function songSelectFadeIn(callback) {
  document.getElementById('songSelect').classList.remove("hide");
  anime({
    targets: '#songSelect',
    opacity: 1,
    duration: animDuration,
    easing: 'easeOutQuad',
    complete: function() {
      if (callback) callback();
    }
  });
}

// receive message update from websocket
socket.api_v2(({ play, state, performance, resultsScreen }) => {
  try {
    console.log("Got data from ws");
    // state manager
    if (state.name === "play") {
      songSelectFadeOut(() => {
        ingameFadeIn();
      });

      // pp counters
      if (cache.pp !== Math.round(play.pp.current)) {
        cache.pp = Math.round(play.pp.current);
        document.getElementById('ingame_currCounter').innerHTML = Math.round(play.pp.current);
      }
      if (cache.pp !== Math.round(play.pp.fc)) {
        cache.pp = Math.round(play.pp.fc);
        document.getElementById('ingame_totalCounter').innerHTML = Math.round(play.pp.fc);
      }
    } else if (state.name === 'resultScreen') {
      songSelectFadeOut(() => {
        ingameFadeIn();
      });

      // update pp counters
      document.getElementById('ingame_currCounter').innerHTML = Math.round(resultsScreen.pp.current);
      document.getElementById('ingame_totalCounter').innerHTML = Math.round(resultsScreen.pp.fc);
    } else if (state.name === 'selectPlay') {
      ingameFadeOut(() => {
        songSelectFadeIn();
      });

      // update pp counter
      document.getElementById('songSelect_totalCounter').innerHTML = Math.round(performance.accuracy[100]).toString();
    } else {
      songSelectFadeOut(() => {
        ingameFadeOut();
      });
    }
  } catch (error) {
    console.log(error);
  }
});

