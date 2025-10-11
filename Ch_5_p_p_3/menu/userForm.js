// Add SERVER_URL from Navigation.js as it's not loaded on this page
var SERVER_URL = 'http://140.184.132.239:3000';

function setFormState(state) {
    var isEdit = (state === 'edit');
    
    // Toggle readonly/disabled properties. Using 'disabled' is more robust than 'readonly'.
    $("input[type='text'], input[type='email'], input[type='date'], input[type='password']").prop("disabled", !isEdit);
    $("select").selectmenu(isEdit ? 'enable' : 'disable');

    // Refresh input styles
    $("input[type='text'], input[type='email'], input[type='date'], input[type='password']").textinput('refresh');

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
    var userJSON = sessionStorage.getItem("user");
    if (userJSON) {
        user = JSON.parse(userJSON);
        userExists = true;
    }

    if (user) {
        $("#txtEmail").val(user.Email);
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

    if (($("#txtEmail").val() != "") &&
        ($("#txtFirstName").val() != "") &&
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
        // Use PascalCase for properties to match existing client-side code (e.g., in Table.js)
        var user = {
            "Email": $("#txtEmail").val(),
            "FirstName": $("#txtFirstName").val(),
            "LastName": $("#txtLastName").val(),
            "HealthCardNumber": $("#txtHealthCardNumber").val(),
            "NewPassword": $("#changePassword").val(),
            "Birthdate": $("#datBirthdate").val(),
            "CancerType": $("#slcCancerType").val(),
            "CancerStage": $("#slcCancerStage").val(),
            "TSHRange": $("#slcTSHRange").val()
        };
        
        var storageMode = sessionStorage.getItem("storageMode") || 'local'; // default to local if not set
        var isCreate = sessionStorage.getItem("user") === null;

        if(storageMode === 'local') {
            var users = localStorage.getItem('users') ? JSON.parse(localStorage.getItem('users')) : {};
            if (isCreate) {
                if (users[user.Email]) {
                    alert('User with this email already exists in local storage.');
                    return;
                }
                user.agreedToLegal = false; // new users haven't agreed
                users[user.Email] = user;
                localStorage.setItem('users', JSON.stringify(users));
                alert("New User Created Successfully in Local Storage! Please log in.");
                $.mobile.changePage("../password_entry.html");
            } else {
                var existingUser = JSON.parse(sessionStorage.getItem("user"));
                user.agreedToLegal = existingUser.agreedToLegal;

                if (existingUser.Email !== user.Email) {
                    if (users[user.Email]) {
                        alert('A user with the new email already exists.');
                        $("#txtEmail").val(existingUser.Email); // Revert
                        return;
                    }
                    delete users[existingUser.Email];
                    var oldRecordsKey = 'tbRecords_' + existingUser.Email;
                    var newRecordsKey = 'tbRecords_' + user.Email;
                    if (localStorage.getItem(oldRecordsKey)) {
                        localStorage.setItem(newRecordsKey, localStorage.getItem(oldRecordsKey));
                        localStorage.removeItem(oldRecordsKey);
                    }
                }
                
                users[user.Email] = user;
                localStorage.setItem('users', JSON.stringify(users));
                alert("User updated successfully in Local Storage!");
                sessionStorage.setItem("user", JSON.stringify(user));
                sessionStorage.setItem("password", user.NewPassword);
                $.mobile.changePage("menu.html");
            }
        } else { // Server mode
            if (isCreate) {
                var userData = {
                    newUser: user
                };
                $.post(SERVER_URL + '/saveNewUser', userData, function(data) {
                    alert("New User Created Successfully!");
                    sessionStorage.setItem("user", JSON.stringify(user));
                    sessionStorage.setItem("password", user.NewPassword);
                    $.mobile.changePage("menu.html");
                }).fail(function(error) {
                    alert(error.responseText);
                });
            } else {
                var existingUser = JSON.parse(sessionStorage.getItem("user"));
                user.agreedToLegal = existingUser.agreedToLegal;
                user.Password = sessionStorage.getItem("password");

                $.post(SERVER_URL + '/updateUser', user, function(data) {
                    sessionStorage.setItem("user", JSON.stringify(user));
                    sessionStorage.setItem("password", user.NewPassword);
                }).fail(function(error) {
                    alert(error.responseText);
                }).done(function() {
                    $.mobile.changePage("menu.html");
                });
            }
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
        if (sessionStorage.getItem("user") !== null) {
            // Existing user, reload data and go to view mode
            showUserForm();
        } else {
            // New user, go back to menu
            $.mobile.changePage("../password_entry.html");
        }
    });

    // Form submission handler (Save button)
    $("#frmUserForm").on('submit', function (event) {
        event.preventDefault();
        saveUserForm();
    });
});