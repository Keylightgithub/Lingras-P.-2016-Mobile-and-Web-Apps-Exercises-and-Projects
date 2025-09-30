function adviceCompareDates(a, b) {
  var x = new Date(a.Date);
  var y = new Date(b.Date);
  // Sort dates in ascending order (oldest to newest)
  if (x > y) {
    return 1;
  } else if (x < y) {
    return -1;
  }
  return 0;
}

function advicePage() {
  var userJSON = localStorage.getItem("user");
  if (!userJSON) {
    alert("User data not found. Please create a user profile.");
    $.mobile.changePage("user_info.html");
    return;
  }

  var recordsJSON = localStorage.getItem("tbRecords");
  if (!recordsJSON) {
    alert("No records exist.");
    $.mobile.changePage("menu.html");
    return;
  }

  var tbRecords = JSON.parse(recordsJSON);
  if (tbRecords.length === 0) {
    alert("No records exist.");
    $.mobile.changePage("menu.html");
    return;
  }

  // Clear any previous advice text
  $('#adviceText').html('');

  var user = JSON.parse(userJSON);
  var TSHLevel = user.TSHRange;
  tbRecords.sort(adviceCompareDates);
  // Get the TSH from the most recent record, which is the last element after an ascending sort.
  var mostRecentRecord = tbRecords[tbRecords.length - 1];
  var TSH = parseFloat(mostRecentRecord.TSH);

  if (isNaN(TSH)) {
    alert("The latest TSH record has an invalid value. Cannot display suggestions.");
    $.mobile.changePage("records.html");
    return;
  }
  
  // RGraph drawing is handled inside the meter functions.

  if (TSHLevel == "StageA") {
    levelAMeter(TSH);
    levelAwrite(TSH, TSHLevel);
  } else if (TSHLevel == "StageB") {
    levelBMeter(TSH);
    levelBwrite(TSH, TSHLevel);
  } else if (TSHLevel == "StageC") {
    levelCMeter(TSH);
    levelCwrite(TSH, TSHLevel);
  } else {
    // Handle case where TSH range is not specified
    var advice = "Your target TSH range is not specified. Please consult your doctor for advice.";
    $('#adviceText').html('<p>' + advice + '</p>');
    // Also clear the canvas
    RGraph.clear(document.getElementById('AdviceCanvas'));
    return;
  }
}

function getRangeText(TSHLevel) {
  if (TSHLevel == "StageA") return "0.01-0.1 mIU/L";
  if (TSHLevel == "StageB") return "0.1-0.5 mIU/L";
  if (TSHLevel == "StageC") return "0.35-2.0 mIU/L";
  return "not specified";
}

function levelAwrite(TSH, TSHLevel) {
  if ((TSH >= 0.01) && (TSH <= 0.1)) {
    writeAdvice("green", TSH, TSHLevel);
  } else if ((TSH > 0.1) && (TSH <= 0.5)) {
    writeAdvice("yellow", TSH, TSHLevel);
  } else {
    writeAdvice("red", TSH, TSHLevel);
  }
}

function writeAdvice(level, TSH, TSHLevel) {
  var adviceLine1 = "";
  var adviceLine2 = "";
  if (level == "red") {
    adviceLine1 = "Please consult with your family";
    adviceLine2 = "physician urgently.";
  } else if (level == "yellow") {
    adviceLine1 = "Contact family physician and recheck bloodwork";
    adviceLine2 = "in 6-8 weeks.";
  } else if (level == "green") {
    adviceLine1 = "Repeat bloodwork in 3-6 months.";
  }
  
  var content = "<p>Your current TSH is " + TSH.toFixed(2) + ".</p>" +
                "<p>Your target TSH range is: " + getRangeText(TSHLevel) + "</p>" +
                "<p>Your TSH-level is " + level + ".</p>" +
                "<p>" + adviceLine1 + "<br>" + adviceLine2 + "</p>";
                
  $('#adviceText').html(content);
}

function levelBwrite(TSH, TSHLevel) {
  if ((TSH >= 0.1) && (TSH <= 0.5)) {
    writeAdvice("green", TSH, TSHLevel);
  } else if ((TSH > 0.5) && (TSH <= 2.0)) {
    writeAdvice("yellow", TSH, TSHLevel);
  } else if ((TSH >= 0.01) && (TSH < 0.1)) {
    writeAdvice("yellow", TSH, TSHLevel);
  } else {
    writeAdvice("red", TSH, TSHLevel);
  }
}

function levelCwrite(TSH, TSHLevel) {
  if ((TSH >= 0.35) && (TSH <= 2.0)) {
    writeAdvice("green", TSH, TSHLevel);
  } else if ((TSH > 2) && (TSH <= 10)) {
    writeAdvice("yellow", TSH, TSHLevel);
  } else if ((TSH >= 0.1) && (TSH < 0.35)) {
    writeAdvice("yellow", TSH, TSHLevel);
  } else {
    writeAdvice("red", TSH, TSHLevel);
  }
}

function drawGraphError(ex) {
    console.error("RGraph failed to draw: ", ex);
    var canvas = document.getElementById("AdviceCanvas");
    if (canvas) {
        RGraph.clear(canvas);
        var errorMsg = "An error occurred while trying to generate the graph: " + ex.message;
        $('#adviceText').html('<p style="color: red;">' + errorMsg + '</p>');
    }
}

function levelAMeter(TSH) {
  try {
    var canvas = document.getElementById('AdviceCanvas');
    var container = $(canvas).parent();
    canvas.width = container.width();
    canvas.height = canvas.width;
    
    RGraph.clear(canvas);
    var max = TSH > 3 ? TSH : 3;
    var ranges = [
      [0.5, 3, "red"],
      [0.1, 0.5, "yellow"],
      [0.01, 0.1, "lime"]
    ];
    if (TSH > 3) {
      ranges.push([3.01, TSH, "red"]);
    }

    var radius = Math.min(canvas.width / 2, canvas.height) * 0.95;
    var centerx = canvas.width / 2;
    var centery = canvas.width * 0.5;

    new RGraph.Gauge({
      id: 'AdviceCanvas',
      min: 0,
      max: max,
      value: TSH,
      options: {
        colorsRanges: ranges,
        unitsPost: ' mIU/L',
        textBoxed: false,
        textSize: 14,
        textFont: 'Verdana',
        textBold: true,
        textDecimals: 2,
        shadowOffsetX: 5,
        shadowOffsetY: 5,
        scaleDecimals: 2,
        title: 'TSH LEVEL',
        radius: radius,
        centerx: centerx,
        centery: centery
      }
    }).draw();
  } catch (ex) {
    drawGraphError(ex);
  }
}

function levelBMeter(TSH) {
  try {
    var canvas = document.getElementById('AdviceCanvas');
    var container = $(canvas).parent();
    canvas.width = container.width();
    canvas.height = canvas.width;

    RGraph.clear(canvas);
    var max = TSH > 3 ? TSH : 3;
    var ranges = [
      [2.01, 3, "red"],
      [0.51, 2, "yellow"],
      [0.1, 0.5, "lime"],
      [0.01, 0.1, "yellow"]
    ];
    if (TSH > 3) {
      ranges.push([3.01, TSH, "red"]);
    }
    
    var radius = Math.min(canvas.width / 2, canvas.height) * 0.95;
    var centerx = canvas.width / 2;
    var centery = canvas.width * 0.5;

    new RGraph.Gauge({
      id: 'AdviceCanvas',
      min: 0,
      max: max,
      value: TSH,
      options: {
        colorsRanges: ranges,
        unitsPost: ' mIU/L',
        textBoxed: false,
        textSize: 14,
        textFont: 'Verdana',
        textBold: true,
        textDecimals: 2,
        shadowOffsetX: 5,
        shadowOffsetY: 5,
        scaleDecimals: 2,
        title: 'TSH LEVEL',
        radius: radius,
        centerx: centerx,
        centery: centery
      }
    }).draw();
  } catch (ex) {
    drawGraphError(ex);
  }
}

function levelCMeter(TSH) {
  try {
    var canvas = document.getElementById('AdviceCanvas');
    var container = $(canvas).parent();
    canvas.width = container.width();
    canvas.height = canvas.width;
    
    RGraph.clear(canvas);
    var max = TSH > 15 ? TSH : 15;
    var ranges = [
      [10.01, 15, "red"],
      [2.01, 10, "yellow"],
      [0.35, 2, "lime"],
      [0.1, 0.34, "yellow"]
    ];
    if (TSH > 15) {
      ranges.push([15.01, TSH, "red"]);
    }
    
    var radius = Math.min(canvas.width / 2, canvas.height) * 0.95;
    var centerx = canvas.width / 2;
    var centery = canvas.width * 0.5;

    new RGraph.Gauge({
      id: 'AdviceCanvas',
      min: 0,
      max: max,
      value: TSH,
      options: {
        colorsRanges: ranges,
        unitsPost: ' mIU/L',
        textBoxed: false,
        textSize: 14,
        textFont: 'Verdana',
        textBold: true,
        textDecimals: 2,
        shadowOffsetX: 5,
        shadowOffsetY: 5,
        scaleDecimals: 2,
        title: 'TSH LEVEL',
        radius: radius,
        centerx: centerx,
        centery: centery
      }
    }).draw();
  } catch (ex) {
    drawGraphError(ex);
  }
}