module.exports = function(domoMongo, domoActuate, domoLights, domoWeather, domoGCal, domoUtility){
  domoModes = {};
  domoModes.wakeMode = function(actor){
    if(typeof actor === "undefined"){
      actor = "domo"
    }
    domoLights.setStrip("on green bright");
    domoLights.setLamp("on", socket);
    domoMongo.logBehaviour(actor, "Room Mode", "wake mode")
    if(typeof io != "undefined"){
      io.emit("msg", "Good Morning. Starting wake mode!");
      io.emit("start_listen")
    }
    domoActuate.speak("Good Morning. Starting wake mode!", function(){
      domoWeather("today", socket, function(){
        domoGCal("today", socket);
      })
    });
  }
  domoModes.dayMode = function(actor, io){
    if(typeof actor === "undefined"){
      actor = "domo"
    }
    domoMongo.logBehaviour(actor, "Room Mode", "day mode")
    if(typeof io != "undefined"){
      io.emit("msg", "Waking room up.");
    }
    domoLights.setStrip("on bright green");
    domoLights.setLamp("on");
    domoActuate.speak("Waking room up.");
  }

  domoModes.bedtimeMode = function(actor, io){
    if(typeof actor === "undefined"){
      actor = "domo"
    }
    domoMongo.logBehaviour(actor, "Room Mode", "bedtime")
    if(typeof io != "undefined"){
      io.emit("msg", "Getting ready for bedtime.");
    }
    domoActuate.speak("Getting ready for bedtime.", function(){
      domoLights.setLamp("off", io);
      domoLights.setStrip("dark red", io);
    });
  }
  domoModes.sleepMode = function(actor, io){
    if(typeof actor === "undefined"){
      actor = "domo"
    }
    domoMongo.logBehaviour(actor, "Room Mode", "sleep mode")
    if(typeof io != "undefined"){
      io.emit("msg", "Good night. Entering sleep mode.");
      io.emit("stop_listen")
    }
    domoActuate.speak("Good night. Entering sleep mode.", function(){
      domoLights.setLamp("off", io);
      domoLights.setStrip("off", io);
      domoModes.whiteNoise()
    });
  }
  domoModes.loveMode = function(io){
    if(typeof io != "undefined"){
      io.emit("stop_listen")
      io.emit("msg", "LOVE MODE&trade; ACTIVATE");
    }
    domoActuate.speak("Activating Love Mode... ... Have fun!", function(){
      domoLights.setStrip("fade slow", io);
      domoLights.setLamp("off", io);
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
      domoActuate.socketReply(socket, "msg", "Killed Music")
    }
  }
  domoModes.whiteNoise = function(actor){
    if(typeof actor === "undefined"){
      actor = "domo"
    }
    domoActuate.runSysCommand("mplayer -loop 0", __dirname+"/../res/music/white_noise.mp3")
    var duration = 30; //in minutes
    setTimeout(function(){
      domoModes.killMusic();
    }, duration*60*1000)
  }
  domoModes.allOff = function(socket){
    domoLights.setStrip("off", socket);
    domoLights.setLamp("off", socket);
  }
  domoModes.allOn = function(socket){
    domoLights.setStrip("off", socket);
    domoLights.setLamp("off", socket);
    domoActuate.socketReply(socket, "msg", "All appliances off.")
  }
  return domoModes;
}
