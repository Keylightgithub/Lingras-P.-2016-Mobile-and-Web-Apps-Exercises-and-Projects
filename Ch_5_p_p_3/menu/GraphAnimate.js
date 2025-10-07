/**
 * Graphanimate.js
 * 
 * Manages drawing the TSH history graph for the Thyroid Cancer Aide app.
 */

// Function to compare dates for sorting records. It's also in Table.js but graph.html doesn't load it.
function compareDates(a, b) {
  var x = new Date(a.Date);
  var y = new Date(b.Date);

  if (x > y) {
    return 1;
  } else {
    return -1;
  }
}

function getTSHhistory(TSHarr, Datearr) {
  // Fetches TSH history from sessionStorage and populates the arrays.
  var tbRecords = JSON.parse(sessionStorage.getItem("tbRecords"));
  if (tbRecords) {
    tbRecords.sort(compareDates);
    for (var i = 0; i < tbRecords.length; i++) {
      if (tbRecords[i].Date) { // Defensive check for valid date
        // The date from the input is in "YYYY-MM-DD" format.
        var dateParts = tbRecords[i].Date.split('-');
        if (dateParts.length === 3) {
          var month = parseInt(dateParts[1], 10);
          var day = parseInt(dateParts[2], 10);

          // The x-axis label, formatted as M/D
          Datearr.push(month + "/" + day);
          
          // The TSH value is the point to plot, converted to a float.
          TSHarr.push(parseFloat(tbRecords[i].TSH));
        }
      }
    }
  }
}

function getTSHbounds() {
  var user = JSON.parse(sessionStorage.getItem("user"));
  var TSHLevel = user.TSHRange;
  var bounds = { lower: 0, upper: 0 };

  if (TSHLevel == "StageA") {
    bounds.upper = 0.1;
    bounds.lower = 0.01;
  } else if (TSHLevel == "StageB") {
    bounds.upper = 0.5;
    bounds.lower = 0.1;
  } else {
    bounds.upper = 2.0;
    bounds.lower = 0.35;
  }
  return bounds;
}

function drawLines(TSHarr, tshUpper, tshLower, Datearr) {
  var canvas = document.getElementById("GraphCanvas");
  RGraph.clear(canvas);

  var allValues = TSHarr.concat(tshUpper, tshLower);
  var maxValue = 0;
  for (var i = 0; i < allValues.length; i++) {
      var val = parseFloat(allValues[i]);
      if (!isNaN(val) && val > maxValue) {
          maxValue = val;
      }
  }

  var yaxisMax;
  if (maxValue < 1) {
    yaxisMax = 1;
  } else if (maxValue < 2) {
    yaxisMax = 2;
  } else {
    yaxisMax = Math.ceil(maxValue);
  }
  
  new RGraph.Line({
      id: 'GraphCanvas',
      data: [TSHarr, tshUpper, tshLower],
      options: {
          xaxisLabels: Datearr,
          colors: ['blue', 'green', 'red'],
          linewidth: 2,
          yaxisScaleDecimals: 1,
          yaxisScaleMax: yaxisMax,
          xaxispos: 'bottom',
          gutterLeft: 50,
          gutterBottom: 50,
          tickmarks: null,
          title: 'TSH',
          backgroundGridColor: '#efefef',
          backgroundGridVlines: true,
          backgroundGridHlines: true,
          backgroundGridBorder: false,
          axisColor: '#666',
          textColor: '#333'
      }
  }).draw();
}

function drawGraph() {
  var tbRecordsJSON = sessionStorage.getItem("tbRecords");
  if (tbRecordsJSON === null || JSON.parse(tbRecordsJSON).length === 0) {
    alert("No records exist.");
    $.mobile.changePage("menu.html");
  } else {
    var canvas = document.getElementById("GraphCanvas");
    var container = $(canvas).parent();

    // Calculate size based on container, maintaining a 1:1 ratio.
    var size = container.width();
    
    // Ensure canvas is not too big on large screens or too small.
    if (size > 500) size = 500;
    if (size < 250) size = 250;

    canvas.width = size;
    canvas.height = size;

    var TSHarr = new Array();
    var Datearr = new Array();
    getTSHhistory(TSHarr, Datearr);

    var bounds = getTSHbounds();
    var tshLower = new Array(TSHarr.length).fill(bounds.lower);
    var tshUpper = new Array(TSHarr.length).fill(bounds.upper);

    drawLines(TSHarr, tshUpper, tshLower, Datearr);
  }
}