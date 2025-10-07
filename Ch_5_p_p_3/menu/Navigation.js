var SERVER_URL = 'http://140.184.132.239:3000';

if(!sessionStorage) {
    alert('Warning: Your browser does not support features required for this application, please consider upgrading.');
}

/* Adds given text value to the password text
 * field
 */
function addValueToPassword(button) {
  var currVal = $("#passcode").val();
  if (button == "bksp") {
    $("#passcode").val(currVal.substring(0, currVal.length - 1));
  } else {
    $("#passcode").val(currVal.concat(button));
  }
}

/**
 * Retrieves password from session storage if it
 * exists, otherwise returns the default password
 */
function getPassword() {
    if (sessionStorage.getItem("user") != null) {
        return JSON.parse(sessionStorage.getItem("user")).NewPassword;
    }
    /*Default password*/
    return "2345";
}

function getEmail() {
    if (sessionStorage.getItem("user") != null) {
        var user = JSON.parse(sessionStorage.getItem("user"));
        return user.Email ? user.Email : null;
    }
    return null;
}

$(document).on('pageinit', '#pageHome', function(){
    /* On the main page, after password entry, directs
    * user to main page, legal disclaimer if they
    * have not yet agreed to it, or user entry page
    * if they have not yet completed their user info.
    */
    $("#btnEnter").on("click", function(e) {
      e.preventDefault();
      var loginCredentials = {
        email: $("#email").val(),
        password: $("#passcode").val()
      };
      $.post(SERVER_URL + '/login', loginCredentials, function(data) {
        if (data && data.email == loginCredentials.email) {
          sessionStorage.password = $("#passcode").val();
          sessionStorage.user = JSON.stringify(data);
          sessionStorage.setItem('loggedIn', 'true');
          if (!data.agreedToLegal) {
            return $.mobile.changePage("#legalNotice");
          }
          $.post(SERVER_URL + '/getRecords', loginCredentials, function(data) {
            sessionStorage.tbRecords = JSON.stringify(data);
            $.mobile.changePage("menu/menu.html");
          }).fail(function(error) {
            alert(error.responseText);
          });
        } else {
          alert('An error occurred logging user in.');
        }
      }).fail(function(error) {
        alert(error.responseText);
      });
    });
});


/* Records that the user has agreed to the legal
 * disclaimer on this device/browser
 */
$(document).on("click", "#noticeYes", function(e) {
    e.preventDefault();
    sessionStorage.setItem("agreedToLegal", "true");
    $.mobile.changePage("menu/user_info.html");
});

// A logout function that can be called from other pages
function logout() {
    sessionStorage.removeItem('loggedIn');
    $.mobile.changePage("#pageHome", { transition: "slide" });
}
