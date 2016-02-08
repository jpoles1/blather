import sys, os, pyaudio
from pocketsphinx import *

conf_dir = os.path.expanduser("~/.config/blather")
lang_dir = os.path.join(conf_dir, "language")
plugin_dir = os.path.join(conf_dir, "plugins")
command_file = os.path.join(conf_dir, "commands.conf")
strings_file = os.path.join(conf_dir, "sentences.corpus")
history_file = os.path.join(conf_dir, "blather.history")
lang_file = os.path.join(lang_dir,'lm')
dic_file = os.path.join(lang_dir,'dic')

# Create a decoder with certain model
config = Decoder.default_config()
config.set_string('-hmm', 'hmm/en_US/hub4wsj_sc_8k')
config.set_string('-dict', dic_file)
config.set_string('-keyphrase', 'hal')
config.set_float('-kws_threshold', 1e-40)

decoder = Decoder(config)
decoder.start_utt('spotting')

stream = p.open(format=pyaudio.paInt16, channels=1, rate=16000, input=True, frames_per_buffer=1024)
stream.start_stream()        

while True:
    buf = stream.read(1024)
    decoder.process_raw(buf, False, False)
    if decoder.hyp() != None and decoder.hyp().hypstr == 'oh mighty computer':
        print "Detected keyword, restarting search"
        decoder.end_utt()
        decoder.start_utt('spotting')
