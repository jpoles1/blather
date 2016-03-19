window.onload = function(){
  logData = JSON.parse(rawData)
  var tempoptions = {
    chart: {
      renderTo: 'temp',
      type: 'spline',
      zoomType: 'x'
    },
    title: {
      text: 'Room Temperature and Humidity'
    },
    xAxis: {
      type: 'datetime'
    },
    yAxis: [{
      labels: {
        format: '{value}°F'
      },
      title: {
        text: 'Temperature'
      }
    },{
      labels: {
        format: '{value}%'
      },
      title: {
        text: 'Humidity'
      }, opposite: true
    }],
    plotOptions: {
      spline: {
        marker: {
          enabled: false
        }			}
    },
    series: [{name: "Temperature", data: [], tooltip: {valueSuffix: ' °F'}}, {name: "Humidity", data: [], yAxis: 1, tooltip: {valueSuffix: ' %'}}]

  };
  for(entry_index in logData){
    entry = logData[entry_index]
    //lightoptions.series[0].data.push([i.time, i.light]);
    tempoptions.series[0].data.push([entry.time, entry.temp]);
    tempoptions.series[1].data.push([entry.time, entry.humid]);
  }
  console.log(tempoptions.series[0])
  var chart1 = new Highcharts.Chart(tempoptions);
  //var chart2 = new Highcharts.Chart(lightoptions);
};
