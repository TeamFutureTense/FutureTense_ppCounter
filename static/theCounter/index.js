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

const settings = {
  showGrade: true,
  showTotalPP: false,
}

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

let isTransitionAnimationPlaying = false;

function ingameFadeOut(callback) {
  if (!isTransitionAnimationPlaying) {
    isTransitionAnimationPlaying = true;
    anime({
      targets: '#ingame',
      opacity: 0,
      duration: animDuration,
      easing: 'easeOutQuad',
      complete: function() {
        isTransitionAnimationPlaying = false;
        document.getElementById('ingame').classList.add("hide");
        if (callback) callback();
      }
    });
  }
}

function ingameFadeIn(callback) {
  if (!isTransitionAnimationPlaying) {
    isTransitionAnimationPlaying = true;
    document.getElementById('ingame').classList.remove("hide");
    anime({
      targets: '#ingame',
      opacity: 1,
      duration: animDuration,
      easing: 'easeOutQuad',
      complete: function() {
        isTransitionAnimationPlaying = false;
        if (callback) callback();
      }
    });
  }
}

function songSelectFadeOut(callback) {
  if (!isTransitionAnimationPlaying) {
    isTransitionAnimationPlaying = true;
    anime({
      targets: '#songSelect',
      opacity: 0,
      duration: animDuration,
      easing: 'easeOutQuad',
      complete: function() {
        isTransitionAnimationPlaying = false;
        document.getElementById('songSelect').classList.add("hide");
        if (callback) callback();
      }
    });
  }
}

function songSelectFadeIn(callback) {
  if (!isTransitionAnimationPlaying) {
    isTransitionAnimationPlaying = true;
    document.getElementById('songSelect').classList.remove("hide");
    anime({
      targets: '#songSelect',
      opacity: 1,
      duration: animDuration,
      easing: 'easeOutQuad',
      complete: function() {
        isTransitionAnimationPlaying = false;
        if (callback) callback();
      }
    });
  }
}

// receive message update for settings
socket.sendCommand('getSettings', encodeURI("http://127.0.0.1:24050/theCounter"))
socket.commands((data) => {
  try {
    const { command, message } = data;
    if (command == 'getSettings') {
      console.log("From FT PPCounter")
      console.log(command, message)
      settings.showGrade = message.ftppShowIngameGrade;
      settings.showTotalPP = message.ftppShowTotalPP;

      if (settings.showGrade === true) {
        document.getElementById("ingame_Section_Grade").classList.remove("hide")
      }
      else {
        document.getElementById("ingame_Section_Grade").classList.add("hide")
      }
      console.log("Current settings: ", settings)
    }
  }
  catch (error) {
    console.log(error);
  }
})

// receive message update from websocket
socket.api_v2(({ play, state, performance, resultsScreen }) => {
  try {
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

      // hide total fix
      if (settings.showTotalPP) {
        // update
        document.getElementById('ingame_totalCounterFix').innerHTML = Math.round(performance.accuracy[100]).toString();
        document.getElementById("ingame_Section_TotalCounterFix").classList.remove("hide")
        document.getElementById("ingame_Section_TotalCounter").classList.add("hide")
      }
      else {
        document.getElementById("ingame_Section_TotalCounterFix").classList.add("hide")
        document.getElementById("ingame_Section_TotalCounter").classList.remove("hide")
      }

      // update letter grade icon
      if (settings.showGrade) {
        document.getElementById("ingame_Section_Grade").classList.remove("hide");
        const icon = `./img/ranking-${play.rank.current}-small.svg`;
        document.getElementById('gradeDisplay').src = icon;
      }
    } 
    else if (state.name === 'resultScreen') {
      songSelectFadeOut(() => {
        ingameFadeIn();
      });

      // update pp counters
      document.getElementById('ingame_currCounter').innerHTML = Math.round(resultsScreen.pp.current);
      document.getElementById('ingame_totalCounter').innerHTML = Math.round(resultsScreen.pp.fc);
      document.getElementById('ingame_totalCounterFix').innerHTML = Math.round(performance.accuracy[100]).toString();

      document.getElementById("ingame_Section_Grade").classList.add("hide");
      document.getElementById("ingame_Section_TotalCounterFix").classList.remove("hide")
    } 
    else if (state.name === 'selectPlay') {
      document.getElementById("ingame_Section_Grade").classList.add("hide");
      ingameFadeOut(() => {
        songSelectFadeIn();
      });

      // update pp counter
      document.getElementById('songSelect_totalCounter').innerHTML = Math.round(performance.accuracy[100]).toString();
      document.getElementById("ingame_Section_Grade").classList.add("hide");
    } 
    else {
      songSelectFadeOut(() => {
        ingameFadeOut();
      });
    }
  } catch (error) {
    console.log(error);
  }
});

