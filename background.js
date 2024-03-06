var loggedStatus = false;

chrome.runtime.onMessage.addListener(
  function (message, sender, sendResponse) {
    if (message.id === "updateBadge") {
      retrieveSales();
    }
  });

chrome.runtime.onMessage.addListener(
  function (message, sender, sendResponse) {
    if (message.id === "logoutBadge") {
      updateBadge("logout");
      sendResponse({ farewell: "Badge updated" });
    }
  });

chrome.runtime.onMessage.addListener(
  function (message, sender, sendResponse) {
    if (message.id === "updateProductStats") {

      new Promise((resolve, reject) => {
        updateProductStats();
        resolve(true);
      }
      )
        .then(result => {
          sendResponse({ farewell: "Product Stats updated" });
        })
        .catch(error => {
          console.error("Error updating product stats:", error);
        });
    }
  });


function updateBadge(data) {
  if (data === "logout") {
    loggedStatus = false;
    chrome.action.setIcon({ path: "images/icon32_bw.png" })
    chrome.action.setBadgeText({ text: "0" });
    chrome.action.setBadgeBackgroundColor({ color: [160, 160, 160, 1] });
  }
  else {
    loggedStatus = true;
    chrome.action.setIcon({ path: "images/icon32.png" });
    chrome.action.setBadgeBackgroundColor({ color: [19, 93, 145, 1] }); //(19, 93, 145, 1)
    chrome.action.setBadgeText({ text: ("" + data) }); //
  }
}

chrome.runtime.onInstalled.addListener(function (details) {
  chrome.storage.sync.set({ soundOn: true });

  //chrome.storage.sync.set({isPremium:false});
  chrome.storage.sync.set({ prev: 0 });
  chrome.storage.sync.set({ currDate: getTodaysDate() });
  chrome.storage.sync.set({ crawlCount: 0 });

  // TESTING
  //chrome.storage.local.clear()
  //chrome.storage.sync.clear()

  // POPUP
  chrome.storage.sync.set({ lastPopDate: [-1, -1, -1] });

  // PRODUCTS
  // chrome.storage.sync.set({productStatsLastPull : [-1,-1,-1]});

  // SALES
  //chrome.storage.sync.set({lastSyncPoint : -1});
  //chrome.storage.local.set({fullSalesMatrix: []});

  // chrome.storage.sync.set({lastCheckPoint : -1});
  // chrome.storage.sync.set({lastCheckPointIdx : -1});
  // chrome.storage.local.set({checkPointSalesMatrix: []});


  // RANKING
  //chrome.storage.sync.set({rankingLimitReachedPremium: false});
  //chrome.storage.sync.set({seenRankingStoresCount: 0});
  /*
  chrome.storage.sync.set({rankingLimitreached: false});
  chrome.storage.sync.get(function(result) {
    if (!result.rankingLastUpdated){
      chrome.storage.sync.set({rankingLastUpdated : [-1,-1,-1]});
    }
    if (!result.rankingHistory){
      chrome.storage.sync.set({rankingHistory: []});
    }
  });
  */
  chrome.storage.sync.get(function (result) {
    if (!result.rankingLastUpdated) {
      chrome.storage.sync.set({ rankingLastUpdated: [-1, -1, -1] });
    }
    if (!result.rankingHistory) {
      chrome.storage.sync.set({ rankingHistory: [] });
    }
    if (!result.bearerToken) {
      updateBearerToken();
    }
  });

  chrome.storage.local.set({ lastPull: [] });

  chrome.action.setBadgeText({ text: "0" });
  chrome.action.setBadgeBackgroundColor({ color: [19, 93, 145, 1] });
  chrome.alarms.create("salesAlarm", { periodInMinutes: 1 }); //, periodInMinutes: 0.1

});

chrome.alarms.onAlarm.addListener((alarm) => {
  retrieveSales();
});

async function retrieveSales() {
  chrome.storage.sync.get(function (result) {
    let prev = result.prev;
  });
  chrome.storage.sync.get(function (result) {
    let date = result.currDate;
    let today = getTodaysDate();

    if (date[0] != today[0] || date[1] != today[1] || date[2] != today[2]) {
      chrome.storage.sync.set({ prev: 0 });
      chrome.storage.sync.set({ crawlCount: 0 });
      chrome.storage.sync.set({ currDate: today });
      let prev = 0;
      updateBadge(prev.toString());

      if (result.store_url) {
        getRankingSearchSuggestions(result.store_url)
      }

      chrome.storage.sync.set({ rankingLimitreached: false });
      chrome.storage.sync.set({ rankingLimitReachedPremium: false });
      chrome.storage.sync.set({ seenRankingStoresCount: 0 });
    }
  });

  let url = getUrl();

  fetch(url)
    .then(response => {
      if (response.redirected) {
        updateBadge("logout");
        return "logout"
      }
      else {
        return response.text()
      }
    })
    .then(response => {

      if (response === "logout") {
        return
      }

      var strippedHtml = response.replace(/<[^>]+>/g, '');
      var count = parseInt(getSalesCount(strippedHtml));

      if (isNaN(count)) {
        count = 0;
      }

      chrome.storage.sync.get(function (result) {
        let prev = result.prev;

        if (count > prev) {

          chrome.storage.sync.get(function (result) {
            if (result.soundOn) {
              createSaleSoundHtml()
            }
          });
          chrome.storage.sync.set({ prev: count });
          chrome.storage.sync.set({ hasChanges: true });
          updateBadge(count.toString());
        }
      });
    })
}

chrome.runtime.onMessage.addListener(
  function (message, sender, sendResponse) {

    if (message.id === "writeRankingToRTDB") {
      chrome.storage.sync.get(function (result) {

        let today = getCentralDate();
        if (result.rankingLastUpdated[0] === today[0] && result.rankingLastUpdated[1] === today[1] && result.rankingLastUpdated[2] === today[2]) {
          return
        }

        let store_url = result.store_url;
        getRankingSearchSuggestions(store_url)
      });
    }
  }
);


function writeRankingToRTDB(stores, store_url) {

  for (let store in stores) {

    if (stores[store].store_url != store_url) {
      continue
    }

    let today = getCentralDate();
    let todayString = today[0] + "-" + today[1] + "-" + today[2];
    const url = 'https://updateranking-wpcxqhxyxq-uc.a.run.app/';

    const userData = {
      "name": store_url,
      "ranking": stores[store].rank,
      "date": todayString,
    };

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        chrome.storage.sync.set({ rankingLastUpdated: today });
        chrome.storage.sync.get(function (result) {
          let rankingHistory = result.rankingHistory;
          rankingHistory.push([today, stores[store].rank]);
          chrome.storage.sync.set({ rankingHistory: rankingHistory });
        });

        console.log('Ranking updated successfully.');
      })
      .catch((error) => {
        console.error(error);
      });
  }
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
      hits[store.store_name].rank = store.rank;
      hits[store.store_name].picUrl = store.thumbnail_url;
      hits[store.store_name].top_thousand = store.top_thousand;
      hits[store.store_name].store_url = store.store_url;
      hits[store.store_name].active_item_ct = store.active_item_ct;
    }

    console.log(hits)

    //writeRankingToRTDB(hits,name);

    return data
  }).catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  })
}

chrome.runtime.onMessage.addListener(
  function (message, sender, sendResponse) {
    if (message.id === "updateBearerToken") {
      updateBearerToken();
    }
  });

async function updateBearerToken() {
  let url = "https://tpt-informer-default-rtdb.firebaseio.com/bearer.json";
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok, status: ${response.status}`);
      }
      return response.json(); // Get the HTML data as text
    })
    .then(data => {
      console.log(data.token)

      chrome.storage.sync.set({ bearerToken: data.token });

      return data
    })
}


// SEARCH RANK
chrome.runtime.onMessage.addListener(
  function (message, sender, sendResponse) {

    chrome.storage.sync.get(function (result) {
      let today = getCentralDate();
      if (result.trackerRepoLastUpdated && result.trackerRepoLastUpdated[0] === today[0] && result.trackerRepoLastUpdated[1] === today[1] && result.trackerRepoLastUpdated[2] === today[2]) {
        return
      }

      if (message.id === "writeSearchRankToRTDB") {
        chrome.storage.local.get(function (result) {

          console.log(result)

          let trackerRepo = result.trackerRepo
          let formattedTrackerRepo = []

          trackerRepo.forEach(tracker =>{

            if (!tracker.data || tracker.data.length === 0){
              return
            }

            let newTracker = {}
            newTracker.keyword = tracker.keyword
            newTracker.products = []

            tracker.data.forEach(product =>{
              let newProduct = {}

              newProduct.id = product.id
              newProduct.history = {}

              for (let i = 0; i < product.price.length; i++) {
                let date = product.price[i][0]
                let dateString = date[0] + "-" + date[1] + "-" + date[2]

                newProduct.history[dateString] = {
                  "price": product.price[i][1],
                  "rank": product.rank[i][1]
                }
              }

              newProduct.sellerName = product.sellerName
              newProduct.title = product.title
              newProduct.url = product.url

              newTracker.products.push(newProduct)
            })

            formattedTrackerRepo.push(newTracker)
          })

          console.log(formattedTrackerRepo)

          writeSearchRankToRTDB(formattedTrackerRepo)
        });
      }
    });
  }
);

async function writeSearchRankToRTDB(trackerRepo) {
  trackerRepo.forEach(tracker => {
    console.log(tracker)

    fetch('https://updatesearchrank-wpcxqhxyxq-uc.a.run.app', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify({
        "keyword": tracker.keyword,
        "products": tracker.products
      })
    })
      .then(response => response.json()) // Parse the JSON response
      .then(data => console.log(data)) // Log the data
      .catch(error => console.error('Error:', error)); // Log any errors
  });
}


function getSalesCount(salesTxt) {
  let sub = salesTxt.split('Showing ').pop().split(' results')[0];
  let count = sub.substring(sub.indexOf('f') + 2);
  return count
}

function getUrl() {
  var date = getTodaysDate();
  let mm = date[0]; let dd = date[1]; let yyyy = date[2];
  var url = "https://www.teacherspayteachers.com/My-Sales?source=Overall&start_date=" + mm + "%2F" + dd + "%2F" + yyyy + "&end_date=" + mm + "%2F" + dd + "%2F" + yyyy;
  return url
}


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



async function updateProductStats() {
  url = 'https://www.teacherspayteachers.com/items/download_items_stats'
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
          chrome.storage.local.set({ productStats: parsedData });
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
  function (message, sender, sendResponse) {
    if (message.id === "saleSound") {
      createSaleSoundHtml()
    }
  });


function createSaleSoundHtml() {
  chrome.offscreen.createDocument({
    url: chrome.runtime.getURL('audio.html'),
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'Sale notification',
  })

  setTimeout(() => {
    chrome.offscreen.closeDocument()
  }, 3000);
}

