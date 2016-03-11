//Import Libraries
#include <stdlib.h>
#include <IRremote.h>
#include <RCSwitch.h>
//Where we store serial data
String serdat = "";
//Setup IR and RC Blasters
IRsend irsend;
RCSwitch mySwitch = RCSwitch();

void setup() {
  //Start serial comms
  Serial.begin(9600);
  mySwitch.enableTransmit(10);
  mySwitch.setPulseLength(140);
  mySwitch.setRepeatTransmit(5);
  Serial.println("ready");
}
void loop() {
  delay(100);
}
void sendIR(String serdat){
  char command_type = serdat[0];
    int retry = serdat[1] - '0';
    String command = serdat.substring(2);
    if(command_type == 'a'){
      
      unsigned long color = strtol(command.c_str(), NULL, 16);
      Serial.println("IR Blasting: "+command+"; "+color);     
      int i = 0;
      while(i<retry){
        irsend.sendNEC(color, 32);
        delay(100);
        i=i+1;
      }
    }
    if(command_type == 'b'){
      char com[25];
      command.toCharArray(com, 25);
      mySwitch.send(com);
      Serial.println("RC Blasting: "+command);     

    }
    serdat = "";
}
/*
  SerialEvent occurs whenever a new data comes in the
 hardware serial RX.  This routine is run between each
 time loop() runs, so using delay inside loop can delay
 response.  Multiple bytes of data may be available.
 */
void serialEvent() {
  while(Serial.available()) {
    serdat = Serial.readStringUntil('/');
    sendIR(serdat);
    delay(50);
    //serdat.trim();
  }
}


