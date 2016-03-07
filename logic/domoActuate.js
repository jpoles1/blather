//Setup Unix Commands
var exec = require('child_process').exec;
var child;
//Setup Python Commands
var PythonShell = require('python-shell');
var domoActuate = {};
domoActuate.now_speaking = 0;
domoActuate.runSysCommand = function(command, opts, cb){
  child = exec(command+" "+opts, function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
    if (typeof cb === 'function') {
      cb();
    }
  });
}
domoActuate.speak = function(phrase, cb){
  var actuate = this;
  if(actuate.now_speaking==0){
    actuate.now_speaking=1;
    actuate.runSysCommand("espeak -vmb-en1 -p40 -s140 -a180", "\""+phrase+"\"", function(){
      if (typeof cb === 'function') {
        setTimeout(cb, 400);
      }
      actuate.now_speaking=0;
    });
  }
  else{
    console.log("Ignoring espeak command, don't want to talk over myself.")
  }
}
domoActuate.runPyCommand = function(command, opts){
  command = command.replace(/[,#!$%\^&\*;:{}=`~()]/g,"");
  PythonShell.run(command, opts, function (err, results) {
    if (err){
      console.log("Lights error: ", err);
      domoActuate.speak(String(err).split(":")[2]);
    }
    console.log('results: %j', results);
    return results
  });
}
module.exports = domoActuate;
