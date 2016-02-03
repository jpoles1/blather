import os, thread, serial, sys, time
def main(argv):
	color = argv[0]
	thread.start_new_thread(os.system,("espeak 'Setting lights to "+color+"'",))
	if(color in ["off", "toggle"]):
		color="on"
	irsig={"on": "0xFF02FD", "red": "0xFF1AE5", "blue": "0xFF9A65","green": "0xFFA25D", "white": "0xFF22DD"}
	ser = serial.Serial('/dev/ttyUSB0', 9600)
	print(ser.name)
	ser.write(irsig[color])
	ser.close();
if __name__ == "__main__":
    main(sys.argv[1:])
