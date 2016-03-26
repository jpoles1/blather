var fs = require("fs");
var mongoose = require("mongoose")
require('dotenv').config();
//Load in Mongoose Schemas
mongoose.connect(process.env.MONGO_URI);
var domoMongo = require("../logic/domoMongo")()
var streams = {};
var status = {}
var mongoToJSON = function(ws, mongoQuery, taskName){
  status[taskName] = 0;
  ws.write("[")
  function transform(data){
      return JSON.stringify(data) + ",\n";
  }
  var dbStream = mongoQuery.lean().stream({'transform': transform});
  dbStream.on("end", function(){
      ws.write("{}]");
      ws.end();
      status[taskName] = 1;
      console.log(taskName+" transfer has been completed!")
      var done = Object.keys(status).every(function(key){
        return status[key] == 1;
      })
      console.log("Is Task Done:", done)
      if(done){
        setTimeout(function(){process.exit()}, 2000); //Seems to fix unfinished file problem for now.
      }
  });
  dbStream.pipe(ws);
}
//Behaviour logs
var behaviour_stream = fs.createWriteStream('data/behaviour_log.json');
var behaviour_query = domoMongo.DomoBehaviour.find()
var behaviour_log = mongoToJSON(behaviour_stream, behaviour_query, "Behaviour log");
//Room Logs
var status_stream = fs.createWriteStream('data/status_log.json');
var status_query = domoMongo.RoomStatus.find()
var status_log = mongoToJSON(status_stream, status_query, "Status log");
//Status logs
var event_stream = fs.createWriteStream('data/event_log.json');
var event_query = domoMongo.DomoEvent.find()
var event_log = mongoToJSON(event_stream, event_query, "Event log");
//Hand off Data to Python Processing Pipeline
