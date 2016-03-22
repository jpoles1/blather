module.exports = function(domoActuate, domoLights, domoWeather, domoGCal, domoUtility){
  domoModes = {};
  domoModes.wakeMode = function(io, socket){
    if(typeof io != "undefined"){
      io.emit("msg", "Good Morning. Starting wake mode!");
      io.emit("start_listen")
    }
    domoActuate.speak("Good Morning. Starting wake mode!", function(){
      domoWeather("today", socket, function(){
        domoGCal("today", socket);
      })
    });
    domoLights.setStrip("on green bright", socket);
  }
  domoModes.sleepMode = function(io){
    if(typeof io != "undefined"){
      io.emit("msg", "Good night. Entering sleep mode.");
      io.emit("stop_listen")
    }
    domoActuate.speak("Good night. Entering sleep mode.", function(){
      domoLights.setLamp("off", io);
      domoLights.setStrip("dark red", io);
    });
  }
  domoModes.loveMode = function(io){
    if(typeof io != "undefined"){
      io.emit("stop_listen")
      io.emit("msg", "LOVE MODE&trade; ACTIVATE");
    }
    domoActuate.speak("Activating Love Mode... ... Have fun!", function(){
      domoLights.setStrip("fade slow", io);
      domoActuate.runSysCommand("mplayer -shuffle", __dirname+"/../res/music/love/*.mp3")
    });
  }
  domoModes.partyMode = function(io){
    if(typeof io != "undefined"){
      io.emit("stop_listen")
      io.emit("msg", "PARTY MODE&trade; ACTIVATE");
    }
    domoActuate.speak("Activating Party Mode... ... Have fun!", function(){
      domoLights.setStrip("fade fast", io);
      domoActuate.runSysCommand("mplayer -shuffle", __dirname+"/../res/music/party/*.mp3")
    });
  }
  domoModes.killMusic = function(socket){
    domoActuate.runSysCommand("pkill", "mplayer")
    if(typeof socket != "undefined"){
      socket.emit("msg", "Killed Music")
    }
  }
  domoModes.allOff = function(socket){
    domoLights.setStrip("off", socket);
    domoLights.setLamp("off", socket);
  }
  domoModes.allOn = function(socket){
    domoLights.setStrip("off", socket);
    domoLights.setLamp("off", socket);
    socket.emit("msg", "All appliances off.")
  }
  return domoModes;
}
