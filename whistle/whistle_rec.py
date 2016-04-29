#!/usr/bin/env python3

# NOTE: this example requires PyAudio because it uses the Microphone class
import re
import subprocess
import shlex
import speech_recognition as sr
import urllib.request
import wave
import pyaudio
from os import getcwd, system, environ
from time import sleep
from os.path import join, dirname
#Fetch env variables
from dotenv import load_dotenv
dotenv_path = join(dirname(__file__), '../.env')
load_dotenv(dotenv_path)
WIT_AI_KEY = environ["WIT_AI_KEY"]
#Setup sounds
sound_dir = getcwd()+"/../res/sound/"
def playWAV(filename):
    system("aplay "+sound_dir+filename)
global listening, misunderstood;
misunderstood = 0;
listening = 0;
# obtain audio from the microphone
def commandListen(beep=1):
    global listening, misunderstood;
    r = sr.Recognizer()
    with sr.Microphone() as source:
        if beep==1:
            playWAV("beep_hi.wav")
            sleep(.2)
        print("Say something!")
        audio = r.listen(source)
        print("Processing audio...")
        if beep==1:
            playWAV("beep_lo.wav")
            sleep(.5)
    # recognize speech using Wit.ai
    try:
        output = r.recognize_wit(audio, key=WIT_AI_KEY);
        print("Wit.ai thinks you said..\n" + output)
        url_output = output.replace(" ", "%20")
        print(url_output)
        resp = urllib.request.urlopen("http://192.168.1.100:3030/voice?cmd="+url_output).read().decode('utf-8')
        print("Automation server says...\n" + resp)
        if(re.compile(r"^Command Failed").match(resp) != None):
            misunderstood+=1
            if misunderstood<2:
                system("espeak 'Say again?'")
                sleep(.5)
                commandListen(0)
        else:
            misunderstood=0
    except sr.UnknownValueError:
        print("Wit.ai could not understand audio")
    except sr.RequestError as e:
        print("Could not request results from Wit.ai service; {0}".format(e))
    listening = 0
    sleep(1)
while True:
    misunderstood=0
    subprocess.Popen(["./whistle_rec"]).wait()
    commandListen();
    sleep(.7)
