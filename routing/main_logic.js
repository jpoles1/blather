module.exports = function(app){
  app.get("/", function(req, res){
    res.render("index.hbs", {})
  })
  app.post("lights", function(req,res){
    command = req.body.command;
    res.send("Sent command: "+ command)
  });
}
