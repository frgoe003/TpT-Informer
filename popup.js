// Initialize button with users's preferred color
let popupList = document.getElementById("list");
let salesTable = document.getElementById("salesTable");
let todaysEarnings = document.getElementById("todaysEarnings");
let todaysCircle = document.getElementById("todaysCircle");
let weeklyEarnings = document.getElementById("weeklyEarnings");
let weeklyCircle = document.getElementById("weeklyCircle");
let monthlyEarnings = document.getElementById("monthlyEarnings");
let monthlyCircle = document.getElementById("monthlyCircle");
let imageInput = document.getElementById("image");
let nameInput = document.getElementById("name");
let goal = document.getElementById("goal");
let salesSwitch = document.getElementById("onOffSwitch");

let lastSalesCount = 3;
let earningsGoal = 5;
let goalDay = false; let goalMonth = false; goalWeek = false; 

chrome.storage.sync.get(function(result) {
  lastSalesCount = result.lastSalesCount;
  earningsGoal = parseInt(result.earningsGoal);
  //console.log(lastSalesCount,earningsGoal);
});

if (earningsGoal == null){
  earningsGoal = 5;
  chrome.storage.sync.set({earningsGoal:earningsGoal});
}
if (lastSalesCount == null){
  lastSalesCount = 3;
  chrome.storage.sync.set({lastSalesCount:lastSalesCount});
}



chrome.storage.sync.get(function(result) {
  if (!result.soundOn){
    salesSwitch.checked = false;
  }
  console.log(result);
  getHeader()
  // check if data is stored
  if (result.salesMatrix){
    salesMatrix = result.salesMatrix;
    updateSalesTable(salesMatrix);
  }
  if (result.dayEarnings){
    updateTotals(result.dayEarnings);
  }

  if (result.weekEarnings){
    updateTotals(result.weekEarnings,"week");
  }
  if (result.monthEarnings){
    updateTotals(result.monthEarnings,"month");
  }

  if (result.lastPullDate){
    let date = getTodaysDate();
    let lastPullDate = result.lastPullDate;
    if (date[0]!=lastPullDate[0] || date[1]!=lastPullDate[1] || date[2]!=lastPullDate[2]){
      startup();
    }
  }

  else{
    startup();
  }
});


chrome.runtime.sendMessage({id:"updateBadge"});

window.addEventListener('click',function(e){
  if(e.target.href!==undefined){
    chrome.tabs.create({url:e.target.href})
  }
})

function startup(){
  retrieveSales(getUrl("month"),"month");
  retrieveSales(getUrl("week"),"week");
  retrieveSales(getUrl());
  chrome.storage.sync.set({lastPullDate : getTodaysDate()});
}

function getHeader() {
  chrome.storage.sync.get(function(result) {
    if (result.sellerName && result.imgUrl){
      nameInput.innerHTML = result.sellerName;
      imageInput.src = result.imgUrl;
    }
    else {
      fetch("https://www.teacherspayteachers.com/Dashboard").then(response => {
        if(response.status === 200){
          return response.text();
        }throw new Error("Status != 200");
      }).then((responseText) => {
        var parser = new DOMParser();
        var doc = parser.parseFromString(responseText, 'text/html');
        img = doc.getElementsByClassName("Image-module__image--PG7Ib"); // Avatar-module__root--eRcqn Avatar-module__xl--wDBxG
        imgUrl = img.item(0).src;

        let details = doc.getElementsByClassName("SellerDashboardHeader__details")[0]
        seller = details.querySelectorAll(".Link-module__link--GFbUH"); // SellerDashboard__storeName

        sellerName = seller[0].innerText;
        nameInput.innerHTML=sellerName;
        imageInput.src=imgUrl;

        chrome.storage.sync.set({sellerName : sellerName});
        chrome.storage.sync.set({imgUrl : imgUrl});
      }).catch((error) => {
        console.log(error);
      });
    
    }
  });
}


async function retrieveSales(url,mode) {

  fetch(url).then(response => {
    if(response.status === 200){
      return response.text();
    }throw new Error("Status != 200");
  }).then((responseText) => {
    
    arr = extractContent(responseText);
    table=arr[0];
    totals=arr[1];

    if (!totals.item(1)){
      earnings="0";
    } else{
    earnings=totals.item(1).innerText.replace(/[^.0-9$]/g,"");
    }
    salesMatrix= extractSales(table);
    chrome.storage.sync.set({salesMatrix:salesMatrix});
    updateSalesTable(salesMatrix); 

    switch(mode){
      case "week":
        updateTotals(earnings,"week"); 
        chrome.storage.sync.set({weekEarnings:earnings});
        break
      case "month":
        updateTotals(earnings,"month");
        chrome.storage.sync.set({monthEarnings:earnings});
        break
      default:
        updateTotals(earnings,"tdy");
        chrome.storage.sync.set({dayEarnings:earnings});
    }

  }).catch((error) => {
    console.log(error);
  });

}

function extractContent(str) {
  let arr =[];
  var parser = new DOMParser();
  var doc = parser.parseFromString(str, 'text/html');
  var totals = doc.querySelectorAll(".amount");
  var table = doc.querySelectorAll(".odd, .even");
  arr.push(table);arr.push(totals);
  return arr
    
};

function extractSales(NodeList){
  lastSalesCount = Math.min(NodeList.length,lastSalesCount);
  let dateList = [];let salesList = []; let earningsList = []; let itemList = [];

  for (let i=0; i<lastSalesCount;i++){
    curr = NodeList.item(i);
    date = curr.cells.item(0).innerHTML;
    s= curr.cells.item(3).textContent;
    itemSold = s.substring(98,112).replace(/[]/g,"")+"..."; //.substring(31,41)
    sale = curr.cells.item(7).innerHTML; 
    earnings = curr.cells.item(12).innerText.replace(/[^.0-9$]/g,"");
     
    dateList.push(date);
    salesList.push(sale);
    earningsList.push(earnings);
    itemList.push(itemSold);
  }
  salesMatrix=[dateList,itemList,earningsList]; //salesList,
  return salesMatrix
}

function updateSalesTable(salesMatrix){
  const len = Math.min(NodeList.length,lastSalesCount);

  let i = 0;

  // delayed loop for smooth animation
  function loopIteration() {
    var row = document.createElement("div");
    row.classList.add("row");

    for (let j=0;j<=2;j++){
      var cell = document.createElement('div');

      switch (j){
        case 0:
          cell.classList.add('col-4','themed-grid-col'); break
        case 1:
          cell.classList.add('col-4','themed-grid-col'); break
        case 2:
          cell.classList.add('col-4','themed-grid-col');
      }

      cell.innerHTML = salesMatrix[j][i]; //
      row.appendChild(cell);
  } salesTable.appendChild(row);
    i++;

    if (i < lastSalesCount) {
      setTimeout(loopIteration, 10); 
    }
  }
  // Start the first iteration of the loop
  loopIteration();
}



function updateTotals(earnings,mode){

  switch(mode){
    case "week":
      weekly=parseFloat(earnings.replace("$",""));
      weeklyEarnings.innerHTML = "$"+weekly;

      arr=getPercentage(weekly,"week");
      var lvl=arr[0];
      var percentage = parseInt(arr[1]).toString();

      switch(lvl){
        case 0:
          goalWeek= false;
          weeklyCircle.className = "ecircle c100 p"+ percentage +" small green";
          break
        case 1:
          goalWeek= true;
          weeklyCircle.className = "ecircle c100 p"+ percentage +" small orange";
          if (!goalDay){
            goal.className = "orange";
            beatenBy = ((lvl-1)*100)+parseInt(percentage);
            goal.innerHTML = "You beat your weekly goal by " + beatenBy +"% " + "&#x1F389";
          }
          break
        default:
          goalWeek= true;
          if (!goalDay){
            goal.className = "pink";
            beatenBy = ((lvl-1)*100)+parseInt(percentage);
            goal.innerHTML = "You beat your weekly goal by " + beatenBy +"%" + "&#x1F37E";
          }
          weeklyCircle.className = "ecircle c100 p"+ percentage +" small pink";
      }
      break

    case "month":
      monthly=parseFloat(earnings.replace("$",""));
      monthlyEarnings.innerHTML = "$"+monthly;

      arr=getPercentage(monthly,"month");
      var lvl=arr[0];
      var percentage = parseInt(arr[1]).toString();
      
      //console.log(arr);
      switch(lvl){
        case 0:
          goalMonth = false;
          monthlyCircle.className = "ecircle c100 p"+ percentage +" small green"; 
          break
        case 1:
          if (!goalDay && !goalWeek){
            goal.className = "orange";
            beatenBy = ((lvl-1)*100)+parseInt(percentage);
            goal.innerHTML = " You beat your monthly goal by " + beatenBy +"% " + "&#x1F389";
          }
          monthlyCircle.className = "ecircle c100 p"+ percentage +" small orange"; 
          break
        default:
          goalMonth= true;
          if (!goalDay && !goalWeek){
            goal.className = "pink";
            beatenBy = ((lvl-1)*100)+parseInt(percentage);
            goal.innerHTML = "You beat your monthly goal by " + beatenBy +"%" + "&#x1F37E";
          }
          monthlyCircle.className = "ecircle c100 p"+ percentage +" small pink"; 
      }
      break

    default:
      todays=parseFloat(earnings.replace("$",""));
      todaysEarnings.innerHTML = "$"+todays;

      arr=getPercentage(todays);
      var lvl=arr[0];
      var percentage = parseInt(arr[1]).toString();

      switch(lvl){
        case 0:
          todaysCircle.className = "ecircle c100 p"+ percentage +" small green";
          break
        case 1:
          todaysCircle.className = "ecircle c100 p"+ percentage +" small orange";
          goal.className = "orange";
          beatenBy = ((lvl-1)*100)+parseInt(percentage);
          goal.innerHTML = "You beat your daily goal by " + beatenBy +"% " + "&#x1F389";
          break
        default:
          goal.className = "pink";
          beatenBy = ((lvl-1)*100)+parseInt(percentage);
          goal.innerHTML = "You beat your daily goal by " + beatenBy +"%" + "&#x1F37E"; //&#x + 🍾1F37E 🎉1F389 🎊1F38A 🥂1F942
          todaysCircle.className = "ecircle c100 p"+ percentage +" small pink";
      }
  }
}

function getPercentage(num,mode){
  //console.log(num,earningsGoal)
  switch(mode){
    case "week":
      fraction=num/((earningsGoal/30)*7)
      break
    case "month":
      fraction=num/(earningsGoal)
      break
    default:
      fraction=num/(earningsGoal/30)
  }

  return getDecimalPart(fraction)
  
}


function getDecimalPart(num) {
  let arr=[];
  let lvl = parseInt(num);
  arr.push(lvl);
  if (Number.isInteger(num)) {
    arr.push(0);
    return arr
  }
  const decimalStr = num.toString().split('.')[1];

  if (decimalStr.length>=2){
    const sub = decimalStr.substring(0,2);
    arr.push(sub);
    return arr
  }
  if (decimalStr.length===1){
    arr.push(decimalStr+"0");
    return arr
  }
  return arr;
}

function getUrl(mode){
  var date = getDate(mode);
  var url = "https://www.teacherspayteachers.com/My-Sales?source=Overall&start_date=" + date[0] + "%2F" + date[1] + "%2F"+ date[2] + "&end_date="+ date[3] +"%2F"+ date[4] +"%2F"+ date[5];
  return url 
}

function getDate(mode){
  let arr=[];
  var date = new Date();
  var pastDate = date.getDate() - 7;
  date.setDate(pastDate);
  var pwd = String(date.getDate()).padStart(2, '0');
  var pwm = String(date.getMonth() + 1).padStart(2, '0');
  var pwyyy = date.getFullYear();
  var date = new Date();
  var pastDate = date.getDate() - 30;
  date.setDate(pastDate);
  var pmd = String(date.getDate()).padStart(2, '0');
  var pmm = String(date.getMonth() + 1).padStart(2, '0');
  var pmyyy = date.getFullYear();
  var date = new Date();
  var dd = String(date.getDate()).padStart(2, '0');
  var mm = String(date.getMonth() + 1).padStart(2, '0');
  var yyyy = date.getFullYear();

  switch(mode){
    case "week":
      arr.push(pwm);arr.push(pwd);arr.push(pwyyy);arr.push(mm);arr.push(dd);arr.push(yyyy);  
      break;
    case "month":
      arr.push(pmm);arr.push(pmd);arr.push(pmyyy);arr.push(mm);arr.push(dd);arr.push(yyyy);
      break
    default:
      arr.push(mm);arr.push(dd);arr.push(yyyy);arr.push(mm);arr.push(dd);arr.push(yyyy);
  }
  return arr
}

function createTxt(string){
  var link = document.createElement('a');
  link.download = 'data.json';
  var blob = new Blob([string], {type: 'text/plain'});
  link.href = window.URL.createObjectURL(blob);
  link.click();
}
function updateList(){
  listItem = document.createElement('li');
  listItem.innerHTML = sales[i];
  popupList.appendChild(listItem);
}



salesSwitch.addEventListener("click", function(){
  if (salesSwitch.checked){
    chrome.runtime.sendMessage({id:"saleSound"});
    chrome.storage.sync.set({soundOn:true});
  }
  else{
    chrome.storage.sync.set({soundOn:false});
  }
});

function getTodaysDate(){
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  let date= [];
  date.push(mm);date.push(dd);date.push(yyyy);
  return date
}