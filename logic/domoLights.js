module.exports = function(app, domoValidate, domoActuate, domoSerial, domoMonitor, confused){
  var domoLights = {};
  domoLights.setLamp = function(command, socket, actor){
    if(domoValidate.checkLampTag(command)){
      domoSerial.setOutlet("1", command, actor)
      //domoActuate.runPyCommand("plugins/ardlights.py", options);
      if(typeof socket != "undefined"){
        domoActuate.socketReply(socket, "msg", "Sent Lamp command: "+ command)
      }
    }
    else{
      confused(socket)
    }
  }
  domoLights.setStrip = function(command, socket){
    var command_list = domoValidate.checkLEDTag(command);
    if(command_list.length>0){
      domoSerial.setStrip(command_list.join(" "))
      if(typeof socket != "undefined"){
        domoActuate.socketReply(socket, "msg", "Sent LED Strip command: "+ command)
      }
    }
    else{
      confused(socket)
    }
  }
  domoLights.allOff = function(actor){
    domoSerial.setOutlet("all", "off", actor)
  }
  domoLights.allOn = function(actor){
    domoSerial.setOutlet("all", "on", actor)
  }
  app.get("/lights", function(req,res){
    command = req.query.command;
    if(command){
      domoLights.setStrip(command);
      res.send("Switched.")
    }
    else{
      res.send("Invalid Command.")
    }
  })
  app.get("/lamp", function(req,res){
    command = req.query.command;
    if(command){
      domoLights.setLamp(command);
      res.send("Switched.")
    }
    else{
      res.send("Invalid Command.")
    }
  })
  return domoLights;
}
