import os, thread, serial, sys, time, glob
def main(argv):
	color = argv[0]
	thread.start_new_thread(os.system, ("espeak 'Setting lights to "+color+"'",))
	if(color in ["off", "toggle"]):
		color="on"
	irsig={"on": "0xFF02FD", "red": "0xFF1AE5", "blue": "0xFF9A65","green": "0xFFA25D", "white": "0xFF22DD", "bright": "0xFF3AC5", "dim": "0xFFBA45", "strobe": "0xFFD02F", "fade": "0xFFE01F"}
	usbser_list = glob.glob('/dev/ttyUSB*')
	if len(usbser_list) > 0:
		ser = serial.Serial(usbser_list[0], 9600);
		ser.write(irsig[color]);
		print ser.name
		x=0;
		while x==0:
			print ser.readline();
			x=1;
		ser.close();
	else:
		print "Cannot send command, no USB peripheral attached."
if __name__ == "__main__":
    main(sys.argv[1:])
