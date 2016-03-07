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
var keyword_active = 0;
var ready_timer;
$(function(){
  if (annyang) {
    var socket = io(location.origin);
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
      if(commandReady || !keyword_active){
        $("#notify").html(msg)
        commandReady = 0;
        $.get(url, req_opts, function(res){
          if(delay!=-1){
            setTimeout(function(){allowRecognition(10);}, delay*1000);
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
    socket.on("stop_listen", function(){
      stopListening()
    })
    socket.on("start_listen", function(){
      SpeechKITT.startRecognition()
    })
    socket.on("ready", function(){
      SpeechKITT.toggleRecognition();
      SpeechKITT.toggleRecognition();
      setTimeout(function(){
        $("#notify").html("Listening for Commands!");
        allowRecognition(ready_time)
      }, 400)
    })
    socket.on("unready", function(){
      endRecognition()
    })
    socket.on("msg", function(msg){
      $("#notify").html(msg);
      $("#loglist").prepend("<li class='log-item'>"+msg+"<div class='log_time'>"+moment().format("HH:MM")+"</div></li>")
    })
    console.log("Starting to listen")
    // Let's define our first command. First the text we expect, and then the function it should call
    var commands = {
      'hey *name': function(name) {
        name = name.toLowerCase();
        if(["rrad", "red", "brad", "rad", "rod", "ram", "fred", "brother", "bro", "bread", "grab"].contains(name)){name = "RRAD";}
        if(["domo", "dummy", "don't know", "dumbo", "don't", "donna", "demo", "mama", "there", "number"].contains(name)){name = "Domo";}
        if(["RRAD", "Domo"].contains(name)){
          $("#notify").html("Heard Keyword: "+name+"!");
          allowRecognition(ready_time);
        }
      },
      '(set) (change) light(s) (to) *tag': function(tag) {
        var tagwords = domoValidate.checkLEDTag(tag);
        tag = tagwords.join(" ")
        var valid_led_command = (tagwords.length == 1) || (tagwords.length == 2) || (tagwords.length == 3 && (tagwords.contains("on") || tagwords.contains("off") || tagwords.contains("toggle")))
        if(valid_led_command){
          handleCommand("/lights", {"command": tag}, "Setting lights to: "+tag, 3)
        }
        else{
          $("#notify").html("Did not recognize light command!");
          handleCommand("/confused", {}, "Did not recognize light command!", 3)
          return false;
        }
      },
      '(set) (change) lamp (to) *tag': function(tag) {
        if(domoValidate.checkLampTag(tag)){
          handleCommand("/lamp", {"command": tag}, "Setting lamp to: "+tag, 3)
        }
        else{
          $("#notify").html("Did not recognize lamp command!");
          handleCommand("/confused", {}, "Did not recognize lamp command!", 3)
        }
      },
      '(enter) (activate) (start) :tag mode': function(tag){
        if(commandReady || !keyword_active){
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
          else if(["party"].contains(tag)){
            handleCommand("/party", {}, "Starting Party Mode&trade;.", -1)
            stopListening();
          }
          else if(["wake", "week", "with"].contains(tag)){
            handleCommand("/wake", {}, "Starting Wake Mode&trade;.", -1);
            setTimeout(function(){
              commandReady = 1;
              handleCommand("/weather", {}, "Fetching the weather..", -1)
            }, 6*1000)
            setTimeout(function(){
              commandReady = 1;
              handleCommand("/cal", {}, "Fetching today's schedule..", 8)
            }, 14*1000)
          }
          else{
            console.log("Could not activate the mode:", tag)
          }
        }
      },
      /*Voice recognition cannot determine zip codes accurately, so this feature has been deactivated.
      "(what's) (what) (is) (the) weather in *location": function(location) {
        handleCommand("/weather", {"loc": location}, "Fetching the weather in"+location, 8)
      },*/
      "(what's) (what) (is) (on) (my) schedule (for) (on) :time": function(time) {
        if(commandReady || !keyword_active){
          socket.emit("cal", time);
          commandReady = 0;
        }
      },
      "(what's) (what) (is) (on) :time schedule": function(time) {
        if(commandReady || !keyword_active){
          time = time.split("'")[0]
          socket.emit("cal", time);
          commandReady = 0;
        }
      },
      "(what's) (what) (is) (on) (my) (today's) schedule (for) (today)": function() {
        if(commandReady || !keyword_active){
          socket.emit("cal", "today");
          commandReady = 0;
        }
      },
      "(what's) (what) (is) (the) weather (on) :day": function(day) {
        if(commandReady || !keyword_active){
          socket.emit("weather", day);
          commandReady = 0;
        }
      },
      "(what's) (what) (is) (the) time (is it)": function(){
        if(commandReady || !keyword_active){
          socket.emit("time");
          commandReady = 0;
        }
      },
      "(what's) (what is) (the) (today's) date": function(){
        if(commandReady || !keyword_active){
          socket.emit("date");
          commandReady = 0;
        }
      },
      '(stop) (end) (cancel)': function(){
        endRecognition()
      },
      'thank(s) (you)': function(){
        if(commandReady || !keyword_active){
          socket.emit("thanks");
        }
      },
      '(off) (kill)': function(){
        stopListening()
      },
      'disable keyword': function(name) {
        keyword_active = 0;
      },
      'enable keyword': function(name) {
        keyword_active = 1;
      },
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
    })
  }
});
