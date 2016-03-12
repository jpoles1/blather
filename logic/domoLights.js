module.exports = function(app, domoValidate, domoActuate, domoSerial, confused){
  var domoLights = {};
  domoLights.setLamp = function(command, socket){
    if(domoValidate.checkLampTag(command)){
      domoSerial.setOutlet("1", command)
      //domoActuate.runPyCommand("plugins/ardlights.py", options);
      if(typeof socket != "undefined"){
        socket.emit("msg", "Sent Lamp command: "+ command)
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
        socket.emit("msg", "Sent LED Strip command: "+ command)
      }
    }
    else{
      confused(socket)
    }
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
