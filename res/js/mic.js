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
          setTimeout(function(){$("#notify").html("Listening!"); allowRecognition(10);}, delay*1000);
          SpeechKITT.toggleRecognition();
          SpeechKITT.toggleRecognition();
          $("#notify").html(res)
        })
      }
    }
    function endRecognition(){
      if(commandReady == 1){
        beep_lo.play();
      }
      commandReady = 0;
      $("#notify").html("");
    }
    console.log("Starting to listen")
    // Let's define our first command. First the text we expect, and then the function it should call
    var commands = {
      'hey *name': function(name) {
        name = name.toLowerCase();
        if(["red", "brad", "rad", "ram", "fred", "brother", "bro"].contains(name)){name = "rrad";}
        if(["dummy", "don't know", "dumbo", "don't", "demo"].contains(name)){name = "domo";}
        if(["rrad", "domo"].contains(name)){
          $("#notify").html("Heard Keyword: "+name+"!");
          allowRecognition(ready_time);
        }
      },
      '(change) lights (to) :tag': function(tag) {
        handleCommand("/lights", {"command": tag}, "Setting lights to: "+tag, 3)
      },
      /*Voice recognition cannot determine zip codes accurately, so this feature has been deactivated.
      "(what's) (what) (is) (the) weather in *location": function(location) {
        handleCommand("/weather", {"loc": location}, "Fetching the weather in"+location, 8)
      },*/
      "(what's) (what) (is) (the) weather": function() {
        handleCommand("/weather", {}, "Fetching the weather in"+location, 8)
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
      '(off) (kill)': function(){
        endRecognition()
        SpeechKITT.abortRecognition()
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