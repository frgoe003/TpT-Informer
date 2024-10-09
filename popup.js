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


let username = document.getElementById("username");
let input = document.getElementById("login");
let loginBtnDiv = document.getElementById("loginBtnDiv");
let loginInput = document.getElementById("loginInput");

chrome.storage.sync.get(function(result) {
  if (result.isPremium){
    loginInput.innerHTML = "<div style='justify-content:center;align-items:center'>Premium User &#x1F389</div>";
    loginBtnDiv.style.display = "none";
  }
  else{
    loginBtnDiv.style.display = "display-block";
    loginInput.innerHTML += '<hr style="margin:5px"></hr><div style="justify-content:center;align-items:center">Upgrade to TpT-Informer <a target="_blank" rel="noopener noreferrer" href="https://tptinformer.com"><u>premium</u></a></div><hr style="margin:5px"></hr>';
  }
});

input.addEventListener("click", function(event) {

  let firebaseRTDB = 'https://tpt-informer-default-rtdb.firebaseio.com/users/'+username.value+'.json';

  fetch(firebaseRTDB)  
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    console.log(response);
    return response.json();
  })
  .then(data => {
    // Handle the data returned from the fetch request
    if (data == username.value){
      chrome.storage.sync.set({isPremium:true});
      loginInput.innerHTML = "<div style='justify-content:center;align-items:center'>Premium User &#x1F389</div>";
      loginBtnDiv.style.display = "none";
    }
    else{
    alert("Invalid personal identifier");

    }
  })
  .catch(error => {
    // Handle any errors that occurred during the fetch
    console.error('There was a problem with the fetch operation:', error);
  });
});

let LASTSALESCOUNT = 7;
let EARNINGSGOAL = 10;
const DEBUG = false;
let rawSalesMatrix = [];

let IDX = 1;
let goalDay = false; 
let goalMonth = false; 
let goalWeek = false; 




chrome.storage.sync.get(function(result) {
  if (!result.soundOn){
    salesSwitch.checked = false;
  }

  if (result.earningsGoal){
    EARNINGSGOAL = parseFloat(result.earningsGoal);
  }
  if (result.lastSalesCount){
    LASTSALESCOUNT = parseInt(result.lastSalesCount);
  }


  getHeader()
  // check if data is stored
  //startup();

  if (!result.imgUrl || !result.sellerName){
    getHeader();
    startup();
    return 
  }

  if (result.earnings != null){

    chrome.storage.local.get(function(result) {
      let popupSales = result.popupSales;
      //updateSalesTable(popupSales);
    });

    let earnings = result.earnings;
    //updateTotals(earnings);
  }

  if (result.lastPopDate){
    let date = getTodaysDate();
    let lastPopDate = result.lastPopDate;
    console.log(date,lastPopDate)
    if (date[0]!=lastPopDate[0] || date[1]!=lastPopDate[1] || date[2]!=lastPopDate[2]){
      startup();
    }
  }
  if (result.hasChanges){
    chrome.storage.sync.set({hasChanges:false});
    startup();
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
  retrieveSales(getUrl(1,subtractDaysFromDate(getTodaysDate(),30),getTodaysDate()));
  chrome.storage.sync.set({lastPopDate : getTodaysDate()});
}


async function retrieveSales(url) {

  fetch(url).then(response => {
    if(response.status === 200){
      return response.text();
    }throw new Error("Status != 200");
  }).then((responseText) => {

    let extractedContent = extractContent(responseText) 

    rawSalesMatrix = rawSalesMatrix.concat(extractedContent);

    let popupSales = [];
    for (let i=0; i < rawSalesMatrix.length; i++){
      popupSales = popupSales.concat(extractSales(rawSalesMatrix[i]));
    }

    let earnings = getEarnings(popupSales);
    updateTotals(earnings);
    updateSalesTable(popupSales);
    
    chrome.storage.sync.set({earnings:earnings});
    chrome.storage.local.set({popupSales:popupSales});

  }).catch((error) => {
    console.log(error);
  });
}


function extractContent(str) {
  let arr =[];
  var parser = new DOMParser();
  var doc = parser.parseFromString(str, 'text/html');
  var table = doc.querySelectorAll(".odd, .even");
  var queryDiv = doc.querySelectorAll(".counter")[0]
  var totalNoProducts = parseInt(queryDiv.querySelectorAll('span')[0].innerText);
  var noProducts = parseInt(queryDiv.innerText.split('-')[1].split(' ')[0])
  arr.push(table);

  if (noProducts<totalNoProducts){
    IDX+=1;
    if (DEBUG && IDX>3){
      return arr
    }
    retrieveSales(getUrl(IDX,subtractDaysFromDate(getTodaysDate(),30),getTodaysDate()));
  }
  return arr
};

function extractSales(NodeList){

  let salesMatrix = [];

  for (let i=0; i < NodeList.length; i++){

    let newRow = {};

    let curr = NodeList[i];
    let cells = curr.querySelectorAll("td");
    
    newRow.date = cells[0].innerHTML;
    newRow.orderId = cells[1].innerHTML;
    newRow.source = cells[2].innerHTML;
    let s = cells[3].textContent;
    newRow.itemSold = s.substring(98,112).replace(/[]/g,"")+"..."; //.substring(31,41)

    newRow.buyer = cells[4].innerHTML;
    newRow.lastDownload = cells[5].innerHTML;
    newRow.licenses = cells[6].innerHTML;
    newRow.price = cells[7].innerHTML;
    newRow.commission = cells[8].innerHTML;
    newRow.transactionFee = cells[9].innerHTML;
    newRow.tax_seller = cells[10].innerHTML;
    newRow.tax_tpt = cells[11].innerHTML;
    newRow.earnings = cells[12].innerText.replace(/[^.0-9$]/g,"");
     
    salesMatrix.push(newRow);
  }
  return salesMatrix
}

function updateSalesTable(popupSales){
  let i = 0;
  salesTable.innerHTML = "";
  
  // delayed loop for smooth animation
  function loopIteration() {
    var row = document.createElement("div");
    row.classList.add("row");

    for (let j=0; j < 3; j++){
      var cell = document.createElement("div");
      cell.classList.add("col",'themed-grid-col');

      let sale = popupSales[i];
      let saleDate = sale.date;
      let saleItem = sale.itemSold;
      let saleEarnings = sale.earnings;

      if (j==0){
        cell.innerHTML = saleDate;
      }
      if (j==1){
        cell.innerHTML = saleItem;
      }
      if (j==2){
        cell.innerHTML = saleEarnings;
      }
      row.appendChild(cell);

    } 
    salesTable.appendChild(row);
    i++;

    if (i < LASTSALESCOUNT) {
      setTimeout(loopIteration, 20); 
    }
  }

  // Start the first iteration of the loop
  loopIteration();
}


function getEarnings(popupSales){
  // input popupSales as array of objects and return array of size three, [day,week,month]
  let earnings = [];
  let day = 0; let week = 0; let month = 0;
  let date = getTodaysDate();
  let dayDate = date[0]+"/"+date[1]+"/"+date[2];
  let weekDate = subtractDaysFromDate(date,7);
  let monthDate = subtractDaysFromDate(date,30);

  for (let i=0; i < popupSales.length; i++){
    let sale = popupSales[i];
    let saleDate = sale.date.split('/');
    let saleEarnings = parseFloat(sale.earnings.replace("$",""));

    if (!date1BeforeDate2(saleDate,getTodaysDate())){
      day+=saleEarnings;
    }
    if (!date1BeforeDate2(saleDate,subtractDaysFromDate(getTodaysDate(),7))){
      week+=saleEarnings;
    }
    if (!date1BeforeDate2(saleDate,subtractDaysFromDate(getTodaysDate(),30))){
      month+=saleEarnings;
    }
  }
  return [day.toFixed(2),week.toFixed(2),month.toFixed(2)]
}


function updateTotals(earnings){
  // input earnings as array of size three, [day,week,month]

  let weekly = parseFloat(earnings[1].replace("$",""));
  weeklyEarnings.innerHTML = "$"+weekly;

  let arr = getPercentage(weekly,"week");
  var lvl = arr[0];
  var percentage = parseInt(arr[1]).toString();

  let beatenBy
  let goalWeek
  
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

  let monthly = parseFloat(earnings[2].replace("$",""));
  monthlyEarnings.innerHTML = "$"+monthly;

  arr = getPercentage(monthly,"month");
  var lvl=arr[0];
  var percentage = parseInt(arr[1]).toString();
  
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

  let todays = parseFloat(earnings[0].replace("$",""));
  todaysEarnings.innerHTML = "$"+todays;

  arr = getPercentage(todays);
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

function getPercentage(num,mode){
  let fraction 
  switch(mode){
    case "week":
      fraction=num/((EARNINGSGOAL/30)*7)
      break
    case "month":
      fraction=num/(EARNINGSGOAL)
      break
    default:
      fraction=num/(EARNINGSGOAL/30)
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

function getHeader(){
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
        let img = doc.getElementsByClassName("Image-module__roundedCircle--sgMRY"); // Avatar-module__root--eRcqn Avatar-module__xl--wDBxG
        let imgUrl = img.item(0).src;

        let details = doc.getElementsByClassName("SellerDashboardHeader__details")[0]
        let seller = details.querySelectorAll(".Link-module__link--GFbUH"); // SellerDashboard__storeName

        let sellerName = seller[0].innerText;
        nameInput.innerHTML = sellerName;
        imageInput.src = imgUrl;

        console.log(sellerName,imgUrl)
      
        chrome.storage.sync.set({sellerName : sellerName});
        chrome.storage.sync.set({imgUrl : imgUrl});
      }).catch((error) => {
        console.log(error);
      });
    
    }
  });
}



function getUrl(IDX,startDate,endDate){
  //console.log(startDate)
  //console.log(endDate)
  var url = "https://www.teacherspayteachers.com/My-Sales/page:"+IDX+"?source=Overall&start_date=" + startDate[0] + "%2F" + startDate[1] + "%2F"+ startDate[2] + "&end_date="+ endDate[0] +"%2F"+ endDate[1] +"%2F"+ endDate[2];
  return url 
}

function subtractDaysFromDate(inputDate, daysToSubtract) {
  const [mm, dd, yyyy] = inputDate;
  
  const date = new Date(`${mm}/${dd}/${yyyy}`);

  date.setDate(date.getDate() - daysToSubtract);

  const newMonth = date.getMonth() + 1; // Months are 0-indexed, so add 1
  const newDay = date.getDate();
  const newYear = date.getFullYear();

  // Format the result in the same format ['mm', 'dd', 'yyyy']
  const result = [String(newMonth).padStart(2, '0'), String(newDay).padStart(2, '0'), String(newYear)];
  return result;
}

function createTxt(string){
  var link = document.createElement('a');
  link.download = 'data.json';
  var blob = new Blob([string], {type: 'text/plain'});
  link.href = window.URL.createObjectURL(blob);
  link.click();
}
function updateList(){
  let listItem = document.createElement('li');
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

function date1BeforeDate2(date1,date2){
  // uses format [mm,dd,yyyy]

  // make sure all values are int
  for (let i=0; i<3; i++){
    date1[i] = parseInt(date1[i]);
    date2[i] = parseInt(date2[i]);
  }

  if (date1[2]<date2[2]){
    return true
  }
  else if (date1[2]==date2[2]){
    if (date1[0]<date2[0]){
      return true
    }
    else if (date1[0]==date2[0]){
      if (date1[1]<date2[1]){
        return true
      }
    }
  }
  return false
}
