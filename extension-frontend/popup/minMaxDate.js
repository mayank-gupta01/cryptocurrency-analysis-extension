var today = new Date();
var maxDate = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD

var minDate = new Date(today);
minDate.setDate(today.getDate() - 365);
var dd = minDate.getDate();
var mm = minDate.getMonth() + 1; // January is 0!
var yyyy = minDate.getFullYear();

if (dd < 10) {
  dd = "0" + dd;
}

if (mm < 10) {
  mm = "0" + mm;
}

minDate = yyyy + "-" + mm + "-" + dd;

document.getElementById("startDate").min = minDate;
document.getElementById("startDate").max = maxDate;
