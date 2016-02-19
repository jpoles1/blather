#!/usr/bin/env python2

# -- this code is licensed GPLv3
# Copyright 2013 Jezra
# Modifications by: Jordan Poles - 2016

import sys, signal, gobject,os.path
import subprocess #used to execute commands
import shutil #used to copy plugins directory
import psutil #used for reading process ID
import time #used for keyword time option
from optparse import OptionParser
import serial, filecmp
import wit, json
#Extensions
from DomoSound import DomoSound
from DomoWeather import DomoWeather
#ser = serial.Serial('/dev/ttyUSB0', 9600)
#keywords defined in the commands.conf file
keywords = []
confidence_lvl = .5

#where are the files?
conf_dir = os.path.expanduser("config")
lang_dir = os.path.join(conf_dir, "language")
file_dir = os.path.dirname(os.path.abspath(__file__))
plugin_dir = os.path.join(conf_dir, "plugins")
command_file = os.path.join(conf_dir, "commands.conf")
command_bak_file = os.path.join(conf_dir, "commands.bak.conf")
strings_file = os.path.join(conf_dir, "sentences.corpus")
language_update_script = os.path.join(file_dir, "language_updater.sh")
lang_file = os.path.join(lang_dir,'lm')
dic_file = os.path.join(lang_dir,'dic')
#make the lang_dir if it doesn't exist
if not os.path.exists(lang_dir):
    os.makedirs(lang_dir)
if not os.path.exists(plugin_dir):
    shutil.copytree(os.path.join(file_dir, "plugins"), plugin_dir)

class Blather:
    def __init__(self, opts):
        #import the recognizer so Gst doesn't clobber our -h
        from Recognizer import Recognizer
        #keep track of the opts
        self.opts = opts
        self.continuous_listen = True
        self.commands = {}
        self.read_commands()
        self.recognizer = Recognizer(lang_file, dic_file, opts.microphone )
        self.recognizer.connect('finished',self.recognizer_finished)
        self.matchTime = 0
        try:
            with open(os.path.join(conf_dir, "witapikey.conf"), "r") as apiconf:
                self.witAPI = apiconf.read().strip()
                print self.witAPI
        except:
            raise RuntimeError("Cannot Run Without a WIT_API_KEY")
        self.keywordTimeLimit = opts.keytime #set to 0 to always speak the keyword
        #updates language file and commands on start
        self.domoSound = DomoSound(os.path.join(file_dir, "assets"))
        self.domoWeather = DomoWeather()
        self.checkCommandFile()
        #read options
    def read_commands(self):
        #read the.commands file
        file_lines = open(command_file)
        strings = open(strings_file, "w")
        self.commands = {}
        for line in file_lines:
            #print line
            #trim the white spaces
            line = line.strip()
            #if the line has length and the first char isn't a hash
            if len(line) and line[0]!="#":
                #this is a parsible line
                (key,value) = line.split(":",1)
                #print key, value
                #get the keyword out of the commands file
                if value == "keyword" and key.lower() not in keywords:
                    keywords.append(key.lower())
                    print("KEYWORD: "+key, keywords)
                self.commands[key.strip().lower()] = value.strip()
                strings.write( key.strip()+"\n")
        strings.close()
    def recognizer_finished(self, recognizer, text):
        #split the words spoken into an array
        t = text.lower()
        if t in keywords:
            print("HEARD KEYWORD!")
            self.recognizer.pause()
            self.matserchTime = time.time()
            self.domoSound.playSnd("beep_hi")
            time.sleep(.2)
            self.witRec()
            self.domoSound.playSnd("beep_lo")
            time.sleep(2)
            self.recognizer.listen()
        #call the process
    def witRec(self):
        wit.init()
        resp = json.loads(wit.voice_query_auto(self.witAPI))
        print(type(resp))
        try:
            for res in resp["outcomes"]:
                if(res["confidence"] > confidence_lvl):
                    print("Response: {}".format(res))
                    self.handleWit(res);
        except Exception as e:
            print("Merp: ", e)
        wit.close()
    def witRecOld(self):
        wit.init()
        wit.voice_query_start(self.witAPI)
        time.sleep(3)
        resp = json.loads(wit.voice_query_stop())
        print(type(resp))
        for res in resp["outcomes"]:
            if(res["confidence"] > confidence_lvl):
                print("Response: {}".format(res))
                self.handleWit(res);
        wit.close()
    def handleWit(self, res):
        if res["intent"] == "Lights":
            try:
                cmd = "python ardlights.py "+res["entities"]["color"][0]["value"]
                self.runningProcess = subprocess.Popen(cmd, shell=True)
                print cmd
            except:
                cmd = "espeak 'What about the lights? I'm confused.'"
                #self.runningProcess = subprocess.Popen(cmd, shell=True)
                self.domoSound.speakBlock(cmd)
        if res["intent"] == "weather":
            try:
                location = res["entities"]["location"][0]["value"]
                print("Weather Location:", location)
            except:
                print("No location!")
                location = "77005"
            try:
                we_time = res["entities"]["datetime"][0]["value"].split("T")[0]
                print("Weather time:", we_time)
            except:
                print("No time!")
                we_time = None
            cmd = self.domoWeather.getWeather(location, we_time)
            self.domoSound.speakBlock(cmd)
        elif res["intent"] == "Cancel":
            try:
                print("Cancelling previous command with PID "+str(self.runningProcess.pid))
                self.terminate_child_processes(self.runningProcess.pid)
                #terminate parent process
                self.runningProcess.terminate();
                cmd = "espeak 'cancelling previous command'"
                self.runningProcess = subprocess.Popen(cmd, shell=True)
            except:
                print "No process to terminate"
    def run(self):
        blather.recognizer.listen()

    def quit(self):
        ser.close();
        sys.exit(0)

    def checkCommandFile(self):
        if not filecmp.cmp(command_file, command_bak_file):
            print("Command.conf file modified")
            subprocess.call(language_update_script)
            print("Language file updated")
        self.read_commands()
    def load_resource(self,string):
        local_data = os.path.join(os.path.dirname(__file__), 'data')
        paths = ["/usr/share/blather/","/usr/local/share/blather", local_data]
        for path in paths:
            resource = os.path.join(path, string)
            if os.path.exists( resource ):
                return resource
        #if we get this far, no resource was found
        return False
    # terminate_child_processes kills any child processes under a parent pid.
    # It uses pgrep to list child processes, so the system must have pgrep installed in order
    # to use the 'cancel' commands
    def terminate_child_processes(self, pid):
        out = subprocess.Popen(['pgrep', '-P', str(pid)], stdout=subprocess.PIPE).communicate()[0]
        childProcesses = out.splitlines()
        # Kill any orphaned children.
        for pid in childProcesses:
            #recursive call to kill entire family tree
            self.terminate_child_processes(int(pid))
            print("Killing child with PID "+str(pid))
            p = psutil.Process(int(pid))
            p.terminate()
if __name__ == "__main__":
    #create a bunch of commandline options
    parser = OptionParser()
    parser.add_option("-i", "--interface",  type="string", dest="interface",
        action='store',
        help="Interface to use (if any). 'q' for Qt, 'g' for GTK")
    parser.add_option("-c", "--continuous",
        action="store_true", dest="continuous", default=True,
        help="starts interface with 'continuous' listen enabled")
    parser.add_option("-m", "--microphone", type="int",
        action="store", dest="microphone", default=None,
        help="Audio input card to use (if other than system default)")
    parser.add_option("-k", "--keytime", type="int",
        action="store", dest="keytime", default=0,
        help="In continuous mode, the amount of time (in seconds) after the keyword is initially used before having to say the keyword again to activate a command.")

    (options, args) = parser.parse_args()
    #make our blather object
    blather = Blather(options)
    #init gobject threads
    gobject.threads_init()
    #we want a main loop
    main_loop = gobject.MainLoop()
    #handle sigint
    signal.signal(signal.SIGINT, signal.SIG_DFL)
    #run the blather
    blather.run()
    #start the main loop
    try:
        main_loop.run()
    except:
        print "time to quit"
        main_loop.quit()
        sys.exit()
