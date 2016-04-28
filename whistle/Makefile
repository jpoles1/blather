CC=gcc
LIBS=-lfftw3 -lasound
FILES=[]

%.o: %.c
	$(CC) -c -o $@ $<


whistle_control: whistle_control.o whistle_rec.o
	$(CC) -o whistle_control whistle_control.o $(LIBS)
	$(CC) -o whistle_rec whistle_rec.o $(LIBS)

clean:
	rm -f *.o *~ whistle_control
