module.exports = function(ser, room_status, domoMongo){
  var domoSerial = {};
  var serial_active = 0;
  var outlet_states = {};
  var outlet_commands = {
    "on": {
      "1": "0100000000010101001100110",
      "2": "0100000000010101110000110",
      "3": "0100000000010111000000110",
      "4": "0100000000011101000000110",
      "all": "0100000000110101000000110"
    },
    "off": {
      "1": "0100000000010101001111000",
      "2": "0100000000010101110011000",
      "3": "0100000000010111000011000",
      "4": "0100000000011101000011000",
      "all": "0100000000110101000011000"
    }
  }
  domoSerial.setOutlet = function(outlet, comm, actor){
    if(comm=="toggle"){
      if(room_status.outlets[outlet]=="on"){
        comm = "off";
        ser.write("b4"+outlet_commands["off"][outlet]+"/")
      }
      else{
        comm = "on";
        ser.write("b4"+outlet_commands["on"][outlet]+"/")
      }
    }
    else if(["off", "on"].contains(comm)){
      ser.write("b4"+outlet_commands[comm][outlet]+"/")
    }
    if(outlet=="all"){
      for(outlet in room_status["outlets"]){
        room_status.outlets[outlet] = comm;
      };
    }
    else{
      room_status.outlets[outlet] = comm;
    }
    console.log(room_status)
    if(typeof actor === "undefined"){
      actor = "user"
    }
    domoMongo.logBehaviour(actor, "outlet "+outlet, comm)
  }
  domoSerial.setStrip = function(comms, actor){
    var comm_list = "";
    comms.split(" ").forEach(function(comm){
      var color = comm;
      if(["off", "on"].contains(color)){
        domoSerial.setOutlet("2", color);
      }
      else{
        if(["dark"].contains(color)){
          color="dim";
        }
  			//The value preceding the 0x indicates the number of repeat signals to send
  			irsig={
  				"on": "10xFF02FD",
  				"red": "50xFFA25D",
  				"orange": "50xFF926D",
  				"pink": "50xFF9867",
  				"blue": "50xFF9A65",
  				"aqua": "50xFF38C7",
  				"purple": "50xFF9867",
  				"green": "50xFF1AE5",
  				"white": "50xFF22DD",
  				"bright": "90xFF3AC5",
  				"dim": "90xFFBA45",
  				"strobe": "20xFFD02F",
  				"fade": "20xFFE01F",
  				"jump": "20xFF20DF",
  				"slow": "70xFFC837",
  				"fast": "70xFFE817"
  			}
        if(comm_list == ""){
          comm_list = "a"+irsig[color]
        }
        else{
          comm_list += "/a"+irsig[color]
        }
        if(typeof actor === "undefined"){
          actor = "user"
        }
        domoMongo.logBehaviour(actor, "led strip via IR", color)
      }
    })
    if(comm_list != ""){
      ser.write(comm_list+"/")
    }
  }
  return domoSerial
}
