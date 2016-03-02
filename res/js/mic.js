Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}
var commandReady = 0;
var ready_time = 15; //In seconds
var ready_timer;
$(function(){
  if (annyang) {
    var beep_hi = new Audio('res/sound/beep_hi.wav');
    var beep_lo = new Audio('res/sound/beep_lo.wav');
    function allowRecognition(ready_time){
      beep_hi.play();
      commandReady = 1;
      clearTimeout(ready_timer);
      ready_timer = setTimeout(function(){
        endRecognition()
      }, ready_time*1000);
    }
    function handleCommand(url, req_opts, msg, delay){
      if(commandReady){
        $("#notify").html(msg)
        commandReady = 0;
        $.get(url, req_opts, function(res){
          if(delay!=-1){
            setTimeout(function(){$("#notify").html("Listening!"); allowRecognition(10);}, delay*1000);
            SpeechKITT.toggleRecognition();
            SpeechKITT.toggleRecognition();
          }
          $("#notify").html(res)
        })
      }
    }
    function endRecognition(){
      if(commandReady != 0){
        beep_lo.play();
      }
      commandReady = 0;
      $("#notify").html("");
    }
    function stopListening(){
      beep_lo.play();
      setTimeout(function(){beep_lo.play();}, 400);
      endRecognition()
      SpeechKITT.abortRecognition()
    }
    console.log("Starting to listen")
    // Let's define our first command. First the text we expect, and then the function it should call
    var commands = {
      'hey *name': function(name) {
        name = name.toLowerCase();
        if(["red", "brad", "rad", "rod", "ram", "fred", "brother", "bro"].contains(name)){name = "rrad";}
        if(["dummy", "don't know", "dumbo", "don't", "demo"].contains(name)){name = "domo";}
        if(["rrad", "domo"].contains(name)){
          $("#notify").html("Heard Keyword: "+name+"!");
          allowRecognition(ready_time);
        }
      },
      '(set) (change) lights (to) *tag': function(tag) {
        orig_tag = tag;
        function correctLightCommand(tag){
          if(["read"].contains(tag)){tag = "red";}
          if(["blew"].contains(tag)){tag = "blue";}
          if(["screen"].contains(tag)){tag = "green";}
          if(["right"].contains(tag)){tag = "bright";}
          if(["paint"].contains(tag)){tag = "pink";}
          if(["people"].contains(tag)){tag = "purple";}
          if(["babe", "paid"].contains(tag)){tag = "fade";}
          if(["tim", "them"].contains(tag)){tag = "dim";}
          return tag;
        }
        //I don't think there's any situation in which I would want more than two tags.
        tagwords = tag.split(" ")
        try{
          if(tagwords.length == 1){
            tag = correctLightCommand(tag);
          }
          //For descriptors like "dark blue" "bright red"
          else if(tagwords.length == 2){
            tag = correctLightCommand(tagwords[0])+" "+correctLightCommand(tagwords[1]);
          }
          console.log(tag)
          handleCommand("/lights", {"command": tag}, "Setting lights to: "+orig_tag, 3)
        }
        catch(e){
          $("#notify").html("Did not recognize light command!");
        }
      },
      /*Voice recognition cannot determine zip codes accurately, so this feature has been deactivated.
      "(what's) (what) (is) (the) weather in *location": function(location) {
        handleCommand("/weather", {"loc": location}, "Fetching the weather in"+location, 8)
      },*/
      "(what's) (what) (is) (the) weather": function() {
        handleCommand("/weather", {}, "Fetching the weather..", 8)
      },
      "(what's) (what) (is) (the) time (is it)": function(){
        handleCommand("/time", {}, "Fetching time...", 2.5)
      },
      "(what's) (what is) (the) (today's) date": function(){
        handleCommand("/date", {}, "Fetching date...", 4)
      },
      '(stop) (end) (cancel)': function(){
        endRecognition()
      },
      '(enter) (activate) (start) :tag mode': function(tag){
        if(commandReady){
          tag = tag.toLowerCase();
          if(["love", "sex", "sexy", "sexytime"].contains(tag)){
            handleCommand("/sexytime", {}, "Starting Love Mode&trade;.", -1)
            stopListening()
          }
          else if(["sleep"].contains(tag)){
            var sleeptime = 7; //hrs
            handleCommand("/sleep", {}, "Starting Sleep Mode&trade;.", -1)
            stopListening();
            setTimeout(function(){SpeechKITT.startRecognition()}, sleeptime*60*60*1000)
          }
          else if(["wake", "week"].contains(tag)){
            handleCommand("/wake", {}, "Starting Wake Mode&trade;.", -1);
            setTimeout(function(){
              commandReady = 1;
              handleCommand("/weather", {}, "Fetching the weather..", 8)
            }, 6*1000)
          }
          else{
            console.log("Could not activate the mode:", tag)
          }
        }
      },
      '(off) (kill)': function(){
        stopListening()
      }
    };
    annyang.debug();

    // Add our commands to annyang
    annyang.addCommands(commands);

    // Start listening. You can call this here, or attach this call to an event, button, etc.
    SpeechKITT.annyang();

    // Define a stylesheet for KITT to use
    SpeechKITT.setStylesheet('//cdnjs.cloudflare.com/ajax/libs/SpeechKITT/0.3.0/themes/flat.css');

    SpeechKITT.startRecognition();

    // Render KITT's interface
    SpeechKITT.vroom();
    prevScrollPos = 0;
    $(window).keypress(function (e) {
      console.log(e.keyCode)
      if (e.keyCode === 0 || e.keyCode === 32) {
        e.preventDefault()
        console.log('Space pressed')
        SpeechKITT.toggleRecognition();
        if(SpeechKITT.isListening()){
          $("#notify").html("Starting Listening!");
          allowRecognition(ready_time);
        }
        else{
          $("#notify").html("");
        }
      }
      else if (e.keyCode === 119) {
        //W Key
        e.preventDefault()
        console.log('W pressed')
        $.get("lights", {"command": "bright"}, function(res){
          console.log(res)
        })
      }
      else if (e.keyCode === 115) {
        //D Key
        e.preventDefault()
        console.log('D pressed')
        $.get("lights", {"command": "dim"}, function(res){
          console.log(res)
        })
      }
    })
  }
});
