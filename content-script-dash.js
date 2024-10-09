const DEBUG = false;
let ACTIVE = false;
let MARKET_RESEARCH_ACTIVE = false;
let PRODUCTS_ACTIVE = false;
let DASHBOARD_ACTIVE = false;
let RANKING_ACTIVE = false;
let TRACKER_ACTIVE = false;

let TABS_ADDED = false;

let TABOPEN = false;
const DAILY_LIMIT_ACTIVE = false;
let ISPREMIUM = false;
const DAILYSEARCHLIMIT = 3;
const FREE_LIMIT = 3;
const MOSTCOMMONCOUNT = 15
let IDX = 1;
let totalProducts = 0;

// MARKET RESEARCH
let seenMarketResearchKeywords = {}

// RANKING
let seenRankingStores = {};
let seenRankingStoresCount = 0;
const FREE_DAILY_RANKING_LIMIT = 0;
const PREMIUM_DAILY_RANKING_LIMIT = 10;

// PRODUCTS
let globalProductStats = [];
let filteredProductStats = [];
let productDataFromProfile = [];

// TRACKER
let showAllTrackerResults = false
let globalTrackerRepo = [[], [], [], [], []]
let trackerKeywords = ["", "", "", "", ""]

setTimeout(startup, 20);

chrome.storage.local.get(function (result) {
  console.log(result)
})

chrome.storage.sync.get(function (result) {
  if (result.isPremium) {
    ISPREMIUM = true;
    chrome.storage.sync.set({ rankingLimitreached: false });
  }
});

function addBootstrap() {
  let bootstrap = document.createElement('link');
  bootstrap.rel = 'stylesheet';
  bootstrap.href = 'bootstrap_mod_tpt.css';
  document.head.appendChild(bootstrap);
}

async function startup() {
  setStoreDetails()
  addInformerTab()
  addInformerTabRemovalListener()

  // CHECK BEARER TOKEN
  chrome.storage.sync.get(function (result) {

    seenRankingStoresCount = result.seenRankingStoresCount || 0;
    globalBearerToken = result.bearerToken;
    testBearerToken(result.bearerToken)
  })

  // DASHBOARD
  chrome.storage.sync.get(function (result) {
    startSalesRetrieve(result.lastSyncPoint).then(() => {
      //updateSales()

    }).then(() => {
      setTimeout(() => {
        if (DASHBOARD_ACTIVE) {
          reloadInformerTab()
        }
      }, 100);
    })
  });


  // TRACKER KEYWORDS
  chrome.storage.sync.get(function (result) {
    if (result.trackerKeywords) {
      trackerKeywords = result.trackerKeywords;
    }
  })


  // CHECK IF PRODUCTS LOADED TODAY AND LOAD IF NOT
  chrome.storage.sync.get("productStatsLastPull", function (result) {
    const productStatsLastPull = result.productStatsLastPull || [0, 0, 0];
    const today = getTodaysDate();

    if (productStatsLastPull[0] != today[0] || productStatsLastPull[1] != today[1] || productStatsLastPull[2] != today[2]) {
      getProductStats(loadOnly = true);
    }
  })

  // CHECK IF TRACKER REPO LOADED UPDATED TODAY
  chrome.storage.local.get(async function (result) {
    let todayCentral = getCentralDate();

    if (result.trackerRepo) {
      for (i = 0; i < result.trackerRepo.length; i++) {
        if (!result.trackerRepo[i].lastUpdated) {
          continue
        }

        if (result.trackerRepo[i].lastUpdated[0] != todayCentral[0] || result.trackerRepo[i].lastUpdated[1] != todayCentral[1] || result.trackerRepo[i].lastUpdated[2] != todayCentral[2]) {
          let keyword = result.trackerRepo[i].keyword;

          await searchRankTrackerCrawlWrapper(keyword, 5, i)
        }
      }
      chrome.runtime.sendMessage({ id: "writeSearchRankToRTDB" });
      setTimeout(() => {
        chrome.storage.sync.set({ trackerRepoLastUpdated: todayCentral })
      }, 1000);
    }
  })
}

function setStoreDetails() {
  chrome.storage.sync.get(function (result) {
    if (!result.store_url) {
      let img = document.getElementsByClassName("Image-module__roundedCircle--sgMRY"); // Avatar-module__root--eRcqn Avatar-module__xl--wDBxG
      let imgUrl = img.item(0).src;

      let details = document.getElementsByClassName("SellerDashboardHeader__details")[0]
      let seller = details.querySelectorAll(".Link-module__link--GFbUH"); // SellerDashboard__storeName
      store_url = seller[0].href.split("/")[4];

      let sellerName = seller[0].innerText;

      chrome.storage.sync.set({ sellerName: sellerName });
      chrome.storage.sync.set({ imgUrl: imgUrl });
      chrome.storage.sync.set({ store_url: store_url });
    }
  })
}


let globalSalesMatrix = []

async function startSalesRetrieve(lastSyncPoint) {

  await retrieveSales(getUrl(IDX, ['01', '01', '1969'], getTodaysDate()), lastSyncPoint).then(
    (newFullSalesMatrix) => {

      removeLoadingScreenDashboard();

      // Assuming `newFullSalesMatrix` has the necessary data
      if (newFullSalesMatrix.length > 0) {
        chrome.storage.sync.set({ lastSyncPoint: globalSalesMatrix[0].orderId + globalSalesMatrix[0].buyer.replace(/[0-9@#$%^&*()_+=[\]{};':"\\|,.<>/?~`]/g, "") });
      }

      chrome.storage.local.get("fullSalesMatrix", function (result) {
        let fullSalesMatrixOld = result.fullSalesMatrix || []; // Simplified initialization

        let newFullSalesMatrix = globalSalesMatrix.concat(fullSalesMatrixOld);

        chrome.storage.local.set({ fullSalesMatrix: newFullSalesMatrix }, function () {
          updateSales()
        });


      })
    }
  )
}

async function retrieveSales(url, lastSyncPoint) {
  try {
    const response = await fetch(url);
    if (response.status !== 200) {
      throw new Error("Status != 200");
    }
    const responseText = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(responseText, 'text/html');
    const table = doc.querySelectorAll(".odd, .even");
    const queryDiv = doc.querySelectorAll(".counter")[0];
    const totalNoProducts = parseInt(queryDiv.querySelectorAll('span')[0].innerText);
    totalProducts = totalNoProducts;
    const noProducts = parseInt(queryDiv.innerText.split('-')[1].split(' ')[0]);

    // if dashboard activ, display loading screen
    if (DASHBOARD_ACTIVE) {
      displayLoadingScreenDashboard(noProducts, totalNoProducts);
    }
    let rawSalesMatrix = [];
    let thisfullSalesMatrix = [];

    rawSalesMatrix.push(table);

    for (let i = 0; i < rawSalesMatrix.length; i++) {
      let newRow = extractSales(rawSalesMatrix[i]);

      if (!newRow[i]) {
        continue;
      }

      for (let j = 0; j < newRow.length; j++) {
        let thisSyncPoint = newRow[j].orderId + newRow[j].buyer.replace(/[0-9@#$%^&*()_+=[\]{};':"\\|,.<>/?~`]/g, "");
        // Check if lastSyncPoint exists and matches the current row
        if (lastSyncPoint && thisSyncPoint === lastSyncPoint) {
          thisfullSalesMatrix = thisfullSalesMatrix.concat(newRow.slice(0, j));
          globalSalesMatrix = globalSalesMatrix.concat(thisfullSalesMatrix);

          return thisfullSalesMatrix; // Return accumulated data if sync point is reached
        }
      }

      thisfullSalesMatrix = thisfullSalesMatrix.concat(newRow);
    }

    globalSalesMatrix = globalSalesMatrix.concat(thisfullSalesMatrix);

    if (noProducts < totalNoProducts) {
      IDX += 1;
      return retrieveSales(getUrl(IDX, ['01', '01', '1969'], getTodaysDate()), lastSyncPoint);
    }

    return thisfullSalesMatrix; // Return accumulated data if no more products to retrieve


  } catch (error) {
    console.log(error);
    return []; // Return an empty array in case of error
  }
}



function extractSales(NodeList) {

  let salesMatrix = [];

  for (let i = 0; i < NodeList.length; i++) {
    let newRow = {};

    let curr = NodeList[i];
    let cells = curr.querySelectorAll("td");

    newRow.date = cells[0].innerHTML;
    newRow.orderId = cells[1].innerHTML;
    newRow.source = cells[2].innerHTML;
    s = cells[3].textContent;
    newRow.itemSold = s.substring(98, 112).replace(/[]/g, "") + "..."; //.substring(31,41)

    newRow.buyer = cells[4].innerHTML;
    newRow.lastDownload = cells[5].innerHTML;
    newRow.licenses = cells[6].innerHTML;
    newRow.price = cells[7].innerHTML;
    newRow.commission = cells[8].innerHTML;
    newRow.transactionFee = cells[9].innerHTML;
    newRow.tax_seller = cells[10].innerHTML;
    newRow.tax_tpt = cells[11].innerHTML;
    newRow.earnings = cells[12].innerText.replace(/[^.0-9$]/g, "");

    salesMatrix.push(newRow);
  }
  return salesMatrix
}


// UTILS
function getTodaysDate() {
  const today = new Date();
  const mm = today.getMonth() + 1; // Months are zero-indexed, so we add 1
  const dd = today.getDate();
  const yyyy = today.getFullYear();
  const dateArray = [mm, dd, yyyy];
  return dateArray
}

function getCentralDate() {
  const currentDate = new Date();

  const options = {
    timeZone: 'America/Chicago',
  };

  const day = currentDate.toLocaleString('en-US', { day: '2-digit', ...options });
  const month = currentDate.toLocaleString('en-US', { month: '2-digit', ...options });
  const year = currentDate.toLocaleString('en-US', { year: 'numeric', ...options });

  return [month, day, year];
}

function dateMoreThanOneDayAgo(date) {
  const today = new Date();
  const dd = today.getDate();
  const mm = today.getMonth() + 1; // Months are zero-indexed, so we add 1
  const yyyy = today.getFullYear();
  const dateArray = [mm, dd, yyyy];
  if (date[0] != dateArray[0] || date[1] != dateArray[1] || date[2] != dateArray[2]) {
    return true
  }
  return false
}

function getUrl(IDX, startDate, endDate) {
  var url = "https://www.teacherspayteachers.com/My-Sales/page:" + IDX + "?source=Overall&start_date=" + startDate[0] + "%2F" + startDate[1] + "%2F" + startDate[2] + "&end_date=" + endDate[0] + "%2F" + endDate[1] + "%2F" + endDate[2];
  return url
}

function date1BeforeDate2(date1, date2) {
  // uses format [mm,dd,yyyy]

  // make sure all values are int
  for (let i = 0; i < 3; i++) {
    date1[i] = parseInt(date1[i]);
    date2[i] = parseInt(date2[i]);
  }

  if (date1[2] < date2[2]) {
    return true
  }
  else if (date1[2] == date2[2]) {
    if (date1[0] < date2[0]) {
      return true
    }
    else if (date1[0] == date2[0]) {
      if (date1[1] < date2[1]) {
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


async function keywordCrawlWrapper(keyword, popularity = -1, ITERATIONS = 3) {
  let products = [];

  for (let i = 1; i < ITERATIONS + 1; i++) { // Use <= to include the last iteration
    try {
      const productsNew = await keywordCrawl(products, i, keyword); // Pass i as the page index
      products = products.concat(productsNew);
    } catch (error) {
      console.error("Error crawling keyword:", error);
    }
  }
  const crawlStats = analyzeKeywordCrawl(keyword, products);
  crawlStats.popularity = popularity;

  return crawlStats;
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

    const marketSizeDiv = doc.querySelectorAll(".SearchResultsHeader")[0]
    const span = marketSizeDiv?.querySelectorAll('.Text-module__bodyBase--iQGdU')[0].textContent;
    const marketSize = span?.split(' ')[0] || '';


    const rows = doc.querySelectorAll(".ProductRowLayout");
    const productsNew = processKeywordCrawl(rows, marketSize);


    return productsNew;

  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // Rethrow the error for the wrapper function to handle
  }
}

function processKeywordCrawl(rows, marketSize) {

  products = [];

  rows.forEach(productCard => {
    const productInfo = {};

    const titleElement = productCard.querySelector('.ProductRowCard-module__cardTitleLink--YPqiC');
    productInfo.title = titleElement.textContent.trim();

    const sellerNameElement = productCard.querySelector('.ProductRowSellerByline-module__storeName--DZyfm');
    productInfo.sellerName = sellerNameElement.textContent.trim();

    try {
      const rating = productCard.querySelectorAll('.RatingsLabel-module__ratingsLabel--lMWgy')[0].innerText.split(" ")[0]
      productInfo.rating = parseFloat(rating);

    }
    catch (err) {
      const rating = "0";
      productInfo.rating = parseFloat(rating);
    }

    try {
      const salePriceElement = productCard.querySelector('.ProductPrice-module__stackedPrice--HDi24');
      const priceElement = productCard.querySelector('.ProductPrice-module__basePrice--L99Kg');

      productInfo.salePrice = salePriceElement.textContent.trim().split(" ")[1];
      productInfo.price = priceElement.textContent.trim();

    }
    catch (err) {
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
    catch (err) {
      const subjects = "";
      productInfo.subjects = subjects;
    }

    try {
      const gradesElement = productCard.querySelector('.MetadataFacetSection .Text-module__detailXS--X_1mi.MetadataFacetSection__list');
      const grades = gradesElement ? gradesElement.textContent.trim() : '';
      productInfo.grades = grades;
    }
    catch (err) {
      const grades = "";
      productInfo.grades = grades;
    }

    try {
      const types = Array.from(productCard.querySelectorAll('.MetadataFacetSection a[href^="/browse"]'))
        .map((type) => type.textContent.trim())
        .join(', ');
      productInfo.types = types;

    }
    catch (err) {
      const types = "";
      productInfo.types = types;

    }
    try {
      const ccss = Array.from(productCard.querySelectorAll('.StandardsList a[href^="/browse/ccss-"]'))
        .map((ccssItem) => ccssItem.textContent.trim())
        .join(', ');
      productInfo.ccss = ccss;
    }
    catch (err) {
      const ccss = "";
      productInfo.ccss = ccss;
    }

    try {
      const ratingElement = productCard.querySelector('.RatingsLabel-module__totalReviews--Roe3y');
      ratingCount = ratingElement.textContent.trim();
      ratingCount = ratingCount.replace(/[^.K0-9$]/g, "");
      if (ratingCount.includes("K")) {
        ratingCount = ratingCount.replace("K", "");
        ratingCount = parseFloat(ratingCount);
        ratingCount = ratingCount * 1000;
      }
      ratingCount = parseInt(ratingCount);
      productInfo.ratingCount = ratingCount;
    }
    catch (err) {
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



function analyzeKeywordCrawl(keyword, products) {

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

  let productsOnSalePercentage = productsOnSale / totalProducts;

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
  crawlStats.avgSaleDiscount = ((avgSaleDiscount) * 100).toFixed(1);

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
  crawlStats.productsOnSalePercentage = (productsOnSalePercentage * 100).toFixed(1);
  crawlStats.averageRatingCount = parseInt(averageRatingCount);

  // DESCRIPTION
  let description_and_title = [];
  for (const product of products) {
    let description_title = product.title + " " + product.description;
    description_and_title.push(description_title);
  }

  crawlStats.descriptionStats = analyzeDescriptions(description_and_title, keyword);

  return crawlStats
}

function analyzeDescriptions(descriptions, keyword) {
  mostCommonWords = {};

  for (const description of descriptions) {
    const words = description.split(" ");

    for (let word of words) {
      word = word.replace(/[^a-zA-Z ]/g, "");
      if (mostCommonWords[word] == undefined) {
        mostCommonWords[word] = 1;
      }
      else {
        mostCommonWords[word] += 1;
      }
    }
  }
  return getMostCommonWords(MOSTCOMMONCOUNT, mostCommonWords, keyword);
}

function getMostCommonWords(cnt, descriptions, keyword) {
  // remove { and } from descriptions

  // remove unsignificant words like "the", "and", "with", etc.
  mostCommonWords = removeUnsignificantWords(mostCommonWords, keyword);

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

function removeUnsignificantWords(mostCommonWords, keyword) {
  const stopWordsSet = new Set(['black', 'white', '{Educlips', 'saved', 'includes', 'Clipart}', 'included', 'includes', 'students', 'school', 'grade', '&amp', 'word', 'able', 'about', 'above', 'abst', 'accordance', 'according', 'accordingly', 'across', 'act', 'actually', 'added', 'adj', 'affected', 'affecting', 'affects', 'after', 'afterwards', 'again', 'against', 'ain', "ain't", 'all', 'allow', 'allows', 'almost', 'alone', 'along', 'already', 'also', 'although', 'always', 'among', 'amongst', 'amoungst', 'amount', 'and', 'announce', 'another', 'any', 'anybody', 'anyhow', 'anymore', 'anyone', 'anything', 'anyway', 'anyways', 'anywhere', 'apart', 'apparently', 'appear', 'appreciate', 'appropriate', 'approximately', 'are', 'aren', 'arent', "aren't", 'arise', 'around', "a's", 'aside', 'ask', 'asking', 'associated', 'auth', 'available', 'away', 'awfully', 'back', 'became', 'because', 'become', 'becomes', 'becoming', 'been', 'before', 'beforehand', 'begin', 'beginning', 'beginnings', 'begins', 'behind', 'being', 'believe', 'below', 'beside', 'besides', 'best', 'better', 'between', 'beyond', 'bill', 'biol', 'both', 'bottom', 'brief', 'briefly', 'but', 'call', 'came', 'can', 'cannot', 'cant', "can't", 'cause', 'causes', 'certain', 'certainly', 'changes', 'cit', 'clearly', "c'mon", 'com', 'come', 'comes', 'con', 'concerning', 'consequently', 'consider', 'considering', 'contain', 'containing', 'contains', 'corresponding', 'could', 'couldn', 'couldnt', "couldn't", 'course', 'cry', "c's", 'currently', 'date', 'definitely', 'describe', 'described', 'despite', 'detail', 'did', 'didn', "didn't", 'different', 'does', 'doesn', "doesn't", 'doing', 'don', 'done', "don't", 'down', 'downwards', 'due', 'during', 'each', 'edu', 'effect', 'eight', 'eighty', 'either', 'eleven', 'else', 'elsewhere', 'empty', 'end', 'ending', 'enough', 'entirely', 'especially', 'est', 'et-al', 'etc', 'even', 'ever', 'every', 'everybody', 'everyone', 'everything', 'everywhere', 'exactly', 'example', 'except', 'far', 'few', 'fifteen', 'fifth', 'fify', 'fill', 'find', 'fire', 'first', 'five', 'fix', 'followed', 'following', 'follows', 'for', 'former', 'formerly', 'forth', 'forty', 'found', 'four', 'from', 'front', 'full', 'further', 'furthermore', 'gave', 'get', 'gets', 'getting', 'give', 'given', 'gives', 'giving', 'goes', 'going', 'gone', 'got', 'gotten', 'greetings', 'had', 'hadn', "hadn't", 'happens', 'hardly', 'has', 'hasn', 'hasnt', "hasn't", 'have', 'haven', "haven't", 'having', 'hed', "he'd", "he'll", 'hello', 'help', 'hence', 'her', 'here', 'hereafter', 'hereby', 'herein', 'heres', "here's", 'hereupon', 'hers', 'herself', 'hes', "he's", 'hid', 'him', 'himself', 'his', 'hither', 'home', 'hopefully', 'how', 'howbeit', 'however', "how's", 'http', 'hundred', 'ibid', "i'd", 'ignored', "i'll", "i'm", 'immediate', 'immediately', 'importance', 'important', 'inasmuch', 'inc', 'indeed', 'index', 'indicate', 'indicated', 'indicates', 'information', 'inner', 'insofar', 'instead', 'interest', 'into', 'invention', 'inward', 'isn', "isn't", 'itd', "it'd", "it'll", 'its', "it's", 'itself', "i've", 'just', 'keep', 'keeps', 'kept', 'know', 'known', 'knows', 'largely', 'last', 'lately', 'later', 'latter', 'latterly', 'least', 'les', 'less', 'lest', 'let', 'lets', "let's", 'like', 'liked', 'likely', 'line', 'little', 'look', 'looking', 'looks', 'los', 'ltd', 'made', 'mainly', 'make', 'makes', 'many', 'may', 'maybe', 'mean', 'means', 'meantime', 'meanwhile', 'merely', 'might', 'mightn', "mightn't", 'mill', 'million', 'mine', 'miss', 'more', 'moreover', 'most', 'mostly', 'move', 'mrs', 'much', 'mug', 'must', 'mustn', "mustn't", 'myself', 'name', 'namely', 'nay', 'near', 'nearly', 'necessarily', 'necessary', 'need', 'needn', "needn't", 'needs', 'neither', 'never', 'nevertheless', 'new', 'next', 'nine', 'ninety', 'nobody', 'non', 'none', 'nonetheless', 'noone', 'nor', 'normally', 'nos', 'not', 'noted', 'nothing', 'novel', 'now', 'nowhere', 'obtain', 'obtained', 'obviously', 'off', 'often', 'okay', 'old', 'omitted', 'once', 'one', 'ones', 'only', 'onto', 'ord', 'other', 'others', 'otherwise', 'ought', 'our', 'ours', 'ourselves', 'out', 'outside', 'over', 'overall', 'owing', 'own', 'page', 'pagecount', 'pages', 'par', 'part', 'particular', 'particularly', 'pas', 'past', 'per', 'perhaps', 'placed', 'please', 'plus', 'poorly', 'possible', 'possibly', 'potentially', 'predominantly', 'present', 'presumably', 'previously', 'primarily', 'probably', 'promptly', 'proud', 'provides', 'put', 'que', 'quickly', 'quite', 'ran', 'rather', 'readily', 'really', 'reasonably', 'recent', 'recently', 'ref', 'refs', 'regarding', 'regardless', 'regards', 'related', 'relatively', 'research', 'research-articl', 'respectively', 'resulted', 'resulting', 'results', 'right', 'run', 'said', 'same', 'saw', 'say', 'saying', 'says', 'sec', 'second', 'secondly', 'section', 'see', 'seeing', 'seem', 'seemed', 'seeming', 'seems', 'seen', 'self', 'selves', 'sensible', 'sent', 'serious', 'seriously', 'seven', 'several', 'shall', 'shan', "shan't", 'she', 'shed', "she'd", "she'll", 'shes', "she's", 'should', 'shouldn', "shouldn't", "should've", 'show', 'showed', 'shown', 'showns', 'shows', 'side', 'significant', 'significantly', 'similar', 'similarly', 'since', 'sincere', 'six', 'sixty', 'slightly', 'some', 'somebody', 'somehow', 'someone', 'somethan', 'something', 'sometime', 'sometimes', 'somewhat', 'somewhere', 'soon', 'sorry', 'specifically', 'specified', 'specify', 'specifying', 'still', 'stop', 'strongly', 'sub', 'substantially', 'successfully', 'such', 'sufficiently', 'suggest', 'sup', 'sure', 'system', 'take', 'taken', 'taking', 'tell', 'ten', 'tends', 'than', 'thank', 'thanks', 'thanx', 'that', "that'll", 'thats', "that's", "that've", 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'thence', 'there', 'thereafter', 'thereby', 'thered', 'therefore', 'therein', "there'll", 'thereof', 'therere', 'theres', "there's", 'thereto', 'thereupon', "there've", 'these', 'they', 'theyd', "they'd", "they'll", 'theyre', "they're", "they've", 'thickv', 'thin', 'think', 'third', 'this', 'thorough', 'thoroughly', 'those', 'thou', 'though', 'thoughh', 'thousand', 'three', 'throug', 'through', 'throughout', 'thru', 'thus', 'til', 'tip', 'together', 'too', 'took', 'top', 'toward', 'towards', 'tried', 'tries', 'truly', 'try', 'trying', "t's", 'twelve', 'twenty', 'twice', 'two', 'u201d', 'under', 'unfortunately', 'unless', 'unlike', 'unlikely', 'until', 'unto', 'upon', 'ups', 'use', 'used', 'useful', 'usefully', 'usefulness', 'uses', 'using', 'usually', 'value', 'various', 'very', 'via', 'viz', 'vol', 'vols', 'volumtype', 'want', 'wants', 'was', 'wasn', 'wasnt', "wasn't", 'way', 'wed', "we'd", 'welcome', 'well', "we'll", 'well-b', 'went', 'were', "we're", 'weren', 'werent', "weren't", "we've", 'what', 'whatever', "what'll", 'whats', "what's", 'when', 'whence', 'whenever', "when's", 'where', 'whereafter', 'whereas', 'whereby', 'wherein', 'wheres', "where's", 'whereupon', 'wherever', 'whether', 'which', 'while', 'whim', 'whither', 'who', 'whod', 'whoever', 'whole', "who'll", 'whom', 'whomever', 'whos', "who's", 'whose', 'why', "why's", 'widely', 'will', 'willing', 'wish', 'with', 'within', 'without', 'won', 'wonder', 'wont', "won't", 'words', 'world', 'would', 'wouldn', 'wouldnt', "wouldn't", 'www', 'yes', 'yet', 'you', 'youd', "you'd", "you'll", 'your', 'youre', "you're", 'yours', 'yourself', 'yourselves', "you've", 'zero']);
  const adjectives = new Set(["aback", "abaft", "abandoned", "abashed", "aberrant", "abhorrent", "abiding", "abject", "ablaze", "able", "abnormal", "aboard", "aboriginal", "abortive", "abounding", "abrasive", "abrupt", "absent", "absorbed", "absorbing", "abstracted", "absurd", "abundant", "abusive", "acceptable", "accessible", "accidental", "accurate", "acid", "acidic", "acoustic", "acrid", "actually", "ad", "hoc", "adamant", "adaptable", "addicted", "adhesive", "adjoining", "adorable", "adventurous", "afraid", "aggressive", "agonizing", "agreeable", "ahead", "ajar", "alcoholic", "alert", "alike", "alive", "alleged", "alluring", "aloof", "amazing", "ambiguous", "ambitious", "amuck", "amused", "amusing", "ancient", "angry", "animated", "annoyed", "annoying", "anxious", "apathetic", "aquatic", "aromatic", "arrogant", "ashamed", "aspiring", "assorted", "astonishing", "attractive", "auspicious", "automatic", "available", "average", "awake", "aware", "awesome", "awful", "axiomatic", "bad", "barbarous", "bashful", "bawdy", "beautiful", "befitting", "belligerent", "beneficial", "bent", "berserk", "best", "better", "bewildered", "big", "billowy", "bite-sized", "bitter", "bizarre", "black", "black-and-white", "bloody", "blue", "blue-eyed", "blushing", "boiling", "boorish", "bored", "boring", "bouncy", "boundless", "brainy", "brash", "brave", "brawny", "breakable", "breezy", "brief", "bright", "bright", "broad", "broken", "brown", "bumpy", "burly", "bustling", "busy", "cagey", "calculating", "callous", "calm", "capable", "capricious", "careful", "careless", "caring", "cautious", "ceaseless", "certain", "changeable", "charming", "cheap", "cheerful", "chemical", "chief", "childlike", "chilly", "chivalrous", "chubby", "chunky", "clammy", "classy", "clean", "clear", "clever", "cloistered", "cloudy", "closed", "clumsy", "cluttered", "coherent", "cold", "colorful", "colossal", "combative", "comfortable", "common", "complete", "complex", "concerned", "condemned", "confused", "conscious", "cooing", "cool", "cooperative", "coordinated", "courageous", "cowardly", "crabby", "craven", "crazy", "creepy", "crooked", "crowded", "cruel", "cuddly", "cultured", "cumbersome", "curious", "curly", "curved", "curvy", "cut", "cute", "cute", "cynical", "daffy", "daily", "damaged", "damaging", "damp", "dangerous", "dapper", "dark", "dashing", "dazzling", "dead", "deadpan", "deafening", "dear", "debonair", "decisive", "decorous", "deep", "deeply", "defeated", "defective", "defiant", "delicate", "delicious", "delightful", "demonic", "delirious", "dependent", "depressed", "deranged", "descriptive", "deserted", "detailed", "determined", "devilish", "didactic", "different", "difficult", "diligent", "direful", "dirty", "disagreeable", "disastrous", "discreet", "disgusted", "disgusting", "disillusioned", "dispensable", "distinct", "disturbed", "divergent", "dizzy", "domineering", "doubtful", "drab", "draconian", "dramatic", "dreary", "drunk", "dry", "dull", "dusty", "dynamic", "dysfunctional", "eager", "early", "earsplitting", "earthy", "easy", "eatable", "economic", "educated", "efficacious", "efficient", "eight", "elastic", "elated", "elderly", "electric", "elegant", "elfin", "elite", "embarrassed", "eminent", "empty", "enchanted", "enchanting", "encouraging", "endurable", "energetic", "enormous", "entertaining", "enthusiastic", "envious", "equable", "equal", "erect", "erratic", "ethereal", "evanescent", "evasive", "even excellent excited", "exciting exclusive", "exotic", "expensive", "extra-large extra-small exuberant", "exultant", "fabulous", "faded", "faint fair", "faithful", "fallacious", "false familiar famous", "fanatical", "fancy", "fantastic", "far", " far-flung", " fascinated", "fast", "fat faulty", "fearful fearless", "feeble feigned", "female fertile", "festive", "few fierce", "filthy", "fine", "finicky", "first", " five", " fixed", " flagrant", "flaky", "flashy", "flat", "flawless", "flimsy", " flippant", "flowery", "fluffy", "fluttering", " foamy", "foolish", "foregoing", "forgetful", "fortunate", "four frail", "fragile", "frantic", "free", " freezing", " frequent", " fresh", " fretful", "friendly", "frightened frightening full fumbling functional", "funny", "furry furtive", "future futuristic", "fuzzy ", "gabby", "gainful", "gamy", "gaping", "garrulous", "gaudy", "general gentle", "giant", "giddy", "gifted", "gigantic", "glamorous", "gleaming", "glib", "glistening glorious", "glossy", "godly", "good", "goofy", "gorgeous", "graceful", "grandiose", "grateful gratis", "gray greasy great", "greedy", "green grey grieving", "groovy", "grotesque", "grouchy", "grubby gruesome", "grumpy", "guarded", "guiltless", "gullible gusty", "guttural H habitual", "half", "hallowed", "halting", "handsome", "handsomely", "handy", "hanging", "hapless", "happy", "hard", "hard-to-find", "harmonious", "harsh", "hateful", "heady", "healthy", "heartbreaking", "heavenly heavy hellish", "helpful", "helpless", "hesitant", "hideous highPrice", "highfalutin", "highPrice-pitched", "hilarious", "hissing", "historical", "holistic", "hollow", "homeless", "homely", "honorable", "horrible", "hospitable", "hot huge", "hulking", "humdrum", "humorous", "hungry", "hurried", "hurt", "hushed", "husky", "hypnotic", "hysterical", "icky", "icy", "idiotic", "ignorant", "ill", "illegal", "ill-fated", "ill-informed", "illustrious", "imaginary", "immense", "imminent", "impartial", "imperfect", "impolite", "important", "imported", "impossible", "incandescent", "incompetent", "inconclusive", "industrious", "incredible", "inexpensive", "infamous", "innate", "innocent", "inquisitive", "insidious", "instinctive", "intelligent", "interesting", "internal", "invincible", "irate", "irritating", "itchy", "jaded", "jagged", "jazzy", "jealous", "jittery", "jobless", "jolly", "joyous", "judicious", "juicy", "jumbled", "jumpy", "juvenile", "kaput", "keen", "kind", "kindhearted", "kindly", "knotty", "knowing", "knowledgeable", "known", "labored", "lackadaisical", "lacking", "lame", "lamentable", "languid", "large", "last", "late", "laughable", "lavish", "lazy", "lean", "learned", "left", "legal", "lethal", "level", "lewd", "light", "like", "likeable", "limping", "literate", "little", "lively", "lively", "living", "lonely", "long", "longing", "long-term", "loose", "lopsided", "loud", "loutish", "lovely", "loving", "lowPrice", "lowly", "lucky", "ludicrous", "lumpy", "lush", "luxuriant", "lying", "lyrical", "macabre", "macho", "maddening", "madly", "magenta", "magical", "magnificent", "majestic", "makeshift", "male", "malicious", "mammoth", "maniacal", "many", "marked", "massive", "married", "marvelous", "material", "materialistic", "mature", "mean", "measly", "meaty", "medical", "meek", "mellow", "melodic", "melted", "merciful", "mere", "messy", "mighty", "military", "milky", "mindless", "miniature", "minor", "miscreant", "misty", "mixed", "moaning", "modern", "moldy", "momentous", "motionless", "mountainous", "muddled", "mundane", "murky", "mushy", "mute", "mysterious", "naive", "nappy", "narrow", "nasty", "natural", "naughty", "nauseating", "near", "neat", "nebulous", "necessary", "needless", "needy", "neighborly", "nervous", "new", "next", "nice", "nifty", "nimble", "nine", "nippy", "noiseless", "noisy", "nonchalant", "nondescript", "nonstop", "normal", "nostalgic", "nosy", "noxious", "null", "numberless", "numerous", "nutritious", "nutty", "oafish", "obedient", "obeisant", "obese", "obnoxious", "obscene", "obsequious", "observant", "obsolete", "obtainable", "oceanic", "odd", "offbeat", "old", "old-fashioned", "omniscient", "one", "onerous", "open", "opposite", "optimal", "orange", "ordinary", "organic", "ossified", "outgoing", "outrageous", "outstanding", "oval", "overconfident", "overjoyed", "overrated", "overt", "overwrought", "painful", "painstaking", "pale", "paltry", "panicky", "panoramic", "parallel", "parched", "parsimonious", "past", "pastoral", "pathetic", "peaceful", "penitent", "perfect", "periodic", "permissible", "perpetual", "petite", "petite", "phobic", "physical", "picayune", "pink", "piquant", "placid", "plain", "plant", "plastic", "plausible", "pleasant", "plucky", "pointless", "poised", "polite", "political", "poor", "possessive", "possible", "powerful", "precious", "premium", "present", "pretty", "previous", "pricey", "prickly", "private", "probable", "productive", "profuse", "protective", "proud", "psychedelic", "psychotic", "public", "puffy", "pumped", "puny", "purple", "purring", "pushy", "puzzled", "puzzling", "quack", "quaint", "quarrelsome", "questionable", "quick", "quickest", "quiet", "quirky", "quixotic", "quizzical", "rabid", "racial", "ragged", "rainy", "rambunctious", "rampant", "rapid", "rare", "raspy", "ratty", "ready", "real", "rebel", "receptive", "recondite", "red", "redundant", "reflective", "regular", "relieved", "remarkable", "reminiscent", "repulsive", "resolute", "resonant", "responsible", "rhetorical", "rich", "right", "righteous", "rightful", "rigid", "ripe", "ritzy", "roasted", "robust", "romantic", "roomy", "rotten", "rough", "round", "royal", "ruddy", "rude", "rural", "rustic", "ruthless", "sable", "sad", "safe", "salty", "same", "sassy", "satisfying", "savory", "scandalous", "scarce", "scared", "scary", "scattered", "scientific", "scintillating", "scrawny", "screeching", "second", "second-hand", "secret", "secretive", "sedate", "seemly", "selective", "selfish", "separate", "serious", "shaggy", "shaky", "shallow", "sharp", "shiny", "shivering", "shocking", "short", "shrill", "shut", "shy", "sick", "silent", "silent", "silky", "silly", "simple", "simplistic", "sincere", "six", "skillful", "skinny", "sleepy", "slim", "slimy", "slippery", "sloppy", "slow", "small", "smart", "smelly", "smiling", "smoggy", "smooth", "sneaky", "snobbish", "snotty", "soft", "soggy", "solid", "somber", "sophisticated", "sordid", "sore", "sore", "sour", "sparkling", "special", "spectacular", "spicy", "spiffy", "spiky", "spiritual", "spiteful", "splendid", "spooky", "spotless", "spotted", "spotty", "spurious", "squalid", "square", "squealing", "squeamish", "staking", "stale", "standing", "statuesque", "steadfast", "steady", "steep", "stereotyped", "sticky", "stiff", "stimulating", "stingy", "stormy", "straight", "strange", "striped", "strong", "stupendous", "stupid", "sturdy", "subdued", "subsequent", "substantial", "successful", "succinct", "sudden", "sulky", "super", "superb", "superficial", "supreme", "swanky", "sweet", "sweltering", "swift", "symptomatic", "synonymous", "taboo", "tacit", "tacky", "talented", "tall", "tame", "tan", "tangible", "tangy", "tart", "tasteful", "tasteless", "tasty", "tawdry", "tearful", "tedious", "teeny", "teeny-tiny", "telling", "temporary", "ten", "tender tense", "tense", "tenuous", "terrible", "terrific", "tested", "testy", "thankful", "therapeutic", "thick", "thin", "thinkable", "third", "thirsty", "thoughtful", "thoughtless", "threatening", "three", "thundering", "tidy", "tight", "tightfisted", "tiny", "tired", "tiresome", "toothsome", "torpid", "tough", "towering", "tranquil", "trashy", "tremendous", "tricky", "trite", "troubled", "truculent", "true", "truthful", "two", "typical", "ubiquitous", "ugliest", "ugly", "ultra", "unable", "unaccountable", "unadvised", "unarmed", "unbecoming", "unbiased", "uncovered", "understood", "undesirable", "unequal", "unequaled", "uneven", "unhealthy", "uninterested", "unique", "unkempt", "unknown", "unnatural", "unruly", "unsightly", "unsuitable", "untidy", "unused", "unusual", "unwieldy", "unwritten", "upbeat", "uppity", "upset", "uptight", "used", "useful", "useless", "utopian", "utter", "uttermost", "vacuous", "vagabond", "vague", "valuable", "various", "vast", "vengeful", "venomous", "verdant", "versed", "victorious", "vigorous", "violent", "violet", "vivacious", "voiceless", "volatile", "voracious", "vulgar", "wacky", "waggish", "waiting", "", "wakeful", "wandering", "wanting", "warlike", "warm", "wary", "wasteful", "watery", "weak", "wealthy", "weary", "well-groomed", "well-made", "well-off", "well-to-do", "wet", "whimsical", "whispering", "white", "whole", "wholesale", "wicked", "wide", "wide-eyed", "wiggly", "wild", "willing", "windy", "wiry", "wise", "wistful", "witty", "woebegone", "womanly", "wonderful", "wooden", "woozy", "workable", "worried", "worthless", "wrathful", "wretched", "wrong", "wry", "xenophobic", "yellow", "yielding", "young", "youthful", "yummy", "zany", "zealous", "zesty", "zippy", "zonked"])
  const verbes = new Set(["accept", "add", "admire", "admit", "advise", "afford", "agree", "alert", "allow", "amuse", "analyse", "announce", "annoy", "answer", "apologise", "appear", "applaud", "appreciate", "approve", "argue", "arrange", "arrest", "arrive", "ask", "attach", "attack", "attempt", "attend", "attract", "avoid", "back", "bake", "balance", "ban", "bang", "bare", "bat", "bathe", "battle", "beam", "beg", "behave", "belong", "bleach", "bless", "blind", "blink", "blot", "blush", "boast", "boil", "bolt", "bomb", "book", "bore", "borrow", "bounce", "bow", "box", "brake", "branch", "breathe", "bruise", "brush", "bubble", "bump", "burn", "bury", "buzz", "calculate", "call", "camp", "care", "carry", "carve", "cause", "challenge", "change", "charge", "chase", "cheat", "check", "cheer", "chew", "choke", "chop", "claim", "clap", "clean", "clear", "clip", "close", "coach", "coil", "collect", "colour", "comb", "command", "communicate", "compare", "compete", "complain", "complete", "concentrate", "concern", "confess", "confuse", "connect", "consider", "consist", "contain", "continue", "copy", "correct", "cough", "count", "cover", "crack", "crash", "crawl", "cross", "crush", "cry", "cure", "curl", "curve", "cycle", "dam", "damage", "dance", "dare", "decay", "deceive", "decide", "decorate", "delay", "delight", "deliver", "depend", "describe", "desert", "deserve", "destroy", "detect", "develop", "disagree", "disappear", "disapprove", "disarm", "discover", "dislike", "divide", "double", "doubt", "drag", "drain", "dream", "dress", "drip", "drop", "drown", "drum", "dry", "dust", "earn", "educate", "embarrass", "employ", "empty", "encourage", "end", "enjoy", "enter", "entertain", "escape", "examine", "excite", "excuse", "exercise", "exist", "expand", "expect", "explain", "explode", "extend", "face", "fade", "fail", "fancy", "fasten", "fax", "fear", "fence", "fetch", "file", "fill", "film", "fire", "fit", "fix", "flap", "flash", "float", "flood", "flow", "flower", "fold", "follow", "fool", "force", "form", "found", "frame", "frighten", "fry", "gather", "gaze", "glow", "glue", "grab", "grate", "grease", "greet", "grin", "grip", "groan", "guarantee", "guard", "guess", "guide", "hammer", "hand", "handle", "hang", "happen", "harass", "harm", "hate", "haunt", "head", "heal", "heap", "heat", "help", "hook", "hop", "hope", "hover", "hug", "hum", "hunt", "hurry", "identify", "ignore", "imagine", "impress", "improve", "include", "increase", "influence", "inform", "inject", "injure", "instruct", "intend", "interest", "interfere", "interrupt", "introduce", "invent", "invite", "irritate", "itch", "jail", "jam", "jog", "join", "joke", "judge", "juggle", "jump", "kick", "kill", "kiss", "kneel", "knit", "knock", "knot", "label", "land", "last", "laugh", "launch", "learn", "level", "license", "lick", "lie", "lighten", "like", "list", "listen", "live", "load", "lock", "long", "look", "love", "man", "manage", "march", "mark", "marry", "match", "mate", "matter", "measure", "meddle", "melt", "memorise", "mend", "mess up", "milk", "mine", "miss", "mix", "moan", "moor", "mourn", "move", "muddle", "mug", "multiply", "murder", "nail", "name", "need", "nest", "nod", "note", "notice", "number", "obey", "object", "observe", "obtain", "occur", "offend", "offer", "open", "order", "overflow", "owe", "own", "pack", "paddle", "paint", "park", "part", "pass", "paste", "pat", "pause", "peck", "pedal", "peel", "peep", "perform", "permit", "phone", "pick", "pinch", "pine", "place", "plan", "plant", "play", "please", "plug", "point", "poke", "polish", "pop", "possess", "post", "pour", "practise", "pray", "preach", "precede", "prefer", "prepare", "present", "preserve", "press", "pretend", "prevent", "prick", "print", "produce", "program", "promise", "protect", "provide", "pull", "pump", "punch", "puncture", "punish", "push", "question", "queue", "race", "radiate", "rain", "raise", "reach", "realise", "receive", "recognise", "record", "reduce", "reflect", "refuse", "regret", "reign", "reject", "rejoice", "relax", "release", "rely", "remain", "remember", "remind", "remove", "repair", "repeat", "replace", "reply", "report", "reproduce", "request", "rescue", "retire", "return", "rhyme", "rinse", "risk", "rob", "rock", "roll", "rot", "rub", "ruin", "rule", "rush", "sack", "sail", "satisfy", "save", "saw", "scare", "scatter", "scold", "scorch", "scrape", "scratch", "scream", "screw", "scribble", "scrub", "seal", "search", "separate", "serve", "settle", "shade", "share", "shave", "shelter", "shiver", "shock", "shop", "shrug", "sigh", "sign", "signal", "sin", "sip", "ski", "skip", "slap", "slip", "slow", "smash", "smell", "smile", "smoke", "snatch", "sneeze", "sniff", "snore", "snow", "soak", "soothe", "sound", "spare", "spark", "sparkle", "spell", "spill", "spoil", "spot", "spray", "sprout", "squash", "squeak", "squeal", "squeeze", "stain", "stamp", "stare", "start", "stay", "steer", "step", "stir", "stitch", "stop", "store", "strap", "strengthen", "stretch", "strip", "stroke", "stuff", "subtract", "succeed", "suck", "suffer", "suggest", "suit", "supply", "support", "suppose", "surprise", "surround", "suspect", "suspend", "switch", "talk", "tame", "tap", "taste", "tease", "telephone", "tempt", "terrify", "test", "thank", "thaw", "tick", "tickle", "tie", "time", "tip", "tire", "touch", "tour", "tow", "trace", "trade", "train", "transport", "trap", "travel", "treat", "tremble", "trick", "trip", "trot", "trouble", "trust", "try", "tug", "tumble", "turn", "twist", "type", "undress", "unfasten", "unite", "unlock", "unpack", "untidy", "use", "vanish", "visit", "wail", "wait", "walk", "wander", "want", "warm", "warn", "wash", "waste", "watch", "water", "wave", "weigh", "welcome", "whine", "whip", "whirl", "whisper", "whistle", "wink", "wipe", "wish", "wobble", "wonder", "work", "worry", "wrap", "wreck", "wrestle", "wriggle", "x-ray", "yawn", "yell", "zip", "zoom"])

  // generate all keyword combinations
  keywords = keyword.split(" ");
  keywords.push(keywords.join(''))

  kws = [];
  for (kw in keywords) {
    kws.push(keywords[kw]);
    kws.push(keywords[kw] + 's');
    kws.push(keywords[kw].toLowerCase());
    kws.push(keywords[kw].toUpperCase());
    kws.push(keywords[kw].charAt(0).toUpperCase() + keywords[kw].slice(1));
    kws.push(keywords[kw].charAt(0).toUpperCase() + keywords[kw].slice(1) + 's');
  }

  function deleteAll(word) {
    delete mostCommonWords[word];
    delete mostCommonWords[word.toLowerCase()];
    delete mostCommonWords[word + 's'];
    delete mostCommonWords[word.toUpperCase()];
  }
  // remove words in mostCommonWords found in stopWordsSet, check for capitalization
  for (const word in mostCommonWords) {

    if (stopWordsSet.has(word.toLowerCase()) || adjectives.has(word.toLowerCase()) || verbes.has(word.toLowerCase())) {
      deleteAll(word)
    }
    if (word.length < 3) {
      deleteAll(word)
    }

    if (kws.includes(word)) {
      deleteAll(word)
    }
  }
  return mostCommonWords
}



function displayMarketStats(productStats) {

  const marketTabWrapper = document.getElementsByClassName("marketTabWrapper")[0];
  const keywordSuggestionsHeader = document.getElementsByClassName("keywordSuggestionsHeader")[0];
  const marketStatsHeader = document.getElementsByClassName("marketStatsHeader")[0];

  // remove loading screen
  const loadingScreen = document.getElementsByClassName("loadingScreen")[0];
  if (loadingScreen) { loadingScreen.remove(); }

  // show market header 
  marketStatsHeader.style.display = "block";
  marketStatsHeader.innerHTML = '<h5 class="">Market Stats</h5>';

  keywordSuggestionsHeader.style.display = "block";
  keywordSuggestionsHeader.innerHTML = '<h5>Related search queries</h5>';
  keywordSuggestionsHeader.className = "py-2 keywordSuggestionsHeader"
  //keywordSuggestionsHeader.style.borderBottom = "1px solid #e6e6e6";

  let keywordSuggestionsInner = document.createElement("div", "keywordSuggestions");
  keywordSuggestionsInner.classList.add("px-3", "keywordSuggestions"); //, "align-items-start"
  keywordSuggestionsInner.style.borderTop = "2px solid #e6e6e6";

  let header = getKeywordSuggestionsHeader();
  keywordSuggestionsInner.append(header);

  const wrapper = document.createElement("div");
  wrapper.classList.add("px-3", "marketStats");
  wrapper.style.borderTop = "2px solid #e6e6e6";

  const statsTable = getStatsTable(productStats);
  const statsHeader = getStatsTableHeader(productStats);



  wrapper.append(statsHeader);
  wrapper.append(statsTable);
  marketStatsHeader.append(wrapper);

  keywordSuggestionsHeader.append(keywordSuggestionsInner);

  displayLoadingScreenMarketResearchSuggestions();

  addKeywordSuggestions(productStats);

  if (!document.querySelector(".marketResearchLegend")) {
    const legend = getMarketResearchLegend();
    marketTabWrapper.append(legend);
  }
}


function getStatsTableHeader() {
  statsHeader = document.createElement("div");
  statsHeader.classList.add("row"); //,"bordered","px-3"

  /*
  keywordHeader = document.createElement("div");
  keywordHeader.classList.add("col-12"); 
  keywordHeader.innerHTML = productStats.keyword;
  keywordHeader.style = "font-weight: bold; size: 1.2em; "
  */
  let listStats = ["keyword", "marketSize", "averagePrice", "averageRating", "averageRatingCount", "productsOnSalePercentage", "avgSaleDiscount", "totalProducts", "medianPrice", "productsOnSale", "descriptionStats"];
  const IGNORE = ["keyword", "totalProducts", "productsOnSale", "descriptionStats"];

  labelMap = {
    "keyword": "Query",
    "totalProducts": "Total Products",
    "averagePrice": "Price",
    "productsOnSale": "Products on Sale",
    "productsOnSalePercentage": "On Sale",
    "avgSaleDiscount": "Discount",
    "averageRating": "Rating",
    "averageRatingCount": "#Ratings",
    "descriptionStats": "Keywords",
    "marketSize": "Market Size",
    "medianPrice": "Median Price"
  }

  for (const i in listStats) {
    if (IGNORE.indexOf(listStats[i]) != -1) {
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


function getStatsTable(productStats) {

  statsInner = document.createElement("div");
  statsInner.classList.add("row"); //,"bordered","px-3"

  addMap = {
    "keyword": "",
    "totalProducts": "",
    "averagePrice": "$",
    "productsOnSalePercentage": "%",
    "avgSaleDiscount": "%",
    "averageRating": "/5",
    "averageRatingCount": "",
    "descriptionStats": "",
    "marketSize": "",
    "medianPrice": "$"
  }

  let listStats = ["keyword", "marketSize", "averagePrice", "averageRating", "averageRatingCount", "productsOnSalePercentage", "avgSaleDiscount", "totalProducts", "medianPrice", "productsOnSale", "descriptionStats"];
  const IGNORE = ["keyword", "totalProducts", "productsOnSale", "descriptionStats"];

  for (const i in listStats) {
    if (IGNORE.indexOf(listStats[i]) != -1) {
      continue
    }
    stat = listStats[i];
    statDiv = document.createElement("div");

    if (stat == "descriptionStats") {
      continue
    }
    else {
      statDiv.classList.add("col"); //, "align-items-start"
      statDiv.innerHTML = productStats[stat] + addMap[stat];
    }
    statsInner.appendChild(statDiv);
  }
  return statsInner
}


function addKeywordSuggestions(productStats) {
  const originalKeyword = productStats['keyword'];
  const descriptionStats = productStats['descriptionStats'];

  // sort keywords by count
  let sortedStats = [];
  for (const keyword in descriptionStats) {
    sortedStats.push([keyword, descriptionStats[keyword]]);
  }
  sortedStats.sort(function (a, b) {
    return b[1] - a[1];
  });

  i = 0;
  for (const stat of sortedStats) {
    const keyword = stat[0];
    const count = stat[1];

    if (ISPREMIUM || i < FREE_LIMIT) {
      addKeywordSuggestionRow(originalKeyword + " " + keyword, count);
    }
    else {
      addDummyRow();
    }
    i++;
  }

  if (!ISPREMIUM) {
    addPremiumUpgradeRow();
  }

  return
}

function addPremiumUpgradeRow() {
  let keywordSuggestionsInner = document.getElementsByClassName("keywordSuggestions")[0];

  const row = document.createElement("div");
  row.classList.add("row", "keywordSuggestionRow", "py-1");
  row.innerHTML = '<div class="col">Upgrade to <a target="_blank" rel="noopener noreferrer" href="https://tptinformer.com/"><u>premium</u></a> to see more results.</div>';

  keywordSuggestionsInner.append(row);
  return
}

function getKeywordSuggestionsHeader() {

  let suggestionsHeader = document.createElement("div");
  suggestionsHeader.classList.add("row"); //,"bordered","px-3"

  let listStats = ["keyword", "popularity", "marketSize", "averagePrice", "averageRating", "averageRatingCount", "productsOnSalePercentage", "avgSaleDiscount", "totalProducts", "medianPrice", "productsOnSale", "descriptionStats"];
  let IGNORE = ["totalProducts", "productsOnSale", "descriptionStats", "medianPrice"];

  let labelMap = {
    "popularity": "Popularity",
    "keyword": "Keyword",
    "totalProducts": "Total Products",
    "averagePrice": "Price",
    "productsOnSalePercentage": "On Sale",
    "productsOnSale": "Products on Sale",
    "avgSaleDiscount": "Discount",
    "averageRating": "Rating",
    "averageRatingCount": "#Ratings",
    "descriptionStats": "Keywords",
    "marketSize": "Market Size",
    "medianPrice": "Median Price"
  }

  for (const i in listStats) {
    let stat = listStats[i];

    if (IGNORE.indexOf(stat) != -1) {
      continue
    }
    statDiv = document.createElement("div");

    if (stat == 'keyword') {
      statDiv.classList.add("col-3");
    }
    else {
      statDiv.classList.add("col");
    }

    statDiv.innerHTML = labelMap[listStats[i]]
    statDiv.style = "font-weight: bold; size: 0.5em;"
    suggestionsHeader.appendChild(statDiv);
  }
  return suggestionsHeader
}


function addKeywordSuggestionRow(keyword, count) {

  let keywordSuggestionsInner = document.getElementsByClassName("keywordSuggestions")[0];

  let bdy = "{\"requests\":[{\"indexName\":\"Resource Suggestions\",\"params\":\"highlightPreTag=%3Cais-highlight-0000000000%3E&highlightPostTag=%3C%2Fais-highlight-0000000000%3E&hitsPerPage=5&query=" + keyword + "&facets=%5B%5D&tagFilters=\"},{\"indexName\":\"Stores\",\"params\":\"highlightPreTag=%3Cais-highlight-0000000000%3E&highlightPostTag=%3C%2Fais-highlight-0000000000%3E&hitsPerPage=2&query=" + keyword + "&filters=is_active%20%3D%201%20AND%20active_item_ct%20%3E%200&facets=%5B%5D&tagFilters=\"}]}"
  let isMultiword = keyword.split(" ").length > 1

  if (isMultiword) {
    let words = keyword.split(" ")
    let query = words.join("%20")
    bdy = "{\"requests\":[{\"indexName\":\"Resource Suggestions\",\"params\":\"highlightPreTag=%3Cais-highlight-0000000000%3E&highlightPostTag=%3C%2Fais-highlight-0000000000%3E&hitsPerPage=5&query=" + query + "&facets=%5B%5D&tagFilters=\"},{\"indexName\":\"Stores\",\"params\":\"highlightPreTag=%3Cais-highlight-0000000000%3E&highlightPostTag=%3C%2Fais-highlight-0000000000%3E&hitsPerPage=2&query=" + query + "&filters=is_active%20%3D%201%20AND%20active_item_ct%20%3E%200&facets=%5B%5D&tagFilters=\"}]}"
  }

  return fetch("https://sbekgjsj8m-dsn.algolia.net/1/indexes/*/queries?x-algolia-agent=Algolia%20for%20JavaScript%20(4.9.1)%3B%20Browser%20(lite)%3B%20react%20(16.8.6)%3B%20react-instantsearch%20(6.11.0)%3B%20JS%20Helper%20(3.4.4)&x-algolia-api-key=ce17b545c6ba0432cf638e0c29ee64ef&x-algolia-application-id=SBEKGJSJ8M", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en,en-US;q=0.9,de-DE;q=0.8,de;q=0.7",
      "cache-control": "no-cache",
      "content-type": "application/x-www-form-urlencoded",
      "pragma": "no-cache",
      "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site"
    },
    "referrer": "https://www.teacherspayteachers.com/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": bdy,
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  }).then(response => {
    if (!response.ok) {
      throw new Error(`Network response was not ok, status: ${response.status}`);
    }
    return response.json();
  }).then(data => {

    data = data.results
    let kws = data[0].hits

    if (kws.length == 0) {
      return []
    }

    let keyword = null
    let popularity = null

    kws.forEach(kw => {
      if (seenMarketResearchKeywords.hasOwnProperty(kw.query) || popularity) {
        return
      }
      else {
        keyword = kw.query
        seenMarketResearchKeywords[keyword] = true
        popularity = kw.popularity
      }
    })

    if (!popularity) {
      return []
    }


    const row = document.createElement("div");
    row.classList.add("row", "keywordSuggestionRow", "py-1");

    keywordCrawlWrapper(keyword, popularity).then(crawlStats => {
      let listStats = ["keyword", "popularity", "marketSize", "averagePrice", "averageRating", "averageRatingCount", "productsOnSalePercentage", "avgSaleDiscount", "totalProducts", "medianPrice", "productsOnSale", "descriptionStats"];
      let IGNORE = ["totalProducts", "productsOnSale", "descriptionStats", "medianPrice"];

      addMap = {
        "popularity": "",
        "keyword": "",
        "totalProducts": "",
        "averagePrice": "$",
        "productsOnSale": "",
        "productsOnSalePercentage": "%",
        "productsOnSale": "",
        "avgSaleDiscount": "%",
        "averageRating": "/5",
        "averageRatingCount": "",
        "descriptionStats": "",
        "marketSize": "",
        "medianPrice": "$"
      }

      for (const i in listStats) {
        if (IGNORE.indexOf(listStats[i]) != -1) {
          continue
        }
        let stat = listStats[i];
        statDiv = document.createElement("div");

        if (stat == 'keyword') {
          statDiv.classList.add("col-3");
        }
        if (stat == 'popularity') {
          statDiv.classList.add("col");
          statDiv.style = "font-weight: bold; size: 0.5em;"
        }
        else {
          statDiv.classList.add("col");
        }

        statDiv.innerHTML = crawlStats[stat] + addMap[stat];
        row.appendChild(statDiv);
      }

      if (document.querySelector(".dummyRow")) {
        let firstDummyRow = document.querySelector(".dummyRow")
        keywordSuggestionsInner.insertBefore(row, firstDummyRow);
      }
      else {
        keywordSuggestionsInner.append(row);
      }

      if (document.querySelector(".loadingScreen")) {
        document.querySelector(".loadingScreen").remove();
      }
    })

    return
  })
}

function addDummyRow() {
  const row = document.createElement("div");
  row.classList.add("row", "keywordSuggestionRow", "dummyRow", "py-1");

  let keywordSuggestionsInner = document.getElementsByClassName("keywordSuggestions")[0];

  // create array of dummy values and choose random value
  const dummyKeyword = ["dummy", "NoRealKeyword", "NotAKey", "NotAKeyword", "NotARealKeyword", "NoKEY", "NoExploit!"];
  const dummyMarketSize = ["10314214", "123", "1234", "12345", "123456", "1234567", "12345678", "123456789", "1234567890"];
  const dummyAvgSaleDiscount = ["0.00", "0.01", "0.02", "0.03", "0.04", "0.05", "0.06", "0.07", "0.08"];
  const dummyAverageRating = ["4.8", "4.9", "5.0"];
  const dummyAveragePrice = ["$1.00", "$1.01", "$1.02", "$1.03", "$1.04", "$1.05", "$1.06", "$1.07", "$1.08"];
  const dummyMedianPrice = ["$1.00", "$1.01", "$1.02", "$1.03", "$1.04", "$1.05", "$1.06", "$1.07", "$1.08"];
  const dummyAverageRatingCount = ["1", "2", "1314", "123", "9562", "1324", "4124"];

  function getDummyCell(dummyArray) {
    const cell = document.createElement("div");
    cell.classList.add("col");
    const randomIndex = Math.floor(Math.random() * dummyArray.length);
    cell.innerHTML = dummyArray[randomIndex];
    return cell
  }

  keyword = getDummyCell(dummyKeyword)
  keyword.classList.add("col-3");
  row.appendChild(keyword);
  row.appendChild(getDummyCell(dummyMarketSize));
  row.appendChild(getDummyCell(dummyAvgSaleDiscount));
  row.appendChild(getDummyCell(dummyAverageRating));
  row.appendChild(getDummyCell(dummyAveragePrice));
  row.appendChild(getDummyCell(dummyMedianPrice));
  row.appendChild(getDummyCell(dummyAverageRatingCount));

  //blur row
  row.style.filter = "blur(4px)";

  keywordSuggestionsInner.append(row);
  return
}

function getMarketResearchLegend() {
  const legend = document.createElement("div");
  legend.className = "marketResearchLegend pt-4 px-3"

  const legendHeader = document.createElement("div");

  const legendBody = document.createElement("div");
  legendBody.classList.add("row");

  const terms = ["Popularity", "Market size", "Price", "Rating", "#Ratings", "On Sale", "Discount", "Median Price"]
  const explainations = ["The keyword popularity is used by TPT to rank search results. It is a measure of how often the keyword is searched for on TPT."]
  explainations.push("The market size is the number of products that are currently listed for the keyword.")
  explainations.push("The average price of all products listed within the first 3 pages of search results.")
  explainations.push("The average rating of all products listed within the first 3 pages of search results.")
  explainations.push("The average number of ratings of all products listed within the first 3 pages of search results.")
  explainations.push("The percentage of products that are currently on sale within the first 3 pages of search results.")
  explainations.push("The average discount of all products that are currently on sale within the first 3 pages of search results.")
  explainations.push("The median price of all products within the first 3 pages of search results.")


  for (let i = 0; i < terms.length; i++) {
    const term = document.createElement("div");
    term.classList.add("col-3");
    term.innerHTML = terms[i];
    term.style = "font-weight: bold; size: 0.5em;"
    const explaination = document.createElement("div");
    explaination.classList.add("col-9");
    explaination.innerHTML = explainations[i];
    legendBody.appendChild(term);
    legendBody.appendChild(explaination);
  }

  legend.appendChild(legendHeader);
  legend.appendChild(legendBody);

  return legend
}



function getHeader() {

  let headerDiv = document.createElement("div");
  headerDiv.setAttribute("id", "headerDiv");
  headerDiv.setAttribute("class", "row");

  headerLeft = document.createElement("h5");
  headerLeft.classList.add("col-4", "pb-1", "my-1", "text-nowrap");
  headerLeft.innerHTML = 'TpT Informer Market Research <span class="small ml-2 d-inline-block">v2.0</span>'

  headerRight = document.createElement("div");
  headerRight.classList.add("col-8", "justify-content-end", "pb-1");
  headerRight.innerHTML = '';

  headerDiv.appendChild(headerLeft);
  headerDiv.appendChild(headerRight);

  return headerDiv
}

function getMarketResearchTab() {

  const wrapper = document.createElement("div");
  wrapper.classList = "col-12 csviewer_wrapper";
  wrapper.style.border = '1px solid #ced4da';
  //wrapper.style = "background-color: rgba(0,0,0,0.2);"


  const inputElement = document.createElement('input');
  inputElement.setAttribute('type', 'text');
  inputElement.setAttribute('id', 'keywordInput');
  inputElement.setAttribute('placeholder', 'Enter a keyword...');

  async function handleEnterKeyPress(event) {
    if (event.key === 'Enter') {

      seenMarketResearchKeywords = {}

      if (document.querySelector(".keywordSuggestions")) {
        if (document.querySelector(".marketStats")) {
          document.querySelector(".marketStats").innerHTML = "";
        }
        if (document.querySelector(".keywordSuggestionsHeader")) {
          document.querySelector(".keywordSuggestionsHeader").innerHTML = "";
        }
        if (document.querySelector(".marketResearchLegend")) {
          document.querySelector(".marketResearchLegend").remove();
        }
      }

      // add loading screen until keyword crawl is done
      displayLoadingScreen()

      const keyword = inputElement.value;
      let crawlStats = keywordCrawlWrapper(keyword)
      crawlStats.then(function (result) {
        crawlStats = result;
        displayMarketStats(crawlStats)
      });
    }
  }

  inputElement.addEventListener('keydown', handleEnterKeyPress);
  wrapper.prepend(inputElement);
  return wrapper
}


function displayLoadingScreen() {
  const marketTabWrapper = document.getElementsByClassName("marketTabWrapper")[0];
  const loadingScreen = document.createElement("div");
  loadingScreen.classList.add("loadingScreen");
  loadingScreen.innerHTML = '<div class="spinner-border text-primary my-3" role="status"><span class="sr-only">Loading...</span></div>';
  loadingScreen.innerHTML += '<div class="small text-primary">Crawling keywords...';
  marketTabWrapper.append(loadingScreen);
  // add counter for how many keywords have been crawled
  return
}
function displayLoadingScreenMarketResearchSuggestions() {
  const marketTabWrapper = document.getElementsByClassName("marketTabWrapper")[0];
  const loadingScreen = document.createElement("div");
  loadingScreen.classList.add("loadingScreen", "px-3");
  loadingScreen.innerHTML = '<div class="spinner-border text-primary my-3" role="status"><span class="sr-only">Loading...</span></div>';
  loadingScreen.innerHTML += '<div class="small text-primary">Generating suggestions...';
  marketTabWrapper.append(loadingScreen);
  // add counter for how many keywords have been crawled
  return
}




function displayLoadingScreenDashboard(cnt, totalCnt) {
  // remove old loading screen
  if (document.getElementsByClassName("loadingScreenDashboard").length > 0) {
    removeLoadingScreenDashboard();
  }

  const dashboardMainDiv = document.getElementsByClassName("dashboardMainDiv")[0];
  const loadingScreen = document.createElement("div");
  loadingScreen.classList.add("loadingScreenDashboard");
  loadingScreen.innerHTML = '<div class="spinner-border text-primary my-3" role="status"><span class="sr-only">Loading...</span></div>';
  loadingScreen.innerHTML += '<div class="small text-primary my-3">Crawling sales... (' + cnt + '/' + totalCnt + ')</div>';
  dashboardMainDiv.prepend(loadingScreen);
}
function removeLoadingScreenDashboard() {
  if (document.getElementsByClassName("loadingScreenDashboard").length > 0) {
    const loadingScreen = document.getElementsByClassName("loadingScreenDashboard")[0];
    loadingScreen.remove();
  }
}





function addInformerTab() {

  const informerTab = document.createElement("li");
  informerTab.classList.add("Tabs__tab", "informertab");
  informerTab.setAttribute("role", "tab");
  informerTab.setAttribute("tabindex", "-1");
  informerTab.setAttribute("aria-selected", "false");
  informerTab.style.cssText += 'color:#107F7F';
  informerTab.innerHTML = '<div class="Onboarding__highlight">TpT Informer</div>';

  informerTab.addEventListener("click", () => {
    if (ACTIVE) {
      return
    }
    //DASHBOARD_ACTIVE = true;
    ACTIVE = true;
    changeToInformerTab();
  });

  const mainDiv = document.getElementsByClassName("SellerDashboard__container")[0];
  const tabs = document.querySelectorAll(".Tabs__tab");
  tabs[0].parentNode.insertBefore(informerTab, tabs[0].nextSibling);
}


function changeToInformerTab() {
  if (!TABS_ADDED) {
    TABS_ADDED = true;
    addSubTabs()
  }

  let informerTab = document.getElementsByClassName("informertab")[0];
  const tabs = document.querySelectorAll(".Tabs__tab");
  for (const tab of tabs) {
    if (tab.classList.contains("informertab")) {
      continue
    }
    tab.classList.remove("Tabs__tab--active");
  }
  informerTab.classList.add("Tabs__tab--active");

  removeContent()
  deselectMarketTab();
  deselectRankingTab();
  deselectProductsTab();
  deselectTrackerTab()

  startInformerTab();
}

function startInformerTab() {
  // DASHBOARD
  DASHBOARD_ACTIVE = true;

  let mainDiv = document.getElementsByClassName("Tabs__content")[0];

  let dashboardMainDiv = document.createElement("div");
  dashboardMainDiv.classList.add("row", "dashboardMainDiv");

  // SHOW TPT Dashboard
  //let inlineDashboard4 = document.getElementsByClassName("Onboarding__highlight");
  //inlineDashboard4 = inlineDashboard4[inlineDashboard4.length-2];
  //inlineDashboard4.style.display = "block";

  let ctx = document.createElement("canvas");
  ctx.id = "earningsChart";
  ctx.width = "400";
  //mainDiv.prepend(ctx);


  let tptDashboard = getDashboard()

  dashboardMainDiv.prepend(tptDashboard);

  //createEarningsGraphInRange(monthlySales);

  mainDiv.prepend(dashboardMainDiv);
  addPopularityScoresCard()
}
function addInformerTabRemovalListener() {
  const tabs = document.querySelectorAll(".Tabs__tab");

  for (const tab of tabs) {
    if (tab.classList.contains("informertab")) {
      continue
    }

    tab.addEventListener("click", () => {
      ACTIVE = false;
      TABS_ADDED = false;

      deselectInformer();
    });
  }
}



function reloadInformerTab() {
  deselectInformerTab();
  startInformerTab();
}

function changeToMarketTab() {
  ACTIVE = false;

  let MarketResearchTab = document.getElementsByClassName("informermarketresearch")[0];

  const tabs = document.querySelectorAll(".Tabs__tab");
  for (const tab of tabs) {
    if (tab.classList.contains("informermarketresearch")) {
      continue
    }
    tab.classList.remove("Tabs__tab--active");
  }
  MarketResearchTab.classList.add("Tabs__tab--active");
  removeContent()
  deselectProductsTab()
  deselectRankingTab()
  deselectInformerTab()
  deselectTrackerTab()

  startMarketResearchTab();
}

function startMarketResearchTab() {
  const mainDiv = document.getElementsByClassName("Tabs__content")[0];

  let marketTabWrapper = document.createElement("div");
  marketTabWrapper.classList.add("row", "marketTabWrapper", "px-4");

  let header = getHeader();
  let marketResearchTab = getMarketResearchTab();

  let keywordSuggestionsHeader = document.createElement("div");
  keywordSuggestionsHeader.classList.add("keywordSuggestionsHeader"); //"col-12",
  keywordSuggestionsHeader.innerHTML = "";

  marketTabWrapper.prepend(keywordSuggestionsHeader);

  let marketStatsHeader = document.createElement("div");
  marketStatsHeader.classList.add("marketStatsHeader");
  marketStatsHeader.innerHTML = '';

  marketTabWrapper.prepend(marketStatsHeader);
  marketTabWrapper.prepend(marketResearchTab);

  marketTabWrapper.prepend(header);

  mainDiv.prepend(marketTabWrapper);
}

function changeToProductsTab() {
  ACTIVE = false;

  let productsTab = document.getElementsByClassName("informerproducts")[0];

  const tabs = document.querySelectorAll(".Tabs__tab");
  for (const tab of tabs) {
    if (tab.classList.contains("informerproducts")) {
      continue
    }
    tab.classList.remove("Tabs__tab--active");
  }
  productsTab.classList.add("Tabs__tab--active");
  removeContent()
  deselectMarketTab()
  deselectRankingTab()
  deselectInformerTab()
  deselectTrackerTab()

  startProductsTab();
}

function startProductsTab() {

  // CHECK if products have been loaded this day already
  chrome.storage.sync.get("productStatsLastPull", function (result) {
    const productStatsLastPull = result.productStatsLastPull || [0, 0, 0];
    const today = getTodaysDate();


    if (productStatsLastPull[0] == today[0] || productStatsLastPull[1] == today[1] || productStatsLastPull[2] == today[2]) {
      // load products from storage
      chrome.storage.local.get("productStats", function (result) {
        let productStats = result.productStats;

        globalProductStats = productStats;
        filteredProductStats = productStats;

        displayProductStats(productStats);
      });
    }
    else {
      getProductStats()
    }
  });




}


function changeToRankingTab() {
  ACTIVE = false;

  let rankingTab = document.getElementsByClassName("informerranking")[0];

  const tabs = document.querySelectorAll(".Tabs__tab");
  for (const tab of tabs) {
    if (tab.classList.contains("informerranking")) {
      continue
    }
    tab.classList.remove("Tabs__tab--active");
  }
  rankingTab.classList.add("Tabs__tab--active");
  removeContent()
  deselectMarketTab()
  deselectProductsTab()
  deselectInformerTab()
  deselectTrackerTab()

  startRankingTab();
}

function startRankingTab() {
  RANKING_ACTIVE = true;

  if (document.querySelector(".rankingTabWrapper")) {
    let rankingTabWrapper = document.getElementsByClassName("rankingTabWrapper")[0];
    rankingTabWrapper.style.display = "block";
    return
  }

  const mainDiv = document.getElementsByClassName("Tabs__content")[0];

  let rankingTabWrapper = document.createElement("div");

  let headerDiv = document.createElement("div");
  headerDiv.setAttribute("id", "headerDiv");
  headerDiv.setAttribute("class", "row");

  headerLeft = document.createElement("h5");
  headerLeft.classList.add("col-4", "mt-1", "text-nowrap");
  headerLeft.innerHTML = 'TpT Informer Ranking search <span class="small ml-2 d-inline-block">v2.0</span>'

  headerRight = document.createElement("div");
  headerRight.classList.add("col-8", "justify-content-end");
  headerRight.innerHTML = '';

  headerDiv.appendChild(headerLeft);
  headerDiv.appendChild(headerRight);


  rankingTabWrapper.classList.add("row", "rankingTabWrapper", "px-4");
  let searchBar = getRankingSearchBar();

  rankingTabWrapper.appendChild(headerDiv);
  rankingTabWrapper.appendChild(searchBar);

  mainDiv.prepend(rankingTabWrapper);
  //addUserRankingDiv()

}


function changeToTrackerTab() {
  ACTIVE = false;

  let trackerTab = document.getElementsByClassName("informertracker")[0];

  const tabs = document.querySelectorAll(".Tabs__tab");
  for (const tab of tabs) {
    if (tab.classList.contains("informertracker")) {
      continue
    }
    tab.classList.remove("Tabs__tab--active");
  }
  trackerTab.classList.add("Tabs__tab--active");
  removeContent()
  deselectMarketTab()
  deselectProductsTab()
  deselectRankingTab()
  deselectInformerTab()
  startTrackerTab();
}

function startTrackerTab() {
  TRACKER_ACTIVE = true;

  const mainDiv = document.getElementsByClassName("Tabs__content")[0];

  let trackerTabWrapper = document.createElement("div");

  let headerDiv = document.createElement("div");
  headerDiv.setAttribute("id", "headerDiv");
  headerDiv.setAttribute("class", "row");

  headerLeft = document.createElement("h5");
  headerLeft.classList.add("col-4", "mt-1", "text-nowrap");
  headerLeft.innerHTML = 'TpT Informer Search Rank Tracker <span class="small ml-2 d-inline-block">v1.0</span>'

  headerRight = document.createElement("div");
  headerRight.classList.add("col-8", "justify-content-end");
  headerRight.innerHTML = '';

  headerDiv.appendChild(headerLeft);
  headerDiv.appendChild(headerRight);

  trackerTabWrapper.classList.add("row", "trackerTabWrapper", "px-4");
  trackerTabWrapper.appendChild(headerDiv);

  mainDiv.prepend(trackerTabWrapper);
  addTrackerSelectorBar()

}




function addSubTabs() {
  const tabs = document.querySelectorAll(".Tabs__tab");
  let informerTab = document.getElementsByClassName("informertab")[0];

  let names = ["Tracker", "Ranking", "Products", "Market Research"]

  const delayBetweenTabs = 20;

  function addTabWithDelay(names, index) {
    if (index < names.length) {
      const name = names[index];
      const tab = document.createElement("li");
      tab.classList.add("Tabs__tab", "informer" + name.toLowerCase().replace(" ", ""));
      tab.setAttribute("role", "tab");
      tab.setAttribute("tabindex", "-1");
      tab.setAttribute("aria-selected", "false");
      tab.style.cssText += 'color:#107F7F; font-size: 1em;';

      tab.addEventListener("click", () => {
        if (name == "Market Research") {
          if (MARKET_RESEARCH_ACTIVE) {
            return
          }
          MARKET_RESEARCH_ACTIVE = true;
          changeToMarketTab();
        }
        else if (name == "Products") {
          if (PRODUCTS_ACTIVE) {
            return
          }
          PRODUCTS_ACTIVE = true;
          changeToProductsTab();
        }
        else if (name == "Ranking") {
          if (RANKING_ACTIVE) {
            return
          }
          RANKING_ACTIVE = true;
          changeToRankingTab();
        }
        else if (name == "Tracker") {
          if (TRACKER_ACTIVE) {
            return
          }
          TRACKER_ACTIVE = true;
          changeToTrackerTab();
        }

      });

      tab.innerHTML = '<div class="Onboarding__highlight">' + name + '</div>';

      informerTab.parentNode.insertBefore(tab, informerTab.nextSibling);

      setTimeout(() => {
        addTabWithDelay(names, index + 1);
      }, delayBetweenTabs);
    }
  }
  addTabWithDelay(names, 0);
}
function removeSubTabs() {
  const tabs = document.querySelectorAll(".Tabs__tab");
  let names = ["Ranking", "Products", "Market Research", "Tracker"]

  for (const tab of tabs) {
    if (names.some(v => tab.classList.contains("informer" + v.toLowerCase().replace(" ", "")))) {
      tab.remove();
    }
  }
}


function deselectMarketTab() {
  if (MARKET_RESEARCH_ACTIVE) {
    MARKET_RESEARCH_ACTIVE = false;
    marketTabWrapper = document.getElementsByClassName("marketTabWrapper")[0];
    marketTabWrapper.remove();
  }
}
function deselectProductsTab() {
  if (PRODUCTS_ACTIVE) {
    PRODUCTS_ACTIVE = false;
    ProductsTabWrapper = document.getElementsByClassName("ProductsTabWrapper")[0];
    ProductsTabWrapper.remove();
  }
}
function deselectInformerTab() {
  if (DASHBOARD_ACTIVE) {
    DASHBOARD_ACTIVE = false;
    dashboardMainDiv = document.getElementsByClassName("dashboardMainDiv")[0];
    dashboardMainDiv.remove();
  }
}
function deselectRankingTab() {
  if (RANKING_ACTIVE) {
    RANKING_ACTIVE = false;
    rankingTabWrapper = document.getElementsByClassName("rankingTabWrapper")[0];
    rankingTabWrapper.style.display = "none";
  }
}
function deselectTrackerTab() {
  if (TRACKER_ACTIVE) {
    TRACKER_ACTIVE = false;
    trackerTabWrapper = document.getElementsByClassName("trackerTabWrapper")[0];
    trackerTabWrapper.remove()
  }
}

function deselectInformer() {
  // DESELECT ALL TPT INFORMER TABS

  informerTab = document.getElementsByClassName("informertab")[0];
  informerTab.classList.remove("Tabs__tab--active");

  //inlineDashboard1 = document.getElementsByClassName("Panel Panel--borderless")[0];
  inlineDashboard2 = document.getElementsByClassName("SellerDashboardHomeTab__panelRow")[0];
  inlineDashboard3 = document.getElementsByClassName("SellerDashboardMarketingTab__panelRow")[0];

  // get second to last
  inlineDashboard4 = document.getElementsByClassName("Onboarding__highlight");
  inlineDashboard4 = inlineDashboard4[inlineDashboard4.length - 2];

  try {
    inlineDashboard2.style.display = "block";
  }
  catch (err) {
  }
  try {
    inlineDashboard3.style.display = "block";
  }
  catch (err) {
  }
  try {
    inlineDashboard4.style.display = "block";
  }
  catch (err) {
  }
  //inlineDashboard1.style.display = "block";

  deselectInformerTab();
  deselectMarketTab();
  deselectProductsTab();
  deselectRankingTab();
  deselectTrackerTab()
  removeSubTabs()
}


function removeContent() {
  //inlineDashboard1 = document.getElementsByClassName("Panel Panel--borderless")[0];
  inlineDashboard2 = document.getElementsByClassName("SellerDashboardHomeTab__panelRow")[0];
  inlineDashboard3 = document.getElementsByClassName("SellerDashboardMarketingTab__panelRow")[0];

  // get second to last
  inlineDashboard4 = document.getElementsByClassName("Onboarding__highlight");
  inlineDashboard4 = inlineDashboard4[inlineDashboard4.length - 2];

  // hide content of inline dashboards
  //inlineDashboard1.style.display = "none";

  try {
    inlineDashboard2.style.display = "none";
  }
  catch (err) {
  }
  try {
    inlineDashboard3.style.display = "none";
  }
  catch (err) {
  }
  try {
    inlineDashboard4.style.display = "none";
  }
  catch (err) {
  }
}



///////
// PRODUCTS
///////

async function getProductStats(loadOnly = false) {
  url = 'https://www.teacherspayteachers.com/items/download_items_stats'

  if (PRODUCTS_ACTIVE) {
    displayLoadingScreenProducts()
  }

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok, status: ${response.status}`);
      }
      return response.text(); // Get the CSV data as text
    })
    .then(csvData => {

      new Promise((resolve, reject) => {

        let lines = csvData.split("\n"); // Split the CSV data into lines
        const headers = lines[0].split(",");
        const parsedData = [];


        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const values = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);


          if (values.length === headers.length) {
            const row = {};
            for (let j = 0; j < headers.length; j++) {
              // replace \"
              let newPut = values[j]
              if (newPut == '-') {
                newPut = '0';
              }
              row[headers[j]] = newPut.replace(/\\|"|'/g, '');
            }
            parsedData.push(row);
          }
        }

        resolve(parsedData);
      })
        .then(parsedData => {


          getProductDataFromProfileWrapper(parsedData, loadOnly)
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

function displayLoadingScreenProducts() {
  const mainDiv = document.getElementsByClassName("Tabs__content")[0];
  const loadingScreen = document.createElement("div");
  loadingScreen.classList.add("loadingScreen");
  loadingScreen.innerHTML = '<div class="spinner-border text-primary mb-2 mt-3" role="status"><span class="sr-only">Loading...</span></div>';
  loadingScreen.innerHTML += '<div class="small text-primary">Getting products...';
  mainDiv.prepend(loadingScreen);
}
function removeLoadingScreenProducts() {
  const loadingScreen = document.getElementsByClassName("loadingScreen")[0];
  if (loadingScreen) { loadingScreen.remove(); }
}



///////
// DASHBOARD
///////

let todaysSales = [];
let yesterdaySales = []
let weeklySales = [];
let monthlySales = [];
let yearlySales = [];

let lastWeeksSales = [];
let lastMonthsSales = [];
let lastYearsSales = [];

let todaysEarnings = 0;
let yesterdayEarnings = 0;
let weeklyEarnings = 0;
let monthlyEarnings = 0;
let yearlyEarnings = 0;

let bestDay = 0;
let productsWithSales = 0;
let avgDaysToFirstSale = 0;
let totalEarnings = 0;
let totalSales = 0;


function updateSales() {
  chrome.storage.local.get("fullSalesMatrix", function (result) {

    const salesMatrix = result.fullSalesMatrix;

    todaysSales = [];
    weeklySales = [];
    monthlySales = [];
    yearlySales = [];

    lastWeeksSales = [];
    lastMonthsSales = [];
    lastYearsSales = [];

    let bestDay = 0;
    let productsWithSales = 0;
    let avgDaysToFirstSale = 0;
    let totalEarnings = 0;
    let totalSales = 0;

    let currDay = salesMatrix[0].date;
    let currEarnings = 0;

    let today = getTodaysDate();

    for (let row of salesMatrix) {
      date = row.date.split("/");
      date = [date[0], date[1], date[2]];

      if (currDay == row.date) {
        currEarnings += parseFloat(row.earnings.replace("$", ""));
      }
      else {
        if (currEarnings > bestDay) {
          bestDay = currEarnings;
        }
        currDay = row.date;
        currEarnings = parseFloat(row.earnings.replace("$", ""));
      }
      totalEarnings += parseFloat(row.earnings.replace("$", ""));
      totalSales += 1;

      if (!date1BeforeDate2(date, today)) {
        todaysSales.push(row);
        todaysEarnings += parseFloat(row.earnings.replace("$", ""));
      }
      if (!date1BeforeDate2(subtractDaysFromDate(today, 1), subtractDaysFromDate(today, 2))) {
        yesterdaySales.push(row);
        yesterdayEarnings += parseFloat(row.earnings.replace("$", ""));
      }

      if (!date1BeforeDate2(date, subtractDaysFromDate(today, 7))) {
        weeklySales.push(row);
        weeklyEarnings += parseFloat(row.earnings.replace("$", ""));
      }
      if (!date1BeforeDate2(date, subtractDaysFromDate(today, 30))) {
        monthlySales.push(row);
        monthlyEarnings += parseFloat(row.earnings.replace("$", ""));
      }
      if (!date1BeforeDate2(date, subtractDaysFromDate(today, 366))) {
        yearlySales.push(row);
        yearlyEarnings += parseFloat(row.earnings.replace("$", ""));
      }
      if (!date1BeforeDate2(date, subtractDaysFromDate(today, 7 * 2))) {
        lastWeeksSales.push(row);
      }
      if (!date1BeforeDate2(date, subtractDaysFromDate(today, 30 * 2))) {
        lastMonthsSales.push(row);
      }
      if (!date1BeforeDate2(date, subtractDaysFromDate(today, 365 * 2))) {
        lastYearsSales.push(row);
      }
    }
  });
}

let currPlotSelected = "CONVERSION"
let currProductStats = []

// PRODUCTS TAB
function getProductsTableHeader(productStats) {

  let productsHeader = document.createElement("div");
  productsHeader.classList.add("row");

  const IGNORE = ["keyword", "totalProducts", "productsOnSale", "descriptionStats"];
  const listStats = ["#", "NAME", "POSTED", "PRICE", "\"PAGE VIEWS\"", "\"PRODUCT PREVIEWS\"", "SOLD", "VOTES", "RATING", "EARNINGS", "CONVERSION"];

  labelMap = {
    "#": "#",
    "NAME": "Title",
    "\"PAGE VIEWS\"": "Views",
    "POSTED": "Posted",
    "\"PRODUCT PREVIEWS\"": "Previews",
    "VOTES": "Ratings",
    "RATING": "Rating",
    "SOLD": "Sold",
    "EARNINGS": "Earnings",
    "CONVERSION": "Conversion",
    "PRICE": "Price",
    "SALE PRICE": "Sale Price",
    "URL": "URL",
  }

  for (const stat of listStats) {
    if (IGNORE.includes(stat)) {
      continue;
    }

    let statDiv = document.createElement("div");
    statDiv.classList.add(stat === "NAME" ? "col-2" : "col-1");
    statDiv.style.fontWeight = "bold";
    statDiv.style.fontSize = "1em";
    statDiv.style.borderBottom = "1px solid #e6e6e6";
    statDiv.style.paddingBottom = "10px";
    statDiv.innerHTML = labelMap[stat];

    if (stat === "\"PAGE VIEWS\"" || stat === "VOTES" || stat === "RATING" || stat === "SOLD" || stat === "EARNINGS" || stat === "CONVERSION" || stat === "\"PRODUCT PREVIEWS\"" || stat === "PRICE") {
      let icon = document.createElement('i');
      icon.classList.add('fa-solid');
      icon.classList.add('fa-sort-down');
      icon.style.marginLeft = "5px";
      statDiv.appendChild(icon);

      statDiv.addEventListener("click", () => {

        if (stat === "\"PAGE VIEWS\"") {
          const sortedStats = sortProductsByPageViews(productStats);
          plotProductStats(sortedStats);
        }
        else if (stat === "VOTES") {
          const sortedStats = sortProductsByVotes(productStats);
          plotProductStats(sortedStats);
        }
        else if (stat === "RATING") {
          const sortedStats = sortProductsByRating(productStats);
          plotProductStats(sortedStats);
        }
        else if (stat === "SOLD") {
          const sortedStats = sortProductsBySold(productStats);
          plotProductStats(sortedStats);
        }
        else if (stat === "EARNINGS") {
          const sortedStats = sortProductsByEarnings(productStats);
          plotProductStats(sortedStats);
        }
        else if (stat === "CONVERSION") {
          const sortedStats = sortProductsByConversion(productStats);
          plotProductStats(sortedStats);
        }
        else if (stat === "\"PRODUCT PREVIEWS\"") {
          const sortedStats = sortProductsByProductPreviews(productStats);
          plotProductStats(sortedStats);
        }
        else if (stat === "PRICE") {
          const sortedStats = sortProductsByPrice(productStats);
          plotProductStats(sortedStats);
        }

        icon.classList.toggle('fa-sort-down');
        icon.classList.toggle('fa-sort-up');
      });
    }

    productsHeader.appendChild(statDiv);
  }
  return productsHeader;
}
function getProductsTable(productStats) {
  statsInner = document.createElement("div");

  addMap = {
    "#": "",
    "NAME": "",
    "\"PAGE VIEWS\"": "",
    "POSTED": "",
    "\"PRODUCT PREVIEWS\"": "",
    "VOTES": "",
    "RATING": "",
    "SOLD": "",
    "EARNINGS": "",
    "CONVERSION": "",
    "PRICE": "",
    "SALE PRICE": "",
    "URL": "",
    "ACTIVE": "",
  }
  preMap = {
    "#": "",
    "NAME": "",
    "\"PAGE VIEWS\"": "",
    "POSTED": "",
    "\"PRODUCT PREVIEWS\"": "",
    "VOTES": "",
    "RATING": "",
    "SOLD": "",
    "EARNINGS": "",
    "CONVERSION": "",
    "PRICE": "$",
    "SALE PRICE": "$",
    "URL": "",
    "ACTIVE": "",
  }

  const listStats = ["NAME", "POSTED", "PRICE", "\"PAGE VIEWS\"", "\"PRODUCT PREVIEWS\"", "SOLD", "VOTES", "RATING", "EARNINGS", "CONVERSION"];
  const IGNORE = ["ACTIVE", "URL", "keyword", "totalProducts", "productsOnSale", "descriptionStats"];

  let idx = 1;

  Object.keys(productStats).forEach(function (key) {

    let newRow = document.createElement("div");
    newRow.classList.add("row");

    let statDiv = document.createElement("div");
    statDiv.classList.add("col-1");
    statDiv.innerHTML = idx;
    newRow.appendChild(statDiv);
    idx += 1;

    for (const i in listStats) {
      if (IGNORE.indexOf(listStats[i]) != -1) {
        continue
      }
      let stat = listStats[i];
      statDiv = document.createElement("div");
      if (stat == "NAME") {
        statDiv.classList.add("col-2");
        statDiv.style = "size: 0.5em; font-size: 0.9em"
        statDiv.innerHTML = '<a href=' + productStats[key]["URL"] + ' target="_blank" rel="noopener noreferrer">' + preMap[stat] + productStats[key][stat] + addMap[stat] + ' <i class="fa fa-external-link" style="font-size: 0.6em;" aria-hidden="true"></i>' + '</a>';
      }
      else {
        statDiv.classList.add("col-1");
        statDiv.innerHTML = preMap[stat] + productStats[key][stat] + addMap[stat]
      }

      newRow.appendChild(statDiv);
    }

    newRow.style.paddingBottom = "5px";
    newRow.style.borderBottom = "1px solid #e6e6e6";
    statsInner.appendChild(newRow);
  });

  return statsInner
}
function displayProductStats(productStats, reloadChart = true) {
  if (document.getElementsByClassName("ProductsTabWrapper").length > 0) {
    document.getElementsByClassName("ProductsTabWrapper")[0].remove();
  }
  removeLoadingScreenProducts();

  let ProductsTabWrapper = document.createElement("div");
  ProductsTabWrapper.classList.add("container", "ProductsTabWrapper", "px-4");

  let productsTableWrapper = document.createElement("div");
  productsTableWrapper.classList.add("row", "productsTableWrapper", "px-4");
  let productsHeader = getProductsTableHeader(productStats);
  let productsTable = getProductsTable(productStats);
  productsTableWrapper.append(productsHeader);
  productsTableWrapper.append(productsTable);

  let chartWrapper = document.createElement("div");
  chartWrapper.classList.add("row", "chartWrapper", "px-4");
  chartWrapper.style = "align-items: center; justify-content: center;"

  let ctx = document.createElement('canvas');
  ctx.id = 'myChart';
  ctx.width = 750;
  ctx.height = 450;
  chartWrapper.appendChild(ctx);

  ProductsTabWrapper.appendChild(getChartSelectorBar())
  ProductsTabWrapper.appendChild(chartWrapper);

  let filterBar = getFilterBar()
  ProductsTabWrapper.append(filterBar);

  ProductsTabWrapper.append(productsTableWrapper);

  let mainDiv = document.getElementsByClassName("Tabs__content")[0];
  mainDiv.prepend(ProductsTabWrapper);
}
function updateStatsTable(productStats) {
  let productsHeader = getProductsTableHeader(productStats);
  let productsTable = getProductsTable(productStats);

  if (document.getElementsByClassName("productsTableWrapper").length > 0) {
    document.getElementsByClassName("productsTableWrapper")[0].remove();
  }

  let productsTableWrapper = document.createElement("div");
  productsTableWrapper.classList.add("row", "productsTableWrapper", "px-4");
  productsTableWrapper.append(productsHeader);
  productsTableWrapper.append(productsTable);

  let mainDiv = document.getElementsByClassName("ProductsTabWrapper")[0];
  mainDiv.append(productsTableWrapper);
}


function plotProductStats(productStats) {
  updateStatsTable(productStats);
  if (currPlotSelected == "EARNINGS") {
    createPlotEarningsXName(productStats);
  }
  else if (currPlotSelected == "SALES") {
    createPlotSalesXName(productStats);
  }
  else if (currPlotSelected == "WISH LISTED") {
    createPlotWhishlistedXName(productStats);
  }
  else if (currPlotSelected == "CONVERSION") {
    createPlotConversionXName(productStats);
  }
  else if (currPlotSelected == "PAGE VIEWS") {
    createPlotPageviewsXName(productStats);
  }
  else if (currPlotSelected == "CONVERSION/VIEWS") {
    createPlotConversionXViews(productStats);
  }
  else if (currPlotSelected == "CONVERSION/PRICE") {
    createPlotConversionXPrice(productStats);
  }
  else if (currPlotSelected == "SALES/PRICE") {
    createPlotSalesXPrice(productStats);
  }
  else if (currPlotSelected == "CONVERSION MATRIX") {
    createPlotConversionMatrix(productStats);
  }
}

function getFilterBar() {
  const filterBarWrapper = document.createElement("div");
  filterBarWrapper.classList.add("filterBar", "pt-4");
  // add bottom border

  let filterBarHeader = document.createElement("div");
  filterBarHeader.classList.add("col-12");
  filterBarHeader.innerHTML = '<h4 class="">Filter</h4>';
  filterBarHeader.style = "border-bottom: 1px solid #e6e6e6;"

  const filterBar = document.createElement("div");
  filterBar.classList.add("row", "filterBar", "pb-4");

  let priceFilterWrapper = document.createElement("div");
  priceFilterWrapper.classList.add("col-3", "priceFilterWrapper");
  let priceFilterHeader = document.createElement("div");
  priceFilterHeader.innerHTML = '<h5 class="col-12">Price</h5>';
  let priceFilter = getPriceFilter();

  priceFilterWrapper.appendChild(priceFilterHeader);
  priceFilterWrapper.appendChild(priceFilter);

  let earningsFilterWrapper = document.createElement("div");
  earningsFilterWrapper.classList.add("col-3", "earningsFilterWrapper");
  let earningsFilterHeader = document.createElement("div");
  earningsFilterHeader.innerHTML = '<h5 class="col-12">Earnings</h5>';
  let earningsFilter = getEarningsFilter();

  earningsFilterWrapper.appendChild(earningsFilterHeader);
  earningsFilterWrapper.appendChild(earningsFilter);

  let viewsFilterWrapper = document.createElement("div");
  viewsFilterWrapper.classList.add("col-3", "viewsFilterWrapper");
  let viewsFilterHeader = document.createElement("div");
  viewsFilterHeader.innerHTML = '<h5 class="col-12">Views</h5>';
  let viewsFilter = getViewsFilter();

  viewsFilterWrapper.appendChild(viewsFilterHeader);
  viewsFilterWrapper.appendChild(viewsFilter);

  let salesFilterWrapper = document.createElement("div");
  salesFilterWrapper.classList.add("col-3", "salesFilterWrapper");
  let salesFilterHeader = document.createElement("div");
  salesFilterHeader.innerHTML = '<h5 class="col-12">Sales</h5>';
  let salesFilter = getSalesFilter();

  salesFilterWrapper.appendChild(salesFilterHeader);
  salesFilterWrapper.appendChild(salesFilter);

  filterBar.appendChild(priceFilterWrapper);

  filterBar.appendChild(earningsFilterWrapper);
  filterBar.appendChild(salesFilterWrapper);
  filterBar.appendChild(viewsFilterWrapper);

  filterBarWrapper.appendChild(filterBarHeader);
  filterBarWrapper.appendChild(filterBar);

  return filterBarWrapper
}

function applyAllFilters(productStats) {
  const filteredStats = filterProductsBySalePrice(lowPrice, highPrice, productStats);
  const filteredStats2 = filterProductsByEarnings(lowEarnings, highEarnings, filteredStats);
  const filteredStats3 = filterProductsByViews(lowViews, highViews, filteredStats2);
  const filteredStats4 = filterProductsBySales(lowSold, highSold, filteredStats3);
  return filteredStats4
}


let lowPrice = 0;
let highPrice = 1000000;

function getPriceFilter() {
  const priceFilter = document.createElement("div");
  priceFilter.classList.add("col-12", "priceFilter");
  priceFilter.style = "display: flex; flex-direction: row; justify-content: space-between;"

  priceFilterLeft = document.createElement("input");
  priceFilterLeft.type = "text";
  priceFilterLeft.placeholder = "Min. Price";
  priceFilterLeft.style = "border: 1px solid #e6e6e6; margin-right: 5px; width: 100%"

  priceFilterLeft.addEventListener("change", () => {
    let input = parseFloat(priceFilterLeft.value.replace(/[^\d.-]/g, ''));
    if (input) {
      lowPrice = input;
    }
    else {
      lowPrice = 0;
    }

    filteredProductStats = applyAllFilters(globalProductStats)
    plotProductStats(filteredProductStats);

    if (lowPrice != 0) { priceFilterLeft.value = lowPrice; }
    if (highPrice != 1000000) { priceFilterRight.value = highPrice; }
  });

  priceFilterRight = document.createElement("input");
  priceFilterRight.type = "text";
  priceFilterRight.placeholder = "Max. Price";
  priceFilterRight.style = "border: 1px solid #e6e6e6; margin-left: 5px; width: 100%"

  priceFilterRight.addEventListener("change", () => {
    let input = parseFloat(priceFilterRight.value.replace(/[^\d.-]/g, ''));
    if (input) {
      highPrice = input;
    }
    else {
      highPrice = 1000000;
    }

    filteredProductStats = applyAllFilters(globalProductStats)
    plotProductStats(filteredProductStats);

    if (lowPrice != 0) { priceFilterLeft.value = lowPrice; }
    if (highPrice != 1000000) { priceFilterRight.value = highPrice; }
  });

  // required if filter is applied or another chart selected -> forces update of filter
  if (lowPrice != 0) { priceFilterLeft.value = lowPrice; }
  if (highPrice != 1000000) { priceFilterRight.value = highPrice; }

  priceFilterMid = document.createElement("div");
  priceFilterMid.innerHTML = "-";

  priceFilter.appendChild(priceFilterLeft);
  priceFilter.appendChild(priceFilterMid);
  priceFilter.appendChild(priceFilterRight);

  return priceFilter
}

function filterProductsBySalePrice(lowPrice, highPrice, productStats) {
  const filteredStats = productStats.filter(function (el) {
    const price = el["PRICE"];
    return price >= lowPrice && price <= highPrice;
  });
  return filteredStats
}

let lowEarnings = 0;
let highEarnings = 1000000;

function getEarningsFilter() {
  const earningsFilter = document.createElement("div");
  earningsFilter.classList.add("col-12", "earningsFilter");
  earningsFilter.style.display = "flex";
  earningsFilter.style.flexDirection = "row";
  earningsFilter.style.justifyContent = "space-between";

  const earningsFilterLeft = document.createElement("input");
  earningsFilterLeft.type = "text";
  earningsFilterLeft.placeholder = "Min. Earnings";
  earningsFilterLeft.style.border = "1px solid #e6e6e6";
  earningsFilterLeft.style.marginRight = "5px";
  earningsFilterLeft.style.width = "100%";

  earningsFilterLeft.addEventListener("change", () => {
    let input = parseFloat(earningsFilterLeft.value.replace(/[^\d.-]/g, ''));
    if (input) {
      lowEarnings = input;
    }
    else {
      lowEarnings = 0;
    }
    filteredProductStats = applyAllFilters(globalProductStats)
    plotProductStats(filteredProductStats);


    if (lowEarnings !== 0) { earningsFilterLeft.value = lowEarnings; }
    if (highEarnings !== 1000000) { earningsFilterRight.value = highEarnings; }
  });

  const earningsFilterRight = document.createElement("input");
  earningsFilterRight.type = "text";
  earningsFilterRight.placeholder = "Max. Earnings";
  earningsFilterRight.style.border = "1px solid #e6e6e6";
  earningsFilterRight.style.marginLeft = "5px";
  earningsFilterRight.style.width = "100%";

  earningsFilterRight.addEventListener("change", () => {
    let input = parseFloat(earningsFilterRight.value.replace(/[^\d.-]/g, ''));
    if (input) {
      highEarnings = input;
    }
    else {
      highEarnings = 1000000;
    }
    filteredProductStats = applyAllFilters(globalProductStats)
    plotProductStats(filteredProductStats);

    if (lowEarnings !== 0) { earningsFilterLeft.value = lowEarnings; }
    if (highEarnings !== 1000000) { earningsFilterRight.value = highEarnings; }
  });

  // Required if filter is applied or another chart selected -> forces update of filter
  if (lowEarnings !== 0) { earningsFilterLeft.value = lowEarnings; }
  if (highEarnings !== 1000000) { earningsFilterRight.value = highEarnings; }

  const earningsFilterMid = document.createElement("div");
  earningsFilterMid.textContent = "-";

  earningsFilter.appendChild(earningsFilterLeft);
  earningsFilter.appendChild(earningsFilterMid);
  earningsFilter.appendChild(earningsFilterRight);

  return earningsFilter;
}

function filterProductsByEarnings(lowEarnings, highEarnings, productStats) {
  const filteredStats = productStats.filter(function (el) {
    const earnings = parseFloat(el["EARNINGS"].replace("$", ""));
    return earnings >= lowEarnings && earnings <= highEarnings;
  });
  return filteredStats;
}

let lowViews = 0;
let highViews = 1000000;

function getViewsFilter() {
  const viewsFilter = document.createElement("div");
  viewsFilter.classList.add("col-12", "viewsFilter");
  viewsFilter.style.display = "flex";
  viewsFilter.style.flexDirection = "row";
  viewsFilter.style.justifyContent = "space-between";

  const viewsFilterLeft = document.createElement("input");
  viewsFilterLeft.type = "text";
  viewsFilterLeft.placeholder = "Min. Views";
  viewsFilterLeft.style.border = "1px solid #e6e6e6";
  viewsFilterLeft.style.marginRight = "5px";
  viewsFilterLeft.style.width = "100%";

  viewsFilterLeft.addEventListener("change", () => {
    let input = parseFloat(viewsFilterLeft.value.replace(/[^\d.-]/g, ''));
    if (input) {
      lowViews = input;
    }
    else {
      lowViews = 0;
    }
    filteredProductStats = applyAllFilters(globalProductStats)
    plotProductStats(filteredProductStats);


    if (lowViews !== 0) { viewsFilterLeft.value = lowViews; }
    if (highViews !== 1000000) { viewsFilterRight.value = highViews; }
  });

  const viewsFilterRight = document.createElement("input");
  viewsFilterRight.type = "text";
  viewsFilterRight.placeholder = "Max. Views";
  viewsFilterRight.style.border = "1px solid #e6e6e6";
  viewsFilterRight.style.marginLeft = "5px";
  viewsFilterRight.style.width = "100%";

  viewsFilterRight.addEventListener("change", () => {
    let input = parseFloat(viewsFilterRight.value.replace(/[^\d.-]/g, ''));
    if (input) {
      highViews = input;
    }
    else {
      highViews = 1000000;
    }
    filteredProductStats = applyAllFilters(globalProductStats)
    plotProductStats(filteredProductStats);

    if (lowViews !== 0) { viewsFilterLeft.value = lowViews; }
    if (highViews !== 1000000) { viewsFilterRight.value = highViews; }
  });

  // Required if filter is applied or another chart selected -> forces update of filter
  if (lowViews !== 0) { viewsFilterLeft.value = lowViews; }
  if (highViews !== 1000000) { viewsFilterRight.value = highViews; }

  const viewsFilterMid = document.createElement("div");
  viewsFilterMid.textContent = "-";

  viewsFilter.appendChild(viewsFilterLeft);
  viewsFilter.appendChild(viewsFilterMid);
  viewsFilter.appendChild(viewsFilterRight);

  return viewsFilter;
}

function filterProductsByViews(lowViews, highViews, productStats) {
  const filteredStats = productStats.filter(function (el) {
    const views = el["\"PAGE VIEWS\""];
    return views >= lowViews && views <= highViews;
  });
  return filteredStats;
}

let lowSold = 0;
let highSold = 1000000;

function getSalesFilter() {
  const soldFilter = document.createElement("div");
  soldFilter.classList.add("col-12", "soldFilter");
  soldFilter.style.display = "flex";
  soldFilter.style.flexDirection = "row";
  soldFilter.style.justifyContent = "space-between";

  const soldFilterLeft = document.createElement("input");
  soldFilterLeft.type = "text";
  soldFilterLeft.placeholder = "Min. Sold";
  soldFilterLeft.style.border = "1px solid #e6e6e6";
  soldFilterLeft.style.marginRight = "5px";
  soldFilterLeft.style.width = "100%";

  soldFilterLeft.addEventListener("change", () => {
    let input = parseFloat(soldFilterLeft.value.replace(/[^\d.-]/g, ''));
    if (input) {
      lowSold = input;
    }
    else {
      lowSold = 0;
    }
    filteredProductStats = applyAllFilters(globalProductStats)
    plotProductStats(filteredProductStats);


    if (lowSold !== 0) { soldFilterLeft.value = lowSold; }
    if (highSold !== 1000000) { soldFilterRight.value = highSold; }
  });

  const soldFilterRight = document.createElement("input");
  soldFilterRight.type = "text";
  soldFilterRight.placeholder = "Max. Sold";
  soldFilterRight.style.border = "1px solid #e6e6e6";
  soldFilterRight.style.marginLeft = "5px";
  soldFilterRight.style.width = "100%";

  soldFilterRight.addEventListener("change", () => {
    let input = parseFloat(soldFilterRight.value.replace(/[^\d.-]/g, ''));
    if (input) {
      highSold = input;
    }
    else {
      highSold = 1000000;
    }
    filteredProductStats = applyAllFilters(globalProductStats)
    plotProductStats(filteredProductStats);

    if (lowSold !== 0) { soldFilterLeft.value = lowSold; }
    if (highSold !== 1000000) { soldFilterRight.value = highSold; }
  });

  // Required if filter is applied or another chart selected -> forces update of filter
  if (lowSold !== 0) { soldFilterLeft.value = lowSold; }
  if (highSold !== 1000000) { soldFilterRight.value = highSold; }

  const soldFilterMid = document.createElement("div");
  soldFilterMid.textContent = "-";

  soldFilter.appendChild(soldFilterLeft);
  soldFilter.appendChild(soldFilterMid);
  soldFilter.appendChild(soldFilterRight);

  return soldFilter;
}

function filterProductsBySales(lowSold, highSold, productStats) {
  const filteredStats = productStats.filter(function (el) {
    const sold = el["SOLD"];
    return sold >= lowSold && sold <= highSold;
  });
  return filteredStats;
}




function sortProductsByRating(productStats) {
  const sortedStats = productStats.sort(function (a, b) {
    return b["RATING"] - a["RATING"];
  });
  return sortedStats
}
function sortProductsBySold(productStats) {
  const sortedStats = productStats.sort(function (a, b) {
    a["SOLD"] = a["SOLD"].replace(/[^\d.-]/g, '');
    b["SOLD"] = b["SOLD"].replace(/[^\d.-]/g, '');
    return b["SOLD"] - a["SOLD"];
  });
  return sortedStats
}
function sortProductsByEarnings(productStats) {
  const sortedStats = productStats.slice().sort(function (a, b) {
    const earningsA = parseFloat(a["EARNINGS"].replace(/[^\d.-]/g, ''));
    const earningsB = parseFloat(b["EARNINGS"].replace(/[^\d.-]/g, ''));
    return earningsB - earningsA;
  });
  return sortedStats;
}
function sortProductsByConversion(productStats) {
  const sortedStats = productStats.slice().sort(function (a, b) {
    const conversionA = parseFloat(a["CONVERSION"].replace("%", ""));
    const conversionB = parseFloat(b["CONVERSION"].replace("%", ""));
    return conversionB - conversionA;
  });
  return sortedStats;
}
function sortProductsByPageViews(productStats) {
  const sortedStats = productStats.sort(function (a, b) {
    return b["\"PAGE VIEWS\""] - a["\"PAGE VIEWS\""];
  });
  return sortedStats
}
function sortProductsByProductPreviews(productStats) {
  const sortedStats = productStats.sort(function (a, b) {
    return b["\"PRODUCT PREVIEWS\""] - a["\"PRODUCT PREVIEWS\""];
  });
  return sortedStats
}
function sortProductsByVotes(productStats) {
  const sortedStats = productStats.sort(function (a, b) {
    return b["VOTES"] - a["VOTES"];
  });
  return sortedStats
}
function sortProductsByPrice(productStats) {
  const sortedStats = productStats.sort(function (a, b) {
    return b["PRICE"] - a["PRICE"];
  });
  return sortedStats
};




function createPlotWhishlistedXName(productStats) {
  let ctx = document.getElementById('myChart').getContext('2d');

  // check if chart already exists
  if (Chart.getChart(ctx)) {
    Chart.getChart(ctx).destroy()
  }
  currPlotSelected = "WISH LISTED"

  let data = []
  let labels = []
  let earningsMap = {}
  let idx = 0

  Object.keys(productStats).forEach(element => {
    let curr = productStats[element]
    let WHISHLISTED = curr['\"WISH LISTED\"']
    idx += 1
    let NAME = curr.NAME.replace('"', '')

    data.push({ x: idx, y: WHISHLISTED })
    labels.push(NAME)
  });

  var scatterChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      labels: labels,
      datasets: [{
        label: 'Wishlisted',
        data: data,
        pointRadius: 5,
        pointHoverRadius: 10
      }]
    },
    options: {
      responsive: false,
      devicePixelRatio: 4,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of times whishlisted [-]',
            font: {
              size: 15  // Adjust the font size as needed
            }
          },
          ticks: {
            font: {
              size: 15,
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Product [-]',
            font: {
              size: 15  // Adjust the font size as needed
            }
          },
          ticks: {
            font: {
              size: 15,
            }
          }
        }
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            // if multiple datasets are displayed, show all tooltips
            var label = data.labels[tooltipItem.index];
            return label + ': wishlisted ' + tooltipItem.yLabel + ' times';
          }
        }
      },
    }
  });
}

function createPlotConversionXName(productStats) {
  let ctx = document.getElementById('myChart').getContext('2d');

  // check if chart already exists
  if (Chart.getChart(ctx)) {
    Chart.getChart(ctx).destroy()
  }
  currPlotSelected = "CONVERSION"

  let data = []
  let labels = []
  let earningsMap = {}
  let idx = 0

  Object.keys(productStats).forEach(element => {
    let curr = productStats[element]
    let CONVERSION = parseFloat(curr['CONVERSION'].replace('%', ''))
    let NAME = curr.NAME.replace('"', '')
    idx += 1

    data.push({ x: idx, y: CONVERSION })
    labels.push(NAME)
  });


  var scatterChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      labels: labels,
      datasets: [{
        label: 'Conversion',
        data: data,
        pointRadius: 5,
        pointHoverRadius: 10
      }]
    },
    options: {
      responsive: false,
      devicePixelRatio: 4,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Conversion [%]',
            font: {
              size: 15  // Adjust the font size as needed
            }
          },
          ticks: {
            font: {
              size: 15,
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Product [-]',
            font: {
              size: 15  // Adjust the font size as needed
            }
          },
          ticks: {
            font: {
              size: 15,
            }
          }
        }
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            // if multiple datasets are displayed, show all tooltips
            var label = data.labels[tooltipItem.index];
            return label + ': conversion ' + tooltipItem.yLabel + ' %';
          }
        }
      }
    }
  });
}

function createPlotPageviewsXName(productStats) {
  let ctx = document.getElementById('myChart').getContext('2d');

  // check if chart already exists
  if (Chart.getChart(ctx)) {
    Chart.getChart(ctx).destroy()
  }
  currPlotSelected = "PAGE VIEWS"

  let data = []
  let labels = []
  let earningsMap = {}
  let idx = 0

  Object.keys(productStats).forEach(element => {
    let curr = productStats[element]
    let PAGEVIEWS = curr['\"PAGE VIEWS\"']
    let NAME = curr.NAME.replace('"', '')
    idx += 1

    data.push({ x: idx, y: PAGEVIEWS })
    labels.push(NAME)
  });

  var scatterChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      labels: labels,
      datasets: [{
        label: 'Page Views',
        data: data,
        pointRadius: 5,
        pointHoverRadius: 10
      }]
    },
    options: {
      responsive: false,
      devicePixelRatio: 4,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Product [-]',
            font: {
              size: 15  // Adjust the font size as needed
            }
          },
          ticks: {
            font: {
              size: 15,
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Page Views [-]',
            font: {
              size: 15  // Adjust the font size as needed
            }
          },
          ticks: {
            font: {
              size: 15,
            }
          }
        }
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            // if multiple datasets are displayed, show all tooltips
            var label = data.labels[tooltipItem.index];
            return label + ': viewed ' + tooltipItem.xLabel + ' times';
          }
        }
      }
    }
  });
}

function createPlotEarningsXName(productStats) {
  let ctx = document.getElementById('myChart').getContext('2d');

  // check if chart already exists
  if (Chart.getChart(ctx)) {
    Chart.getChart(ctx).destroy()
  }
  currPlotSelected = "EARNINGS"

  let data = []
  let labels = []
  let earningsMap = {}
  let idx = 0

  Object.keys(productStats).forEach(element => {
    let curr = productStats[element]
    let EARNINGS = parseFloat(curr.EARNINGS.replace(/[^\d.-]/g, ''))
    let SOLD = parseFloat(curr.SOLD.replace(/[^\d.-]/g, ''))
    let NAME = curr.NAME.replace('"', '')
    idx += 1

    data.push({ x: idx, y: EARNINGS })
    labels.push(NAME)
  });

  var scatterChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      labels: labels,
      datasets: [{
        label: 'Earnings',
        data: data,
        pointRadius: 5,
        pointHoverRadius: 10
      }]
    },
    options: {
      responsive: false,
      devicePixelRatio: 4,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Earnings [$]',
            font: {
              size: 15  // Adjust the font size as needed
            }
          },
          ticks: {
            font: {
              size: 15,
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Product [-]',
            font: {
              size: 15  // Adjust the font size as needed
            }
          },
          ticks: {
            font: {
              size: 15,
            }
          }
        }
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            // if multiple datasets are displayed, show all tooltips
            var label = data.labels[tooltipItem.index];
            return label + ': earned $' + tooltipItem.xLabel;
          }
        }
      }
    }
  });
}

function createPlotSalesXName(productStats) {
  let ctx = document.getElementById('myChart').getContext('2d');

  // check if chart already exists
  if (Chart.getChart(ctx)) {
    Chart.getChart(ctx).destroy()
  }
  currPlotSelected = "SALES"

  let data = []
  let labels = []
  let earningsMap = {}
  let idx = 0

  Object.keys(productStats).forEach(element => {
    let curr = productStats[element]
    let SOLD = parseFloat(curr.SOLD.replace('$', ''))
    let NAME = curr.NAME.replace('"', '')
    idx += 1

    data.push({ x: idx, y: SOLD })
    labels.push(NAME)
  });

  var scatterChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      labels: labels,
      datasets: [{
        label: 'Sales',
        data: data,
        pointRadius: 5,
        pointHoverRadius: 10
      }]
    },
    options: {
      responsive: false,
      devicePixelRatio: 4,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Sales [-]',
            font: {
              size: 15  // Adjust the font size as needed
            }
          },
          ticks: {
            font: {
              size: 15,
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Product [-]',
            font: {
              size: 15  // Adjust the font size as needed
            }
          },
          ticks: {
            font: {
              size: 15,
            }
          }
        }
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            // if multiple datasets are displayed, show all tooltips
            var label = data.labels[tooltipItem.index];
            return label + ': sold ' + tooltipItem.yLabel + ' times'
          }
        }
      }
    }
  });
}

function createPlotConversionXPrice(productStats) {
  let ctx = document.getElementById('myChart').getContext('2d');

  // check if chart already exists
  if (Chart.getChart(ctx)) {
    Chart.getChart(ctx).destroy()
  }
  currPlotSelected = "CONVERSION/PRICE"

  let data = []
  let labels = []
  let earningsMap = {}
  let idx = 0

  Object.keys(productStats).forEach(element => {
    let curr = productStats[element]
    let CONVERSION = parseFloat(curr['CONVERSION'].replace('%', ''))
    let PRICE = parseFloat(curr['PRICE'])
    let NAME = curr.NAME.replace('"', '')

    data.push({ x: PRICE, y: CONVERSION })
    labels.push(NAME)
  });

  var scatterChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      labels: labels,
      datasets: [{
        label: 'Conversion/Price',
        data: data,
        pointRadius: 5,
        pointHoverRadius: 10
      }]
    },
    options: {
      responsive: false,
      devicePixelRatio: 4,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Conversion [%]',
            font: {
              size: 15  // Adjust the font size as needed
            }
          },
          ticks: {
            font: {
              size: 15,
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Price [$]',
            font: {
              size: 15  // Adjust the font size as needed
            }
          },
          ticks: {
            font: {
              size: 15,
            }
          }
        }
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            // if multiple datasets are displayed, show all tooltips
            var label = data.labels[tooltipItem.index];
            return label + ': conversion ' + tooltipItem.yLabel + ' %';
          }
        }
      }
    }
  });
}

function createPlotSalesXPrice(productStats) {
  let ctx = document.getElementById('myChart').getContext('2d');

  // check if chart already exists
  if (Chart.getChart(ctx)) {
    Chart.getChart(ctx).destroy()
  }
  currPlotSelected = "SALES/PRICE"

  let data = []
  let labels = []
  let earningsMap = {}
  let idx = 0

  Object.keys(productStats).forEach(element => {
    let curr = productStats[element]
    let SOLD = parseFloat(curr.SOLD.replace('$', ''))
    let PRICE = parseFloat(curr.PRICE)
    let NAME = curr.NAME.replace('"', '')

    data.push({ x: PRICE, y: SOLD })
    labels.push(NAME)
  });

  var scatterChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      labels: labels,
      datasets: [{
        label: 'Sales/Price',
        data: data,
        pointRadius: 5,
        pointHoverRadius: 10
      }]
    },
    options: {
      responsive: false,
      devicePixelRatio: 4,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Sales [-]',
            font: {
              size: 15  // Adjust the font size as needed
            }
          },
          ticks: {
            font: {
              size: 15,
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Price [$]',
            font: {
              size: 15  // Adjust the font size as needed
            }
          },
          ticks: {
            font: {
              size: 15,
            }
          }
        }
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            // if multiple datasets are displayed, show all tooltips
            var label = data.labels[tooltipItem.index];
            return label + ': sold ' + tooltipItem.yLabel + ' times'
          }
        }
      }
    }
  });
}

function createPlotConversionXViews(productStats) {
  let ctx = document.getElementById('myChart').getContext('2d');

  // check if chart already exists
  if (Chart.getChart(ctx)) {
    Chart.getChart(ctx).destroy()
  }
  currPlotSelected = "CONVERSION/VIEWS"

  let data = []
  let labels = []
  let earningsMap = {}
  let idx = 0

  Object.keys(productStats).forEach(element => {
    let curr = productStats[element]
    let CONVERSION = parseFloat(curr['CONVERSION'].replace('%', ''))
    let PAGEVIEWS = parseFloat(curr['\"PAGE VIEWS\"'])
    let NAME = curr.NAME.replace('"', '')

    data.push({ x: PAGEVIEWS, y: CONVERSION })
    labels.push(NAME)
  });

  var scatterChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      labels: labels,
      datasets: [{
        label: 'Conversion/Page Views',
        data: data,
        pointRadius: 5,
        pointHoverRadius: 10
      }]
    },
    options: {
      responsive: false,
      devicePixelRatio: 4,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Conversion [%]',
            font: {
              size: 15  // Adjust the font size as needed
            }
          },
          ticks: {
            font: {
              size: 15,
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Page Views [-]',
            font: {
              size: 15  // Adjust the font size as needed
            }
          },
          ticks: {
            font: {
              size: 15,
            }
          }
        }
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            // if multiple datasets are displayed, show all tooltips
            var label = data.labels[tooltipItem.index];
            return label + ': conversion ' + tooltipItem.yLabel + ' %';
          }
        }
      }
    }
  });
}

function createPlotConversionMatrix(productStats) {
  let ctx = document.getElementById('myChart').getContext('2d');

  // check if chart already exists
  if (Chart.getChart(ctx)) {
    Chart.getChart(ctx).destroy()
  }
  currPlotSelected = "CONVERSION MATRIX"

  let data = []
  let labels = []

  Object.keys(productStats).forEach(element => {
    let curr = productStats[element]
    let SOLD = parseFloat(curr.SOLD.replace('$', ''))
    let PREVIEWS = parseFloat(curr['\"PRODUCT PREVIEWS\"'])
    let VIEWS = parseFloat(curr['\"PAGE VIEWS\"'])
    let NAME = curr.NAME.replace('"', '')

    data.push({ x: (PREVIEWS / VIEWS) * 100, y: (SOLD / PREVIEWS) * 100 })
    labels.push(NAME)
  });

  var scatterChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      labels: labels,
      datasets: [{
        label: 'Previews/Views - Sales/Previews',
        data: data,
        pointRadius: 5,
        pointHoverRadius: 10
      }]
    },
    options: {
      responsive: false,
      devicePixelRatio: 4,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Previews / Page Views [%]',
            font: {
              size: 15  // Adjust the font size as needed
            }
          },
          ticks: {
            font: {
              size: 15,
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Sales / Previews [%]',
            font: {
              size: 15  // Adjust the font size as needed
            }
          },
          ticks: {
            font: {
              size: 15,
            }
          }
        }
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            // if multiple datasets are displayed, show all tooltips
            var label = data.labels[tooltipItem.index];
            return label + ': sold ' + tooltipItem.yLabel + ' times'
          }
        }
      }
    }
  });
}

function getChartSelectorBar(productStats) {
  let chartSelectorBar = document.createElement('div');
  chartSelectorBar.id = 'chartSelectorBar';
  chartSelectorBar.className = 'row my-3';
  chartSelectorBar.style = 'justify-content: center;';

  let earningsButton = document.createElement('button');
  earningsButton.className = 'col-2 btn btn-primary mx-1 border'; // Added Bootstrap classes for styling
  earningsButton.innerHTML = 'Earnings';
  earningsButton.onclick = function () {
    currPlotSelected = "EARNINGS"
    plotProductStats(filteredProductStats);
  };

  let salesButton = document.createElement('button');
  salesButton.className = 'col-2 btn btn-info mx-1 border'; // Added Bootstrap classes for styling
  salesButton.innerHTML = 'Sales';
  salesButton.onclick = function () {
    currPlotSelected = "SALES"
    plotProductStats(filteredProductStats);
  }

  let WishlistedButton = document.createElement('button');
  WishlistedButton.className = 'col-2 btn btn-secondary mx-1 border'; // Added Bootstrap classes for styling
  WishlistedButton.innerHTML = 'Wishlisted';
  WishlistedButton.onclick = function () {
    currPlotSelected = "WISH LISTED"
    plotProductStats(filteredProductStats);
  };

  let ConversionButton = document.createElement('button');
  ConversionButton.className = 'col-2 btn btn-success mx-1 border'; // Added Bootstrap classes for styling
  ConversionButton.innerHTML = 'Conversion';
  ConversionButton.onclick = function () {
    currPlotSelected = "CONVERSION"
    plotProductStats(filteredProductStats);
  };

  let PageviewsButton = document.createElement('button');
  PageviewsButton.className = 'col-2 btn btn-warning mx-1 border'; // Added Bootstrap classes for styling
  PageviewsButton.innerHTML = 'Views';
  PageviewsButton.onclick = function () {
    currPlotSelected = "PAGE VIEWS"
    plotProductStats(filteredProductStats);
  };

  let PriceConversionButton = document.createElement('button');
  PriceConversionButton.className = 'col-2 btn btn-danger m-1 border'; // Added Bootstrap classes for styling
  PriceConversionButton.innerHTML = 'Conversion/Price';
  PriceConversionButton.onclick = function () {
    currPlotSelected = "CONVERSION/PRICE"
    plotProductStats(filteredProductStats);
  }

  let PriceSalesButton = document.createElement('button');
  PriceSalesButton.className = 'col-2 btn btn-dark m-1 border'; // Added Bootstrap classes for styling
  PriceSalesButton.innerHTML = 'Sales/Price';
  PriceSalesButton.onclick = function () {
    currPlotSelected = "SALES/PRICE"
    plotProductStats(filteredProductStats);
  }

  let ConversionMatrixButton = document.createElement('button');
  ConversionMatrixButton.className = 'col-2 btn btn-primary m-1 border'; // Added Bootstrap classes for styling
  ConversionMatrixButton.innerHTML = 'Conversion Matrix';
  ConversionMatrixButton.onclick = function () {
    currPlotSelected = "CONVERSION MATRIX"
    plotProductStats(filteredProductStats);
  }

  let ConversionViewsButton = document.createElement('button');
  ConversionViewsButton.className = 'col-2 btn btn-secondary m-1 border'; // Added Bootstrap classes for styling
  ConversionViewsButton.innerHTML = 'Conversion/Views';
  ConversionViewsButton.onclick = function () {
    currPlotSelected = "CONVERSION/VIEWS"
    plotProductStats(filteredProductStats);
  }


  chartSelectorBar.appendChild(earningsButton);
  chartSelectorBar.appendChild(salesButton);
  chartSelectorBar.appendChild(WishlistedButton);
  chartSelectorBar.appendChild(ConversionButton);
  chartSelectorBar.appendChild(PageviewsButton);
  chartSelectorBar.appendChild(ConversionViewsButton);
  chartSelectorBar.appendChild(PriceConversionButton);
  chartSelectorBar.appendChild(PriceSalesButton);
  chartSelectorBar.appendChild(ConversionMatrixButton);

  setTimeout(() => {
    ConversionButton.click();
  }, 50)

  return chartSelectorBar;
}




// DASHBOARD TAB

function getDashboard() {

  // DASHBOARD
  let dashboardDiv = document.createElement("div");
  dashboardDiv.classList.add("row", "dashboardDiv", "pt-3");

  let salesCard = getDashboardSalesCard()
  let salesChart = getDashboardSalesChartCard()
  let productsCard = getDashboardProductsCard()
  let lastSalesCard = getDashboardLastSalesCard()


  dashboardDiv.appendChild(salesCard);
  dashboardDiv.appendChild(productsCard);

  dashboardDiv.appendChild(salesChart);
  dashboardDiv.appendChild(lastSalesCard);

  setTimeout(() => {
    createWeekSalesChart(weeklySales);
  }, 50)


  return dashboardDiv
}


// Chart Card
function getDashboardSalesChartCard() {

  let salesChartCard = document.createElement('div');
  salesChartCard.className = 'col border-0'; // Add other necessary classes

  let salesChart = document.createElement('canvas');
  //salesChart.className = 'p-3'
  salesChart.id = 'salesChart';
  salesChart.width = '500';
  salesChart.height = '400';

  let salesChartSelectorBar = getSalesChartSelectorBar();

  salesChartCard.appendChild(salesChartSelectorBar);
  salesChartCard.appendChild(salesChart);

  setTimeout(() => {
    createWeekSalesChart(lastWeeksSales);
  }, 50)

  return salesChartCard;

}
function getSalesChartSelectorBar() {
  let chartSelectorBar = document.createElement('div');
  chartSelectorBar.id = 'chartSelectorBar';
  chartSelectorBar.className = 'row';
  chartSelectorBar.style = 'justify-content: center;';

  let weekButton = document.createElement('button');
  weekButton.className = 'col-3 btn btn-primary mx-1 border'; // Added Bootstrap classes for styling
  weekButton.innerHTML = 'Week';
  weekButton.onclick = function () {
    createWeekSalesChart(lastWeeksSales);
  };

  let monthButton = document.createElement('button');
  monthButton.className = 'col-3 btn btn-secondary mx-1 border'; // Added Bootstrap classes for styling
  monthButton.innerHTML = 'Month';
  monthButton.onclick = function () {
    createMonthSalesChart(lastMonthsSales);
  };

  let yearButton = document.createElement('button');
  yearButton.className = 'col-3 btn btn-success mx-1 border'; // Added Bootstrap classes for styling
  yearButton.innerHTML = 'Year';
  yearButton.onclick = function () {
    createYearSalesChart(lastYearsSales);
  };

  chartSelectorBar.appendChild(weekButton);
  chartSelectorBar.appendChild(monthButton);
  chartSelectorBar.appendChild(yearButton);

  return chartSelectorBar;
}


function createWeekSalesChart(data) {
  // Get the date range for the last seven days in reversed order (newest to oldest)

  let ctx = document.getElementById('salesChart').getContext('2d');

  // check if chart already exists
  if (Chart.getChart(ctx)) {
    Chart.getChart(ctx).destroy()
  }
  const today = new Date();
  const lastSevenDays = Array.from({ length: 8 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    return date.toLocaleDateString();
  }); // Reverse the order of dates


  // Create an object to store the count of sales per day
  const salesPerDay = lastSevenDays.reduce((acc, date) => {
    acc[date] = 0;
    return acc;
  }, {});

  // Count the number of sales for each day
  data.forEach(sale => {
    const saleDate = new Date(sale.date).toLocaleDateString();
    if (salesPerDay[saleDate] !== undefined) {
      salesPerDay[saleDate]++;
    }
  });

  const labels = Object.keys(salesPerDay).reverse(); // Reverse the order of labels
  const dataCounts = Object.values(salesPerDay).reverse(); // Reverse the order of data counts

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Number of Sales',
        data: dataCounts,
        backgroundColor: 'rgba(54, 162, 235, 0.3)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        borderRadius: 5 // Adding rounded corners to bars
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false // Disable tooltips to avoid duplicate information
        },
        datalabels: {
          anchor: 'end',
          align: 'top',
          color: 'black', // Color of the data labels
          font: {
            weight: 'bold'
          },
          formatter: function (value) {
            return value; // Show the y-axis value on the bar
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Sales'
          },
          ticks: {
            stepSize: 1 // Set step size to 1 to show only integer values
          }

        },
        x: {
          title: {
            display: true,
            text: 'Date'
          },
          grid: {
            display: false // Remove horizontal gridlines
          }
        }
      },
      animation: {
        duration: 0,
        onComplete: function () {
          ctx2 = this.ctx;
          ctx2.font = Chart.helpers.fontString(Chart.defaults.font.size, Chart.defaults.font.style, Chart.defaults.font.family);
          ctx2.textAlign = 'center';
          ctx2.textBaseline = 'bottom';
          chartinst = this;
          this.data.datasets.forEach(function (dataset, i) {
            if (chartinst.isDatasetVisible(i)) {
              var meta = chartinst.getDatasetMeta(i);
              meta.data.forEach(function (bar, index) {
                var data = dataset.data[index];
                var yPos = bar.y - 5; // Initial position above the bar

                // Check if label exceeds the visible area
                var labelHeight = ctx2.measureText(data).actualBoundingBoxAscent + ctx2.measureText(data).actualBoundingBoxDescent;
                if (labelHeight > bar.y - chartinst.chartArea.top) {
                  yPos = bar.y + 20; // Adjust to inside the bar
                }

                ctx2.fillText(data, bar.x, yPos);
              });
            }
          });
        }
      }

    }
  });
}
function createMonthSalesChart(data) {
  // check if chart already exists
  let ctx = document.getElementById('salesChart').getContext('2d');

  if (Chart.getChart(ctx)) {
    Chart.getChart(ctx).destroy()
  }
  const today = new Date();
  const last30Days = Array.from({ length: 31 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    return date.toLocaleDateString();
  }); // Reverse the order of dates


  // Create an object to store the count of sales per day
  const salesPerDay = last30Days.reduce((acc, date) => {
    acc[date] = 0;
    return acc;
  }, {});

  // Count the number of sales for each day
  data.forEach(sale => {
    const saleDate = new Date(sale.date).toLocaleDateString();
    if (salesPerDay[saleDate] !== undefined) {
      salesPerDay[saleDate]++;
    }
  });

  const labels = Object.keys(salesPerDay).reverse(); // Reverse the order of labels
  const dataCounts = Object.values(salesPerDay).reverse(); // Reverse the order of data counts

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Number of Sales',
        data: dataCounts,
        backgroundColor: 'rgba(54, 162, 235, 0.3)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        borderRadius: 5 // Adding rounded corners to bars
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false // Disable tooltips to avoid duplicate information
        },
        datalabels: {
          anchor: 'end',
          align: 'top',
          color: 'black', // Color of the data labels
          font: {
            weight: 'bold'
          },
          formatter: function (value) {
            return value; // Show the y-axis value on the bar
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Sales'
          },
          ticks: {
            stepSize: 1 // Set step size to 1 to show only integer values
          }

        },
        x: {
          title: {
            display: true,
            text: 'Date'
          },
          grid: {
            display: false // Remove horizontal gridlines
          }
        }
      },
      animation: {
        duration: 0,
        onComplete: function () {
          ctx2 = this.ctx;
          ctx2.font = Chart.helpers.fontString(Chart.defaults.font.size, Chart.defaults.font.style, Chart.defaults.font.family);
          ctx2.textAlign = 'center';
          ctx2.textBaseline = 'bottom';
          chartinst = this;
          this.data.datasets.forEach(function (dataset, i) {
            if (chartinst.isDatasetVisible(i)) {
              var meta = chartinst.getDatasetMeta(i);
              meta.data.forEach(function (bar, index) {
                var data = dataset.data[index];
                var yPos = bar.y - 5; // Initial position above the bar

                // Check if label exceeds the visible area
                var labelHeight = ctx2.measureText(data).actualBoundingBoxAscent + ctx2.measureText(data).actualBoundingBoxDescent;
                if (labelHeight > bar.y - chartinst.chartArea.top) {
                  yPos = bar.y + 20; // Adjust to inside the bar
                }

                ctx2.fillText(data, bar.x, yPos);
              });
            }
          });
        }
      }
    }
  });
}
function createYearSalesChart(data) {
  // check if chart already exists
  let ctx = document.getElementById('salesChart').getContext('2d');

  if (Chart.getChart(ctx)) {
    Chart.getChart(ctx).destroy()
  }

  // group sales by month
  let salesPerMonth = {};

  // Count sales per month
  data.forEach(sale => {
    let date = new Date(sale.date);
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();

    const givenDate = new Date(year, month - 1, day);

    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - 13); // Subtracting 12 months
    // set date to first day of month
    currentDate.setDate(1);

    // if data older than 12 months, ignore
    if (givenDate < currentDate) {
      return;
    }

    if (!salesPerMonth[year]) {
      salesPerMonth[year] = Array(12).fill(0);
    }

    salesPerMonth[year][month]++;
  });


  // Create labels and data
  let labels = [];
  let dataCounts = [];

  Object.keys(salesPerMonth).forEach(year => {
    salesPerMonth[year].forEach((count, month) => {

      const currentDate = new Date();
      currentDate.setMonth(currentDate.getMonth() - 12);

      // check if data older than 12 months, ignore
      if (new Date(year, month, 1) < currentDate) {
        return;
      }
      // check if data newer than today, ignore
      if (new Date(year, month, 1) > new Date()) {
        return;
      }

      labels.push(month + 1 + '/' + year); // Months are zero-based, so increment by 1
      dataCounts.push(count);
    });
  });


  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Number of Sales',
        data: dataCounts,
        backgroundColor: 'rgba(54, 162, 235, 0.3)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        borderRadius: 5 // Adding rounded corners to bars
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false // Disable tooltips to avoid duplicate information
        },
        datalabels: {
          anchor: 'end',
          align: 'top',
          color: 'black', // Color of the data labels
          font: {
            weight: 'bold'
          },
          formatter: function (value) {
            return value; // Show the y-axis value on the bar
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Sales'
          },
          ticks: {
            stepSize: 1 // Set step size to 1 to show only integer values
          }

        },
        x: {
          title: {
            display: true,
            text: 'Date'
          },
          grid: {
            display: false // Remove horizontal gridlines
          }
        }
      },
      animation: {
        duration: 0,
        onComplete: function () {
          ctx2 = this.ctx;
          ctx2.font = Chart.helpers.fontString(Chart.defaults.font.size, Chart.defaults.font.style, Chart.defaults.font.family);
          ctx2.textAlign = 'center';
          ctx2.textBaseline = 'bottom';
          chartinst = this;
          this.data.datasets.forEach(function (dataset, i) {
            if (chartinst.isDatasetVisible(i)) {
              var meta = chartinst.getDatasetMeta(i);
              meta.data.forEach(function (bar, index) {
                var data = dataset.data[index];
                var yPos = bar.y - 5; // Initial position above the bar

                // Check if label exceeds the visible area
                var labelHeight = ctx2.measureText(data).actualBoundingBoxAscent + ctx2.measureText(data).actualBoundingBoxDescent;
                if (labelHeight > bar.y - chartinst.chartArea.top) {
                  yPos = bar.y + 20; // Adjust to inside the bar
                }

                ctx2.fillText(data, bar.x, yPos);
              });
            }
          });
        }
      }
    }
  });
}


// Sales Card
function getDashboardSalesCard() {

  let salesCardWrapper = document.createElement('div');
  salesCardWrapper.className = 'col-3';

  let salesCard = document.createElement('div');
  salesCard.className = 'card mb-2 border';

  // CARD HEADER
  let cardHeader = document.createElement('div');
  cardHeader.className = 'bg-light p-3';

  let icon = document.createElement('i');
  icon.className = 'fas fa-chart-line';

  cardHeaderSpan = document.createElement('span');
  cardHeaderSpan.style.marginLeft = '5px';

  cardHeaderSpan.innerText = 'Sales';
  cardHeaderSpan.style.fontSize = '1rem';

  cardHeader.appendChild(icon);
  cardHeader.appendChild(cardHeaderSpan);

  // Todays sales
  let todaysSalesBanner = createSalesBanner("Today's sales", todaysSales.length, todaysEarnings.toFixed(2));

  // This week's sales
  let thisWeekSales = createSalesBanner("Last 7 days", weeklySales.length, weeklyEarnings.toFixed(2));

  // This month's sales
  let thisMonthSales = createSalesBanner("Last 30 days", monthlySales.length, monthlyEarnings.toFixed(2));

  salesCard.appendChild(cardHeader);
  salesCard.appendChild(todaysSalesBanner);
  salesCard.appendChild(thisWeekSales);
  salesCard.appendChild(thisMonthSales);

  salesCardWrapper.appendChild(salesCard);

  return salesCardWrapper;
}
function createSalesBanner(title, salesCount, earnings) {
  let salesBanner = document.createElement('div');
  salesBanner.className = "card-body p-3";
  salesBanner.style.flex = '1'; // Set flex to distribute available space evenly

  let salesBannerInner = document.createElement('div');
  salesBannerInner.className = "row";

  let salesBannerInnerCol1 = document.createElement('div');
  salesBannerInnerCol1.className = "col-12 d-flex justify-content-between align-items-end";
  salesBannerInnerCol1.innerText = title;

  let salesBannerInnerCol2 = document.createElement('div');
  salesBannerInnerCol2.className = "col-12 d-flex text-muted justify-content-center align-items-center";
  salesBannerInnerCol2.innerText = salesCount;
  salesBannerInnerCol2.style.textAlign = 'center';
  salesBannerInnerCol2.style.fontSize = '2rem';

  let salesBannerInnerCol3 = document.createElement('div');
  salesBannerInnerCol3.className = "col-12 d-flex justify-content-center align-items-center";

  let salesBannerInnerCol3Span = document.createElement('span');
  salesBannerInnerCol3Span.innerText = "$";
  salesBannerInnerCol3Span.className = "text-warning";

  let salesBannerInnerCol3Span2 = document.createElement('span');
  salesBannerInnerCol3Span2.innerText = earnings;
  salesBannerInnerCol3Span2.className = "text-muted";

  salesBannerInnerCol3.appendChild(salesBannerInnerCol3Span);
  salesBannerInnerCol3.appendChild(salesBannerInnerCol3Span2);

  salesBannerInner.appendChild(salesBannerInnerCol1);
  salesBannerInner.appendChild(salesBannerInnerCol2);
  salesBannerInner.appendChild(salesBannerInnerCol3);

  salesBanner.appendChild(salesBannerInner);

  return salesBanner;
}


// Products Card
function getDashboardProductsCard() {

  let productStats = getDashboardProductsCardStats();

  let productCardWrapper = document.createElement('div');
  productCardWrapper.className = 'col-3';

  let productCard = document.createElement('div');
  productCard.className = 'card mb-2 border';
  //productCard.style.width = '300px';

  // CARD HEADER
  let cardHeader = document.createElement('div');
  cardHeader.className = 'bg-light p-3';

  let icon = document.createElement('i');
  icon.className = 'fa-solid fa-chart-pie ml-2';

  cardHeaderSpan = document.createElement('span');
  cardHeaderSpan.style.marginLeft = '5px';
  cardHeaderSpan.innerText = 'Products';
  cardHeaderSpan.style.fontSize = '1rem';

  cardHeader.appendChild(icon);
  cardHeader.appendChild(cardHeaderSpan);


  // Live products
  let liveProducts = document.createElement('div');
  liveProducts.className = "card-body p-3";

  let liveProductsInner = document.createElement('div');
  liveProductsInner.className = "row";

  let liveProductsInnerCol1 = document.createElement('div');
  liveProductsInnerCol1.className = "col-6 d-flex justify-content-between align-items-end";
  liveProductsInnerCol1.innerText = "Live products";

  let liveProductsInnerCol2 = document.createElement('div');
  liveProductsInnerCol2.className = "col-6 d-flex justify-content-between align-items-end";
  liveProductsInnerCol2.innerText = productStats["productsOnline"];

  liveProductsInner.appendChild(liveProductsInnerCol1);
  liveProductsInner.appendChild(liveProductsInnerCol2);

  liveProducts.appendChild(liveProductsInner);

  /// Products with sales
  let productsWithSales = document.createElement('div');
  productsWithSales.className = "card-body p-3";

  let productsWithSalesInner = document.createElement('div');
  productsWithSalesInner.className = "row";

  let productsWithSalesInnerCol1 = document.createElement('div');
  productsWithSalesInnerCol1.className = "col-6 d-flex justify-content-between align-items-end";
  productsWithSalesInnerCol1.innerText = "Products with sales";

  let productsWithSalesInnerCol2 = document.createElement('div');
  productsWithSalesInnerCol2.className = "col-3 d-flex justify-content-between align-items-end";
  productsWithSalesInnerCol2.innerText = productStats["productsWithSales"];

  productsWithSalesInner.appendChild(productsWithSalesInnerCol1);
  productsWithSalesInner.appendChild(productsWithSalesInnerCol2);

  productsWithSales.appendChild(productsWithSalesInner);

  /// Total sales 
  let totalSales = document.createElement('div');
  totalSales.className = "card-body p-3";

  let totalSalesInner = document.createElement('div');
  totalSalesInner.className = "row";

  let totalSalesInnerCol1 = document.createElement('div');
  totalSalesInnerCol1.className = "col-6 d-flex justify-content-between align-items-end";
  totalSalesInnerCol1.innerText = "Total sales";

  let totalSalesInnerCol2 = document.createElement('div');
  totalSalesInnerCol2.className = "col-6 d-flex justify-content-between align-items-end";
  totalSalesInnerCol2.innerText = productStats["totalSales"];

  totalSalesInner.appendChild(totalSalesInnerCol1);
  totalSalesInner.appendChild(totalSalesInnerCol2);

  totalSales.appendChild(totalSalesInner);

  // Total earnings
  let totalEarnings = document.createElement('div');
  totalEarnings.className = "card-body p-3";

  let totalEarningsInner = document.createElement('div');
  totalEarningsInner.className = "row";

  let totalEarningsInnerCol1 = document.createElement('div');
  totalEarningsInnerCol1.className = "col-6 d-flex justify-content-between align-items-end";
  totalEarningsInnerCol1.innerText = "Total earnings";

  let totalEarningsInnerCol2 = document.createElement('div');
  totalEarningsInnerCol2.className = "col-6 d-flex justify-content-between align-items-end";
  totalEarningsInnerCol2.innerText = "$" + productStats["totalEarnings"].toFixed(2);

  totalEarningsInner.appendChild(totalEarningsInnerCol1);
  totalEarningsInner.appendChild(totalEarningsInnerCol2);

  totalEarnings.appendChild(totalEarningsInner);

  // Bestseller
  let bestseller = document.createElement('div');
  bestseller.className = "card-body p-3";

  let bestsellerInner = document.createElement('div');
  bestsellerInner.className = "row";

  let bestsellerInnerCol1 = document.createElement('div');
  bestsellerInnerCol1.className = "col-6 d-flex justify-content-between align-items-end";
  bestsellerInnerCol1.innerText = "Bestseller";

  let bestsellerInnerCol2 = document.createElement('div');
  bestsellerInnerCol2.className = "col-6 d-flex justify-content-between align-items-end";
  bestsellerInnerCol2.innerText = productStats["bestseller"];
  bestsellerInnerCol2.style.color = 'blue';
  bestsellerInnerCol2.style.cursor = 'pointer';

  // add hover to show bestseller name
  bestsellerInnerCol2.onmouseover = function () {
    bestsellerInnerCol2.innerText = productStats["bestseller_name"];
  }
  bestsellerInnerCol2.onmouseout = function () {
    bestsellerInnerCol2.innerText = productStats["bestseller"];
    bestsellerInnerCol2.style.color = 'blue';
    bestsellerInnerCol2.style.cursor = 'pointer';
  }

  bestsellerInner.appendChild(bestsellerInnerCol1);
  bestsellerInner.appendChild(bestsellerInnerCol2);

  bestseller.appendChild(bestsellerInner);


  // Reviews
  let reviews = document.createElement('div');
  reviews.className = "card-body pt-3";

  let reviewsInner = document.createElement('div');
  reviewsInner.className = "row";

  let reviewsInnerCol1 = document.createElement('div');
  reviewsInnerCol1.className = "col-6 d-flex justify-content-between align-items-end";
  reviewsInnerCol1.innerText = "Reviews";

  let reviewsInnerCol2 = document.createElement('div');
  reviewsInnerCol2.className = "col-3 d-flex justify-content-between align-items-end";
  reviewsInnerCol2.innerText = "0";

  let reviewsInnerCol3 = document.createElement('div');
  reviewsInnerCol3.className = "col-3 d-flex justify-content-between align-items-end";
  reviewsInnerCol3.innerText = "5/5";

  reviewsInner.appendChild(reviewsInnerCol1);
  reviewsInner.appendChild(reviewsInnerCol2);
  reviewsInner.appendChild(reviewsInnerCol3);

  reviews.appendChild(reviewsInner);


  productCard.appendChild(cardHeader);
  productCard.appendChild(liveProducts);
  productCard.appendChild(productsWithSales);
  productCard.appendChild(bestseller);

  //productCard.appendChild(totalSales);
  //productCard.appendChild(totalEarnings);
  //productCard.appendChild(reviews);

  productCardWrapper.appendChild(productCard);

  return productCardWrapper
}

function getDashboardProductsCardStats() {
  let stats = {}

  // GET: productsWithSales, Total Sales, Total Earnings, Products online
  let productsOnline = 0;
  let productsWithSales = 0;
  let bestSellingProduct = "";
  let bestSellingProductSales = 0;

  for (const product of globalProductStats) {
    if (product["SOLD"] > 0) {
      productsWithSales += 1;
    }
    if (parseInt(product["SOLD"]) > bestSellingProductSales) {
      bestSellingProductSales = parseInt(product["SOLD"]);
      bestSellingProduct = product["NAME"];
    }
    productsOnline += 1;
  }

  stats["productsWithSales"] = productsWithSales;
  stats["totalSales"] = totalSales;
  stats["totalEarnings"] = totalEarnings;
  stats["productsOnline"] = productsOnline;
  stats["bestseller"] = bestSellingProductSales;
  stats['bestseller_name'] = bestSellingProduct.replace('"', "")

  return stats
}


// Popularity Card
async function addPopularityScoresCard() {

  if (document.querySelector(".popularityCard")) {
    return
  }

  fetch("https://sbekgjsj8m-dsn.algolia.net/1/indexes/*/queries?x-algolia-agent=Algolia%20for%20JavaScript%20(4.9.1)%3B%20Browser%20(lite)%3B%20react%20(16.8.6)%3B%20react-instantsearch%20(6.11.0)%3B%20JS%20Helper%20(3.4.4)&x-algolia-api-key=ce17b545c6ba0432cf638e0c29ee64ef&x-algolia-application-id=SBEKGJSJ8M", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en,en-US;q=0.9,de-DE;q=0.8,de;q=0.7",
      "cache-control": "no-cache",
      "content-type": "application/x-www-form-urlencoded",
      "pragma": "no-cache",
      "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site"
    },
    "referrer": "https://www.teacherspayteachers.com/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": "{\"requests\":[{\"indexName\":\"Resource Suggestions\",\"params\":\"highlightPreTag=%3Cais-highlight-0000000000%3E&highlightPostTag=%3C%2Fais-highlight-0000000000%3E&hitsPerPage=5&query=&facets=%5B%5D&tagFilters=\"}]}",
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  }).then(response => {
    if (!response.ok) {
      throw new Error(`Network response was not ok, status: ${response.status}`);
    }
    return response.json();
  }).then(data => {

    data = data.results

    let kws = data[0].hits
    let popularityScores = {}

    kws.forEach(kw => {

      popularityScores[kw.query] = {}
      popularityScores[kw.query]["popularity"] = kw.popularity
      try {
        popularityScores[kw.query]["nb_hits"] = kw.Resources.exact_nb_hits
      }
      catch {
        popularityScores[kw.query]["nb_hits"] = "-"
      }
    })

    if (DASHBOARD_ACTIVE) {
      let popularityCard = getPopularityCard(popularityScores);
      let dashboardDiv = document.querySelector(".dashboardDiv");
      dashboardDiv.appendChild(popularityCard);
    }

    return data
  }).catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  })
}

function getPopularityCard(popularityScores) {

  let popularityCardWrapper = document.createElement('div');
  popularityCardWrapper.className = 'col-5 popularityCard';

  let popularityCard = document.createElement('div');
  popularityCard.className = 'card mb-2 border';
  //productCard.style.width = '300px';

  // CARD HEADER
  let cardHeader = document.createElement('div');
  cardHeader.className = 'bg-light p-3';

  let icon = document.createElement('i');
  icon.className = 'fa-solid fa-magnifying-glass ml-2';

  cardHeaderSpan = document.createElement('span');
  cardHeaderSpan.style.marginLeft = '5px';
  cardHeaderSpan.innerText = 'Popular Today';
  cardHeaderSpan.style.fontSize = '1rem';

  cardHeader.appendChild(icon);
  cardHeader.appendChild(cardHeaderSpan);

  // Popularity Scores
  let popularityScoresDiv = document.createElement('div');
  popularityScoresDiv.className = "card-body p-3";

  let popularityScoresInner = document.createElement('div');
  popularityScoresInner.className = "row";

  let popularityScoresInnerCol1 = document.createElement('div');
  popularityScoresInnerCol1.className = "col-5 d-flex justify-content-between align-items-end";
  popularityScoresInnerCol1.innerText = "Search query";
  popularityScoresInnerCol1.style.fontWeight = 'bold';

  let popularityScoresInnerCol2 = document.createElement('div');
  popularityScoresInnerCol2.className = "col-3 d-flex justify-content-between align-items-end";
  popularityScoresInnerCol2.innerText = "Popularity";
  popularityScoresInnerCol2.style.fontWeight = 'bold';

  let popularityScoresInnerCol3 = document.createElement('div');
  popularityScoresInnerCol3.className = "col-4 d-flex justify-content-between align-items-end";
  popularityScoresInnerCol3.innerText = "Exact hits";
  popularityScoresInnerCol3.style.fontWeight = 'bold';


  popularityScoresInner.appendChild(popularityScoresInnerCol1);
  popularityScoresInner.appendChild(popularityScoresInnerCol2);
  popularityScoresInner.appendChild(popularityScoresInnerCol3);

  popularityScoresDiv.appendChild(popularityScoresInner);

  // Add popularity scores
  Object.keys(popularityScores).forEach(kw => {
    let popularityScoresInner = document.createElement('div');
    popularityScoresInner.className = "row py-2";

    let popularityScoresInnerCol1 = document.createElement('div');
    popularityScoresInnerCol1.className = "col-5 d-flex justify-content-between align-items-end";
    popularityScoresInnerCol1.innerText = kw;

    let popularityScoresInnerCol2 = document.createElement('div');
    popularityScoresInnerCol2.className = "col-3 d-flex justify-content-between align-items-end";
    popularityScoresInnerCol2.innerText = popularityScores[kw]["popularity"];

    let popularityScoresInnerCol3 = document.createElement('div');
    popularityScoresInnerCol3.className = "col-4 d-flex justify-content-between align-items-end";
    popularityScoresInnerCol3.innerText = popularityScores[kw]["nb_hits"];

    popularityScoresInner.appendChild(popularityScoresInnerCol1);
    popularityScoresInner.appendChild(popularityScoresInnerCol2);
    popularityScoresInner.appendChild(popularityScoresInnerCol3);

    popularityScoresDiv.appendChild(popularityScoresInner);
  })

  popularityCard.appendChild(cardHeader);
  popularityCard.appendChild(popularityScoresDiv);

  popularityCardWrapper.appendChild(popularityCard);

  return popularityCardWrapper
}

// Last Sales Card
function getDashboardLastSalesCard() {
  // Show Top 5 weekly products with sales and earnings in a card
  let lastSalesCardWrapper = document.createElement('div');
  lastSalesCardWrapper.className = 'col-4';

  let lastSalesCard = document.createElement('div');
  lastSalesCard.className = 'card mb-2 border';

  // CARD HEADER
  let cardHeader = document.createElement('div');
  cardHeader.className = 'bg-light p-3';

  let icon = document.createElement('i');
  icon.className = 'fa-solid fa-receipt';

  let cardHeaderSpan = document.createElement('span');
  cardHeaderSpan.style.marginLeft = '5px';
  cardHeaderSpan.innerText = 'Top Sales';
  cardHeaderSpan.style.fontSize = '1rem';

  cardHeader.appendChild(icon);
  cardHeader.appendChild(cardHeaderSpan);
  lastSalesCard.appendChild(cardHeader);

  // Last sales
  let topWeeklySales = getTopWeeklySales();
  let topMonthlySales = getTopMonthlySales();

  let salesListWrapper = document.createElement('div');
  salesListWrapper.className = 'card-body p-3';
  let salesList = document.createElement('ul');
  salesList.className = 'list-group list-group-flush';
  // Adding weekly sales
  let weeklySalesWrapper = document.createElement('div');
  weeklySalesWrapper.className = 'pb-3';
  let weeklySalesItem = document.createElement('li');
  weeklySalesItem.className = 'list-group-item';

  let weeklySalesTitle = document.createElement('h5');
  weeklySalesTitle.innerText = 'Top Earners - Last 7 Days';
  weeklySalesItem.appendChild(weeklySalesTitle);

  let weeklySalesTable = document.createElement('table');
  weeklySalesTable.className = 'table';

  let weeklySalesTableBody = document.createElement('tbody');
  topWeeklySales.forEach(sale => {
    let tableRow = document.createElement('tr');
    let nameCell = document.createElement('td');
    let salesCell = document.createElement('td');
    salesCell.className = "text-muted";
    let earningsCell = document.createElement('td');

    nameCell.innerText = sale.name;
    salesCell.innerText = `(${sale.sales})`;

    let salesBannerInnerCol3 = document.createElement('div');
    salesBannerInnerCol3.className = "col-12 d-flex justify-content-center align-items-center";

    let salesBannerInnerCol3Span = document.createElement('span');
    salesBannerInnerCol3Span.innerText = "$";
    salesBannerInnerCol3Span.className = "text-warning";

    let salesBannerInnerCol3Span2 = document.createElement('span');
    salesBannerInnerCol3Span2.innerText = sale.earnings;
    salesBannerInnerCol3Span2.className = "text-muted";

    salesBannerInnerCol3.appendChild(salesBannerInnerCol3Span);
    salesBannerInnerCol3.appendChild(salesBannerInnerCol3Span2);
    earningsCell.appendChild(salesBannerInnerCol3); // Append salesBannerInnerCol3 as a child element

    tableRow.appendChild(nameCell);
    tableRow.appendChild(earningsCell);
    tableRow.appendChild(salesCell);

    weeklySalesTableBody.appendChild(tableRow);
  });
  weeklySalesTable.appendChild(weeklySalesTableBody);
  weeklySalesItem.appendChild(weeklySalesTable);
  weeklySalesWrapper.appendChild(weeklySalesItem);
  salesList.appendChild(weeklySalesWrapper);

  // Adding monthly sales
  let monthlySalesItem = document.createElement('li');
  monthlySalesItem.className = 'list-group-item';

  let monthlySalesTitle = document.createElement('h5');
  monthlySalesTitle.innerText = 'Top Earners - Last 30 Days';
  monthlySalesItem.appendChild(monthlySalesTitle);

  let monthlySalesTable = document.createElement('table');
  monthlySalesTable.className = 'table';

  let monthlySalesTableBody = document.createElement('tbody');
  topMonthlySales.forEach(sale => {
    let tableRow = document.createElement('tr');
    let nameCell = document.createElement('td');
    let salesCell = document.createElement('td');
    salesCell.className = "text-muted";
    let earningsCell = document.createElement('td');

    nameCell.innerText = sale.name;
    salesCell.innerText = `(${sale.sales})`;

    let salesBannerInnerCol3 = document.createElement('div');
    salesBannerInnerCol3.className = "col-12 d-flex justify-content-center align-items-center";

    let salesBannerInnerCol3Span = document.createElement('span');
    salesBannerInnerCol3Span.innerText = "$";
    salesBannerInnerCol3Span.className = "text-warning";

    let salesBannerInnerCol3Span2 = document.createElement('span');
    salesBannerInnerCol3Span2.innerText = sale.earnings;
    salesBannerInnerCol3Span2.className = "text-muted";

    salesBannerInnerCol3.appendChild(salesBannerInnerCol3Span);
    salesBannerInnerCol3.appendChild(salesBannerInnerCol3Span2);
    earningsCell.appendChild(salesBannerInnerCol3); // Append salesBannerInnerCol3 as a child element

    tableRow.appendChild(nameCell);
    tableRow.appendChild(earningsCell);
    tableRow.appendChild(salesCell);

    monthlySalesTableBody.appendChild(tableRow);
  });
  monthlySalesTable.appendChild(monthlySalesTableBody);
  monthlySalesItem.appendChild(monthlySalesTable);
  salesList.appendChild(monthlySalesItem);

  salesListWrapper.appendChild(salesList);

  lastSalesCard.appendChild(salesListWrapper);
  lastSalesCardWrapper.appendChild(lastSalesCard);
  return lastSalesCardWrapper;
}

function getTopWeeklySales() {
  if (!weeklySales || !weeklySales.length) {
    return [];
  }

  // Count sales per product and return top 5
  // If product has multiple sales, sum them up. Store name, total earnings and number of sales
  let productSales = {};

  weeklySales.forEach(sale => {
    if (productSales[sale.itemSold]) {
      productSales[sale.itemSold]["sales"] += 1;
      productSales[sale.itemSold]["earnings"] += parseFloat(sale.earnings.replace("$", ""));
    } else {
      productSales[sale.itemSold] = {
        sales: 1,
        earnings: parseFloat(sale.earnings.replace("$", "")),
        name: sale.itemSold // Assuming 'product' is the name of the product
      };
    }
  });

  // Transform productSales into an array, sort it by earnings, and then take the top 5
  let sortedSales = Object.values(productSales).sort((a, b) => b.earnings - a.earnings);
  let topWeeklySales = sortedSales.slice(0, 5);

  topWeeklySales.forEach(sale => {
    sale.earnings = sale.earnings.toFixed(2);
  })

  return topWeeklySales;
}

function getTopMonthlySales() {
  if (!monthlySales || !monthlySales.length) {
    return [];
  }

  // Count sales per product and return top 5
  // If product has multiple sales, sum them up. Store name, total earnings and number of sales
  let productSales = {};

  monthlySales.forEach(sale => {
    if (productSales[sale.itemSold]) {
      productSales[sale.itemSold]["sales"] += 1;
      productSales[sale.itemSold]["earnings"] += parseFloat(sale.earnings.replace("$", ""));
    } else {
      productSales[sale.itemSold] = {
        sales: 1,
        earnings: parseFloat(sale.earnings.replace("$", "")),
        name: sale.itemSold // Assuming 'product' is the name of the product
      };
    }
  });

  // Transform productSales into an array, sort it by earnings, and then take the top 5
  let sortedSales = Object.values(productSales).sort((a, b) => b.earnings - a.earnings);
  let topMonthlySales = sortedSales.slice(0, 5);

  topMonthlySales.forEach(sale => {
    sale.earnings = sale.earnings.toFixed(2);
  })

  return topMonthlySales;
}






// RANKINGS
function addUserRankingDiv() {
  let rankingDiv = document.createElement("div");

  let headerDivUser = document.createElement("div");
  headerDivUser.setAttribute("id", "headerDiv");
  headerDivUser.setAttribute("class", "row");

  headerLeft = document.createElement("h5");
  headerLeft.classList.add("col-4", "mt-1", "text-nowrap");
  headerLeft.innerHTML = 'Your TpT Rank'

  headerRight = document.createElement("div");
  headerRight.classList.add("col-8", "justify-content-end");
  headerRight.innerHTML = '';

  headerDivUser.appendChild(headerLeft);
  headerDivUser.appendChild(headerRight);


  chrome.storage.sync.get(function (result) {

    if (result.rankingHistory) {

      let rankingHistory = result.rankingHistory;
      rankingHistory = rankingHistory.reverse();

      let rankData = [];
      let dateData = [];
      let seenDates = [];

      for (i = 0; i < Math.min(rankingHistory.length, 9); i++) {
        if (seenDates.includes(rankingHistory[i][0])) {
          continue;
        }

        rankData.push(rankingHistory[i][1]);
        dateData.push(rankingHistory[i][0]);
      }

      if (rankData.length < 10) {
        let emptyElements = 9 - rankData.length;
        for (let i = 0; i < emptyElements; i++) {
          rankData.push("");
          dateData.push("");
        }
      }

      let baseline = rankData[0];

      const rankRow = document.createElement('div');
      rankRow.className = 'row';

      idx = 0
      rankData.forEach((data) => {
        const col = document.createElement('div');
        col.className = 'col';
        col.textContent = data;
        col.style.textAlign = 'center';
        col.style.fontSize = '1.2rem';
        col.style.fontWeight = 'bold';
        col.style.opacity = 1 - (idx / 12);
        if (data == baseline) {
          col.style.color = 'black';
        }
        else if (data < baseline) {
          col.style.color = 'green';
        }
        else {
          col.style.color = 'red';
        }
        idx++
        rankRow.appendChild(col);
      });

      const dateRow = document.createElement('div');
      dateRow.className = 'row';
      dateData.forEach((data) => {
        const col = document.createElement('div');
        col.style.textAlign = 'center';
        col.className = 'col';
        if (data[0]) {
          col.textContent = data[0] + '/' + data[1];
        }
        else {
          col.textContent = "";
        }
        dateRow.appendChild(col);
      });

      rankingDiv.appendChild(rankRow);
      rankingDiv.appendChild(dateRow);
      rankingDiv.className = 'mx-3 mb-3';

      const rankingTabWrapper = document.querySelector('.rankingTabWrapper');
      rankingTabWrapper.prepend(rankingDiv);
      rankingTabWrapper.prepend(headerDivUser);
    }
  });
}

function getRankingSearchBar() {
  let searchBar = document.createElement('div');
  searchBar.className = 'col-12 mt-1';


  let searchBarInput = document.createElement('input');
  searchBarInput.className = 'form-control mb-3';
  searchBarInput.placeholder = ' Search for a TpT seller...';
  searchBarInput.style.border = '1px solid #ced4da';

  searchBarInput.onkeyup = function () {
    let value = searchBarInput.value;
    if (value.length > 2) {
      getRankingSearchSuggestions(value);
    }
  }

  const suggBox = document.createElement("div");
  suggBox.classList.add("autocom-box");

  searchBar.appendChild(searchBarInput);
  searchBar.appendChild(suggBox);

  return searchBar;
}

function showRankingSuggestions(hits) {
  const suggBox = document.querySelector(".autocom-box");

  // Clear previous search results
  suggBox.innerHTML = '';

  const suggestionItems = Object.keys(hits).map(storeName => {
    const store = hits[storeName];
    const item = document.createElement('div');
    item.classList.add("sugg-item");
    const img = document.createElement('img');
    img.src = store.picUrl;
    img.alt = `${storeName} Image`;
    img.classList.add("store-image");
    const span = document.createElement('span');
    span.textContent = storeName;
    span.classList.add("store-name");

    // check if store has been seen and increase opacity
    if (seenRankingStores[store.store_url]) {
      item.style.opacity = 0.5;
    }

    item.appendChild(img);
    item.appendChild(span);

    // Add click event listener to each suggestion item
    item.addEventListener('click', function () {
      if (!document.querySelector('.rankingResultHeader')) {
        let rankingTabWrapper = document.querySelector('.rankingTabWrapper');
        let headerRow = document.createElement('div');
        headerRow.className = 'row m-2 rankingResultHeader'; // Bootstrap row

        // Left Column (Rank)
        const nameColumn = document.createElement('div');
        nameColumn.className = 'col-md-5'; // Bootstrap column for rank
        nameColumn.innerHTML = '<b>Store</b>';

        const rankColumn = document.createElement('div');
        rankColumn.className = 'col-md-2'; // Bootstrap column for rank
        rankColumn.innerHTML = '<b>TpT Rank</b>';

        // Middle Column (Percentile)
        const middleColumn = document.createElement('div');
        middleColumn.className = 'col-md-2'; // Bootstrap column for empty space
        middleColumn.innerHTML = '<b>Percentile</b>';

        // Right Column (Last updated)
        const storeColumn = document.createElement('div');
        storeColumn.className = 'col-md-2'; // Bootstrap column for 'Visit Store'
        storeColumn.innerHTML = '<b>Cohort</b>';

        headerRow.appendChild(nameColumn);
        headerRow.appendChild(rankColumn);
        headerRow.appendChild(middleColumn);
        headerRow.appendChild(storeColumn);
        rankingTabWrapper.appendChild(headerRow);
      }

      addStoreRank(storeName, store);

    });
    return item;
  });

  suggestionItems.forEach(item => {
    suggBox.appendChild(item);
  });

  // Additional CSS for the suggestions
  const suggestionStyles = `
      .sugg-item {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 5px;
      }
      .store-image {
          width: 40px; /* Adjust size as needed */
          height: 40px; /* Adjust size as needed */
          margin-right: 10px;
          border-radius: 50%; /* To make the images round */
      }
      /* Other styles as needed */
  `;

  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = suggestionStyles;
  document.head.appendChild(styleSheet);
}


function addStoreRank(storeName, store) {
  // check if free limit has been reached, and if so add premium row
  chrome.storage.sync.get(function (result) {
    if (result.rankingLimitreached) {
      let premiumRow = document.querySelector('.premiumRowRanking');
      if (!premiumRow) {
        let rankingTabWrapper = document.querySelector('.rankingTabWrapper');
        let premiumRow = document.createElement('div');
        premiumRow.className = 'premiumRowRanking';
        premiumRow.innerHTML = '<div class="col">You have reached your free daily limit. Please upgrade to <a target="_blank" rel="noopener noreferrer" href="https://tptinformer.com/"><u>premium</u></a> to see unlimited results.</div>';
        rankingTabWrapper.appendChild(premiumRow);
      }
    }
    else {
      if (seenRankingStoresCount >= FREE_DAILY_RANKING_LIMIT) {
        if (!ISPREMIUM) {
          let premiumRow = document.querySelector('.premiumRowRanking');
          if (!premiumRow) {
            chrome.storage.sync.set({ rankingLimitreached: true });

            let rankingTabWrapper = document.querySelector('.rankingTabWrapper');
            let premiumRow = document.createElement('div');
            premiumRow.className = 'premiumRowRanking';
            premiumRow.innerHTML = '<div class="col">Please upgrade to <a target="_blank" rel="noopener noreferrer" href="https://tptinformer.com/"><u>premium</u></a> to search for store ranks.</div>';
            rankingTabWrapper.appendChild(premiumRow);
          }
          return;
        }
        else {
          if (seenRankingStoresCount >= PREMIUM_DAILY_RANKING_LIMIT) {
            let premiumLimitRowRanking = document.querySelector('.premiumLimitRowRanking');
            if (!premiumLimitRowRanking) {
              chrome.storage.sync.set({ rankingLimitReachedPremium: true });

              let rankingTabWrapper = document.querySelector('.rankingTabWrapper');
              let premiumRow = document.createElement('div');
              premiumRow.className = 'premiumLimitRowRanking';
              premiumRow.innerHTML = '<div class="col">You have reached your daily premium search limit. Come back tomorrow to search for more rankings.</div>';
              rankingTabWrapper.appendChild(premiumRow);
            }
            return;
          }
          // delete first 
          let rankingResults = document.querySelectorAll('.rankingResult');

          if (rankingResults && rankingResults.length == 5) {
            let storeUrl = rankingResults[0].querySelector('a').href;

            seenRankingStores[storeUrl] = false;
            rankingResults[0].remove();
          }
        }
      }

      // if store has been seen, do nothing
      if (seenRankingStores[store.store_url]) {
        return;
      }

      const img = document.createElement('img');
      img.src = store.picUrl;
      img.classList.add("store-image");



      const storeUrl = store.store_url;
      const rankingTabWrapper = document.querySelector('.rankingTabWrapper');

      fetch("https://www.teacherspayteachers.com/gateway/graphql?opname=StoreRanking", {
        "headers": {
          "accept": "application/json",
          "accept-language": "en,en-US;q=0.9,de-DE;q=0.8,de;q=0.7",
          "authorization": "Bearer " + globalBearerToken,
          "cache-control": "no-cache",
          "content-type": "application/json",
          "pragma": "no-cache",
          "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"macOS\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
        },
        "referrer": "https://www.teacherspayteachers.com/Dashboard",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "{\"operationName\":\"StoreRanking\",\"variables\":{\"storeId\":\"" + store.id + "\"},\"extensions\":{},\"query\":\"query StoreRanking($storeId: ID) {\\n  sellerRanking(storeId: $storeId) {\\n    salesRank\\n    startDate\\n    percentile\\n    __typename\\n  }\\n}\\n\"}",
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
      }).then(response => {
        return response.json();
      }).then(data => {

        const percentile = data.data.sellerRanking.percentile;
        const rank = data.data.sellerRanking.salesRank;

        if (rankingTabWrapper) {
          const newLine = document.createElement('div');
          newLine.className = 'row m-2 rankingResult'; // Bootstrap row

          // Left Column (Rank)
          const nameColumn = document.createElement('div');
          nameColumn.className = 'col-md-5'; // Bootstrap column for rank

          const span = document.createElement('span');
          span.classList.add("store-name");
          span.innerHTML = '<a href=' + store.store_url + ' target="_blank" rel="noopener noreferrer">' + storeName + ' <i class="fa fa-external-link" style="font-size: 0.6em;" aria-hidden="true"></i>' + '</a>';

          nameColumn.appendChild(img);
          nameColumn.appendChild(span);


          const rankColumn = document.createElement('div');
          rankColumn.className = 'col-md-2'; // Bootstrap column for rank
          let ranking = document.createElement('span');

          if (rank) {
            ranking.textContent = rank
            ranking.style.fontSize = '1rem';
            ranking.style.fontWeight = 'bold';
          }
          else {
            ranking.textContent = 'Seller made no sales last month';
          }

          //ranking.style.color = 'blue';
          rankColumn.appendChild(ranking);

          // Middle Column (Empty)
          const percentileColumn = document.createElement('div');
          percentileColumn.className = 'col-md-2'; // Bootstrap column for empty space
          percentileColumn.innerHTML = percentile

          // Right Column (Visit Store)
          const lastUpdatedColumn = document.createElement('div');
          lastUpdatedColumn.className = 'col-md-2'; // Bootstrap column for 'Visit Store'
          // get last month as long written
          let date = new Date();
          date.setMonth(date.getMonth() - 1);
          let month = date.toLocaleString('default', { month: 'long' });
          lastUpdatedColumn.innerText = month

          newLine.appendChild(nameColumn);
          newLine.appendChild(rankColumn);
          newLine.appendChild(percentileColumn);
          newLine.appendChild(lastUpdatedColumn);

          rankingTabWrapper.appendChild(newLine);

          // Add to seen stores
          if (!seenRankingStores[storeUrl]) {
            seenRankingStores[storeUrl] = true;
            seenRankingStoresCount += 1;

            chrome.storage.sync.set({ seenRankingStoresCount: seenRankingStoresCount });
          }
        }

      });


    }
  });
}


async function getRankingSearchSuggestions(name) {

  let bdy = "{\"requests\":[{\"indexName\":\"Resource Suggestions\",\"params\":\"highlightPreTag=%3Cais-highlight-0000000000%3E&highlightPostTag=%3C%2Fais-highlight-0000000000%3E&hitsPerPage=5&query=" + name + "&facets=%5B%5D&tagFilters=\"},{\"indexName\":\"Stores\",\"params\":\"highlightPreTag=%3Cais-highlight-0000000000%3E&highlightPostTag=%3C%2Fais-highlight-0000000000%3E&hitsPerPage=2&query=" + name + "&filters=is_active%20%3D%201%20AND%20active_item_ct%20%3E%200&facets=%5B%5D&tagFilters=\"}]}"

  fetch("https://sbekgjsj8m-dsn.algolia.net/1/indexes/*/queries?x-algolia-agent=Algolia%20for%20JavaScript%20(4.9.1)%3B%20Browser%20(lite)%3B%20react%20(16.8.6)%3B%20react-instantsearch%20(6.11.0)%3B%20JS%20Helper%20(3.4.4)&x-algolia-api-key=ce17b545c6ba0432cf638e0c29ee64ef&x-algolia-application-id=SBEKGJSJ8M", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en,en-US;q=0.9,de-DE;q=0.8,de;q=0.7",
      "cache-control": "no-cache",
      "content-type": "application/x-www-form-urlencoded",
      "pragma": "no-cache",
      "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site"
    },
    "referrer": "https://www.teacherspayteachers.com/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": bdy,
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  }).then(response => {
    if (!response.ok) {
      throw new Error(`Network response was not ok, status: ${response.status}`);
    }
    return response.json();
  }).then(data => {

    let stores = data.results[1].hits;

    let hits = {}
    for (let store of stores) {
      if (!hits[store.store_name]) {
        hits[store.store_name] = {}; // Initialize object for store_name if it doesn't exist
      }
      hits[store.store_name].id = store.objectID;
      hits[store.store_name].picUrl = store.thumbnail_url;
      hits[store.store_name].store_url = store.store_url;
    }
    showRankingSuggestions(hits)

    return data
  }).catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  })
}

async function testBearerToken(token) {
  fetch("https://www.teacherspayteachers.com/gateway/graphql?opname=StoreRanking", {
    "headers": {
      "accept": "application/json",
      "accept-language": "en,en-US;q=0.9,de-DE;q=0.8,de;q=0.7",
      "authorization": "Bearer " + token,
      "cache-control": "no-cache",
      "content-type": "application/json",
      "pragma": "no-cache",
      "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
    },
    "referrer": "https://www.teacherspayteachers.com/Dashboard",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": "{\"operationName\":\"StoreRanking\",\"variables\":{\"storeId\":\"12\"},\"extensions\":{},\"query\":\"query StoreRanking($storeId: ID) {\\n  sellerRanking(storeId: $storeId) {\\n    salesRank\\n    startDate\\n    percentile\\n    __typename\\n  }\\n}\\n\"}",
    "method": "POST",
    "mode": "cors",
    "credentials": "include"
  }).then(response => {

    // if error code 400 -> token invalid
    if (response.status == 400) {
      console.log("token invalid")
    }
    else {
      console.log("token valid")
      chrome.runtime.sendMessage({ id: "updateBearerToken" });
    }

  })
}



// PRODUCT STATS
function mergeProductStatsAndProfileData(parsedData, profileData) {
  for (let product of parsedData) {
    for (let productProfile of profileData) {
      if (product["NAME"] == productProfile["title"]) {
        product["URL"] = productProfile["url"];
        product["PRICE"] = productProfile["price"];
        product["SALE_PRICE"] = productProfile["sale_price"];
        product["ACTIVE"] = productProfile["active"];
      }
    }
  }

  return parsedData
}

async function getProductDataFromProfileWrapper(parsedData, loadOnly) {

  let profileData = await getProductDataFromProfile(1);
  productStats = mergeProductStatsAndProfileData(parsedData, profileData)

  globalProductStats = productStats;
  chrome.storage.local.set({ productStats: productStats });
  chrome.storage.sync.set({ productStatsLastPull: getTodaysDate() });

  if (!loadOnly) {
    displayProductStats(productStats);
  }
}

async function getProductDataFromProfile(idx) {

  url = "https://www.teacherspayteachers.com/My-Products/page:" + idx

  const response = await fetch(url);
  if (response.status !== 200) {
    throw new Error("Status != 200");
  }

  const responseText = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(responseText, 'text/html');

  let pageHeader = doc.querySelector('.PageHeader');
  let totalProducts = parseInt(pageHeader.querySelector('.Text').innerText.split(" ")[0]);

  let myProducts = doc.querySelectorAll('.MyProductsListLayout')[0];
  let products = myProducts.querySelectorAll('.MyProductsProductCard');

  let productsParsed = []
  products.forEach(product => {
    let title = product.querySelector('.MyProductsProductCard__title').innerText.replace("'", "");

    // check if product has class MyProductsProductCard--inactive
    if (product.classList.contains('MyProductsProductCard--inactive')) {
      let editButton = product.querySelector('.MyProductsProductCard__editButton');
      productsParsed.push({
        title: title,
        url: "https://www.teacherspayteachers.com/" + editButton.href,
        price: 0,
        sale_price: 0,
        active: false
      })
      return;
    }

    let url = product.querySelector('.MyProductsProductCard__imageContainer').querySelector('a').href;
    let price
    let sale_price
    try {
      price = product.querySelector('.SearchProductRowPrice__mainPrice').innerText.replace("$", "");
      if (price == "FREE") { price = 0; }
    }
    catch {
      price = 0;
    }
    try {
      sale_price = product.querySelector('.SearchProductRowPrice__secondaryPrice').innerText;
      if (sale_price == "FREE") { sale_price = 0; }
    }
    catch {
      sale_price = 0;
    }

    productsParsed.push({
      title: title,
      url: url,
      price: parseFloat(price),
      sale_price: parseFloat(sale_price),
      active: true
    })
  })
  productDataFromProfile = productDataFromProfile.concat(productsParsed);

  if (productDataFromProfile.length < totalProducts) {
    return getProductDataFromProfile(idx + 1);
  }

  return productDataFromProfile
}




// TRACKER

async function searchRankTrackerCrawlWrapper(keyword, ITERATIONS = 5, repoIdx) {
  for (let i = 1; i < ITERATIONS + 1; i++) { // Use <= to include the last iteration
    try {
      searchRankTrackerCrawl(i, keyword, repoIdx) // Pass i as the page index

    } catch (error) {
      console.error("Error crawling keyword:", error);
    }
  }
  return;
}

async function searchRankTrackerCrawl(IDX, keyword, repoIdx) {
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

    const rows = doc.querySelectorAll(".ProductRowLayout");
    const productsNew = processSearchRankTrackerCrawl(rows, IDX, repoIdx, keyword);

    return productsNew;

  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // Rethrow the error for the wrapper function to handle
  }
}

function getProductDescription(url) {
  return ""
  return fetch(url).then(response => {
    if (!response.ok) {
      throw new Error(`Network response was not ok, status: ${response.status}`);
    }
    return response.text();
  }).then(data => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'text/html');
    const description = doc.querySelector('.UserGeneratedContent').innerHTML;
    return description
  }).catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  })
}

async function processSearchRankTrackerCrawl(rows, idx, repoIdx, keyword) {
  let k = 1;
  let today = getCentralDate();

  rows.forEach(async productCard => {
    const productInfo = {};
    productInfo.rank = parseInt((idx - 1) * 24 + k);
    k += 1;

    const titleElement = productCard.querySelector('.ProductRowCard-module__cardTitleLink--YPqiC');
    productInfo.title = titleElement.textContent.trim();

    const sellerNameElement = productCard.querySelector('.ProductRowSellerByline-module__storeName--DZyfm');
    productInfo.sellerName = sellerNameElement.textContent.trim();

    try {
      const rating = productCard.querySelectorAll('.RatingsLabel-module__ratingsLabel--lMWgy')[0].innerText.split(" ")[0]
      productInfo.rating = parseFloat(rating);

    }
    catch (err) {
      const rating = "0";
      productInfo.rating = parseFloat(rating);
    }


    try {
      const priceElement = productCard.querySelector('.ProductPrice-module__stackedPriceContainer--Jx2F6');
      productInfo.price = priceElement.innerText.split(" ")
      productInfo.price = productInfo.price[productInfo.price.length - 1].replace("$", "");
      productInfo.price = parseFloat(productInfo.price);
    }
    catch (err) {
      productInfo.price = 0;
    }

    try {
      const ratingElement = productCard.querySelector('.RatingsLabel-module__totalReviews--Roe3y');
      ratingCount = ratingElement.textContent.trim();
      ratingCount = ratingCount.replace(/[^.K0-9$]/g, "");
      if (ratingCount.includes("K")) {
        ratingCount = ratingCount.replace("K", "");
        ratingCount = parseFloat(ratingCount);
        ratingCount = ratingCount * 1000;
      }
      ratingCount = parseInt(ratingCount);
      productInfo.ratingCount = ratingCount;
    }
    catch (err) {
      const ratingCount = 0;
      productInfo.ratingCount = ratingCount;
    }

    let url = productCard.querySelector('.ProductRowCard-module__linkArea--aCqXC').href;
    let UrlSplit = url.split("-");
    let id = UrlSplit[UrlSplit.length - 1];

    productInfo.url = url;
    productInfo.id = id;
    productInfo.description = "";

    globalTrackerRepo[repoIdx].push(productInfo);


    if (globalTrackerRepo[repoIdx].length == 120) {
      console.log("finished crawling")
      console.log(globalTrackerRepo[repoIdx])

      let today = getCentralDate();

      chrome.storage.local.get(function (result) {
        if (result.trackerRepo && result.trackerRepo[repoIdx] && result.trackerRepo[repoIdx].lastUpdated) {

          let lastUpdated = result.trackerRepo[repoIdx].lastUpdated;
          if (today[0] == lastUpdated[0] && today[1] == lastUpdated[1] && today[2] == lastUpdated[2]) {
            console.log("same day")
            return
          }

          let trackerRepo = result.trackerRepo
          let updatedData = addProductChanges(trackerRepo[repoIdx].data, globalTrackerRepo[repoIdx])

          console.log(updatedData)

          trackerRepo[repoIdx].data = updatedData
          trackerRepo[repoIdx].lastUpdated = today
          trackerRepo[repoIdx].keyword = keyword

          chrome.storage.local.set({ trackerRepo: trackerRepo });
        }
        else {
          for (let i = 0; i < globalTrackerRepo[repoIdx].length; i++) {
            globalTrackerRepo[repoIdx][i].price = [[today, globalTrackerRepo[repoIdx][i].price]];
            globalTrackerRepo[repoIdx][i].rating = [[today, globalTrackerRepo[repoIdx][i].rating]];
            globalTrackerRepo[repoIdx][i].ratingCount = [[today, globalTrackerRepo[repoIdx][i].ratingCount]];
            globalTrackerRepo[repoIdx][i].rank = [[today, globalTrackerRepo[repoIdx][i].rank]];
          }

          if (result.trackerRepo) {
            trackerRepo = result.trackerRepo
            trackerRepo[repoIdx].data = globalTrackerRepo[repoIdx]
            trackerRepo[repoIdx].lastUpdated = today
            trackerRepo[repoIdx].keyword = keyword

            chrome.storage.local.set({ trackerRepo: trackerRepo });
          }
          else {
            let trackerRepo = [{}, {}, {}, {}, {}]
            trackerRepo[repoIdx] = {}
            trackerRepo[repoIdx].data = globalTrackerRepo[repoIdx]
            trackerRepo[repoIdx].lastUpdated = today
            trackerRepo[repoIdx].keyword = keyword

            chrome.storage.local.set({ trackerRepo: trackerRepo });
          }

        }
      })

    }
  });
  return
}


function addProductChanges(productsOld, productsNew) {
  let today = getCentralDate();
  let products = []

  console.log(productsOld, productsNew)

  // generate set of ids for old products
  let oldIds = new Set();
  for (let i = 0; i < productsOld.length; i++) {
    let productOld = productsOld[i];
    oldIds.add(productOld.id);
  }
  let newIds = new Set();
  for (let i = 0; i < productsNew.length; i++) {
    let productNew = productsNew[i];
    newIds.add(productNew.id);
  }

  for (let i = 0; i < productsNew.length; i++) {
    let productNewItem = productsNew[i];
    let newProduct

    if (oldIds.has(productNewItem.id)) {
      for (let j = 0; j < productsOld.length; j++) {
        let productOld = productsOld[j];
        if (productOld.id == productNewItem.id) {
          newProduct = productOld;
          break;
        }
      }
      newProduct.price.push([today, productNewItem.price]);
      newProduct.rating.push([today, productNewItem.rating]);
      newProduct.ratingCount.push([today, productNewItem.ratingCount]);
      newProduct.rank.push([today, productNewItem.rank]);

      // if length>30, remove first element
      if (newProduct.price.length > 30) {
        newProduct.price.shift();
        newProduct.rating.shift();
        newProduct.ratingCount.shift();
        newProduct.rank.shift();
      }
    }
    else {
      newProduct = productNewItem;
      newProduct.price = [[today, newProduct.price]];
      newProduct.rating = [[today, newProduct.rating]];
      newProduct.ratingCount = [[today, newProduct.ratingCount]];
      newProduct.rank = [[today, newProduct.rank]];
    }
    products.push(newProduct);
  }

  return products
}


function addSearchRankTrackerResult(repoIdx) {
  if (!TRACKER_ACTIVE) {
    return
  }
  if (document.querySelector('.trackerTable')) {
    document.querySelector('.trackerTable').remove()
  }
  if (document.querySelector('.selectedKeywordBar')) {
    document.querySelector('.selectedKeywordBar').remove()
  }

  let trackerTabWrapper = document.querySelector('.trackerTabWrapper');
  let topMoversWrapper = document.querySelector('.topMoversWrapper');

  let selectedKeywordBar = document.createElement('div');
  selectedKeywordBar.className = 'row m-2 selectedKeywordBar'; // Bootstrap row

  let showAllButton = document.createElement('button');
  showAllButton.style = "font-size: 0.8rem;"
  showAllButton.className = 'col-2 btn btn-primary rounded-0 border'; // Added Bootstrap classes for styling
  showAllButton.innerHTML = '<span class="btn-label showAllButtonLabel"><i class="fa fa-refresh" aria-hidden="true"></i> Show All</span>';
  showAllButton.onclick = function () {
    showAllTrackerResults = !showAllTrackerResults;
    addSearchRankTrackerResult(repoIdx);

    let t1 = '<span class="showAllButtonLabel"><i class="fa fa-refresh" aria-hidden="true"></i> Show All</span>';
    let t2 = '<span class="showAllButtonLabel"><i class="fa fa-refresh" aria-hidden="true"></i> Changes only</span>';
    document.querySelector('.showAllButtonLabel').innerHTML = showAllTrackerResults ? t2 : t1;
  }

  let removeButton = document.createElement('button');
  removeButton.style = "margin-left: 10px; font-size: 0.8rem;"
  removeButton.className = 'col-2 btn btn-danger rounded-0 border'; // Added Bootstrap classes for styling
  removeButton.innerHTML = '<span class="btn-label"><i class="fa fa-trash" aria-hidden="true"></i> Remove</span>';
  removeButton.onclick = function () {
    // get confirmation
    let confirmation = confirm("Are you sure you want to remove this tracker? This will remove all data associated with this tracker. This action cannot be undone.");

    if (!confirmation) {
      return
    }
    chrome.storage.local.get(function (result) {
      if (result.trackerRepo) {
        let trackerRepo = result.trackerRepo
        trackerRepo[repoIdx] = {}
        chrome.storage.local.set({ trackerRepo: trackerRepo });
      }
    })
    trackerKeywords[repoIdx] = ""
    globalTrackerRepo[repoIdx] = []

    chrome.storage.sync.set({ trackerKeywords: trackerKeywords });
    if (document.querySelector('.trackerTable')) {
      document.querySelector('.trackerTable').remove()
    }
  }

  let trackerTable = document.createElement('div');
  trackerTable.className = 'row m-2 trackerTable'; // Bootstrap row

  selectedKeywordBar.appendChild(showAllButton);
  selectedKeywordBar.appendChild(removeButton);

  topMoversWrapper.appendChild(trackerTable);

  trackerTabWrapper.appendChild(topMoversWrapper);
  trackerTabWrapper.appendChild(selectedKeywordBar);

  addTrackerTableFromRepo(repoIdx);
}


let sellers = []

function addTrackerTableHeader() {
  let trackerTable = document.querySelector('.trackerTable');

  if (!trackerTable) {
    return
  }

  let trackerTableHeader = document.createElement('div');
  trackerTableHeader.className = 'row m-2 mb-4 trackerTableHeader'; // Bootstrap row

  const changesColumn = document.createElement('div');
  changesColumn.className = 'col-md-1';
  changesColumn.innerHTML = '<b data-toggle="tooltip" data-placement="top" title="Indicates the d/d change in search rank. Shows &quot;New&quot; if the product appeared in the 120 for the first time.">Change</b>';
  // add question mark icon with tooltip

  const rankColumn = document.createElement('div');
  rankColumn.className = 'col-md-1';
  rankColumn.innerHTML = '<b>Rank</b>';

  const priceColumn = document.createElement('div');
  priceColumn.className = 'col-md-1';
  priceColumn.innerHTML = '<b>Price</b>';

  const titleColumn = document.createElement('div');
  titleColumn.className = 'col-md-5';
  titleColumn.innerHTML = '<b>Title</b>';

  const sellerColumn = document.createElement('div');
  sellerColumn.className = 'col-md-2';
  sellerColumn.innerHTML = '<b>Seller </b>';

  function toggleSellerDropdown() {
    if (sellerDropdown.style.display === 'block') {
      resetTrackerTableSellerFilter()
      sellerDropdown.style.display = 'none';
    }
    else {
      sellerDropdown.style.display = 'block';
    }
  }

  const filterIcon = document.createElement('i');
  filterIcon.className = 'fas fa-filter';
  filterIcon.style.cursor = 'pointer';
  filterIcon.addEventListener('click', toggleSellerDropdown);

  const sellerDropdown = document.createElement('select');
  sellerDropdown.className = 'form-select form-select-sm sellerDropdown';
  sellerDropdown.style.display = 'none';

  sellerDropdown.addEventListener('change', filterTrackerTableBySeller);

  sellerColumn.appendChild(filterIcon);
  sellerColumn.appendChild(sellerDropdown);

  const showDetailsColumn = document.createElement('div');
  showDetailsColumn.className = 'col-md-1';
  showDetailsColumn.innerHTML = '<b>Details</b>'

  trackerTableHeader.appendChild(changesColumn);
  trackerTableHeader.appendChild(rankColumn);
  trackerTableHeader.appendChild(priceColumn);
  trackerTableHeader.appendChild(titleColumn);
  trackerTableHeader.appendChild(sellerColumn);
  trackerTableHeader.appendChild(showDetailsColumn);

  trackerTable.appendChild(trackerTableHeader);
}


function filterTrackerTableBySeller() {
  const sellerDropdown = document.querySelector('.sellerDropdown');
  const table = document.querySelector('.trackerTable');

  const selectedSellers = Array.from(sellerDropdown.selectedOptions).map(option => option.value);

  const rows = table.querySelectorAll('.trackerTableRow');

  for (const row of rows) {
    const sellerCell = row.querySelector('.seller-col'); // Replace with your actual class for the seller cell

    if (sellerCell) {
      const seller = sellerCell.textContent.trim();
      const shouldBeVisible = selectedSellers.length === 0 || selectedSellers.includes(seller);
      row.style.display = shouldBeVisible ? '' : 'none';
    }
  }
}

function resetTrackerTableSellerFilter() {
  const sellerDropdown = document.querySelector('.sellerDropdown');
  sellerDropdown.value = '';
  filterTrackerTableBySeller();
}

function addTrackerTableFromRepo(repoIdx) {
  chrome.storage.local.get(function (result) {
    if (result.trackerRepo && result.trackerRepo[repoIdx]) {
      let trackerRepo = result.trackerRepo[repoIdx].data;

      trackerRepo.sort((a, b) => (a.rank[a.rank.length - 1][1] > b.rank[b.rank.length - 1][1]) ? 1 : ((b.rank[b.rank.length - 1][1] > a.rank[a.rank.length - 1][1]) ? -1 : 0));

      console.log(trackerRepo)
      addTrackerTableContent(trackerRepo);
    }
  })
}

function addTrackerTableContent(products) {
  let trackerTabWrapper = document.querySelector('.trackerTabWrapper');
  let trackerTable = document.querySelector('.trackerTable');

  if (document.querySelector('.trackerTable')) {
    document.querySelector('.trackerTable').innerHTML = '';
  }
  addTrackerTableHeader();

  sellers = []

  products.forEach(product => {
    let trackerTableRow = document.createElement('div');
    trackerTableRow.className = 'row m-2 trackerTableRow d' + product.id; // Bootstrap row

    const changesColumn = document.createElement('div');
    changesColumn.className = 'col-md-1 border-top'; // Bootstrap column for rank
    changesColumn.style = "font-size: 0.9rem;"

    let rankChange
    if (product.rank.length > 1) {
      rankChange = product.rank[product.rank.length - 2][1] - product.rank[product.rank.length - 1][1] // POSITIVE = UP, NEGATIVE = DOWN
    }
    else {
      rankChange = 0
    }

    if (!showAllTrackerResults && rankChange == 0 && product.rank.length > 1) {
      return
    }
    else if (!showAllTrackerResults && rankChange == 0 && product.rank.length == 1) {
      rankChange = "NEW"
    }

    if (rankChange > 0) {
      rankChange = "+" + rankChange;
      changesColumn.innerHTML = '<i class="fa-solid fa-arrow-up" style="color: green;"></i>' + " " + rankChange
    }
    else if (rankChange < 0) {
      changesColumn.innerHTML = '<i class="fa-solid fa-arrow-down" style="color: red;"></i>' + " " + rankChange
    }
    else {
      changesColumn.innerHTML = '<i class="fa-solid fa-arrow-right" style="color: black;"></i>' + " " + rankChange
    }

    const rankColumn = document.createElement('div');
    rankColumn.className = 'col-md-1 border-top'; // Bootstrap column for empty space
    rankColumn.innerHTML = product.rank[product.rank.length - 1][1]
    rankColumn.style = "font-size: 0.9rem;"

    const titleColumn = document.createElement('div');
    titleColumn.className = 'col-md-5 border-top'; // Bootstrap column for 'Visit Store'
    titleColumn.innerHTML = '<a href=' + product.url + ' target="_blank" rel="noopener noreferrer">' + product.title + ' <i class="fa fa-external-link" style="font-size: 0.6em;" aria-hidden="true"></i>' + '</a>';
    titleColumn.style = "font-size: 0.9rem;"

    const priceColumn = document.createElement('div');
    priceColumn.className = 'col-md-1 border-top'; // Bootstrap column for 'Visit Store'
    priceColumn.innerHTML = '$' + product.price[product.price.length - 1][1]
    priceColumn.style = "font-size: 0.9rem;"

    const sellerColumn = document.createElement('div');
    sellerColumn.className = 'col-md-2 seller-col border-top'; // Bootstrap column for 'Visit Store'
    sellerColumn.innerHTML = product.sellerName
    sellerColumn.style = "font-size: 0.9rem;"

    if (!sellers.includes(product.sellerName)) {
      sellers.push(product.sellerName)
    }

    const showDetailsColumn = document.createElement('div');
    showDetailsColumn.className = 'col-md-1 border-top'; // Bootstrap column for 'Visit Store'
    showDetailsColumn.innerHTML = '<i class="fa-solid fa-chevron-down"></i>'
    showDetailsColumn.onclick = function () {
      showTrackerProductDetails(product);
    }

    trackerTableRow.appendChild(changesColumn);
    trackerTableRow.appendChild(rankColumn);
    trackerTableRow.appendChild(priceColumn);
    trackerTableRow.appendChild(titleColumn);
    trackerTableRow.appendChild(sellerColumn);
    trackerTableRow.appendChild(showDetailsColumn);

    trackerTable.appendChild(trackerTableRow);
  })
  let sellerDropdown = document.querySelector('.sellerDropdown');

  sellers.sort((a, b) => a.localeCompare(b));
  sellers.forEach((seller) => {
    const option = document.createElement('option');
    option.value = seller;
    option.text = seller;
    sellerDropdown.appendChild(option);
  });


  trackerTabWrapper.appendChild(trackerTable);
}


function showTrackerProductDetails(product) {

  // if div already exists, remove it
  console.log('chartDiv' + product.id)
  if (document.querySelector('.chartDiv' + product.id)) {
    document.querySelector('.chartDiv' + product.id).remove();
    return;
  }
  let insertDiv = document.querySelector('.d' + product.id);

  let chartDiv = document.createElement('div');
  chartDiv.className = 'row chartDiv' + product.id;
  chartDiv.style = "margin-bottom: 50px; margin-top: 20px; margin-left: -40px;" // border: 1px solid lightgray; border-radius: 5px;

  // Header 
  leftHeader = document.createElement('div');
  leftHeader.style = 'color: gray;';
  leftHeader.className = 'col-6';
  leftHeader.innerHTML = '<h5>Search Rank History</h5>';

  rightHeader = document.createElement('div');
  rightHeader.className = 'col-6';
  rightHeader.style = 'color: gray;';
  rightHeader.innerHTML = '<h5>Price History</h5>';

  chartDiv.appendChild(leftHeader);
  chartDiv.appendChild(rightHeader);


  // create ctx for chart js and insert it
  let rankctx = document.createElement('canvas');
  rankctx.id = 'rankChart' + product.id;
  rankctx.className = 'col-6';
  rankctx.height = 230;

  let productctx = document.createElement('canvas');
  productctx.id = 'productChart' + product.id;
  productctx.className = 'col-6';
  productctx.height = 230;

  chartDiv.appendChild(rankctx);
  chartDiv.appendChild(productctx);
  insertDiv.appendChild(chartDiv);

  // create rank history chart
  let rankHistory = product.rank
  let rankHistoryDates = []
  let rankHistoryValues = []
  rankHistory.forEach(rank => {
    rankHistoryDates.push(rank[0]);
    rankHistoryValues.push(rank[1]);
  })

  let rankHistoryChart = new Chart(rankctx, {
    type: 'line',
    data: {
      labels: rankHistoryDates,
      datasets: [{
        label: 'Rank',
        data: rankHistoryValues,
      }]
    },
    options: {
      responsive: false,
      devicePixelRatio: 4,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          reverse: true
        }
      }
    }
  });

  // create price history chart
  let priceHistory = product.price
  let priceHistoryDates = []
  let priceHistoryValues = []
  priceHistory.forEach(price => {
    priceHistoryDates.push(price[0]);
    priceHistoryValues.push(price[1]);
  })

  let priceHistoryChart = new Chart(productctx, {
    type: 'line',
    data: {
      labels: priceHistoryDates,
      datasets: [{
        label: 'Price',
        data: priceHistoryValues,
      }]
    },
    options: {
      responsive: false,
      devicePixelRatio: 4,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });


}


function getComeBackTomorrowMessage() {
  let message = document.createElement('div');
  message.className = 'col-12 m-2 comeBackTomorrowMessage';
  message.innerHTML = '<h5>Check back tomorrow for updated search rank data.</h5>';
  return message;
}

function getFoundDataMessage() {
  let message = document.createElement('div');
  message.className = 'col-12 m-2 foundDataMessage';
  message.innerHTML = '<h5>Found historic data for this keyword.</h5>';
  return message;
}


async function addTrackerSelectorBar() {
  let trackerTabWrapper = document.querySelector('.trackerTabWrapper');

  let topMoversWrapper = document.createElement('div');
  topMoversWrapper.className = 'row m-1 topMoversWrapper';

  let comeBackTomorrowMessage = getComeBackTomorrowMessage();
  let foundDataMessage = getFoundDataMessage();

  let k1 = document.createElement('button');
  k1.className = 'col-2 btn btn-primary mx-1 k1'; // Added Bootstrap classes for styling
  k1.style.border = "1px solid silver";
  k1.style.borderRadius = "2px";
  k1.innerHTML = trackerKeywords[0] ? trackerKeywords[0] : 'Add Keyword';
  k1.style.color = k1.innerHTML == 'Add Keyword' ? 'green' : 'black';
  k1.style.fontWeight = k1.innerHTML == 'Add Keyword' ? 'bold' : 'normal';
  k1.style.fontSize = "0.8rem"
  k1.onclick = function () {
    k1.style.border = "3px solid green";
    k2.style.border = "1px solid silver";
    k3.style.border = "1px solid silver";
    k4.style.border = "1px solid silver";
    k5.style.border = "1px solid silver";

    if (!trackerKeywords[0]) {
      var newKeyword = prompt("Enter a keyword to track:", "");
      if (!newKeyword) {
        return
      }
      newKeyword = newKeyword.toLowerCase();
      k1.innerHTML = newKeyword;
      checkTrackerSearchinRTDB(newKeyword).then((data) => {

        console.log(data)
        // check if data empty
        if (!data.length && !document.querySelector("comeBackTomorrowMessage")) {
          topMoversWrapper.appendChild(comeBackTomorrowMessage);
        }
        else if (data.length && !document.querySelector("foundDataMessage")) {
          topMoversWrapper.appendChild(foundDataMessage);
          globalTrackerRepo[0] = data;
          chrome.storage.local.get(function (result) {
            if (result.trackerRepo && result.trackerRepo[0]) {
              let trackerRepo = result.trackerRepo
              trackerRepo[0].data = globalTrackerRepo[0]
              chrome.storage.local.set({ trackerRepo: trackerRepo });
            }
            else {
              let trackerRepo = [{}, {}, {}, {}, {}]
              trackerRepo[0] = {}
              trackerRepo[0].data = globalTrackerRepo[0]
              chrome.storage.local.set({ trackerRepo: trackerRepo });
            }
          })
        }

        searchRankTrackerCrawlWrapper(newKeyword, 5, 0).then(() => {
          chrome.storage.sync.get(function (result) {
            let syncTrackerKeywords = result.trackerKeywords ? result.trackerKeywords : ["", "", "", "", ""];
            syncTrackerKeywords[0] = newKeyword;
            trackerKeywords = syncTrackerKeywords;
            chrome.storage.sync.set({ trackerKeywords: syncTrackerKeywords });
          })
          addSearchRankTrackerResult(0)
        })
      })
    }
    // if keyword already exists, show results
    else {
      addSearchRankTrackerResult(0);
    }
  }

  let k2 = document.createElement('button');
  k2.className = 'col-2 btn btn-primary mx-1 k2'; // Added Bootstrap classes for styling
  k2.style.border = "1px solid silver";
  k2.style.borderRadius = "2px";
  k2.innerHTML = trackerKeywords[1] ? trackerKeywords[1] : 'Add Keyword';
  k2.style.color = k2.innerHTML == 'Add Keyword' ? 'green' : 'black';
  k2.style.fontWeight = k2.innerHTML == 'Add Keyword' ? 'bold' : 'normal';
  k2.style.fontSize = "0.8rem"
  k2.onclick = function () {
    k2.style.border = "3px solid green";
    k1.style.border = "1px solid silver";
    k3.style.border = "1px solid silver";
    k4.style.border = "1px solid silver";
    k5.style.border = "1px solid silver";

    if (!trackerKeywords[1]) {
      var newKeyword = prompt("Enter a keyword to track:", "");
      if (!newKeyword) {
        return
      }
      newKeyword = newKeyword.toLowerCase();
      k2.innerHTML = newKeyword;
      checkTrackerSearchinRTDB(newKeyword).then((data) => {
        console.log(data)
        // check if data empty
        if (!data.length && !document.querySelector("comeBackTomorrowMessage")) {
          topMoversWrapper.appendChild(comeBackTomorrowMessage);
        }
        else if (data.length && !document.querySelector("foundDataMessage")) {
          topMoversWrapper.appendChild(foundDataMessage);
          globalTrackerRepo[1] = data;
        }

        searchRankTrackerCrawlWrapper(newKeyword, 5, 1).then(() => {
          chrome.storage.sync.get(function (result) {
            let syncTrackerKeywords = result.trackerKeywords ? result.trackerKeywords : ["", "", "", "", ""];
            syncTrackerKeywords[1] = newKeyword;
            trackerKeywords = syncTrackerKeywords;
            chrome.storage.sync.set({ trackerKeywords: syncTrackerKeywords });
          })
          addSearchRankTrackerResult(1)
        })
      })
    }
    // if keyword already exists, show results
    else {
      addSearchRankTrackerResult(1);
    }
  }

  let k3 = document.createElement('button');
  k3.className = 'col-2 btn btn-primary mx-1 k3'; // Added Bootstrap classes for styling
  k3.style.border = "1px solid silver";
  k3.style.borderRadius = "2px";
  k3.innerHTML = trackerKeywords[2] ? trackerKeywords[2] : 'Add Keyword';
  k3.style.color = k3.innerHTML == 'Add Keyword' ? 'green' : 'black';
  k3.style.fontWeight = k3.innerHTML == 'Add Keyword' ? 'bold' : 'normal';
  k3.style.fontSize = "0.8rem"
  k3.onclick = function () {
    k3.style.border = "3px solid green";
    k2.style.border = "1px solid silver";
    k1.style.border = "1px solid silver";
    k4.style.border = "1px solid silver";
    k5.style.border = "1px solid silver";

    if (!trackerKeywords[2]) {
      var newKeyword = prompt("Enter a keyword to track:", "");
      if (!newKeyword) {
        return
      }
      newKeyword = newKeyword.toLowerCase();
      k3.innerHTML = newKeyword;
      checkTrackerSearchinRTDB(newKeyword).then((data) => {
        console.log(data)
        // check if data empty
        if (!data.length && !document.querySelector("comeBackTomorrowMessage")) {
          topMoversWrapper.appendChild(comeBackTomorrowMessage);
        }
        else if (data.length && !document.querySelector("foundDataMessage")) {
          topMoversWrapper.appendChild(foundDataMessage);
          globalTrackerRepo[2] = data;
        }

        searchRankTrackerCrawlWrapper(newKeyword, 5, 2).then(() => {
          chrome.storage.sync.get(function (result) {
            let syncTrackerKeywords = result.trackerKeywords ? result.trackerKeywords : ["", "", "", "", ""];
            syncTrackerKeywords[2] = newKeyword;
            trackerKeywords = syncTrackerKeywords;
            chrome.storage.sync.set({ trackerKeywords: syncTrackerKeywords });
          })
          addSearchRankTrackerResult(2)
        })
      })
    }
    // if keyword already exists, show results
    else {
      addSearchRankTrackerResult(2);
    }
  }

  let k4 = document.createElement('button');
  k4.className = 'col-2 btn btn-primary mx-1 k4'; // Added Bootstrap classes for styling
  k4.style.border = "1px solid silver";
  k4.style.borderRadius = "2px";
  k4.innerHTML = trackerKeywords[3] ? trackerKeywords[3] : 'Add Keyword';
  k4.style.color = k4.innerHTML == 'Add Keyword' ? 'green' : 'black';
  k4.style.fontWeight = k4.innerHTML == 'Add Keyword' ? 'bold' : 'normal';
  k4.style.fontSize = "0.8rem"
  k4.onclick = function () {
    k4.style.border = "3px solid green";
    k2.style.border = "1px solid silver";
    k3.style.border = "1px solid silver";
    k1.style.border = "1px solid silver";
    k5.style.border = "1px solid silver";

    if (!trackerKeywords[3]) {
      var newKeyword = prompt("Enter a keyword to track:", "");
      if (!newKeyword) {
        return
      }
      newKeyword = newKeyword.toLowerCase();
      k4.innerHTML = newKeyword;
      checkTrackerSearchinRTDB(newKeyword).then((data) => {
        console.log(data)
        // check if data empty
        if (!data.length && !document.querySelector("comeBackTomorrowMessage")) {
          topMoversWrapper.appendChild(comeBackTomorrowMessage);
        }
        else if (data.length && !document.querySelector("foundDataMessage")) {
          topMoversWrapper.appendChild(foundDataMessage);
          globalTrackerRepo[3] = data;
        }

        searchRankTrackerCrawlWrapper(newKeyword, 5, 3).then(() => {
          chrome.storage.sync.get(function (result) {
            let syncTrackerKeywords = result.trackerKeywords ? result.trackerKeywords : ["", "", "", "", ""];
            syncTrackerKeywords[3] = newKeyword;
            trackerKeywords = syncTrackerKeywords;
            chrome.storage.sync.set({ trackerKeywords: syncTrackerKeywords });
          })
          addSearchRankTrackerResult(3)
        })
      })
    }
    // if keyword already exists, show results
    else {
      addSearchRankTrackerResult(3);
    }
  }

  let k5 = document.createElement('button');
  k5.className = 'col-2 btn btn-primary mx-1 k5'; // Added Bootstrap classes for styling
  k5.style.border = "1px solid silver";
  k5.style.borderRadius = "2px";
  k5.innerHTML = trackerKeywords[4] ? trackerKeywords[4] : 'Add Keyword';
  k5.style.color = k5.innerHTML == 'Add Keyword' ? 'green' : 'black';
  k5.style.fontWeight = k5.innerHTML == 'Add Keyword' ? 'bold' : 'normal';
  k5.style.fontSize = "0.8rem"
  k5.onclick = function () {
    k5.style.border = "3px solid green";
    k2.style.border = "1px solid silver";
    k3.style.border = "1px solid silver";
    k4.style.border = "1px solid silver";
    k1.style.border = "1px solid silver";

    if (!trackerKeywords[4]) {
      var newKeyword = prompt("Enter a keyword to track:", "");
      if (!newKeyword) {
        return
      }
      newKeyword = newKeyword.toLowerCase();
      k5.innerHTML = newKeyword;
      checkTrackerSearchinRTDB(newKeyword).then((data) => {
        console.log(data)
        // check if data empty
        if (!data.length && !document.querySelector("comeBackTomorrowMessage")) {
          topMoversWrapper.appendChild(comeBackTomorrowMessage);
        }
        else if (data.length && !document.querySelector("foundDataMessage")) {
          topMoversWrapper.appendChild(foundDataMessage);
          globalTrackerRepo[4] = data;
        }

        searchRankTrackerCrawlWrapper(newKeyword, 5, 4).then(() => {
          chrome.storage.sync.get(function (result) {
            let syncTrackerKeywords = result.trackerKeywords ? result.trackerKeywords : ["", "", "", "", ""];
            syncTrackerKeywords[4] = newKeyword;
            trackerKeywords = syncTrackerKeywords;
            chrome.storage.sync.set({ trackerKeywords: syncTrackerKeywords });
          })
          addSearchRankTrackerResult(4)
        })
      })
    }
    // if keyword already exists, show results
    else {
      addSearchRankTrackerResult(4);
    }
  }



  topMoversWrapper.appendChild(k1);
  topMoversWrapper.appendChild(k2);
  topMoversWrapper.appendChild(k3);
  topMoversWrapper.appendChild(k4);
  topMoversWrapper.appendChild(k5);

  if (!ISPREMIUM) {
    [k2, k3, k4, k5].forEach(button => {
      // add a blur effect to the button
      button.style.filter = 'blur(2px)';
      button.onclick = function () {

        // if premiumUpgradeRow exists, return
        if (document.querySelector('.premiumUpgradeRow')) {
          return;
        }

        // add premium upgrade row
        const premiumUpgradeRow = document.createElement('div');
        premiumUpgradeRow.className = 'row m-2 premiumUpgradeRow'; // Bootstrap row
        premiumUpgradeRow.innerHTML = '<div class="col-12 text-center"><a href="https://tptinformer.com/" target="_blank" rel="noopener noreferrer"><u>Upgrade</u></a> to premium to track more search results.</div>';

        // add premiumUpgradeRow to the topMoversWrapper
        topMoversWrapper.appendChild(premiumUpgradeRow);
      }

    });
  }
  trackerTabWrapper.appendChild(topMoversWrapper);
}



async function checkTrackerSearchinRTDB(keyword) {
  let queryKeword = keyword.replace(/ /g, '%2520');
  url = "https://tpt-informer-default-rtdb.firebaseio.com/searchRank/" + queryKeword + ".json"

  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok, status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(data)

      /*
      bring data to the format of globalTrackerRepo:
      [
        {
          price: [[date, price], [date, price], ...],
          rating: [[date, rating], [date, rating], ...],
          ratingCount: [[date, ratingCount], [date, ratingCount], ...],
          rank: [[date, rank], [date, rank], ...],
          title: title,
          sellerName: sellerName,
          url: url,
          id: id
        }
      ]
      */

      let formattedData = {}
      let products = []
      for (let key in data) {
        let product = data[key];
        let newProduct = {
          price: [],
          rating: [],
          ratingCount: [],
          rank: [],
          title: product.title,
          sellerName: product.sellerName,
          url: product.url,
          id: key
        }

        Object.keys(product.history).forEach(date => {
          let curr_history = product.history[date]
          newProduct.price.push([date, curr_history.price])
          //formattedProduct.rating.push([date, history.rating])
          //formattedProduct.ratingCount.push([date, history.ratingCount])
          newProduct.rank.push([date, curr_history.rank])
        })

        products.push(newProduct)
      }
      formattedData.data = products
      formattedData.keyword = keyword


      //formattedData.lastUpdated = mostRecentDate

      return formattedData
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    })
}