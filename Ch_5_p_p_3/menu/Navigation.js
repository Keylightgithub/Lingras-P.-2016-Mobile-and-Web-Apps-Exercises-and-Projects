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
 * Retrieves password from local storage if it
 * exists, otherwise returns the default password
 */
function getPassword() {
    if (typeof(Storage) == "undefined") {
        alert("Your browser does not support HTML5 localStorage. Try upgrading.");
        return null;
    } else if (localStorage.getItem("user") != null) {
        return JSON.parse(localStorage.getItem("user")).NewPassword;
    }
    /*Default password*/
    return "2345";
}

$(document).on('pageinit', '#pageHome', function(){
    /* On the main page, after password entry, directs
    * user to main page, legal disclaimer if they
    * have not yet agreed to it, or user entry page
    * if they have not yet completed their user info.
    */
    $("#btnEnter").on("click", function(e) {
      e.preventDefault();
      var password = getPassword();
      if (document.getElementById("passcode").value == password) {
        sessionStorage.setItem('loggedIn', 'true');
        if (localStorage.getItem("agreedToLegal") !== "true") {
          $.mobile.changePage("#legalNotice");
        } else {
          if (localStorage.getItem("user") == null) {
            /* User has not been created, direct user
             * to User Creation page
             */
            $.mobile.changePage("menu/user_info.html");
          } else {
            $.mobile.changePage("menu/menu.html");
          }
        }
      } else {
        alert("Incorrect password, please try again.");
      }
    });
});


/* Records that the user has agreed to the legal
 * disclaimer on this device/browser
 */
$(document).on("click", "#noticeYes", function(e) {
    e.preventDefault();
    localStorage.setItem("agreedToLegal", "true");
    $.mobile.changePage("menu/user_info.html");
});

// A logout function that can be called from other pages
function logout() {
    localStorage.removeItem('loggedIn');
    $.mobile.changePage("#pageHome", { transition: "slide" });
}
