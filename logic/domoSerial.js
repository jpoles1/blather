module.exports = function(ser, room_status){
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
  domoSerial.setOutlet = function(outlet, comm){
    if(comm=="toggle"){
      if(room_status.outlets[outlet]=="on"){
        comm = "off";
        ser.write("b4"+outlet_commands["off"][outlet])
      }
      else{
        comm = "on";
        ser.write("b4"+outlet_commands["on"][outlet])
      }
    }
    else if(["off", "on"].contains(comm)){
      ser.write("b4"+outlet_commands[comm][outlet])
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
  }
  domoSerial.setStrip = function(comms){
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
  				"red": "50xFF1AE5",
  				"orange": "50xFF30CF",
  				"pink": "50xFF2AD5",
  				"blue": "50xFF9A65",
  				"aqua": "50xFFF807",
  				"purple": "50xFF38C7",
  				"green": "50xFFA25D",
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
      }
    })
    console.log(typeof comm_list)
    ser.write(comm_list)
  }
  domoSerial.allOff = function(){
    domoSerial.setOutlet("all", "off")
  }
  domoSerial.allOn = function(){
    domoSerial.setOutlet("all", "on")
  }
  return domoSerial
}
