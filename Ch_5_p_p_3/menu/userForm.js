function setFormState(page, state) {
    var isEdit = (state === 'edit');
    
    // Toggle readonly/disabled properties
    $("input[type='text'], input[type='date'], input[type='password']", page).attr("readonly", !isEdit);
    $("select", page).selectmenu(isEdit ? 'enable' : 'disable');

    // Refresh input styles
    $("input[type='text'], input[type='date'], input[type='password']", page).textinput('refresh');

    // Toggle button visibility
    if (isEdit) {
        $("#btnEdit", page).closest('.ui-btn').hide();
        $("#btnSave", page).show();
        $("#btnCancel", page).show();
    } else {
        $("#btnEdit", page).closest('.ui-btn').show();
        $("#btnSave", page).hide();
        $("#btnCancel", page).hide();
    }
}

function showUserForm(page) {
    var user = null;
    var userExists = false;
    try {
        var userJSON = localStorage.getItem("user");
        if (userJSON) {
            user = JSON.parse(userJSON);
            userExists = true;
        }
    } catch (e) {
        console.log(e);
        alert("Error reading user data.");
    }

    if (user) {
        $("#txtFirstName", page).val(user.FirstName);
        $("#txtLastName", page).val(user.LastName);
        $("#txtHealthCardNumber", page).val(user.HealthCardNumber);
        $("#datBirthdate", page).val(user.Birthdate);
        $("#slcCancerType", page).val(user.CancerType).selectmenu('refresh');
        $("#slcCancerStage", page).val(user.CancerStage).selectmenu('refresh');
        $("#slcTSHRange", page).val(user.TSHRange).selectmenu('refresh');
        $("#changePassword", page).val(user.NewPassword);
    }
    
    // Set initial form state
    if (userExists) {
        setFormState(page, 'view');
    } else {
        setFormState(page, 'edit');
    }
}

function checkUserForm(page) {
    //Check for empty fields in the form
    var d = new Date();
    var month = d.getMonth() + 1;
    var date = d.getDate();
    var year = d.getFullYear();
    var currentDate = year + '-' +
        (('' + month).length < 2 ? '0' : '') + month + '-' +
        (('' + date).length < 2 ? '0' : '') + date;
    var birthDate = $("#datBirthdate", page).val();

    if (($("#txtFirstName", page).val() != "") &&
        ($("#txtLastName", page).val() != "") &&
        ($("#txtHealthCardNumber", page).val() != "") &&
        (birthDate != "") && (birthDate <= currentDate) &&
        ($("#slcCancerType", page).val() != "Select Cancer Type") &&
        ($("#slcCancerStage", page).val() != "Select Cancer Stage") &&
        ($("#slcTSHRange", page).val() != "Select TSH Range") &&
        ($("#changePassword", page).val() != "")
    ) {
        return true;
    } else {
        return false;
    }
}

function saveUserForm(page) {
    if (checkUserForm(page)) {
        var user = {
            "FirstName": $("#txtFirstName", page).val(),
            "LastName": $("#txtLastName", page).val(),
            "HealthCardNumber": $("#txtHealthCardNumber", page).val(),
            "NewPassword": $("#changePassword", page).val(),
            "Birthdate": $("#datBirthdate", page).val(),
            "CancerType": $("#slcCancerType option:selected", page).val(),
            "CancerStage": $("#slcCancerStage option:selected", page).val(),
            "TSHRange": $("#slcTSHRange option:selected", page).val()
        };

        try {
            localStorage.setItem("user", JSON.stringify(user));
            alert("Saving Information");
            // If this is the first time saving, redirect to the main menu
            if (!localStorage.getItem("user")) {
                 $.mobile.changePage("menu.html");
            } else {
                 setFormState(page, 'view');
            }
        } catch(e) {
            if (window.navigator.vendor === "Google Inc.") {
                if (e.name === 'QuotaExceededError' || e.code === 22) {
                    alert("Error: Local Storage limit exceeds.");
                }
            } else if (e.name === 'QuotaExceededError' || e.code === 22) {
                alert("Error: Saving to local storage.");
            } else {
                alert("An error occurred saving to local storage.");
            }
            console.log(e);
        }
    } else {
        alert("Please complete the form properly.");
    }
}

$(document).on('pageinit', '#pageUserInfo', function(){
    var page = this;
    
    // Populate form and set initial state
    showUserForm(page);

    // Edit button click handler
    $("#btnEdit", page).on('click', function() {
        setFormState(page, 'edit');
    });

    // Cancel button click handler
    $("#btnCancel", page).on('click', function() {
        // Reload data from storage and go back to view mode
        showUserForm(page);
    });

    // Form submission handler (Save button)
    $("#frmUserForm", page).on('submit', function(event) {
        event.preventDefault(); 
        saveUserForm(page);
    });
});