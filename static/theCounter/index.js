// connecting to websocket
import WebSocketManager from './js/socket.js';
const socket = new WebSocketManager('127.0.0.1:24050');


// cache values here to prevent constant updating
const cache = {
  h100: -1,
  h50: -1,
  h0: -1,
  accuracy: -1,
};



// Smoouth numbers update
// const accuracy = new CountUp('accuracy', 0, 0, 2, .5, { useEasing: true, useGrouping: true, separator: " ", decimal: "." })
// const h100 = new CountUp('h100', 0, 0, 0, .5, { useEasing: true, useGrouping: true, separator: " ", decimal: "." })
// const h50 = new CountUp('h50', 0, 0, 0, .5, { useEasing: true, useGrouping: true, separator: " ", decimal: "." })
// const h0 = new CountUp('h0', 0, 0, 0, .5, { useEasing: true, useGrouping: true, separator: " ", decimal: "." })
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
)

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
)

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
)




// receive message update from websocket
socket.api_v2(({ play, state, performance, resultsScreen }) => {
  try {
    console.log("Got data from ws")
    // state manager
    if (state.name === "play") {
      document.getElementById('songSelect').classList.add("hide");
      document.getElementById('ingame').classList.remove("hide");

      // pp counters
      if (cache.pp !== Math.round(play.pp.current)) {
        cache.pp = Math.round(play.pp.current);
        document.getElementById('ingame_currCounter').innerHTML = Math.round(play.pp.current);
      };
      if (cache.pp !== Math.round(play.pp.fc)) {
        cache.pp = Math.round(play.pp.fc);
        document.getElementById('ingame_totalCounter').innerHTML = Math.round(play.pp.fc);
      };
    }
    else if (state.name === 'resultScreen') {
      document.getElementById('songSelect').classList.add("hide");
      document.getElementById('ingame').classList.remove("hide");

      // update pp counters
      document.getElementById('ingame_currCounter').innerHTML = Math.round(resultsScreen.pp.current);
      document.getElementById('ingame_totalCounter').innerHTML = Math.round(resultsScreen.pp.fc);
    }
    else if (state.name === 'selectPlay') {
      document.getElementById('songSelect').classList.remove("hide");
      document.getElementById('ingame').classList.add("hide");

      // update pp counter
      document.getElementById('songSelect_totalCounter').innerHTML = Math.round(performance.accuracy[100]).toString();
    }
    else {
      document.getElementById('songSelect').classList.add("hide");
      document.getElementById('ingame').classList.add("hide");
    }
  } catch (error) {
    console.log(error);
  };
});

