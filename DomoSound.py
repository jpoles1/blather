import pyaudio
import wave
import sys
import os.path
import subprocess
CHUNK = 1024
class DomoSound:
    def __init__(self, asset_dir):
        #Load required sounds:
        self.sounds = {};
        self.sounds["beep_hi"] = os.path.join(asset_dir, "beep_hi.wav")
        self.sounds["beep_lo"] = os.path.join(asset_dir, "beep_lo.wav")
    def playSnd(self, soundName):
        wf = self.sounds[soundName]
        self.runningProcess = subprocess.Popen("aplay "+wf, shell=True)
    def speakBlock(self, text):
        os.system("espeak -ven+f3 -s80 '"+text+"'")
