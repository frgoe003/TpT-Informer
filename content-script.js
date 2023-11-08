

let rawSalesMatrix = [];
let IDX = 1;
const DEBUG = true;
let ACTIVE = false;
let TABOPEN = false;

startup()

// add bootstrap

function addBootstrap(){  
  let bootstrap = document.createElement('link');
  bootstrap.rel = 'stylesheet';
  bootstrap.href = 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css';
  document.head.appendChild(bootstrap);
}


async function startup(){
    addBootstrap()
    addInformerTab()
    modifyTabs()

    await chrome.storage.sync.get(function(result) {

    if (result.lastPullDate == -1){
      retrieveSales(getUrl(IDX,['01','01','1969'],getTodaysDate()));
    }
    else if (dateMoreThanOneDayAgo(result.lastPullDate)){
      retrieveSales(getUrl(IDX,result.lastPullDate,getTodaysDate()));
    }
    else{
      console.log("No need to update");
    }
  })

  // wait until sales are retrieved

  chrome.storage.local.get("fullSalesMatrix", function(result) {
    console.log('awaited!',result.fullSalesMatrix);
    launchDashboard()
  })
}


async function retrieveSales(url) {

  fetch(url).then(response => {
    if(response.status === 200){
      return response.text();
    }throw new Error("Status != 200");
  }).then((responseText) => {

    let extractedContent = extractContent(responseText) 

    rawSalesMatrix = rawSalesMatrix.concat(extractedContent);

    let fullSalesMatrix = [];
    for (let i=0; i < rawSalesMatrix.length; i++){
      fullSalesMatrix = fullSalesMatrix.concat(extractSales(rawSalesMatrix[i]));
    }

    console.log(fullSalesMatrix); 
    chrome.storage.local.set({fullSalesMatrix:fullSalesMatrix});
    chrome.storage.sync.set({lastPullDate:getTodaysDate()});

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
    retrieveSales(getUrl(IDX,['01','01','1969'],getTodaysDate()));
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
    s = cells[3].textContent;
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

function crawlProductStats(){
  document.getElementById("downloadButton").addEventListener("click", function () {
    // Create CSV content
    const csvContent = "Name,Email\nJohn Doe,johndoe@example.com\nJane Smith,janesmith@example.com";
  
    // Create a Blob (Binary Large Object) from the CSV content
    const blob = new Blob([csvContent], { type: "text/csv" });
  
    // Create a download link and trigger the download
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "data.csv";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}


// CSV
function analyzeSales(){
  chrome.runtime.sendMessage({id: "updateProductStats"});
  
  new Promise((resolve, reject) => {
      chrome.storage.local.get("productStats", function(result) {
        resolve(result.productStats);
      });
    }).then(productStats => {
      console.log(productStats);

      let table = generateProductTable(productStats);
      const mainDiv = document.getElementsByClassName("SellerDashboard__container")[0];
      mainDiv.prepend(table);
    });
}

function generateProductTable(products) {
  // USES CSV WITH HEADER

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  // Create table headers (table row)
  const headers = Object.keys(products[0]);
  const headerRow = document.createElement("tr");
  headers.forEach(header => {
    const th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create table rows and cells (product data)
  products.forEach(product => {
    const row = document.createElement("tr");
    headers.forEach(header => {
      const cell = document.createElement("td");
      cell.textContent = product[header];
      row.appendChild(cell);
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  return table;
}




// UTILS
function getTodaysDate(){
  const today = new Date();
  const mm = today.getMonth() + 1; // Months are zero-indexed, so we add 1
  const dd = today.getDate();
  const yyyy = today.getFullYear();
  const dateArray = [mm, dd, yyyy];
return dateArray
}

function dateMoreThanOneDayAgo(date){
  const today = new Date();
  const dd = today.getDate();
  const mm = today.getMonth() + 1; // Months are zero-indexed, so we add 1
  const yyyy = today.getFullYear();
  const dateArray = [mm, dd, yyyy];
  if (date[0]!=dateArray[0] || date[1]!=dateArray[1] || date[2]!=dateArray[2]){
    return true
  }
  return false
}

function getUrl(IDX,startDate,endDate){
  console.log(IDX)
  //console.log(startDate)
  //console.log(endDate)
  var url = "https://www.teacherspayteachers.com/My-Sales/page:"+IDX+"?source=Overall&start_date=" + startDate[0] + "%2F" + startDate[1] + "%2F"+ startDate[2] + "&end_date="+ endDate[0] +"%2F"+ endDate[1] +"%2F"+ endDate[2];
  return url 
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



///////
// KEYWORDS
///////

async function keywordCrawlWrapper(keyword) {
  let ITERATIONS = 5;
  let products = [];

  for (let i = 1; i <= ITERATIONS; i++) { // Use <= to include the last iteration
    try {
      const productsNew = await keywordCrawl(products, i, keyword); // Pass i as the page index
      products = products.concat(productsNew);
    } catch (error) {
      console.error("Error crawling keyword:", error);
    }

    //remove loading screen
    /*
    try {
      document.getElementsByClassName("loadingScreen")[0].remove(); 
    }
    catch{
      console.log("no loading screen")
    }
    // Update the progress bar
    chrome.storage.sync.set({keywordCrawlCounter: (IDX/ITERATIONS)});
    displayLoadingScreen();
    */

  }
  console.log(products)
  let analysis = analyzeKeywordCrawl(keyword,products);

  return products;
}

async function keywordCrawl(products, IDX, keyword) {
  keyword = keyword.replace(/ /g, '%20');
  const url = 'https://www.teacherspayteachers.com/browse?' + 'page=' + IDX + '&search=' + keyword;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok, status: ${response.status}`);
    }

    const document = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(document, 'text/html');

    const marketSizeDiv = doc.querySelectorAll(".ResultsForSearchResultHeader")[0]
    const span = marketSizeDiv.querySelectorAll('.Text-module__bodyBase--iQGdU')[0].innerText;
    const marketSize = span.split(' ')[0]
    console.log(marketSize)

    const rows = doc.querySelectorAll(".ProductRowLayout");
    const productsNew = processKeywordCrawl(rows,marketSize);

    return productsNew;

  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // Rethrow the error for the wrapper function to handle
  }



}

function processKeywordCrawl(rows,marketSize){

  products = [];

  rows.forEach(productCard => {
    const productInfo = {};

    const titleElement = productCard.querySelector('.ProductRowCard-module__cardTitleLink--YPqiC');
    productInfo.title = titleElement.textContent.trim();

    const sellerNameElement = productCard.querySelector('.ProductRowSellerByline-module__storeName--DZyfm');
    productInfo.sellerName = sellerNameElement.textContent.trim();

    try{
      const rating = productCard.querySelectorAll('.RatingsLabel-module__ratingsLabel--lMWgy')[0].innerText.split(" ")[0]
      productInfo.rating = parseFloat(rating);
    
    }
    catch(err){
      const rating = "0";
      productInfo.rating = parseFloat(rating);
    }

    try {
      const salePriceElement = productCard.querySelector('.ProductPrice-module__stackedPrice--HDi24');
      const priceElement = productCard.querySelector('.ProductPrice-module__basePrice--L99Kg');
      
      productInfo.salePrice = salePriceElement.textContent.trim().split(" ")[1];
      productInfo.price = priceElement.textContent.trim();
      
    }
    catch(err) {
      const priceElement = productCard.querySelector('.ProductPrice-module__stackedPriceContainer--Jx2F6');
      productInfo.price = priceElement.textContent.trim();
      salePriceElement = null;
    }

    try {
      const subjects = Array.from(productCard.querySelectorAll('.Text-module__detailXS--X_1mi a[href^="/browse/math"]'))
      .map((subject) => subject.textContent.trim())
      .join(', ');
      productInfo.subjects = subjects;
    }
    catch(err) {
      const subjects = "";
      productInfo.subjects = subjects;
    }
    
    try {
      const gradesElement = productCard.querySelector('.MetadataFacetSection .Text-module__detailXS--X_1mi.MetadataFacetSection__list');
      const grades = gradesElement ? gradesElement.textContent.trim() : '';
      productInfo.grades = grades;
    }
    catch(err) {
      const grades = "";
      productInfo.grades = grades;
    }

    try {
      const types = Array.from(productCard.querySelectorAll('.MetadataFacetSection a[href^="/browse"]'))
      .map((type) => type.textContent.trim())
      .join(', ');
    productInfo.types = types;

    }
    catch(err) {
      const types = "";
    productInfo.types = types;

    }
    try {
      const ccss = Array.from(productCard.querySelectorAll('.StandardsList a[href^="/browse/ccss-"]'))
      .map((ccssItem) => ccssItem.textContent.trim())
      .join(', ');
        productInfo.ccss = ccss;
    }
    catch(err) {
      const ccss = "";
      productInfo.ccss = ccss;
    }

    try {
      const ratingElement = productCard.querySelector('.RatingsLabel-module__totalReviews--Roe3y');
      ratingCount = ratingElement.textContent.trim();
      ratingCount = ratingCount.replace(/[^.K0-9$]/g,"");
      if (ratingCount.includes("K")){
        ratingCount = ratingCount.replace("K","");
        ratingCount = parseFloat(ratingCount);
        ratingCount = ratingCount*1000;
      }
      ratingCount = parseInt(ratingCount);
      productInfo.ratingCount = ratingCount;
    }
    catch(err) {
      const ratingCount = 0;
      productInfo.ratingCount = ratingCount;
    }

    const descriptionElement = productCard.querySelector('.ProductRowCard-module__cardDescription--jPu_8');
    productInfo.description = descriptionElement.textContent.trim();

    productInfo.marketSize = marketSize;

    products.push(productInfo);
  });
  return products
}



function analyzeKeywordCrawl(keyword,products){

  let totalPrice = 0;
  let totalProducts = 0;
  const crawlStats = {};
  crawlStats.keyword = keyword;
  crawlStats.marketSize = products[0].marketSize;

  // TOTAL PRICE
  for (const product of products) {
    const price = parseFloat(product.price.replace('$', '').replace(',', ''));
    if (!isNaN(price)) {
      totalPrice += price;
      totalProducts++;
    }
  }

  // AVG PRICE
  const averagePrice = totalProducts > 0 ? totalPrice / totalProducts : 0;
  
  let productsOnSale = 0;
  for (const product of products) {
    if (product.salePrice && product.salePrice !== null) {
      productsOnSale++;
    }
  }

  // MEDIAN PRICE
  const prices = products.map((product) => parseFloat(product.price.replace('$', '').replace(',', '')));
  prices.sort((a, b) => a - b);
  const medianPrice = prices[Math.floor(prices.length / 2)];


  // AVG SALE DISCOUNT
  const avgSaleDiscount = products.reduce((acc, product) => {
    if (product.salePrice && product.salePrice !== null) {
      const price = parseFloat(product.price.replace('$', '').replace(',', ''));
      const salePrice = parseFloat(product.salePrice.replace('$', '').replace(',', ''));
      const discount = (price - salePrice) / price;
      return acc + discount;
    }
    return acc;
  }, 0) / productsOnSale;
  crawlStats.avgSaleDiscount = ((avgSaleDiscount)*100).toFixed(1);

  // AVG RATING
  const averageRating = products.reduce((acc, product) => {
    return acc + product.rating;
  }
  , 0) / products.length;
  crawlStats.averageRating = averageRating.toFixed(2);

  // AVG RATING COUNT
  const averageRatingCount = products.reduce((acc, product) => {
    return acc + product.ratingCount;
  }, 0) / products.length;

  crawlStats.totalProducts = totalProducts;
  crawlStats.averagePrice = averagePrice.toFixed(1);
  crawlStats.medianPrice = medianPrice.toFixed(1);
  crawlStats.productsOnSale = productsOnSale;
  crawlStats.averageRatingCount = parseInt(averageRatingCount);

  // DESCRIPTION
  // adding product descriptions and title for keyword analysis
  //const descriptions = products.map((product) => product.description);
  let description_and_title = [];
  for (const product of products) {
    let description_title = product.title+" "+product.description;
    description_and_title.push(description_title);
  }

  crawlStats.descriptionStats = analyzeDescriptions(description_and_title,keyword);
  displayProductStats(crawlStats);
  return crawlStats
}

function analyzeDescriptions(descriptions,keyword){
  mostCommonWords = {};

  for (const description of descriptions) {
    const words = description.split(" ");
    
    for (let word of words){
      word = word.replace(/[^a-zA-Z ]/g, "");
      if (mostCommonWords[word] == undefined){
        mostCommonWords[word] = 1;
      }
      else{
        mostCommonWords[word] += 1;
      }
    }
  }
  return getMostCommonWords(15,mostCommonWords,keyword);
  
}


function getMostCommonWords(cnt,descriptions,keyword){
  // remove { and } from descriptions

  // remove unsignificant words like "the", "and", "with", etc.
  mostCommonWords = removeUnsignificantWords(mostCommonWords,keyword);

  // get the most common 5 words, excluding numbers and words with less than 3 characters and duplicates (capitalized)
  const mostCommonWordsSliced = Object.entries(mostCommonWords)
  .filter(([word, count]) => count > 1 && word.length > 3 && !word.match(/\d+/))
  .sort((a, b) => b[1] - a[1])
  .reduce((uniqueWords, [word, count]) => {
    const lowercaseWord = word.toLowerCase();
    if (!uniqueWords.some(([uniqueWord]) => uniqueWord.toLowerCase() === lowercaseWord)) {
      uniqueWords.push([word, count]);
    }
    return uniqueWords;
  }, [])
  .slice(0, Math.min(cnt, Object.keys(mostCommonWords).length))
  .map(([word, count]) => word);

  // keep count of final words
  const finalWords = {};
  for (const word of mostCommonWordsSliced) {
    finalWords[word] = mostCommonWords[word];
  }

  return finalWords
}

function removeUnsignificantWords(mostCommonWords,keyword){
  const stopWordsSet = new Set(['black','white','{Educlips','saved','includes','Clipart}','included','includes','students','school','grade','&amp','word','able', 'about', 'above', 'abst', 'accordance', 'according', 'accordingly', 'across', 'act', 'actually', 'added', 'adj', 'affected', 'affecting', 'affects', 'after', 'afterwards', 'again', 'against', 'ain', "ain't", 'all', 'allow', 'allows', 'almost', 'alone', 'along', 'already', 'also', 'although', 'always', 'among', 'amongst', 'amoungst', 'amount', 'and', 'announce', 'another', 'any', 'anybody', 'anyhow', 'anymore', 'anyone', 'anything', 'anyway', 'anyways', 'anywhere', 'apart', 'apparently', 'appear', 'appreciate', 'appropriate', 'approximately', 'are', 'aren', 'arent', "aren't", 'arise', 'around', "a's", 'aside', 'ask', 'asking', 'associated', 'auth', 'available', 'away', 'awfully', 'back', 'became', 'because', 'become', 'becomes', 'becoming', 'been', 'before', 'beforehand', 'begin', 'beginning', 'beginnings', 'begins', 'behind', 'being', 'believe', 'below', 'beside', 'besides', 'best', 'better', 'between', 'beyond', 'bill', 'biol', 'both', 'bottom', 'brief', 'briefly', 'but', 'call', 'came', 'can', 'cannot', 'cant', "can't", 'cause', 'causes', 'certain', 'certainly', 'changes', 'cit', 'clearly', "c'mon", 'com', 'come', 'comes', 'con', 'concerning', 'consequently', 'consider', 'considering', 'contain', 'containing', 'contains', 'corresponding', 'could', 'couldn', 'couldnt', "couldn't", 'course', 'cry', "c's", 'currently', 'date', 'definitely', 'describe', 'described', 'despite', 'detail', 'did', 'didn', "didn't", 'different', 'does', 'doesn', "doesn't", 'doing', 'don', 'done', "don't", 'down', 'downwards', 'due', 'during', 'each', 'edu', 'effect', 'eight', 'eighty', 'either', 'eleven', 'else', 'elsewhere', 'empty', 'end', 'ending', 'enough', 'entirely', 'especially', 'est', 'et-al', 'etc', 'even', 'ever', 'every', 'everybody', 'everyone', 'everything', 'everywhere', 'exactly', 'example', 'except', 'far', 'few', 'fifteen', 'fifth', 'fify', 'fill', 'find', 'fire', 'first', 'five', 'fix', 'followed', 'following', 'follows', 'for', 'former', 'formerly', 'forth', 'forty', 'found', 'four', 'from', 'front', 'full', 'further', 'furthermore', 'gave', 'get', 'gets', 'getting', 'give', 'given', 'gives', 'giving', 'goes', 'going', 'gone', 'got', 'gotten', 'greetings', 'had', 'hadn', "hadn't", 'happens', 'hardly', 'has', 'hasn', 'hasnt', "hasn't", 'have', 'haven', "haven't", 'having', 'hed', "he'd", "he'll", 'hello', 'help', 'hence', 'her', 'here', 'hereafter', 'hereby', 'herein', 'heres', "here's", 'hereupon', 'hers', 'herself', 'hes', "he's", 'hid', 'him', 'himself', 'his', 'hither', 'home', 'hopefully', 'how', 'howbeit', 'however', "how's", 'http', 'hundred', 'ibid', "i'd", 'ignored', "i'll", "i'm", 'immediate', 'immediately', 'importance', 'important', 'inasmuch', 'inc', 'indeed', 'index', 'indicate', 'indicated', 'indicates', 'information', 'inner', 'insofar', 'instead', 'interest', 'into', 'invention', 'inward', 'isn', "isn't", 'itd', "it'd", "it'll", 'its', "it's", 'itself', "i've", 'just', 'keep', 'keeps', 'kept', 'know', 'known', 'knows', 'largely', 'last', 'lately', 'later', 'latter', 'latterly', 'least', 'les', 'less', 'lest', 'let', 'lets', "let's", 'like', 'liked', 'likely', 'line', 'little', 'look', 'looking', 'looks', 'los', 'ltd', 'made', 'mainly', 'make', 'makes', 'many', 'may', 'maybe', 'mean', 'means', 'meantime', 'meanwhile', 'merely', 'might', 'mightn', "mightn't", 'mill', 'million', 'mine', 'miss', 'more', 'moreover', 'most', 'mostly', 'move', 'mrs', 'much', 'mug', 'must', 'mustn', "mustn't", 'myself', 'name', 'namely', 'nay', 'near', 'nearly', 'necessarily', 'necessary', 'need', 'needn', "needn't", 'needs', 'neither', 'never', 'nevertheless', 'new', 'next', 'nine', 'ninety', 'nobody', 'non', 'none', 'nonetheless', 'noone', 'nor', 'normally', 'nos', 'not', 'noted', 'nothing', 'novel', 'now', 'nowhere', 'obtain', 'obtained', 'obviously', 'off', 'often', 'okay', 'old', 'omitted', 'once', 'one', 'ones', 'only', 'onto', 'ord', 'other', 'others', 'otherwise', 'ought', 'our', 'ours', 'ourselves', 'out', 'outside', 'over', 'overall', 'owing', 'own', 'page', 'pagecount', 'pages', 'par', 'part', 'particular', 'particularly', 'pas', 'past', 'per', 'perhaps', 'placed', 'please', 'plus', 'poorly', 'possible', 'possibly', 'potentially', 'predominantly', 'present', 'presumably', 'previously', 'primarily', 'probably', 'promptly', 'proud', 'provides', 'put', 'que', 'quickly', 'quite', 'ran', 'rather', 'readily', 'really', 'reasonably', 'recent', 'recently', 'ref', 'refs', 'regarding', 'regardless', 'regards', 'related', 'relatively', 'research', 'research-articl', 'respectively', 'resulted', 'resulting', 'results', 'right', 'run', 'said', 'same', 'saw', 'say', 'saying', 'says', 'sec', 'second', 'secondly', 'section', 'see', 'seeing', 'seem', 'seemed', 'seeming', 'seems', 'seen', 'self', 'selves', 'sensible', 'sent', 'serious', 'seriously', 'seven', 'several', 'shall', 'shan', "shan't", 'she', 'shed', "she'd", "she'll", 'shes', "she's", 'should', 'shouldn', "shouldn't", "should've", 'show', 'showed', 'shown', 'showns', 'shows', 'side', 'significant', 'significantly', 'similar', 'similarly', 'since', 'sincere', 'six', 'sixty', 'slightly', 'some', 'somebody', 'somehow', 'someone', 'somethan', 'something', 'sometime', 'sometimes', 'somewhat', 'somewhere', 'soon', 'sorry', 'specifically', 'specified', 'specify', 'specifying', 'still', 'stop', 'strongly', 'sub', 'substantially', 'successfully', 'such', 'sufficiently', 'suggest', 'sup', 'sure', 'system', 'take', 'taken', 'taking', 'tell', 'ten', 'tends', 'than', 'thank', 'thanks', 'thanx', 'that', "that'll", 'thats', "that's", "that've", 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'thence', 'there', 'thereafter', 'thereby', 'thered', 'therefore', 'therein', "there'll", 'thereof', 'therere', 'theres', "there's", 'thereto', 'thereupon', "there've", 'these', 'they', 'theyd', "they'd", "they'll", 'theyre', "they're", "they've", 'thickv', 'thin', 'think', 'third', 'this', 'thorough', 'thoroughly', 'those', 'thou', 'though', 'thoughh', 'thousand', 'three', 'throug', 'through', 'throughout', 'thru', 'thus', 'til', 'tip', 'together', 'too', 'took', 'top', 'toward', 'towards', 'tried', 'tries', 'truly', 'try', 'trying', "t's", 'twelve', 'twenty', 'twice', 'two', 'u201d', 'under', 'unfortunately', 'unless', 'unlike', 'unlikely', 'until', 'unto', 'upon', 'ups', 'use', 'used', 'useful', 'usefully', 'usefulness', 'uses', 'using', 'usually', 'value', 'various', 'very', 'via', 'viz', 'vol', 'vols', 'volumtype', 'want', 'wants', 'was', 'wasn', 'wasnt', "wasn't", 'way', 'wed', "we'd", 'welcome', 'well', "we'll", 'well-b', 'went', 'were', "we're", 'weren', 'werent', "weren't", "we've", 'what', 'whatever', "what'll", 'whats', "what's", 'when', 'whence', 'whenever', "when's", 'where', 'whereafter', 'whereas', 'whereby', 'wherein', 'wheres', "where's", 'whereupon', 'wherever', 'whether', 'which', 'while', 'whim', 'whither', 'who', 'whod', 'whoever', 'whole', "who'll", 'whom', 'whomever', 'whos', "who's", 'whose', 'why', "why's", 'widely', 'will', 'willing', 'wish', 'with', 'within', 'without', 'won', 'wonder', 'wont', "won't", 'words', 'world', 'would', 'wouldn', 'wouldnt', "wouldn't", 'www', 'yes', 'yet', 'you', 'youd', "you'd", "you'll", 'your', 'youre', "you're", 'yours', 'yourself', 'yourselves', "you've", 'zero']);
  const adjectives = new Set(["aback","abaft","abandoned","abashed","aberrant","abhorrent","abiding","abject","ablaze","able","abnormal","aboard","aboriginal","abortive","abounding","abrasive","abrupt","absent","absorbed","absorbing","abstracted","absurd","abundant","abusive","acceptable","accessible","accidental","accurate","acid","acidic","acoustic","acrid","actually","ad","hoc","adamant","adaptable","addicted","adhesive","adjoining","adorable","adventurous","afraid","aggressive","agonizing","agreeable","ahead","ajar","alcoholic","alert","alike","alive","alleged","alluring","aloof","amazing","ambiguous","ambitious","amuck","amused","amusing","ancient","angry","animated","annoyed","annoying","anxious","apathetic","aquatic","aromatic","arrogant","ashamed","aspiring","assorted","astonishing","attractive","auspicious","automatic","available","average","awake","aware","awesome","awful","axiomatic","bad","barbarous","bashful","bawdy","beautiful","befitting","belligerent","beneficial","bent","berserk","best","better","bewildered","big","billowy","bite-sized","bitter","bizarre","black","black-and-white","bloody","blue","blue-eyed","blushing","boiling","boorish","bored","boring","bouncy","boundless","brainy","brash","brave","brawny","breakable","breezy","brief","bright","bright","broad","broken","brown","bumpy","burly","bustling","busy","cagey","calculating","callous","calm","capable","capricious","careful","careless","caring","cautious","ceaseless","certain","changeable","charming","cheap","cheerful","chemical","chief","childlike","chilly","chivalrous","chubby","chunky","clammy","classy","clean","clear","clever","cloistered","cloudy","closed","clumsy","cluttered","coherent","cold","colorful","colossal","combative","comfortable","common","complete","complex","concerned","condemned","confused","conscious","cooing","cool","cooperative","coordinated","courageous","cowardly","crabby","craven","crazy","creepy","crooked","crowded","cruel","cuddly","cultured","cumbersome","curious","curly","curved","curvy","cut","cute","cute","cynical","daffy","daily","damaged","damaging","damp","dangerous","dapper","dark","dashing","dazzling","dead","deadpan","deafening","dear","debonair","decisive","decorous","deep","deeply","defeated","defective","defiant","delicate","delicious","delightful","demonic","delirious","dependent","depressed","deranged","descriptive","deserted","detailed","determined","devilish","didactic","different","difficult","diligent","direful","dirty","disagreeable","disastrous","discreet","disgusted","disgusting","disillusioned","dispensable","distinct","disturbed","divergent","dizzy","domineering","doubtful","drab","draconian","dramatic","dreary","drunk","dry","dull","dusty","dynamic","dysfunctional","eager","early","earsplitting","earthy","easy","eatable","economic","educated","efficacious","efficient","eight","elastic","elated","elderly","electric","elegant","elfin","elite","embarrassed","eminent","empty","enchanted","enchanting","encouraging","endurable","energetic","enormous","entertaining","enthusiastic","envious","equable","equal","erect","erratic","ethereal","evanescent","evasive","even excellent excited","exciting exclusive","exotic","expensive","extra-large extra-small exuberant","exultant","fabulous","faded","faint fair","faithful","fallacious","false familiar famous","fanatical","fancy","fantastic","far"," far-flung"," fascinated","fast","fat faulty","fearful fearless","feeble feigned","female fertile","festive","few fierce","filthy","fine","finicky","first"," five"," fixed"," flagrant","flaky","flashy","flat","flawless","flimsy"," flippant","flowery","fluffy","fluttering"," foamy","foolish","foregoing","forgetful","fortunate","four frail","fragile","frantic","free"," freezing"," frequent"," fresh"," fretful","friendly","frightened frightening full fumbling functional","funny","furry furtive","future futuristic","fuzzy ","gabby","gainful","gamy","gaping","garrulous","gaudy","general gentle","giant","giddy","gifted","gigantic","glamorous","gleaming","glib","glistening glorious","glossy","godly","good","goofy","gorgeous","graceful","grandiose","grateful gratis","gray greasy great","greedy","green grey grieving","groovy","grotesque","grouchy","grubby gruesome","grumpy","guarded","guiltless","gullible gusty","guttural H habitual","half","hallowed","halting","handsome","handsomely","handy","hanging","hapless","happy","hard","hard-to-find","harmonious","harsh","hateful","heady","healthy","heartbreaking","heavenly heavy hellish","helpful","helpless","hesitant","hideous high","highfalutin","high-pitched","hilarious","hissing","historical","holistic","hollow","homeless","homely","honorable","horrible","hospitable","hot huge","hulking","humdrum","humorous","hungry","hurried","hurt","hushed","husky","hypnotic","hysterical","icky","icy","idiotic","ignorant","ill","illegal","ill-fated","ill-informed","illustrious","imaginary","immense","imminent","impartial","imperfect","impolite","important","imported","impossible","incandescent","incompetent","inconclusive","industrious","incredible","inexpensive","infamous","innate","innocent","inquisitive","insidious","instinctive","intelligent","interesting","internal","invincible","irate","irritating","itchy","jaded","jagged","jazzy","jealous","jittery","jobless","jolly","joyous","judicious","juicy","jumbled","jumpy","juvenile","kaput","keen","kind","kindhearted","kindly","knotty","knowing","knowledgeable","known","labored","lackadaisical","lacking","lame","lamentable","languid","large","last","late","laughable","lavish","lazy","lean","learned","left","legal","lethal","level","lewd","light","like","likeable","limping","literate","little","lively","lively","living","lonely","long","longing","long-term","loose","lopsided","loud","loutish","lovely","loving","low","lowly","lucky","ludicrous","lumpy","lush","luxuriant","lying","lyrical","macabre","macho","maddening","madly","magenta","magical","magnificent","majestic","makeshift","male","malicious","mammoth","maniacal","many","marked","massive","married","marvelous","material","materialistic","mature","mean","measly","meaty","medical","meek","mellow","melodic","melted","merciful","mere","messy","mighty","military","milky","mindless","miniature","minor","miscreant","misty","mixed","moaning","modern","moldy","momentous","motionless","mountainous","muddled","mundane","murky","mushy","mute","mysterious","naive","nappy","narrow","nasty","natural","naughty","nauseating","near","neat","nebulous","necessary","needless","needy","neighborly","nervous","new","next","nice","nifty","nimble","nine","nippy","noiseless","noisy","nonchalant","nondescript","nonstop","normal","nostalgic","nosy","noxious","null","numberless","numerous","nutritious","nutty","oafish","obedient","obeisant","obese","obnoxious","obscene","obsequious","observant","obsolete","obtainable","oceanic","odd","offbeat","old","old-fashioned","omniscient","one","onerous","open","opposite","optimal","orange","ordinary","organic","ossified","outgoing","outrageous","outstanding","oval","overconfident","overjoyed","overrated","overt","overwrought","painful","painstaking","pale","paltry","panicky","panoramic","parallel","parched","parsimonious","past","pastoral","pathetic","peaceful","penitent","perfect","periodic","permissible","perpetual","petite","petite","phobic","physical","picayune","pink","piquant","placid","plain","plant","plastic","plausible","pleasant","plucky","pointless","poised","polite","political","poor","possessive","possible","powerful","precious","premium","present","pretty","previous","pricey","prickly","private","probable","productive","profuse","protective","proud","psychedelic","psychotic","public","puffy","pumped","puny","purple","purring","pushy","puzzled","puzzling","quack","quaint","quarrelsome","questionable","quick","quickest","quiet","quirky","quixotic","quizzical","rabid","racial","ragged","rainy","rambunctious","rampant","rapid","rare","raspy","ratty","ready","real","rebel","receptive","recondite","red","redundant","reflective","regular","relieved","remarkable","reminiscent","repulsive","resolute","resonant","responsible","rhetorical","rich","right","righteous","rightful","rigid","ripe","ritzy","roasted","robust","romantic","roomy","rotten","rough","round","royal","ruddy","rude","rural","rustic","ruthless","sable","sad","safe","salty","same","sassy","satisfying","savory","scandalous","scarce","scared","scary","scattered","scientific","scintillating","scrawny","screeching","second","second-hand","secret","secretive","sedate","seemly","selective","selfish","separate","serious","shaggy","shaky","shallow","sharp","shiny","shivering","shocking","short","shrill","shut","shy","sick","silent","silent","silky","silly","simple","simplistic","sincere","six","skillful","skinny","sleepy","slim","slimy","slippery","sloppy","slow","small","smart","smelly","smiling","smoggy","smooth","sneaky","snobbish","snotty","soft","soggy","solid","somber","sophisticated","sordid","sore","sore","sour","sparkling","special","spectacular","spicy","spiffy","spiky","spiritual","spiteful","splendid","spooky","spotless","spotted","spotty","spurious","squalid","square","squealing","squeamish","staking","stale","standing","statuesque","steadfast","steady","steep","stereotyped","sticky","stiff","stimulating","stingy","stormy","straight","strange","striped","strong","stupendous","stupid","sturdy","subdued","subsequent","substantial","successful","succinct","sudden","sulky","super","superb","superficial","supreme","swanky","sweet","sweltering","swift","symptomatic","synonymous","taboo","tacit","tacky","talented","tall","tame","tan","tangible","tangy","tart","tasteful","tasteless","tasty","tawdry","tearful","tedious","teeny","teeny-tiny","telling","temporary","ten","tender tense","tense","tenuous","terrible","terrific","tested","testy","thankful","therapeutic","thick","thin","thinkable","third","thirsty","thoughtful","thoughtless","threatening","three","thundering","tidy","tight","tightfisted","tiny","tired","tiresome","toothsome","torpid","tough","towering","tranquil","trashy","tremendous","tricky","trite","troubled","truculent","true","truthful","two","typical","ubiquitous","ugliest","ugly","ultra","unable","unaccountable","unadvised","unarmed","unbecoming","unbiased","uncovered","understood","undesirable","unequal","unequaled","uneven","unhealthy","uninterested","unique","unkempt","unknown","unnatural","unruly","unsightly","unsuitable","untidy","unused","unusual","unwieldy","unwritten","upbeat","uppity","upset","uptight","used","useful","useless","utopian","utter","uttermost","vacuous","vagabond","vague","valuable","various","vast","vengeful","venomous","verdant","versed","victorious","vigorous","violent","violet","vivacious","voiceless","volatile","voracious","vulgar","wacky","waggish","waiting","","wakeful","wandering","wanting","warlike","warm","wary","wasteful","watery","weak","wealthy","weary","well-groomed","well-made","well-off","well-to-do","wet","whimsical","whispering","white","whole","wholesale","wicked","wide","wide-eyed","wiggly","wild","willing","windy","wiry","wise","wistful","witty","woebegone","womanly","wonderful","wooden","woozy","workable","worried","worthless","wrathful","wretched","wrong","wry","xenophobic","yellow","yielding","young","youthful","yummy","zany","zealous","zesty","zippy","zonked"])
  const verbes = new Set(["accept", "add", "admire", "admit", "advise", "afford", "agree", "alert", "allow", "amuse", "analyse", "announce", "annoy", "answer", "apologise", "appear", "applaud", "appreciate", "approve", "argue", "arrange", "arrest", "arrive", "ask", "attach", "attack", "attempt", "attend", "attract", "avoid", "back", "bake", "balance", "ban", "bang", "bare", "bat", "bathe", "battle", "beam", "beg", "behave", "belong", "bleach", "bless", "blind", "blink", "blot", "blush", "boast", "boil", "bolt", "bomb", "book", "bore", "borrow", "bounce", "bow", "box", "brake", "branch", "breathe", "bruise", "brush", "bubble", "bump", "burn", "bury", "buzz", "calculate", "call", "camp", "care", "carry", "carve", "cause", "challenge", "change", "charge", "chase", "cheat", "check", "cheer", "chew", "choke", "chop", "claim", "clap", "clean", "clear", "clip", "close", "coach", "coil", "collect", "colour", "comb", "command", "communicate", "compare", "compete", "complain", "complete", "concentrate", "concern", "confess", "confuse", "connect", "consider", "consist", "contain", "continue", "copy", "correct", "cough", "count", "cover", "crack", "crash", "crawl", "cross", "crush", "cry", "cure", "curl", "curve", "cycle", "dam", "damage", "dance", "dare", "decay", "deceive", "decide", "decorate", "delay", "delight", "deliver", "depend", "describe", "desert", "deserve", "destroy", "detect", "develop", "disagree", "disappear", "disapprove", "disarm", "discover", "dislike", "divide", "double", "doubt", "drag", "drain", "dream", "dress", "drip", "drop", "drown", "drum", "dry", "dust", "earn", "educate", "embarrass", "employ", "empty", "encourage", "end", "enjoy", "enter", "entertain", "escape", "examine", "excite", "excuse", "exercise", "exist", "expand", "expect", "explain", "explode", "extend", "face", "fade", "fail", "fancy", "fasten", "fax", "fear", "fence", "fetch", "file", "fill", "film", "fire", "fit", "fix", "flap", "flash", "float", "flood", "flow", "flower", "fold", "follow", "fool", "force", "form", "found", "frame", "frighten", "fry", "gather", "gaze", "glow", "glue", "grab", "grate", "grease", "greet", "grin", "grip", "groan", "guarantee", "guard", "guess", "guide", "hammer", "hand", "handle", "hang", "happen", "harass", "harm", "hate", "haunt", "head", "heal", "heap", "heat", "help", "hook", "hop", "hope", "hover", "hug", "hum", "hunt", "hurry", "identify", "ignore", "imagine", "impress", "improve", "include", "increase", "influence", "inform", "inject", "injure", "instruct", "intend", "interest", "interfere", "interrupt", "introduce", "invent", "invite", "irritate", "itch", "jail", "jam", "jog", "join", "joke", "judge", "juggle", "jump", "kick", "kill", "kiss", "kneel", "knit", "knock", "knot", "label", "land", "last", "laugh", "launch", "learn", "level", "license", "lick", "lie", "lighten", "like", "list", "listen", "live", "load", "lock", "long", "look", "love", "man", "manage", "march", "mark", "marry", "match", "mate", "matter", "measure", "meddle", "melt", "memorise", "mend", "mess up", "milk", "mine", "miss", "mix", "moan", "moor", "mourn", "move", "muddle", "mug", "multiply", "murder", "nail", "name", "need", "nest", "nod", "note", "notice", "number", "obey", "object", "observe", "obtain", "occur", "offend", "offer", "open", "order", "overflow", "owe", "own", "pack", "paddle", "paint", "park", "part", "pass", "paste", "pat", "pause", "peck", "pedal", "peel", "peep", "perform", "permit", "phone", "pick", "pinch", "pine", "place", "plan", "plant", "play", "please", "plug", "point", "poke", "polish", "pop", "possess", "post", "pour", "practise", "pray", "preach", "precede", "prefer", "prepare", "present", "preserve", "press", "pretend", "prevent", "prick", "print", "produce", "program", "promise", "protect", "provide", "pull", "pump", "punch", "puncture", "punish", "push", "question", "queue", "race", "radiate", "rain", "raise", "reach", "realise", "receive", "recognise", "record", "reduce", "reflect", "refuse", "regret", "reign", "reject", "rejoice", "relax", "release", "rely", "remain", "remember", "remind", "remove", "repair", "repeat", "replace", "reply", "report", "reproduce", "request", "rescue", "retire", "return", "rhyme", "rinse", "risk", "rob", "rock", "roll", "rot", "rub", "ruin", "rule", "rush", "sack", "sail", "satisfy", "save", "saw", "scare", "scatter", "scold", "scorch", "scrape", "scratch", "scream", "screw", "scribble", "scrub", "seal", "search", "separate", "serve", "settle", "shade", "share", "shave", "shelter", "shiver", "shock", "shop", "shrug", "sigh", "sign", "signal", "sin", "sip", "ski", "skip", "slap", "slip", "slow", "smash", "smell", "smile", "smoke", "snatch", "sneeze", "sniff", "snore", "snow", "soak", "soothe", "sound", "spare", "spark", "sparkle", "spell", "spill", "spoil", "spot", "spray", "sprout", "squash", "squeak", "squeal", "squeeze", "stain", "stamp", "stare", "start", "stay", "steer", "step", "stir", "stitch", "stop", "store", "strap", "strengthen", "stretch", "strip", "stroke", "stuff", "subtract", "succeed", "suck", "suffer", "suggest", "suit", "supply", "support", "suppose", "surprise", "surround", "suspect", "suspend", "switch", "talk", "tame", "tap", "taste", "tease", "telephone", "tempt", "terrify", "test", "thank", "thaw", "tick", "tickle", "tie", "time", "tip", "tire", "touch", "tour", "tow", "trace", "trade", "train", "transport", "trap", "travel", "treat", "tremble", "trick", "trip", "trot", "trouble", "trust", "try", "tug", "tumble", "turn", "twist", "type", "undress", "unfasten", "unite", "unlock", "unpack", "untidy", "use", "vanish", "visit", "wail", "wait", "walk", "wander", "want", "warm", "warn", "wash", "waste", "watch", "water", "wave", "weigh", "welcome", "whine", "whip", "whirl", "whisper", "whistle", "wink", "wipe", "wish", "wobble", "wonder", "work", "worry", "wrap", "wreck", "wrestle", "wriggle", "x-ray", "yawn", "yell", "zip", "zoom"])
  
  // generate all keyword combinations
  keywords = keyword.split(" ");
  kws = [];
  for (kw in keywords){
    kws.push(keywords[kw]);
    kws.push(keywords[kw]+'s');
    kws.push(keywords[kw].toLowerCase());
    kws.push(keywords[kw].toUpperCase());
    kws.push(keywords[kw].charAt(0).toUpperCase() + keywords[kw].slice(1));
    kws.push(keywords[kw].charAt(0).toUpperCase() + keywords[kw].slice(1)+'s');
  }

  function deleteAll(word){
    delete mostCommonWords[word];
    delete mostCommonWords[word.toLowerCase()];
    delete mostCommonWords[word+'s'];
    delete mostCommonWords[word.toUpperCase()];
  }
  // remove words in mostCommonWords found in stopWordsSet, check for capitalization
  for (const word in mostCommonWords){

    if (stopWordsSet.has(word.toLowerCase()) || adjectives.has(word.toLowerCase()) || verbes.has(word.toLowerCase())){
      deleteAll(word)
    }
    if (word.length<3){
      deleteAll(word)
    }
    
    if (kws.includes(word)){
      deleteAll(word)
    }
  }
  return mostCommonWords
}





///////
// HTML manipulation
///////

///////
// DASHBOARD
///////

function launchDashboard() {
  const mainDiv = document.getElementsByClassName("SellerDashboard__container")[0];

  chrome.storage.local.get("fullSalesMatrix", function(result) {
    const salesMatrix = result.fullSalesMatrix;

    let dashboardMainDiv = document.createElement("div");
    dashboardMainDiv.setAttribute("id", "dashboardMainDiv");
    dashboardMainDiv.setAttribute("class", "dashboardMainDiv");
    dashboardMainDiv.setAttribute("style", "display: flex; flex-direction: column; align-items: center;");

    let todaysSales = [];
    let weeklySales = [];
    let monthlySales = [];

    for (let row of salesMatrix){
      date = row.date.split("/");
      date = [date[0],date[1],date[2]];
    
      if (!date1BeforeDate2(date,getTodaysDate())){
        todaysSales.push(row);
      }
      if (!date1BeforeDate2(date,subtractDaysFromDate(getTodaysDate(),7))){
        weeklySales.push(row);
      }
      if (!date1BeforeDate2(date,subtractDaysFromDate(getTodaysDate(),30))){
        monthlySales.push(row);
      }
    }
    console.log('TODAY',todaysSales);
    console.log('Weekly',weeklySales);
    console.log('Monthly',monthlySales);    


    /*
    - Today's Sales
    - Sales table
    - last reviews w/ comments
    */

    //headerDiv = getHeader();
    //dashboardMainDiv.appendChild(headerDiv);

    dashBoard = getDashboard();
    //dashboardMainDiv.appendChild(dashBoard);

    mainDiv.prepend(dashboardMainDiv);
  });
}

function getDashboard(){
  let dashboardDiv = document.createElement("div");
  dashboardDiv.classList.add("col-12")

  let dashboardHeader = document.createElement("div");
  dashboardHeader.classList.add("row","mb-3");
  dashboardHeaderMain = document.createElement("div");
  dashboardHeaderMain.classList.add("card-body", "py-3");
  dashboardHeaderMainInner = document.createElement("div");
  dashboardHeaderMainInner.classList.add("row", "bordered","px-3");

  card1 = document.createElement("div");
  card1.classList.add("col-1", "my-1", "d-flex", "align-items-start");
  card1.innerHTML = 'TEST'

  card2 = document.createElement("div");
  card2.classList.add("col-1", "my-1", "d-flex", "align-items-start");
  card2.innerHTML = 'TEST'

  card3 = document.createElement("div");
  card3.classList.add("col-1", "my-1", "d-flex", "align-items-start");
  card3.innerHTML = 'TEST'

  card4 = document.createElement("div");
  card4.classList.add("col-1", "my-1", "d-flex", "align-items-start");
  card4.innerHTML = 'TEST'


  dashboardHeaderMainInner.appendChild(card1);
  dashboardHeaderMainInner.appendChild(card2);
  dashboardHeaderMainInner.appendChild(card3);
  dashboardHeaderMainInner.appendChild(card4);

  dashboardHeaderMain.appendChild(dashboardHeaderMainInner);
  dashboardHeader.appendChild(dashboardHeaderMain);
  dashboardDiv.appendChild(dashboardHeader);

  return dashboardDiv
}


function getHeader(){

  let headerDiv = document.createElement("div");
  headerDiv.setAttribute("id", "headerDiv");
  headerDiv.setAttribute("class", "row");

  headerLeft = document.createElement("h5");
  headerLeft.classList.add("col-4","pb-1", "my-1","text-nowrap");
  headerLeft.innerHTML = 'TpT-Informer Keyword Research <span class="small ml-2 d-inline-block">v1.0</span>'

  headerRight = document.createElement("div");
  headerRight.classList.add("col-8","justify-content-end","pb-1");
  headerRight.innerHTML = '';

  headerDiv.appendChild(headerLeft);
  headerDiv.appendChild(headerRight);

  return headerDiv
}

function startInformerTab(){

  const mainDiv = document.getElementsByClassName("Tabs__content")[0];

  informerTabWrapper = document.createElement("div");
  informerTabWrapper.classList.add("row","informerTabWrapper","px-4");

  header = getHeader();
  informerTab = getInformerTab();


  let keywordSuggestionsHeader = document.createElement("div");
  keywordSuggestionsHeader.classList.add("keywordSuggestionsHeader"); //"col-12",
  keywordSuggestionsHeader.innerHTML = "";

  //keywordSuggestionsHeader.append(resultsContainer)
  // hide keyword suggestions
  //keywordSuggestionsHeader.style.display = "none";

  informerTabWrapper.prepend(keywordSuggestionsHeader);

  let marketStatsHeader = document.createElement("div");
  marketStatsHeader.classList.add("marketStatsHeader");
  marketStatsHeader.innerHTML = '';

  //marketStatsHeader.style.display = "none";


  informerTabWrapper.prepend(marketStatsHeader);
  informerTabWrapper.prepend(informerTab);

  informerTabWrapper.prepend(header);

  mainDiv.prepend(informerTabWrapper);

}

function addHeaderStyle(div){

  return div
}



function addInformerTab(){

  const informerTab = document.createElement("li");
  informerTab.classList.add("Tabs__tab","informertab");
  informerTab.setAttribute("role","tab");
  informerTab.setAttribute("tabindex","-1");
  informerTab.setAttribute("aria-selected","false");
  informerTab.style.cssText += 'color:rgb(0,0,128)';
  informerTab.innerHTML = '<div class="Onboarding__highlight">TpT-Informer</div>';

  informerTab.addEventListener("click", () => {
    if (ACTIVE){
      return
    }
    ACTIVE = true;
    changeToInformerTab();
  });


  const mainDiv = document.getElementsByClassName("SellerDashboard__container")[0];
  const tabs = document.querySelectorAll(".Tabs__tab");
  tabs[0].parentNode.insertBefore(informerTab, tabs[0].nextSibling);
}


function getInformerTab(){

  const wrapper = document.createElement("div");
  wrapper.classList = "col-12 csviewer_wrapper";
  wrapper.style = "background-color: rgba(0,0,0,0.2);"

  const testBtn = document.createElement("button");
  testBtn.addEventListener("click", () => {
    analyzeSales();
  });
  testBtn.innerHTML = "Update Product Stats";
  testBtn.style = "background-color: rgba(255,0,0,1);"
  //wrapper.prepend(testBtn);

  const inputElement = document.createElement('input');
  inputElement.setAttribute('type', 'text');  
  inputElement.setAttribute('id', 'keywordInput');
  inputElement.setAttribute('placeholder', 'Enter a keyword...');

  function handleEnterKeyPress(event) {
    if (event.key === 'Enter') {

      // remove previous results
      try{
        const keywordSuggestionsHeader = document.getElementsByClassName("keywordSuggestionsHeader")[0];
        keywordSuggestionsHeader.innerHTML = '';
      }
      catch {
        console.log("no prev result loaded");
      }
      const marketStatsHeader = document.getElementsByClassName("marketStatsHeader")[0];
      
      marketStatsHeader.style.display = "none";


      const keywordSuggestionsHeader = document.getElementsByClassName("keywordSuggestionsHeader")[0];
      keywordSuggestionsHeader.innerHTML = '';
      //keywordSuggestionsHeader.style.display = "none";

      // add loading screen until keyword crawl is done
      displayLoadingScreen()

      const keyword = inputElement.value;
      keywordCrawlWrapper(keyword)
      chrome.runtime.sendMessage({id: "callKeywordCrawl", keyword: keyword});

    }
  }
  
  inputElement.addEventListener('keydown', handleEnterKeyPress);

  wrapper.prepend(inputElement);
  return wrapper
}

function displayLoadingScreen(){
  const keywordSuggestionsHeader = document.getElementsByClassName("keywordSuggestionsHeader")[0];
  const loadingScreen = document.createElement("div");
  loadingScreen.classList.add("loadingScreen");
  loadingScreen.innerHTML = '<div class="spinner-border text-primary my-3" role="status"><span class="sr-only">Loading...</span></div>';
  loadingScreen.innerHTML += '<div class="small text-primary">Crawling keywords...';
  keywordSuggestionsHeader.append(loadingScreen);
  // add counter for how many keywords have been crawled
  return 

  
  chrome.storage.sync.get("keywordCrawlCounter", function(result) {
    const keywordCrawlCounter = result.keywordCrawlCounter;
    loadingScreen.innerHTML += '<div class="small text-primary my-3">Crawling keywords... ('+((keywordCrawlCounter*100).toFixed(0))+'/100 %)</div>';
    keywordSuggestionsHeader.append(loadingScreen);
  });
}



function modifyTabs(){
  const tabs = document.querySelectorAll(".Tabs__tab");
  informerTab = document.getElementsByClassName("informertab")[0];

  for (const tab of tabs){

    if (tab.classList.contains("informertab")){
      continue
    }

    tab.addEventListener("click", () => {
      ACTIVE = false;
      console.log("deactivate informer tab");
      deselectInformerTab();
    });
  }
}

function changeToInformerTab(){  
  console.log("clicked");
  informerTab = document.getElementsByClassName("informertab")[0];
  const tabs = document.querySelectorAll(".Tabs__tab");
  for (const tab of tabs){
    if (tab.classList.contains("informertab")){
      continue
    }
    tab.classList.remove("Tabs__tab--active");
  }
  informerTab.classList.add("Tabs__tab--active");
  removeContent()

  startInformerTab();
}


function deselectInformerTab(){
  informerTab = document.getElementsByClassName("informertab")[0];
  informerTab.classList.remove("Tabs__tab--active");

  //inlineDashboard1 = document.getElementsByClassName("Panel Panel--borderless")[0];
  inlineDashboard2 = document.getElementsByClassName("SellerDashboardHomeTab__panelRow")[0];
  inlineDashboard3 = document.getElementsByClassName("SellerDashboardMarketingTab__panelRow")[0];

  // get second to last
  inlineDashboard4 = document.getElementsByClassName("Onboarding__highlight");
  inlineDashboard4 = inlineDashboard4[inlineDashboard4.length-2];

  try{
    inlineDashboard2.style.display = "block";
  }
  catch(err){
    console.log("no inlineDashboard2");
  }
  try{
    inlineDashboard3.style.display = "block";
  }
  catch(err){
    console.log("no inlineDashboard3");
  }
  try{
    inlineDashboard4.style.display = "block";
  }
  catch(err){
    console.log("no inlineDashboard4");
  }
  //inlineDashboard1.style.display = "block";

  informerTabWrapper = document.getElementsByClassName("informerTabWrapper")[0];
  informerTabWrapper.remove();

}

function removeContent(){
  //inlineDashboard1 = document.getElementsByClassName("Panel Panel--borderless")[0];
  inlineDashboard2 = document.getElementsByClassName("SellerDashboardHomeTab__panelRow")[0];
  inlineDashboard3 = document.getElementsByClassName("SellerDashboardMarketingTab__panelRow")[0];

  // get second to last
  inlineDashboard4 = document.getElementsByClassName("Onboarding__highlight");
  inlineDashboard4 = inlineDashboard4[inlineDashboard4.length-2];


  // hide content of inline dashboards
  //inlineDashboard1.style.display = "none";

  try{
    inlineDashboard2.style.display = "none";
  }  
  catch(err){
    console.log("no inlineDashboard2");
  }
  try{
    inlineDashboard3.style.display = "none";
  }
  catch(err){
    console.log("no inlineDashboard3");
  }
  try{
    inlineDashboard4.style.display = "none";
  }
  catch(err){
    console.log("no inlineDashboard4");
  }
}



// PRODUCT STATS

function displayProductStats(productStats){
  console.log(productStats);
  const keywordSuggestionsHeader = document.getElementsByClassName("keywordSuggestionsHeader")[0];
  const marketStatsHeader = document.getElementsByClassName("marketStatsHeader")[0];

  // remove loading screen
  const loadingScreen = document.getElementsByClassName("loadingScreen")[0];
  loadingScreen.remove();

  // show market header 
  marketStatsHeader.style.display = "block";
  marketStatsHeader.innerHTML = '<h5 class="">Market Stats</h5>';


  keywordSuggestionsHeader.style.display = "block";
  keywordSuggestionsHeader.innerHTML = '<h5 class="">Keywords</h5>';
  //keywordSuggestionsHeader.style.borderBottom = "1px solid #e6e6e6";



  const keywordSuggestions = getKeywordSuggestions(productStats);
  keywordSuggestionsHeader.append(keywordSuggestions);


  const wrapper = document.createElement("div");
  wrapper.classList.add("px-3","marketStats"); 
  wrapper.style.borderTop = "2px solid #e6e6e6";

  const statsTable = getStatsTable(productStats);
  const statsHeader = getStatsTableHeader(productStats);

  wrapper.append(statsHeader);
  wrapper.append(statsTable);

  marketStatsHeader.append(wrapper);
}

const IGNORE = ["keyword","totalProducts","productsOnSale","descriptionStats"];

function getStatsTableHeader(productStats){

  statsHeader = document.createElement("div");
  statsHeader.classList.add("row"); //,"bordered","px-3"

  /*
  keywordHeader = document.createElement("div");
  keywordHeader.classList.add("col-12"); 
  keywordHeader.innerHTML = productStats.keyword;
  keywordHeader.style = "font-weight: bold; size: 1.2em; "
  */

  listStats = ["marketSize","keyword","avgSaleDiscount","averageRating","totalProducts","averagePrice","medianPrice","productsOnSale","averageRatingCount","descriptionStats"];
  labelMap = {
    "keyword": "Keyword",
    "totalProducts": "Total Products",
    "averagePrice": "Avg. Price est.",
    "productsOnSale": "Products on Sale",
    "avgSaleDiscount": "Avg. sale discount est.",
    "averageRating": "Avg. rating est.",
    "averageRatingCount": "Rating count est.",
    "descriptionStats": "Keywords",
    "marketSize": "Market Size",
    "medianPrice": "Median Price est."
  }

  for (const i in listStats){
    if (IGNORE.indexOf(listStats[i]) != -1){
      continue
    }
    statDiv = document.createElement("div");
    statDiv.classList.add("col"); //, "align-items-start"
    statDiv.innerHTML = labelMap[listStats[i]]
    statDiv.style = "font-weight: bold; size: 0.5em;"
    statsHeader.appendChild(statDiv);
  }   
  //statsHeader.prepend(keywordHeader);

  return statsHeader
}

function getKeywordSuggestions(productStats){

  keywordSuggestionsInner = document.createElement("div","keywordSuggestions");
  keywordSuggestionsInner.classList.add("px-3","keywordSuggestions"); //, "align-items-start"
  keywordSuggestionsInner.style.borderTop = "2px solid #e6e6e6";
      
  
  const descriptionStats = productStats['descriptionStats'];
  const descriptionStatsKeys = Object.keys(descriptionStats);
  const descriptionStatsValues = Object.values(descriptionStats);

  for (const i in descriptionStatsKeys){

    percentage = (descriptionStatsValues[i]/productStats.totalProducts)*100;
    keywordSuggestionsInner.innerHTML += descriptionStatsKeys[i]
    keywordSuggestionsInner.innerHTML +=  " <span class='small ml-2 d-inline-block'>"+"("+percentage.toFixed(2)+"%)"+"</span> "
  }

  return keywordSuggestionsInner
}

function getStatsTable(productStats){

  statsInner = document.createElement("div");
  statsInner.classList.add("row"); //,"bordered","px-3"

  addMap = {
    "keyword": "",
    "totalProducts": "",
    "averagePrice": "$",
    "productsOnSale": "",
    "avgSaleDiscount": "%",
    "averageRating": "/5",
    "averageRatingCount": " Ratings",
    "descriptionStats": "",
    "marketSize": "",
    "medianPrice": "$"
  }

  listStats = ["marketSize","keyword","avgSaleDiscount","averageRating","totalProducts","averagePrice","medianPrice","productsOnSale","averageRatingCount","descriptionStats"];


  for (const i in listStats){
    if (IGNORE.indexOf(listStats[i]) != -1){
      continue
    }
    stat = listStats[i];
    statDiv = document.createElement("div");

    if (stat == "descriptionStats"){
      continue
    }
    else{
      statDiv.classList.add("col"); //, "align-items-start"
      statDiv.innerHTML = productStats[stat]+addMap[stat];
    }   
    statsInner.appendChild(statDiv);
  }
  return statsInner
}
