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
  var activity_options = {
    chart: {
      renderTo: 'activity',
      type: 'spline',
      zoomType: 'x'
    },
    title: {
      text: 'Room Activity'
    },
    xAxis: {
      type: 'datetime'
    },
    yAxis: [{
      title: {
        text: 'Count'
      }
    }],
    plotOptions: {
      spline: {
        marker: {
          enabled: false
        }			}
    },
    series: [
      {name: "PIR Count", data: [], tooltip: {valueSuffix: ' PIR Events'}},
      {name: "Outlets On", data: [], tooltip: {valueSuffix: ' Outlets On'}}
    ]
  };
  for(entry_index in logData){
    entry = logData[entry_index]
    //lightoptions.series[0].data.push([i.time, i.light]);
    timept = Date.parse(entry.time);
    tempoptions.series[0].data.push([timept, entry.temp]);
    tempoptions.series[1].data.push([timept, entry.humid]);
    activity_options.series[0].data.push([timept, entry.pirct]);
    activity_options.series[1].data.push([timept, entry.outlets_on]);
  }
  var chart1 = new Highcharts.StockChart(tempoptions);
  var chart2 = new Highcharts.Chart(activity_options);
};
