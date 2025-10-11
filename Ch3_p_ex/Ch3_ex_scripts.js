function updateConversion(value) {
    var numValue = parseFloat(value);
    if (isNaN(numValue)) {
        numValue = 0;
    } else if (numValue < 0) {
        numValue = 0;
    } else if (numValue > 100) {
        numValue = 100;
    }

    // Update slider if it exists
    if ($("#gallons-slider").length) {
        $("#gallons-slider").val(numValue).slider("refresh");
    }

    // Update number input if it exists and value was changed
    if ($("#gallons-input").length) {
        if (numValue.toString() !== $("#gallons-input").val()) {
            $("#gallons-input").val(numValue);
        }
    }

    $("#quantity-display").text("Quantity: " + numValue + " gallon" + (numValue !== 1 ? 's' : ''));
    
    var liters = (numValue * 3.789).toFixed(3);
    $("#liters-display").text("Which is " + liters + " liters");
}

$(document).on("pagecreate", "#interface", function() {
    // Use event delegation for both slider and input
    $(this).on("input change", "#gallons-slider, #gallons-input", function() {
        updateConversion($(this).val());
    });

    // Initial sync
    if ($("#gallons-slider").length) {
        updateConversion($("#gallons-slider").val());
    }
    if ($("#gallons-input").length) {
        updateConversion($("#gallons-input").val());
    }
});