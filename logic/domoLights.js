module.exports = function(domoValidate, domoActuate){
  var domoLights = {};
  domoLights.setLamp = function(command, socket){
    if(domoValidate.checkLampTag(command)){
      var options = {
        args: ["outlet", "1", command]
      };
      domoActuate.runPyCommand("plugins/ardlights.py", options);
      domoActuate.speak("Setting lamp to "+command, function(){
        socket.emit("ready")
      })
      //domoActuate.runPyCommand("plugins/ardlights.py", options);
      socket.emit("msg", "Sent lamp command: "+ command)
    }
    else{
      confused(socket)
    }
  }
  domoLights.setStrip = function(command, socket){
    var command_list = domoValidate.checkLEDTag(command);
    if(command_list.length>0){
      command_list.unshift("strip")
      var options = {
        args: command_list
      };
      domoActuate.speak("Setting Lights to "+command, function(){
        socket.emit("ready")
      })
      domoActuate.runPyCommand("plugins/ardlights.py", options);
      socket.emit("msg", "Sent LED Strip command: "+ command)
    }
    else{
      //res.send("Invalid command")
      confused(socket)
    }
  }
  return domoLights;
}
