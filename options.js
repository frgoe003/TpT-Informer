daily = document.getElementById("daily");
weekly = document.getElementById("weekly");

range = document.getElementById('range'),
rangeV = document.getElementById('rangeV'),
setValue = ()=>{
    const newValue = Number( (range.value - range.min) * 100 / (range.max - range.min) ),
    newPosition = 10 - (newValue * 0.2);
    rangeV.innerHTML = `<span>${range.value}</span>`;
    rangeV.style.left = `calc(${newValue}% + (${newPosition}px))`;
};

document.addEventListener("DOMContentLoaded", setValue);
range.addEventListener('input', setValue);

document.getElementById('save').addEventListener('click', save_options);
// Saves options to chrome.storage
function save_options() {
  console.log('save_options')

  var range_val = range.value;
  var earningsGoal = document.getElementById('earningsGoal').value;
  console.log("New sales count:",range.value,"New monthly Goal:",earningsGoal);

  daily.innerHTML = ((earningsGoal/30).toString()).substring(0,4) +"$"
  weekly.innerHTML = ((earningsGoal/30*7).toString()).substring(0,4) +"$"

  chrome.storage.sync.set({
    lastSalesCount: range_val,
    earningsGoal: earningsGoal,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}
