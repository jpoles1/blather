import os, thread, serial, sys, time, glob
def sendSerial(msg):
	usbser_list = glob.glob('/dev/ttyUSB*')
	if len(usbser_list) > 0:
		ser = serial.Serial(usbser_list[0], 9600, timeout=5);
		print "Sending: "+msg
		rec =  ser.readline().strip();
		print "Received: "+rec
		rec = "ready"
		while rec in ["ready", ""]:
			ser.write(msg);
			rec =  ser.readline().strip();
			print "Received: "+rec
		ser.close();
	else:
		time.sleep(1.8);
		thread.start_new_thread(os.system, ("espeak 'USB Disconnected'",))
		print "Cannot send command, no USB peripheral attached."
def main(argv):
	color = argv[0]
	if color in ["read"]:
		color = "red";
	if color in ["blew"]:
		color = "blue";
	if color in ["right"]:
		color = "bright";
	if color in ["babe", "paid"]:
		color = "fade";
	if color in ["tim", "them"]:
		color = "dim";
	thread.start_new_thread(os.system, ("espeak 'Setting lights to "+color+"'",))
	if(color in ["off", "toggle"]):
		color="on"
	irsig={"on": "0xFF02FD", "red": "0xFF1AE5", "blue": "0xFF9A65","green": "0xFFA25D", "white": "0xFF22DD", "bright": "0xFF3AC5", "dim": "0xFFBA45", "strobe": "0xFFD02F", "fade": "0xFFE01F"}
	sendSerial(irsig[color])
if __name__ == "__main__":
    main(sys.argv[1:])
