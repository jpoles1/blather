module.exports = function(domoActuate, domoLights, domoWeather, domoGCal, domoUtility){
  domoModes = {};
  domoModes.wakeMode = function(io, socket){
    io.emit("msg", "Good Morning. Starting wake mode!");
    io.emit("start_listen")
    domoActuate.speak("Good Morning. Starting wake mode!", function(){
      var options = {
        args: ["on", "green", "bright"]
      };
      domoActuate.runPyCommand("plugins/ardlights.py", options);
      domoActuate.speak("Turning lights on. Setting to bright green.", function(){
        domoWeather("today", socket, function(){
          domoGCal("today", socket);
        })
      })
    });
  }
  domoModes.sleepMode = function(io){
    io.emit("msg", "Good night. Entering sleep mode.");
    domoActuate.speak("Good night. Entering sleep mode.", function(){
      var options = {
        args: ["off"]
      };
      domoActuate.speak("Turning lights off.", function(){
        io.emit("stop_listen")
      })
      domoActuate.runPyCommand("plugins/ardlights.py", options);
    });
  }
  domoModes.loveMode = function(io){
    io.emit("stop_listen")
    domoActuate.speak("Activating Love Mode... ... Have fun!", function(){
      var options = {
        args: ["fade", "slow"]
      };
      domoActuate.runPyCommand("plugins/ardlights.py", options);
      domoActuate.runSysCommand("mplayer -shuffle", __dirname+"/../res/music/love/*.mp3")
    });
    io.emit("msg", "LOVE MODE&trade; ACTIVATE");
  }
  domoModes.partyMode = function(io){
    io.emit("stop_listen")
    domoActuate.speak("Activating Party Mode... ... Have fun!", function(){
      var options = {
        args: ["jump", "slow"]
      };
      domoActuate.runPyCommand("plugins/ardlights.py", options);
      domoActuate.runSysCommand("mplayer -shuffle", __dirname+"/../res/music/party/*.mp3")
    });
    io.emit("msg", "PARTY MODE&trade; ACTIVATE");
  }
  domoModes.killMusic = function(socket){
    domoActuate.runSysCommand("pkill", "mplayer")
    socket.emit("msg", "Killed Music")
  }
  return domoModes;
}
