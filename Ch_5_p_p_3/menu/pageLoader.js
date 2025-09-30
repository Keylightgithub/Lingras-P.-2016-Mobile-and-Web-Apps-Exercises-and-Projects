/* Runs the function to display the user information, history,
 * graph or
 * suggestions, every time their div is shown
 */
$(document).on("pageshow", function() {
    if ($('.ui-page-active').attr('id') == "pageUserInfo")
    {
        showUserForm();
    }
    else if ($('.ui-page-active').attr('id') == "pageRecords")
    {
        loadUserInformation();
        listRecords();
    }
    else if ($('.ui-page-active').attr('id') == "pageAdvice")
    {
        advicePage();
    }
    else if ($('.ui-page-active').attr('id') == "pageGraph")
    {
        drawGraph();
    }
});
