var loggedStatus=!1;function updateBadge(t){"logout"===t?(loggedStatus=!1,chrome.action.setIcon({path:"images/icon32_bw.png"}),chrome.action.setBadgeText({text:"0"}),chrome.action.setBadgeBackgroundColor({color:[160,160,160,1]})):(loggedStatus=!0,chrome.action.setIcon({path:"images/icon32.png"}),chrome.action.setBadgeBackgroundColor({color:[19,93,145,1]}),chrome.action.setBadgeText({text:""+t}))}async function retrieveSales(){chrome.storage.sync.get(function(t){let e=t.prev;console.log("prev",e)}),chrome.storage.sync.get(function(t){let e=t.currDate,a=getTodaysDate();console.log(e,a,e[0]!=a[0],e[1]!=a[1],e[2]!=a[2]),(e[0]!=a[0]||e[1]!=a[1]||e[2]!=a[2])&&(chrome.storage.sync.set({prev:0}),chrome.storage.sync.set({crawlCount:0}),chrome.storage.sync.set({currDate:a}),updateBadge(0..toString()))});fetch(getUrl()).then(t=>{if(!t.redirected)return t.text();updateBadge("logout"),resolve(!1)}).then(t=>{var e=parseInt(getSalesCount(t.replace(/<[^>]+>/g,"")));isNaN(e)&&(e=0),chrome.storage.sync.get(function(t){let a=t.prev;console.log(a,e),e>a&&(chrome.storage.sync.get(function(t){t.soundOn&&createSaleSoundHtml()}),chrome.storage.sync.set({prev:e}),chrome.storage.sync.set({hasChanges:!0}),updateBadge(e.toString()))})})}function getSalesCount(t){let e=t.split("Showing ").pop().split(" results")[0];return e.substring(e.indexOf("f")+2)}function getUrl(){var t=getTodaysDate();let e=t[0],a=t[1],s=t[2];return"https://www.teacherspayteachers.com/My-Sales?source=Overall&start_date="+e+"%2F"+a+"%2F"+s+"&end_date="+e+"%2F"+a+"%2F"+s}function getTodaysDate(){var t=new Date,e=String(t.getDate()).padStart(2,"0"),a=String(t.getMonth()+1).padStart(2,"0"),s=t.getFullYear();let o=[];return o.push(a),o.push(e),o.push(s),o}async function updateProductStats(){fetch(url="https://www.teacherspayteachers.com/items/download_items_stats").then(t=>{if(!t.ok)throw Error(`Network response was not ok, status: ${t.status}`);return t.text()}).then(t=>{new Promise((e,a)=>{let s=t.split("\n"),o=s[0].split(","),n=[];for(let r=1;r<s.length;r++){let c=s[r],g=c.split(",");if(g.length===o.length){let l={};for(let u=0;u<o.length;u++)l[o[u]]=g[u];n.push(l)}}e(n)}).then(t=>(chrome.storage.local.set({productStats:t}),t)).catch(t=>{console.error("Error parsing CSV:",t)})}).catch(t=>{console.error("Error fetching CSV:",t)})}function createSaleSoundHtml(){console.log("creating sale sound html"),chrome.offscreen.createDocument({url:chrome.runtime.getURL("audio.html"),reasons:["AUDIO_PLAYBACK"],justification:"Sale notification"}),setTimeout(()=>{chrome.offscreen.closeDocument()},3e3)}chrome.runtime.onMessage.addListener(function(t,e,a){"updateBadge"===t.id&&(console.log("msg received"),retrieveSales())}),chrome.runtime.onMessage.addListener(function(t,e,a){"logoutBadge"===t.id&&(updateBadge("logout"),a({farewell:"Badge updated"}))}),chrome.runtime.onMessage.addListener(function(t,e,a){"updateProductStats"===t.id&&new Promise((t,e)=>{updateProductStats(),t(!0)}).then(t=>{console.log("product stats updated"),a({farewell:"Product Stats updated"})}).catch(t=>{console.error("Error updating product stats:",t)})}),chrome.runtime.onInstalled.addListener(function(t){chrome.storage.sync.set({soundOn:!0}),chrome.storage.sync.set({prev:0}),chrome.storage.sync.set({currDate:getTodaysDate()}),chrome.storage.sync.set({crawlCount:0}),chrome.storage.sync.set({lastPopDate:[-1,-1,-1]}),chrome.storage.local.set({lastPull:[]}),chrome.action.setBadgeText({text:"0"}),chrome.action.setBadgeBackgroundColor({color:[19,93,145,1]}),chrome.alarms.create("salesAlarm",{periodInMinutes:1})}),chrome.alarms.onAlarm.addListener(t=>{retrieveSales()}),chrome.runtime.onMessage.addListener(function(t,e,a){"saleSound"===t.id&&createSaleSoundHtml()});