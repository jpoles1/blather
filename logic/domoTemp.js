module.exports = function(app, domoValidate, domoActuate, domoSerial, domoMonitor, confused){
  var domoTemp = {};
  domoTemp.setFan = function(command, socket, actor){
    if(domoValidate.checkFanTag(command)){
      domoSerial.setOutlet("3", command, actor)
      if(typeof socket != "undefined"){
        domoActuate.socketReply(socket, "msg", "Sent Fan command: "+ command)
      }
    }
    else{
      confused(socket)
    }
  }
  return domoTemp;
}
