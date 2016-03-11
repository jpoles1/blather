module.exports = function(domoValidate, domoActuate, domoSerial){
  var domoLights = {};
  domoLights.setLamp = function(command, socket){
    if(domoValidate.checkLampTag(command)){
      domoSerial.setOutlet("1", command)
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
      domoSerial.setStrip(command_list.join(" "))
      socket.emit("msg", "Sent LED Strip command: "+ command)
    }
    else{
      confused(socket)
    }
  }
  return domoLights;
}
