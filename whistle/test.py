import subprocess
result = subprocess.Popen("./whistle_rec", stdout=subprocess.PIPE)
out = result.stdout.read()
