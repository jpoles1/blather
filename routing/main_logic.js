var PythonShell = require('python-shell');
var speaking_now = 0;
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}
module.exports = function(app){
  app.get("/", function(req, res){
    res.render("mic.hbs", {})
  })
  app.get("/voice", function(req, res){
    heard_command = req.query.command.toLowerCase().split(" ");
    console.log(heard_command);
    if(heard_command.contains("weather") || heard_command.contains("whether")){
      weather = runPyCommand("plugins/weather.py");
      res.send("Got Weather")
    }
  });
  app.get("/lights", function(req,res){
    command = req.query.command.toLowerCase();
    console.log(command);
    var options = {
      args: [command]
    };
    runPyCommand("plugins/ardlights.py", options);
    console.log("Sent command: "+ command)
    res.send("Sent command: "+ command)
  });
}
function runPyCommand(command, opts){
  command = command.replace(/[,#!$%\^&\*;:{}=`~()]/g,"");
  if(speaking_now!=1){
    speaking_now = 1;
    PythonShell.run(command, opts, function (err, results) {
      if (err) console.log("Lights error: ", err);
      console.log('results: %j', results);
      speaking_now = 0;
      return results
    });
  }
}
