/* Runs the function to display the user information, history,
 * suggestions, every time their div is shown
 */
$(document).on("pageshow", function () {
    if ($('.ui-page-active').attr('id') == "pageUserInfo") {
        showUserForm();
    }
    else if ($('.ui-page-active').attr('id') == "pageRecords") {
        loadUserInformation();
        listRecords();
    }
    else if ($('.ui-page-active').attr('id') == "pageAdvice") {
        advicePage();
        resizeGraph();
    }
    else if ($('.ui-page-active').attr('id') == "pageGraph") {
        drawGraph();
        resizeGraph();
    }
});