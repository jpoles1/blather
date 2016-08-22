window.onload = function(){
  Highcharts.setOptions({
    global: {
        timezoneOffset: 6*60
    }
  })
  function syncExtremes(e) {
      var thisChart = this.chart;

      if (typeof e === "undefined" || e["trigger"] !== 'syncExtremes') { // Prevent feedback loop
          Highcharts.each(Highcharts.charts, function (chart) {
              if (chart !== thisChart) {
                  if (chart.xAxis[0].setExtremes) { // It is null while updating
                    if (typeof e === "undefined"){
                      chart.xAxis[0].setExtremes(chart1.min, chart1.max, undefined, false, { trigger: 'syncExtremes' });
                    }
                    else{
                      chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, { trigger: 'syncExtremes' });
                    }
                  }
              }
          });
      }
  }
  roomData = JSON.parse(rawRoomData)
  eventData = JSON.parse(rawEventData)
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
      type: 'datetime',
      events: {setExtremes: syncExtremes}
    },
    rangeSelector : {
      buttons : [{
          type : 'hour',
          count : 1,
          text : '1h'
      }, {
          type : 'hour',
          count : 12,
          text : '12h'
      }, {
          type : 'day',
          count : 1,
          text : '1D'
      },{
          type : 'day',
          count : 2,
          text : '2D'
      },{
          type : 'day',
          count : 7,
          text : 'Wk'
      },{
          type : 'all',
          count : 1,
          text : 'All'
      }],
      selected : 1,
      inputEnabled : false
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
    tooltip: {
      shared: true
    },
    plotOptions: {
      spline: {
        marker: {
          enabled: false
        }			}
    },
    series: [
      {name: "Temperature", data: [], tooltip: {valueSuffix: ' °F'}},
      {name: "Humidity", data: [], yAxis: 1, tooltip: {valueSuffix: ' %'}}
    ]
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
      type: 'datetime',
      events: {setExtremes: syncExtremes},
      plotLines: []
    },
    rangeSelector : {
      selected: 1
    },
    yAxis: [{
      title: {
        text: 'PIR Count'
      }
    },{
      title: {
        text: 'Outlets On'
      }, opposite: true
    }],
    tooltip: {
      shared: true
    },
    plotOptions: {
      spline: {
        marker: {
          enabled: false
        }			}
    },
    series: [
      {name: "PIR Count", data: []},
      {name: "Outlets On", data: [], yAxis: 1}
    ]
  };
  for(entry_index in roomData){
    entry = roomData[entry_index]
    //lightoptions.series[0].data.push([i.time, i.light]);
    timept = Date.parse(entry.time);
    tempoptions.series[0].data.push([timept, entry.temp]);
    tempoptions.series[1].data.push([timept, entry.humid]);
    activity_options.series[0].data.push([timept, entry.pirct]);
    activity_options.series[1].data.push([timept, entry.outlets_on]);
  }
  for(entry_index in eventData){
    entry = eventData[entry_index]
    //lightoptions.series[0].data.push([i.time, i.light]);
    timept = Date.parse(entry.time);
    if(entry["event"] == "Restarted"){
      activity_options.xAxis["plotLines"].push({color: 'red', value: timept, width: .5})
    }
    if(entry["event"] == "Inactive"){
      activity_options.xAxis["plotLines"].push({color: 'blue', value: timept, width: .5})
    }
    if(entry["event"] == "PowerSaver"){
      activity_options.xAxis["plotLines"].push({color: 'green', value: timept, width: .5})
    }
    if(entry["event"] == "Auto On Mistake"){
      activity_options.xAxis["plotLines"].push({color: 'black', value: timept, width: .5})
    }
  }
  var chart1 = new Highcharts.StockChart(tempoptions);
  var chart2 = new Highcharts.Chart(activity_options);
  syncExtremes()
};
