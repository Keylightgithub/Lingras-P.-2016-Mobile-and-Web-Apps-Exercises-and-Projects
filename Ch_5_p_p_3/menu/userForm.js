function setFormState(state) {
    var isEdit = (state === 'edit');
    
    // Toggle readonly/disabled properties. Using 'disabled' is more robust than 'readonly'.
    $("input[type='text'], input[type='date'], input[type='password']").prop("disabled", !isEdit);
    $("select").selectmenu(isEdit ? 'enable' : 'disable');

    // Refresh input styles
    $("input[type='text'], input[type='date'], input[type='password']").textinput('refresh');

    // Toggle button visibility using the jQuery Mobile wrapper for consistency
    if (isEdit) {
        $("#btnEdit").closest('.ui-btn').hide();
        $("#btnSave").closest('.ui-btn').show();
        $("#btnCancel").closest('.ui-btn').show();
    } else {
        $("#btnEdit").closest('.ui-btn').show();
        $("#btnSave").closest('.ui-btn').hide();
        $("#btnCancel").closest('.ui-btn').hide();
    }
}

function showUserForm() {
    var user = null;
    var userExists = false;
    try {
        var userJSON = localStorage.getItem("user");
        if (userJSON) {
            user = JSON.parse(userJSON);
            userExists = true;
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

    if (user) {
        $("#txtFirstName").val(user.FirstName);
        $("#txtLastName").val(user.LastName);
        $("#txtHealthCardNumber").val(user.HealthCardNumber);
        $("#datBirthdate").val(user.Birthdate);
        $("#slcCancerType").val(user.CancerType).selectmenu('refresh');
        $("#slcCancerStage").val(user.CancerStage).selectmenu('refresh');
        $("#slcTSHRange").val(user.TSHRange).selectmenu('refresh');
        $("#changePassword").val(user.NewPassword);
    }
    
    // Set initial form state
    if (userExists) {
        setFormState('view');
    } else {
        setFormState('edit');
    }
}

function checkUserForm() {
    //Check for empty fields in the form
    var d = new Date();
    var month = d.getMonth() + 1;
    var date = d.getDate();
    var year = d.getFullYear();
    var currentDate = year + '-' +
        (('' + month).length < 2 ? '0' : '') + month + '-' +
        (('' + date).length < 2 ? '0' : '') + date;
    var birthDate = $("#datBirthdate").val();

    if (($("#txtFirstName").val() != "") &&
        ($("#txtLastName").val() != "") &&
        ($("#txtHealthCardNumber").val() != "") &&
        (birthDate != "") && (birthDate <= currentDate) &&
        ($("#slcCancerType").val() != "") &&
        ($("#slcCancerStage").val() != "") &&
        ($("#slcTSHRange").val() != "") &&
        ($("#changePassword").val() != "")
    ) {
        return true;
    } else {
        return false;
    }
}

function saveUserForm() {
    if (checkUserForm()) {
        var user = {
            "FirstName": $("#txtFirstName").val(),
            "LastName": $("#txtLastName").val(),
            "HealthCardNumber": $("#txtHealthCardNumber").val(),
            "NewPassword": $("#changePassword").val(),
            "Birthdate": $("#datBirthdate").val(),
            "CancerType": $("#slcCancerType").val(),
            "CancerStage": $("#slcCancerStage").val(),
            "TSHRange": $("#slcTSHRange").val()
        };

        try {
            localStorage.setItem("user", JSON.stringify(user));
            alert("Saving Information");
            // Always redirect to the records page to show the saved data
            $.mobile.changePage("records.html");
        } catch(e) {
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                alert("Error: Local Storage limit exceeds.");
            } else {
                alert("An error occurred while saving data.");
            }
            console.log("Error saving to localStorage:", e);
        }
    } else {
        alert("Please complete the form properly.");
    }
}

$(document).on('pagecreate', '#pageUserInfo', function () {
    // Edit button click handler
    $("#btnEdit").on('click', function () {
        setFormState('edit');
    });

    // Cancel button click handler
    $("#btnCancel").on('click', function () {
        if (localStorage.getItem("user") !== null) {
            // Existing user, reload data and go to view mode
            showUserForm();
        } else {
            // New user, go back to menu
            $.mobile.changePage("menu.html");
        }
    });

    // Form submission handler (Save button)
    $("#frmUserForm").on('submit', function (event) {
        event.preventDefault();
        saveUserForm();
    });
});