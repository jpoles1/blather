var PythonShell = require('python-shell');

module.exports = function(app){
  app.get("/", function(req, res){
    res.render("index.hbs", {})
  })
  app.get("/lights", function(req,res){
    command = req.query.command.toLowerCase();	
    console.log(command);
    var options = {
      args: [command]
    };

    PythonShell.run("ardlights.py", options, function (err, results) {
      if (err) console.log("Lights error: ", err);
      console.log('results: %j', results);
    });
    console.log("Sent command: "+ command)
    res.send("Sent command: "+ command)
  });
}
