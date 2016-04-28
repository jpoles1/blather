import re

resp = "Command failed: test"
mat = re.compile(r"^Command failed").match(resp);
print(mat)
if(mat != None):
    print("YES")
