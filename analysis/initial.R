library(jsonlite)
library(ggplot2)
raw_status = fromJSON("data/status_log.json")
raw_status$time = as.POSIXlt(raw_status$time, format= "%Y-%m-%dT%H:%M:%S")
nrow = dim(raw_status)[1]-1
raw_status = raw_status[1:nrow]
ggplot(data=raw_status, aes(x=time, y=(temp)))+geom_point()+geom_line()
ggplot(data=raw_status, aes(x=time, y=SMA(temp)))+geom_point()+geom_smooth(method="lm")

