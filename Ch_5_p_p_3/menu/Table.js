/**
 * Table.js
 * 
 * Manages medical records for the Thyroid Cancer Aide app.
 * This includes adding, editing, listing, and clearing records stored in localStorage.
 */

function loadUserInformation() {
  try {
    var user = JSON.parse(localStorage.getItem("user"));
    if (user != null) {
      $("#divUserSection").empty();
      var today = new Date();
      var dob = new Date(user.Birthdate);
      var age = Math.floor((today - dob) / (365.25 * 24 * 60 * 60 * 1000));
      
      //Display appropriate Cancer Stage
      if (user.CancerStage == "StageOne") {
        user.CancerStage = "Stage I";
      } else if (user.CancerStage == "StageTwo") {
        user.CancerStage = "Stage II";
      } else if (user.CancerStage == "StageThree") {
        user.CancerStage = "Stage III";
      } else {
        user.CancerStage = "Stage IV";
      }

      //Display appropriate TSH Range
      if (user.TSHRange == "StageA") {
        user.TSHRange = "A: 0.01-0.1 mIU/L";
      } else if (user.TSHRange == "StageB") {
        user.TSHRange = "B: 0.1-0.5 mIU/L";
      } else {
        user.TSHRange = "C: 0.35-2.0 mIU/L";
      }

      $("#divUserSection").append("User's Name: " + user.FirstName + " " + user.LastName +
        "<br>Age: " + age +
        "<br>Health Card Number: " + user.HealthCardNumber +
        "<br>New Password : " + user.NewPassword +
        "<br>Cancer Type: " + user.CancerType +
        "<br>Cancer Stage: " + user.CancerStage +
        "<br>TSH Range: " + user.TSHRange);
        
      $("#divUserSection").append("<br><a href='user_info.html' data-mini='true' id='btnProfile' data-role='button' data-icon='edit' data-iconpos='left' data-inline='true'>Edit Profile</a>");
      $('#btnProfile').button(); // 'Refresh' the button
    }
  } catch (e) {
    /* Google browsers use different error constant */
    if (window.navigator.vendor === "Google Inc.") {
      if (e == DOMException.QUOTA_EXCEEDED_ERR) {
        alert("Error: Local Storage limit exceeds.");
      }
    } else if (e == QUOTA_EXCEEDED_ERR) {
      alert("Error: Saving to local storage.");
    }
    console.log(e);
  }
}

// Function to compare dates for sorting records
function compareDates(a, b) {
  var x=new Date(a.Date);
  var y=new Date(b.Date);

  if (x>y)
  {
    return 1;
  }
  else
  {
    return -1;
  }
}


// Prepares the form for editing a record
function callEdit(index)
{
  $("#btnSubmitRecord").attr("indexToEdit", index);
  /*.button("refresh") function forces jQuery
  * Mobile to refresh the text on the button
  */
  $("#btnSubmitRecord").val("Edit");
  if($("#btnSubmitRecord").hasClass("btn-ui-hidden")) {
    $("#btnSubmitRecord").button("refresh");
  }
}

// Deletes a record from localStorage
function deleteRecord(index)
{
  try
  {
    var tbRecords=JSON.parse(localStorage.getItem("tbRecords"));
    tbRecords.sort(compareDates); // Sort records before deleting
    tbRecords.splice(index, 1);
    if (tbRecords.length==0)
    {
      /* No items left in records, remove entire
      * array from localStorage
      */
      localStorage.removeItem("tbRecords");
    }
    else
    {
      localStorage.setItem("tbRecords", JSON.stringify(tbRecords));
    }
  }
  catch(e)
  {
    /* Google browsers use different error
    * constant
    */
    if (window.navigator.vendor=="Google Inc.")
    {
      if (e == DOMException.QUOTA_EXCEEDED_ERR)
      {
        alert("Error: Local Storage limit exceeds.");
      }
    }
    else if (e == QUOTA_EXCEEDED_ERR) {
      alert("Error: Saving to local storage.");
    }
    console.log(e);
  }
}

// Delete the given index and re-display the table
function callDelete(index)
{
  deleteRecord(index);
  listRecords();
}


// Function to clear the new record form
function clearRecordForm()
{
  $('#datExamDate').val("");
  $('#txtTSH').val("");
  $('#txtThyroglobulin').val("");
  $('#txtSynthroidDose').val("");
  return true;
}

/* Checks that users have entered all valid info
 * and that the date they have entered is not in
 * the future
 */
function checkRecordForm() {
  //for finding current date
  var d = new Date();
  var month = d.getMonth() + 1;
  var date = d.getDate();
  // Format as YYYY-MM-DD to match the input type="date" format for correct string comparison
  var currentDate = d.getFullYear() + '-' +
    (('' + month).length < 2 ? '0' : '') + month + '-' +
    (('' + date).length < 2 ? '0' : '') + date;

  if (($("#txtTSH").val() != "") &&
    ($("#datExamDate").val() != "") &&
    ($("#datExamDate").val() <= currentDate) &&
    (parseFloat($("#txtSynthroidDose").val()) < 1000000) &&
    ($("#txtSynthroidDose").val() != "")) {
    return true;
  } else {
    return false;
  }
}


// Function to show a record's data in the form for editing
function showRecordForm(index)
{
  try
  {
    var tbRecords=JSON.parse(localStorage.getItem("tbRecords"));
    tbRecords.sort(compareDates); // Sort records to get the correct one
    var rec=tbRecords[index];
    $('#datExamDate').val(rec.Date);
    $('#txtTSH').val(rec.TSH);
    $('#txtThyroglobulin').val(rec.Tg);
    $('#txtSynthroidDose').val(rec.SynthroidDose);
  }
  catch(e)
  {
    /* Google browsers use different error
     * constant
     */
    if (window.navigator.vendor==="Google Inc.")
    {
      if (e == DOMException.QUOTA_EXCEEDED_ERR)
      {
        alert("Error: Local Storage limit exceeds.");
      }
    }
    else if (e == QUOTA_EXCEEDED_ERR){
      alert("Error: Saving to local storage.");
    }

    console.log(e);
  }
}

// Function to add a record to localStorage, as depicted in the user-provided image.
function addRecord() {
  if (checkRecordForm()) {
    var record = {
      "Date": $('#datExamDate').val(),
      "TSH": $('#txtTSH').val(),
      "Tg": $('#txtThyroglobulin').val(),
      "SynthroidDose": $('#txtSynthroidDose').val()
    };

    try {
      var tbRecords = JSON.parse(localStorage.getItem("tbRecords"));
      if (tbRecords == null) {
        tbRecords = [];
      }
      tbRecords.push(record);
      localStorage.setItem("tbRecords", JSON.stringify(tbRecords));
      alert("Saving Information");
      clearRecordForm();
    } catch (e) {
      /* Google browsers use different error
       * constant
       */
      if (window.navigator.vendor == "Google Inc.") {
        if (e == DOMException.QUOTA_EXCEEDED_ERR) {
          alert("Error: Local Storage limit exceeds.");
        }
      } else if (e == QUOTA_EXCEEDED_ERR) {
        alert("Error: Saving to local storage.");
      }
      console.log(e);
    }
  } else {
    alert("Please complete the form properly.");
  }
  return true;
}

// Function to edit an existing record
function editRecord(indexToEdit) {
  if (checkRecordForm()) {
    try {
      var tbRecords = JSON.parse(localStorage.getItem("tbRecords"));
      tbRecords.sort(compareDates); // Sort to match the view, ensuring correct record is edited.

      // Update record by replacing the object.
      tbRecords[indexToEdit] = {
        "Date": $('#datExamDate').val(),
        "TSH": $('#txtTSH').val(),
        "Tg": $('#txtThyroglobulin').val(),
        "SynthroidDose": $('#txtSynthroidDose').val()
      };
      
      localStorage.setItem("tbRecords", JSON.stringify(tbRecords));
      alert("Saving Information");
      clearRecordForm();
      listRecords();
    } catch (e) {
      /* Google browsers use different error
       * constant
       */
      if (window.navigator.vendor === "Google Inc.") {
        if (e == DOMException.QUOTA_EXCEEDED_ERR) {
          alert("Error: Local Storage limit exceeds.");
        }
      } else if (e == QUOTA_EXCEEDED_ERR) {
        alert("Error: Saving to local storage.");
      }
      console.log(e);
    }
  } else {
    alert("Please complete the form properly.");
  }
}

// Overwrite the placeholder listRecords function.
// This function is called from pageLoader.js on pageshow.
function listRecords() {
  try {
    var tbRecords = JSON.parse(localStorage.getItem("tbRecords"));
    
    if (tbRecords != null && tbRecords.length > 0) {
      //Order the records by date
      tbRecords.sort(compareDates);

      //Initializing the table
      $("#tblRecords").html(
        "<thead>" +
        " <tr>" +
        "   <th>Date</th>" +
        "   <th><abbr title='Thyroid Stimulating Hormone'>TSH(mIU/l)</abbr></th>" +
        "   <th><abbr title='Thyroglobulin'>Tg(ug/L)</abbr></th>" +
        "   <th>Synthroid Dose(ug)</th>" +
        "   <th>Edit / Delete</th>" +
        " </tr>" +
        "</thead>" +
        "<tbody>" +
        "</tbody>"
      );

      //Loop to insert the each record in the table
      for (var i = 0; i < tbRecords.length; i++) {
        var rec = tbRecords[i];
        var thyroglobulinValue = rec.Thyroglobulin || rec.Tg || '';
        $("#tblRecords tbody").append("<tr>" +
          " <td>" + rec.Date + "</td>" +
          " <td>" + rec.TSH + "</td>" +
          " <td>" + thyroglobulinValue + "</td>" +
          " <td>" + rec.SynthroidDose + "</td>" +
          " <td><a data-inline='true' data-mini='true' data-role='button' href='#pageNewRecordForm' onclick='callEdit(" + i + ")' data-icon='edit' data-iconpos='notext'></a>" +
          "<a data-inline='true' data-mini='true' data-role='button' href='#' onclick='callDelete(" + i + ")' data-icon='delete' data-iconpos='notext'></a></td>" +
          "</tr>");
      }
      
      // 'Refresh' the buttons. Without this the delete/edit buttons wont appear
      $('#tblRecords [data-role="button"]').button();
    } else {
      $("#tblRecords").html("");
    }
  } catch (e) {
    /* Google browsers use different error
     * constant
     */
    if (window.navigator.vendor === "Google Inc.") {
      if (e == DOMException.QUOTA_EXCEEDED_ERR) {
        alert("Error: Local Storage limit exceeds.");
      }
    } else if (e == QUOTA_EXCEEDED_ERR) {
      alert("Error: Saving to local storage.");
    }
    console.log(e);
  }
  return true;
}

// Bind events for the records page
$(document).on("pageinit", "#pageRecords", function() {
  $("#btnAddRecord").on("click", function() {
    // Set the submit button's value to 'Add' for the new record form.
    $("#btnSubmitRecord").val("Add");
  });

  // Removes all record data from localStorage
  $("#btnClearHistory").click(function() {
    localStorage.removeItem("tbRecords");
    listRecords();
    alert("All records have been deleted.");
  });
});

// Logic for the New Record Form page
$("#pageNewRecordForm").on("pageshow", function(){
  //We need to know if we are editing or adding a record everytime we show this page
  //If we are adding a record we show the form with blank inputs
  var formOperation=$("#btnSubmitRecord").val();

  if(formOperation=="Add")
  {
    clearRecordForm();
  }
  else if(formOperation=="Edit")
  {
    //If we are editing a record we load the stored data in the form
    showRecordForm($("#btnSubmitRecord").attr("indexToEdit"));
  }
});

$(document).on("pageinit", "#pageNewRecordForm", function() {
  $("#frmNewRecordForm").submit(function() {
    var formOperation = $("#btnSubmitRecord").val();

    if (formOperation == "Add")
    {
      addRecord();
      $.mobile.changePage("#pageRecords");
    }
    else if (formOperation == "Edit")
    {
      editRecord($("#btnSubmitRecord").attr("indexToEdit"));
      $.mobile.changePage("#pageRecords");
      $("#btnSubmitRecord").removeAttr("indexToEdit");
    }

    /*Must return false, or else submitting form
     * results in reloading the page
     */
    return false;
  });
});