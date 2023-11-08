var loggedStatus = false;

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    if (message.id === "updateBadge"){
      console.log("msg received");
      retrieveSales();
}});

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    if (message.id === "logoutBadge"){
      updateBadge("logout");
      sendResponse({farewell: "Badge updated"}); 
}});

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    if (message.id === "updateProductStats"){

      new Promise((resolve, reject) => {
        updateProductStats();
        resolve(true);
      }
    )
    .then(result => {
      console.log("product stats updated");
      sendResponse({farewell: "Product Stats updated"}); 
    })
    .catch(error => {
      console.error("Error updating product stats:", error);
    });
  }});


function updateBadge(data){
  if (data==="logout"){
    loggedStatus = false;
    chrome.action.setIcon({path:"images/icon32_bw.png"})
    chrome.action.setBadgeText({text:"0"});
    chrome.action.setBadgeBackgroundColor({color:[160,160,160,1]});
    }
  else{
    loggedStatus = true;
    chrome.action.setIcon({path:"images/icon32.png"});
    chrome.action.setBadgeBackgroundColor({color:[19, 93, 145, 1]}); //(19, 93, 145, 1)
    chrome.action.setBadgeText({text:(""+data)}); //
  }
}

chrome.runtime.onInstalled.addListener (function (details) {
  //console.log("installed")
  chrome.storage.sync.set({soundOn:true});
  chrome.storage.sync.set({prev : 0});
  chrome.storage.sync.set({currDate : getTodaysDate()});
  chrome.storage.sync.set({lastPullDate : -1});
  chrome.storage.local.set({lastPull: []});

  chrome.action.setBadgeText({text:"0"});
  chrome.action.setBadgeBackgroundColor({color:[19, 93, 145, 1]});
  chrome.alarms.create("salesAlarm", {periodInMinutes: 1}); //, periodInMinutes: 0.1
});

chrome.alarms.onAlarm.addListener((alarm) => {
  retrieveSales();
});

async function retrieveSales() {
  chrome.storage.sync.get(function(result) {
    prev = result.prev;
    console.log("prev",prev)
  });
  chrome.storage.sync.get(function(result) {
    let date = result.currDate;
    let today = getTodaysDate();
    console.log(date,today,date[0]!=today[0], date[1]!=today[1], date[2]!=today[2])
    if (date[0]!=today[0] || date[1]!=today[1] || date[2]!=today[2]){
      chrome.storage.sync.set({prev : 0});
      chrome.storage.sync.set({currDate : today});
      prev=0;
      updateBadge(prev.toString());
    }
  });

  url=getUrl();
  fetch(url)
  .then(response => {
    if (response.redirected) { 
      updateBadge("logout");
      resolve(false);
    }
    else{
      return response.text()
    }})
    .then(response => {
    var strippedHtml = response.replace(/<[^>]+>/g, '');
    var count = parseInt(getSalesCount(strippedHtml));

    if (isNaN(count)){
      count=0;
    }
    console.log(prev,count)

    if (count>prev){

      chrome.storage.sync.get(function(result) {
        if (result.soundOn){
          createSaleSoundHtml()
        }
      });
      chrome.storage.sync.set({prev : count});
      updateBadge(count.toString());
    }
  })
}

function getSalesCount(salesTxt){
  let sub = salesTxt.split('Showing ').pop().split(' results')[0];
  let count = sub.substring(sub.indexOf('f') + 2);
  return count
}

 function getUrl() {
  var date = getTodaysDate();
  let mm = date[0]; let dd = date[1]; let yyyy = date[2];
  var url = "https://www.teacherspayteachers.com/My-Sales?source=Overall&start_date=" + mm + "%2F" + dd + "%2F"+ yyyy + "&end_date="+ mm +"%2F"+ dd +"%2F"+ yyyy;
  return url 
}


function getTodaysDate(){
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  let date= [];
  date.push(mm);date.push(dd);date.push(yyyy);
  return date
}



async function updateProductStats() {
  url='https://www.teacherspayteachers.com/items/download_items_stats'
  fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Network response was not ok, status: ${response.status}`);
    }
    return response.text(); // Get the CSV data as text
  })
  .then(csvData => {
    
    new Promise((resolve, reject) => {
      const lines = csvData.split("\n"); // Split the CSV data into lines
      const headers = lines[0].split(",");
      const parsedData = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const values = line.split(",");
        if (values.length === headers.length) {
          const row = {};
          for (let j = 0; j < headers.length; j++) {
            row[headers[j]] = values[j];
          }
          parsedData.push(row);
        }
      }

      resolve(parsedData);
    })
  .then(parsedData => {
    chrome.storage.local.set({productStats: parsedData});
    return parsedData;

  })
  .catch(error => {
    console.error("Error parsing CSV:", error);
  });
  })
  .catch(error => {
    console.error("Error fetching CSV:", error);
  });
}


chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    if (message.id === "saleSound"){
      createSaleSoundHtml()
}});


function createSaleSoundHtml(){
  console.log("creating sale sound html");
  chrome.offscreen.createDocument({
    url: chrome.runtime.getURL('audio.html'),
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'Sale notification',
  })

  setTimeout(() => {
    chrome.offscreen.closeDocument()
  }, 3000);
}