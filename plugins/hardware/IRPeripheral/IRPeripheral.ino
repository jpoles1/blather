//Import Libraries
#include <stdlib.h>
#include <IRremote.h>

//Define some rudimentary IR Codes (for reference)
#define	IR_BPlus  0xFF3AC5	// 
#define	IR_BMinus 0xFFBA45	// 
#define	IR_POW 	  0xFF02FD	// 
#define	IR_R 	  0xFF1AE5	// 
#define	IR_G 	  0xFF9A65	// 
#define	IR_B  	  0xFFA25D	// 
#define	IR_W 	  0xFF22DD	// 
#define	IR_FLASH  0xFFD02F	// 
#define	IR_JUMP3  0xFF20DF	// 
#define	IR_JUMP7  0xFFA05F	// 
#define	IR_FADE3  0xFF609F	// 
#define	IR_FADE7  0xFFE01F	// 

//Where we store serial data
String serdat = "";
//Setup IR Blaster
IRsend irsend;

void setup() {
  //Start serial comms
  Serial.begin(9600);
  Serial.println("ready");
}
void blastIR(int code){
  irsend.sendNEC(code, 32);
}
void loop() {
  // print the string when there is data:
  if (serdat != "") {
    //Serial.println(serdat);
    unsigned long color = strtol(serdat.c_str(), NULL, 16);
    Serial.println(color);
    blastIR(color);
    serdat = "";
    delay(100);
  }
}
/*
  SerialEvent occurs whenever a new data comes in the
 hardware serial RX.  This routine is run between each
 time loop() runs, so using delay inside loop can delay
 response.  Multiple bytes of data may be available.
 */
void serialEvent() {
  if(Serial.available()) {
    serdat = Serial.readString();
    //serdat.trim();
  }
}


