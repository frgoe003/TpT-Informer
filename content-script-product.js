let ISPREMIUM = false;
const FREE_LIMIT_TITLE = 7;
const FREE_LIMIT_DESCRIPTION = 5;
const LIMIT_TITLE = 15;
const LIMIT_DESCRIPTION = 25;

chrome.storage.sync.get(function(result) {
    if (result.isPremium){
      ISPREMIUM = true;
    }
  });
  
const description = document.querySelectorAll(".public-DraftEditor-content")[0]
const title = document.querySelectorAll(".Input")[0]
const titleWrapper = document.querySelector("#label_ItemName")

const description_wrapper = document.querySelector("#react-upload-description-editor")


function startup(){
    //document.querySelectorAll(".FormHeading")[0].style = "background-color:yellow"
    addTitleSuggestionWrapper()
    //addDescriptionWrapper()
    //addDescriptionListener()
    addTitleListener()
}

// wait 0.5 seconds before starting
setTimeout(startup, 200);


function addDescriptionWrapper(){
    const description_wrapper = document.querySelector("#react-upload-description-editor")
    
    let descriptionSuggestionWrapper = document.createElement("div")
    descriptionSuggestionWrapper.className = "description-suggestion-wrapper"

    let descriptionTitle = document.createElement("div")
    descriptionTitle.className = "description-title"
    descriptionTitle.classList.add("Text-module__strong--T7aIl")
    descriptionTitle.innerHTML = "Based on your Product Title, consider using these keywords in your description:"

    let descriptionSuggestions = document.createElement("div")
    descriptionSuggestions.className = "description-suggestions"
    descriptionSuggestions.id = "description-suggestions"

    descriptionSuggestionWrapper.appendChild(descriptionTitle)
    descriptionSuggestionWrapper.appendChild(descriptionSuggestions)

    description_wrapper.appendChild(descriptionSuggestionWrapper)
}

function addTitleSuggestionWrapper(){
    const titleWrapper = document.querySelector("#label_ItemName")
    let suggestion_wrapper = document.createElement("div")

    let suggestions = document.createElement("div")
    suggestions.className = "suggestions"
    suggestions.id = "suggestions"

    let suggestionTitle = document.createElement("div")
    suggestionTitle.className = "suggestion-title"
    suggestionTitle.style.display = "inline-flex"
    suggestionTitle.classList.add("Text-module__strong--T7aIl")
    suggestionTitle.innerHTML = "Popular search queries on TpT:"

    suggestion_wrapper.prepend(suggestionTitle)
    suggestion_wrapper.appendChild(suggestions)

    suggestion_wrapper.id = "suggestion-wrapper"
    titleWrapper.appendChild(suggestion_wrapper)
}

let seenTitleCnt = 0
let seenDescriptionCnt = 0
let seenKeywordsTitle = {}
let seenKeywordsDescription = {}

function addTitleListener() {
    const title = document.querySelectorAll(".Input")[0]

    let previousInput = ""; // Variable to store the previous input value
    title.addEventListener('input', function(evt) {

        let currentInput = evt.target.value;
        let previousKeywords = previousInput.split(" ");

        let titleWords = Array.from(removeUnsignificantWords(currentInput.split(" ")))

       
        for (let i = 0; i < titleWords.length; i++) {
            if (seenTitleCnt > LIMIT_TITLE){
                break
            }
            if (seenKeywordsTitle[titleWords[i]]){
                continue
            }

            addSuggestions(titleWords[i],"Title",false)
        }


        removeSuggestions()

        previousInput = currentInput; // Update previous input value
    }, false);
}



function addDescriptionListener() {
    const description = document.querySelectorAll(".public-DraftEditor-content")[0];

    return
    description.addEventListener('input', function(evt) {
        let currentInput = evt.target.innerText;
        var result = currentInput.split(/\s+|\n+/);

        let significantWords = removeUnsignificantWords(result);

    }, false);
}



function getAllSuggestions(){
    let kws = document.querySelectorAll(".kw-wrapper")
    let kwsAsObjects = []
    kws.forEach(kw => {
        let kwObj = {}
        kwObj.word = kw.children[0].innerHTML
        kwObj.popularity = kw.children[1].innerHTML
        kwsAsObjects.push(kwObj)
    })
    return kwsAsObjects
}


function getContinuousSubstrings(words) {
    const substrings = [];
    //remove all special characters and numbers
    words = words.map(word => {
        return word.replace(/[^a-zA-Z ]/g, "")
    })
  
    for (let i = 0; i < words.length; i++) {
      let temp = '';
      for (let j = i; j < words.length; j++) {
        temp += (temp === '' ? '' : ' ') + words[j];
        substrings.push(temp);
      }
    }
    return substrings;
}



async function addSuggestions(keyword,mode,isMultiword=false){

    let bdy = "{\"requests\":[{\"indexName\":\"Resource Suggestions\",\"params\":\"highlightPreTag=%3Cais-highlight-0000000000%3E&highlightPostTag=%3C%2Fais-highlight-0000000000%3E&hitsPerPage=5&query="+keyword+"&facets=%5B%5D&tagFilters=\"},{\"indexName\":\"Stores\",\"params\":\"highlightPreTag=%3Cais-highlight-0000000000%3E&highlightPostTag=%3C%2Fais-highlight-0000000000%3E&hitsPerPage=2&query="+keyword+"&filters=is_active%20%3D%201%20AND%20active_item_ct%20%3E%200&facets=%5B%5D&tagFilters=\"}]}"

    if (isMultiword){
        let words = keyword.split(" ")
        let query = words.join("%20")
        bdy = "{\"requests\":[{\"indexName\":\"Resource Suggestions\",\"params\":\"highlightPreTag=%3Cais-highlight-0000000000%3E&highlightPostTag=%3C%2Fais-highlight-0000000000%3E&hitsPerPage=5&query="+query+"&facets=%5B%5D&tagFilters=\"},{\"indexName\":\"Stores\",\"params\":\"highlightPreTag=%3Cais-highlight-0000000000%3E&highlightPostTag=%3C%2Fais-highlight-0000000000%3E&hitsPerPage=2&query="+query+"&filters=is_active%20%3D%201%20AND%20active_item_ct%20%3E%200&facets=%5B%5D&tagFilters=\"}]}"
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
        let stores = data[1].hits
        let kws = data[0].hits
        let meta = {
            "nbHits": data[0].nbHits,
            "hitsPerPage": data[0].hitsPerPage
        }

        if (mode == "Description"){
            let keywords = getKeywordsRaw(kws)
            seenKeywordsDescription[keyword] = []
            let parent = keyword
            keywords.forEach((kw, index) => {
                    if (!document.getElementById(keyword.query)){
                        addKeywordToDescriptionSuggestions(kw,parent)
                    }
            });
            return data
        }
        else {
            let keywords = getKeywordsRaw(kws)
            seenKeywordsTitle[keyword] = []
            let parent = keyword
            keywords.forEach((kw, index) => {
                addKeywordToTitleSuggestions(kw,parent)
            });
        }

      return data
    }).catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    })
}



function addKeywordToTitleSuggestions(keyword,parent){
    let suggestions = document.querySelector("#suggestions")
    let title = document.querySelectorAll(".Input")[0]

    if (seenTitleCnt > 15){
        return
    }
    let kw = keyword.query

    let OutWrapper;
    if (ISPREMIUM || seenTitleCnt < FREE_LIMIT_TITLE){
        OutWrapper = getKeywordSuggestionDiv(keyword,parent)
    }
    else {
        OutWrapper = getDummySuggestionDiv()
    }
    OutWrapper.classList.add("titleKeyword")


    // check if keyword is already in seenKeywords
    if (seenKeywordsTitle[parent].includes(kw)){
        return
    }
    // iterate over seenTitleKeywords and check if keyword is already added
    for (const [key, value] of Object.entries(seenKeywordsTitle)) {
        if (value.includes(kw)){
            return
        }
    }

    // check if keyword is already in title
    // get all combinations of keyword (lowercase, uppercase, first letter uppercase) and check if in title
    let keywordCombinations = []
    keywordCombinations.push(kw)
    keywordCombinations.push(kw.toLowerCase())
    keywordCombinations.push(kw.toUpperCase())
    keywordCombinations.push(kw.charAt(0).toUpperCase() + kw.slice(1))

    let titleText = title.value
    keywordCombinations.forEach(combination => {
        if (titleText.includes(combination)){
            return
        }
    })

    suggestions.appendChild(OutWrapper);
    seenTitleCnt += 1
    seenKeywordsTitle[parent].push(kw)
    
    if (seenTitleCnt > FREE_LIMIT_TITLE && !ISPREMIUM){
        if (!document.querySelector(".getPremiumRow")){
            let row = getPremiumUpgradeRow()
            let suggestion_wrapper = document.querySelector("#suggestion-wrapper")
            suggestion_wrapper.appendChild(row);
        }
    }
}


function addKeywordToDescriptionSuggestions(keyword,parent){
    const descriptionSuggestions = document.querySelector("#description-suggestions")

    if (seenDescriptionCnt > LIMIT_DESCRIPTION){
        return
    }
    if (document.getElementById(keyword.query)){
        return
    }

    let OutWrapper;
    if (ISPREMIUM || seenDescriptionCnt < FREE_LIMIT_DESCRIPTION){
        OutWrapper = getKeywordSuggestionDiv(keyword,parent)
    }
    else {
        OutWrapper = getDummySuggestionDiv()
    }

    OutWrapper.classList.add("descriptionKeyword")

    // check if keyword is already in seenKeywords
    if (seenKeywordsDescription[parent].includes(keyword)){
        return
    }

    // check if keyword is already in title
    if (title.value.includes(keyword)){
        return
    }

    descriptionSuggestions.appendChild(OutWrapper);
    seenDescriptionCnt += 1
    seenKeywordsDescription[parent].push(keyword)
}


function getKeywordSuggestionDiv(keyword,parent){
    let OutWrapper = document.createElement("div")
    OutWrapper.className = "OutWrapper"
    OutWrapper.style.display = "inline-flex";
    OutWrapper.style.paddingBottom = "5px"
    OutWrapper.style.alignItems = "center";

    let kwDivWrapper = document.createElement("div");
    kwDivWrapper.className = "kw-wrapper";
    kwDivWrapper.style.display = "inline-flex";
    kwDivWrapper.style.alignItems = "center";
    kwDivWrapper.style.backgroundColor = "#EBF5FB"; // Adjust as desired
    kwDivWrapper.style.borderRadius = "8px"; // Curved edges
    kwDivWrapper.style.padding = "8px"; // Adjust padding as needed
    kwDivWrapper.style.marginRight = "10px"; // Space between keyword wrappers

    let kwDiv = document.createElement("div");
    kwDiv.className = "kw";
    kwDiv.id = (keyword.query.split(" ")).join("_");
    kwDiv.innerHTML = keyword.query;
    kwDiv.style.marginRight = "5px"; // Space between keyword and popularity

    let kwPopularity = document.createElement("div");
    kwPopularity.className = "kw-popularity";
    kwPopularity.innerHTML = keyword.popularity;
    let popularityColor = '#ABEBC6'; // Define colors based on popularity as needed

    kwPopularity.style.backgroundColor = popularityColor;
    kwPopularity.style.borderRadius = "4px"; // Curved edges
    kwPopularity.style.padding = "4px 8px"; // Adjust padding as needed

    kwDivWrapper.appendChild(kwDiv);
    kwDivWrapper.appendChild(kwPopularity);
    kwDivWrapper.style.paddingBottom = "5px"; // Space between keyword wrappers

    OutWrapper.classList.add("kw-p-"+parent)

    OutWrapper.appendChild(kwDivWrapper)
    return OutWrapper
}

function getDummySuggestionDiv(){
    let dummyKeywords = ["dummy","NoRealKeyword","NotAKey","NotAKeyword","NotARealKeyword","NotReal","Dummy?","Dummy!","Dummy.","Dummy,","Dummy"]
    let dummyPopularityScores = [23,12,2409,212,123,12,19,99,101,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
    
    let OutWrapper = document.createElement("div")
    OutWrapper.className = "OutWrapper"
    OutWrapper.style.display = "inline-flex";
    OutWrapper.style.paddingBottom = "5px"
    OutWrapper.style.alignItems = "center";

    let kwDivWrapper = document.createElement("div");
    kwDivWrapper.className = "kw-wrapper";
    kwDivWrapper.style.display = "inline-flex";
    kwDivWrapper.style.alignItems = "center";
    kwDivWrapper.style.backgroundColor = "#EBF5FB"; // Adjust as desired
    kwDivWrapper.style.borderRadius = "8px"; // Curved edges
    kwDivWrapper.style.padding = "8px"; // Adjust padding as needed
    kwDivWrapper.style.marginRight = "10px"; // Space between keyword wrappers

    let kwDiv = document.createElement("div");
    kwDiv.className = "kw";
    let randIdx = Math.floor(Math.random() * dummyKeywords.length)
    kwDiv.id = dummyKeywords[randIdx];
    kwDiv.innerHTML = dummyKeywords[randIdx];
    kwDiv.style.marginRight = "5px"; // Space between keyword and popularity
    
    let kwPopularity = document.createElement("div");
    kwPopularity.className = "kw-popularity";
    let randIdx2 = Math.floor(Math.random() * dummyPopularityScores.length)
    kwPopularity.innerHTML = dummyPopularityScores[randIdx2];
    let popularityColor = '#ABEBC6'; // Define colors based on popularity as needed
    kwPopularity.style.backgroundColor = popularityColor;
    kwPopularity.style.borderRadius = "4px"; // Curved edges
    kwPopularity.style.padding = "4px 8px"; // Adjust padding as needed

    kwDivWrapper.appendChild(kwDiv);
    kwDivWrapper.appendChild(kwPopularity);
    kwDivWrapper.style.paddingBottom = "5px"; // Space between keyword wrappers

    OutWrapper.appendChild(kwDivWrapper)
    OutWrapper.style.filter = "blur(4px)";

    return OutWrapper
}

function removeSuggestions(){

    let title = document.querySelectorAll(".Input")[0]
    let currentKeywords = title.value.split(" ")

    let significantWords = Array.from(removeUnsignificantWords(currentKeywords))

    let validParents = []

    significantWords.forEach(word => {
        validParents.push("kw-p-"+word)
    })

    let suggestions = document.querySelectorAll(".OutWrapper")

    suggestions.forEach(kw => {
        // if kw doesnt contain a validParents class name, remove it
        if (!validParents.some(className => kw.classList.contains(className))){
            kw.remove()

            // check if classList contains titleKeyword or descriptionKeyword
            if (kw.classList.contains("titleKeyword")){
                seenTitleCnt -= 1
            }
            else if (kw.classList.contains("descriptionKeyword")){
                seenDescriptionCnt -= 1
            }
        }
    })

    Object.keys(seenKeywordsTitle).forEach(kw => {
        if (!significantWords.includes(kw)){
            delete seenKeywordsTitle[kw]
        }
    })
}




function getKeywordsRaw(kws){
    let keywords = []
    kws.forEach(kw => {
        newKw = {}
        newKw.query = kw.objectID
        //newKw.query = newKw.query.split(" ")
        //newKw.query = newKw.query[newKw.query.length - 1]
        newKw.popularity = kw.popularity
        try {
            newKw.productCount = kw.Resources.exact_nb_hits
        }
        catch {
            newKw.productCount = 0
        }
        
        keywords.push(newKw)
    });
    return keywords
}


function removeUnsignificantWords(wordsArray){

    // remove all special characters and numbers
    let words = wordsArray.map(word => {
        return word.replace(/[^a-zA-Z ]/g, "")
    })


    const stopWordsSet = new Set(['black','white','{Educlips','saved','includes','Clipart}','included','includes','students','school','grade','&amp','word','able', 'about', 'above', 'abst', 'accordance', 'according', 'accordingly', 'across', 'act', 'actually', 'added', 'adj', 'affected', 'affecting', 'affects', 'after', 'afterwards', 'again', 'against', 'ain', "ain't", 'all', 'allow', 'allows', 'almost', 'alone', 'along', 'already', 'also', 'although', 'always', 'among', 'amongst', 'amoungst', 'amount', 'and', 'announce', 'another', 'any', 'anybody', 'anyhow', 'anymore', 'anyone', 'anything', 'anyway', 'anyways', 'anywhere', 'apart', 'apparently', 'appear', 'appreciate', 'appropriate', 'approximately', 'are', 'aren', 'arent', "aren't", 'arise', 'around', "a's", 'aside', 'ask', 'asking', 'associated', 'auth', 'available', 'away', 'awfully', 'back', 'became', 'because', 'become', 'becomes', 'becoming', 'been', 'before', 'beforehand', 'begin', 'beginning', 'beginnings', 'begins', 'behind', 'being', 'believe', 'below', 'beside', 'besides', 'best', 'better', 'between', 'beyond', 'bill', 'biol', 'both', 'bottom', 'brief', 'briefly', 'but', 'call', 'came', 'can', 'cannot', 'cant', "can't", 'cause', 'causes', 'certain', 'certainly', 'changes', 'cit', 'clearly', "c'mon", 'com', 'come', 'comes', 'con', 'concerning', 'consequently', 'consider', 'considering', 'contain', 'containing', 'contains', 'corresponding', 'could', 'couldn', 'couldnt', "couldn't", 'course', 'cry', "c's", 'currently', 'date', 'definitely', 'describe', 'described', 'despite', 'detail', 'did', 'didn', "didn't", 'different', 'does', 'doesn', "doesn't", 'doing', 'don', 'done', "don't", 'down', 'downwards', 'due', 'during', 'each', 'edu', 'effect', 'eight', 'eighty', 'either', 'eleven', 'else', 'elsewhere', 'empty', 'end', 'ending', 'enough', 'entirely', 'especially', 'est', 'et-al', 'etc', 'even', 'ever', 'every', 'everybody', 'everyone', 'everything', 'everywhere', 'exactly', 'example', 'except', 'far', 'few', 'fifteen', 'fifth', 'fify', 'fill', 'find', 'fire', 'first', 'five', 'fix', 'followed', 'following', 'follows', 'for', 'former', 'formerly', 'forth', 'forty', 'found', 'four', 'from', 'front', 'full', 'further', 'furthermore', 'gave', 'get', 'gets', 'getting', 'give', 'given', 'gives', 'giving', 'goes', 'going', 'gone', 'got', 'gotten', 'greetings', 'had', 'hadn', "hadn't", 'happens', 'hardly', 'has', 'hasn', 'hasnt', "hasn't", 'have', 'haven', "haven't", 'having', 'hed', "he'd", "he'll", 'hello', 'help', 'hence', 'her', 'here', 'hereafter', 'hereby', 'herein', 'heres', "here's", 'hereupon', 'hers', 'herself', 'hes', "he's", 'hid', 'him', 'himself', 'his', 'hither', 'home', 'hopefully', 'how', 'howbeit', 'however', "how's", 'http', 'hundred', 'ibid', "i'd", 'ignored', "i'll", "i'm", 'immediate', 'immediately', 'importance', 'important', 'inasmuch', 'inc', 'indeed', 'index', 'indicate', 'indicated', 'indicates', 'information', 'inner', 'insofar', 'instead', 'interest', 'into', 'invention', 'inward', 'isn', "isn't", 'itd', "it'd", "it'll", 'its', "it's", 'itself', "i've", 'just', 'keep', 'keeps', 'kept', 'know', 'known', 'knows', 'largely', 'last', 'lately', 'later', 'latter', 'latterly', 'least', 'les', 'less', 'lest', 'let', 'lets', "let's", 'like', 'liked', 'likely', 'line', 'little', 'look', 'looking', 'looks', 'los', 'ltd', 'made', 'mainly', 'make', 'makes', 'many', 'may', 'maybe', 'mean', 'means', 'meantime', 'meanwhile', 'merely', 'might', 'mightn', "mightn't", 'mill', 'million', 'mine', 'miss', 'more', 'moreover', 'most', 'mostly', 'move', 'mrs', 'much', 'mug', 'must', 'mustn', "mustn't", 'myself', 'name', 'namely', 'nay', 'near', 'nearly', 'necessarily', 'necessary', 'need', 'needn', "needn't", 'needs', 'neither', 'never', 'nevertheless', 'new', 'next', 'nine', 'ninety', 'nobody', 'non', 'none', 'nonetheless', 'noone', 'nor', 'normally', 'nos', 'not', 'noted', 'nothing', 'novel', 'now', 'nowhere', 'obtain', 'obtained', 'obviously', 'off', 'often', 'okay', 'old', 'omitted', 'once', 'one', 'ones', 'only', 'onto', 'ord', 'other', 'others', 'otherwise', 'ought', 'our', 'ours', 'ourselves', 'out', 'outside', 'over', 'overall', 'owing', 'own', 'page', 'pagecount', 'pages', 'par', 'part', 'particular', 'particularly', 'pas', 'past', 'per', 'perhaps', 'placed', 'please', 'plus', 'poorly', 'possible', 'possibly', 'potentially', 'predominantly', 'present', 'presumably', 'previously', 'primarily', 'probably', 'promptly', 'proud', 'provides', 'put', 'que', 'quickly', 'quite', 'ran', 'rather', 'readily', 'really', 'reasonably', 'recent', 'recently', 'ref', 'refs', 'regarding', 'regardless', 'regards', 'related', 'relatively', 'research', 'research-articl', 'respectively', 'resulted', 'resulting', 'results', 'right', 'run', 'said', 'same', 'saw', 'say', 'saying', 'says', 'sec', 'second', 'secondly', 'section', 'see', 'seeing', 'seem', 'seemed', 'seeming', 'seems', 'seen', 'self', 'selves', 'sensible', 'sent', 'serious', 'seriously', 'seven', 'several', 'shall', 'shan', "shan't", 'she', 'shed', "she'd", "she'll", 'shes', "she's", 'should', 'shouldn', "shouldn't", "should've", 'show', 'showed', 'shown', 'showns', 'shows', 'side', 'significant', 'significantly', 'similar', 'similarly', 'since', 'sincere', 'six', 'sixty', 'slightly', 'some', 'somebody', 'somehow', 'someone', 'somethan', 'something', 'sometime', 'sometimes', 'somewhat', 'somewhere', 'soon', 'sorry', 'specifically', 'specified', 'specify', 'specifying', 'still', 'stop', 'strongly', 'sub', 'substantially', 'successfully', 'such', 'sufficiently', 'suggest', 'sup', 'sure', 'system', 'take', 'taken', 'taking', 'tell', 'ten', 'tends', 'than', 'thank', 'thanks', 'thanx', 'that', "that'll", 'thats', "that's", "that've", 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'thence', 'there', 'thereafter', 'thereby', 'thered', 'therefore', 'therein', "there'll", 'thereof', 'therere', 'theres', "there's", 'thereto', 'thereupon', "there've", 'these', 'they', 'theyd', "they'd", "they'll", 'theyre', "they're", "they've", 'thickv', 'thin', 'think', 'third', 'this', 'thorough', 'thoroughly', 'those', 'thou', 'though', 'thoughh', 'thousand', 'three', 'throug', 'through', 'throughout', 'thru', 'thus', 'til', 'tip', 'together', 'too', 'took', 'top', 'toward', 'towards', 'tried', 'tries', 'truly', 'try', 'trying', "t's", 'twelve', 'twenty', 'twice', 'two', 'u201d', 'under', 'unfortunately', 'unless', 'unlike', 'unlikely', 'until', 'unto', 'upon', 'ups', 'use', 'used', 'useful', 'usefully', 'usefulness', 'uses', 'using', 'usually', 'value', 'various', 'very', 'via', 'viz', 'vol', 'vols', 'volumtype', 'want', 'wants', 'was', 'wasn', 'wasnt', "wasn't", 'way', 'wed', "we'd", 'welcome', 'well', "we'll", 'well-b', 'went', 'were', "we're", 'weren', 'werent', "weren't", "we've", 'what', 'whatever', "what'll", 'whats', "what's", 'when', 'whence', 'whenever', "when's", 'where', 'whereafter', 'whereas', 'whereby', 'wherein', 'wheres', "where's", 'whereupon', 'wherever', 'whether', 'which', 'while', 'whim', 'whither', 'who', 'whod', 'whoever', 'whole', "who'll", 'whom', 'whomever', 'whos', "who's", 'whose', 'why', "why's", 'widely', 'will', 'willing', 'wish', 'with', 'within', 'without', 'won', 'wonder', 'wont', "won't", 'words', 'world', 'would', 'wouldn', 'wouldnt', "wouldn't", 'www', 'yes', 'yet', 'you', 'youd', "you'd", "you'll", 'your', 'youre', "you're", 'yours', 'yourself', 'yourselves', "you've", 'zero']);
    const adjectives = new Set(["aback","abaft","abandoned","abashed","aberrant","abhorrent","abiding","abject","ablaze","able","abnormal","aboard","aboriginal","abortive","abounding","abrasive","abrupt","absent","absorbed","absorbing","abstracted","absurd","abundant","abusive","acceptable","accessible","accidental","accurate","acid","acidic","acoustic","acrid","actually","ad","hoc","adamant","adaptable","addicted","adhesive","adjoining","adorable","adventurous","afraid","aggressive","agonizing","agreeable","ahead","ajar","alcoholic","alert","alike","alive","alleged","alluring","aloof","amazing","ambiguous","ambitious","amuck","amused","amusing","ancient","angry","animated","annoyed","annoying","anxious","apathetic","aquatic","aromatic","arrogant","ashamed","aspiring","assorted","astonishing","attractive","auspicious","automatic","available","average","awake","aware","awesome","awful","axiomatic","bad","barbarous","bashful","bawdy","beautiful","befitting","belligerent","beneficial","bent","berserk","best","better","bewildered","big","billowy","bite-sized","bitter","bizarre","black","black-and-white","bloody","blue","blue-eyed","blushing","boiling","boorish","bored","boring","bouncy","boundless","brainy","brash","brave","brawny","breakable","breezy","brief","bright","bright","broad","broken","brown","bumpy","burly","bustling","busy","cagey","calculating","callous","calm","capable","capricious","careful","careless","caring","cautious","ceaseless","certain","changeable","charming","cheap","cheerful","chemical","chief","childlike","chilly","chivalrous","chubby","chunky","clammy","classy","clean","clear","clever","cloistered","cloudy","closed","clumsy","cluttered","coherent","cold","colorful","colossal","combative","comfortable","common","complete","complex","concerned","condemned","confused","conscious","cooing","cool","cooperative","coordinated","courageous","cowardly","crabby","craven","crazy","creepy","crooked","crowded","cruel","cuddly","cultured","cumbersome","curious","curly","curved","curvy","cut","cute","cute","cynical","daffy","daily","damaged","damaging","damp","dangerous","dapper","dark","dashing","dazzling","dead","deadpan","deafening","dear","debonair","decisive","decorous","deep","deeply","defeated","defective","defiant","delicate","delicious","delightful","demonic","delirious","dependent","depressed","deranged","descriptive","deserted","detailed","determined","devilish","didactic","different","difficult","diligent","direful","dirty","disagreeable","disastrous","discreet","disgusted","disgusting","disillusioned","dispensable","distinct","disturbed","divergent","dizzy","domineering","doubtful","drab","draconian","dramatic","dreary","drunk","dry","dull","dusty","dynamic","dysfunctional","eager","early","earsplitting","earthy","easy","eatable","economic","educated","efficacious","efficient","eight","elastic","elated","elderly","electric","elegant","elfin","elite","embarrassed","eminent","empty","enchanted","enchanting","encouraging","endurable","energetic","enormous","entertaining","enthusiastic","envious","equable","equal","erect","erratic","ethereal","evanescent","evasive","even excellent excited","exciting exclusive","exotic","expensive","extra-large extra-small exuberant","exultant","fabulous","faded","faint fair","faithful","fallacious","false familiar famous","fanatical","fancy","fantastic","far"," far-flung"," fascinated","fast","fat faulty","fearful fearless","feeble feigned","female fertile","festive","few fierce","filthy","fine","finicky","first"," five"," fixed"," flagrant","flaky","flashy","flat","flawless","flimsy"," flippant","flowery","fluffy","fluttering"," foamy","foolish","foregoing","forgetful","fortunate","four frail","fragile","frantic","free"," freezing"," frequent"," fresh"," fretful","friendly","frightened frightening full fumbling functional","funny","furry furtive","future futuristic","fuzzy ","gabby","gainful","gamy","gaping","garrulous","gaudy","general gentle","giant","giddy","gifted","gigantic","glamorous","gleaming","glib","glistening glorious","glossy","godly","good","goofy","gorgeous","graceful","grandiose","grateful gratis","gray greasy great","greedy","green grey grieving","groovy","grotesque","grouchy","grubby gruesome","grumpy","guarded","guiltless","gullible gusty","guttural H habitual","half","hallowed","halting","handsome","handsomely","handy","hanging","hapless","happy","hard","hard-to-find","harmonious","harsh","hateful","heady","healthy","heartbreaking","heavenly heavy hellish","helpful","helpless","hesitant","hideous high","highfalutin","high-pitched","hilarious","hissing","historical","holistic","hollow","homeless","homely","honorable","horrible","hospitable","hot huge","hulking","humdrum","humorous","hungry","hurried","hurt","hushed","husky","hypnotic","hysterical","icky","icy","idiotic","ignorant","ill","illegal","ill-fated","ill-informed","illustrious","imaginary","immense","imminent","impartial","imperfect","impolite","important","imported","impossible","incandescent","incompetent","inconclusive","industrious","incredible","inexpensive","infamous","innate","innocent","inquisitive","insidious","instinctive","intelligent","interesting","internal","invincible","irate","irritating","itchy","jaded","jagged","jazzy","jealous","jittery","jobless","jolly","joyous","judicious","juicy","jumbled","jumpy","juvenile","kaput","keen","kind","kindhearted","kindly","knotty","knowing","knowledgeable","known","labored","lackadaisical","lacking","lame","lamentable","languid","large","last","late","laughable","lavish","lazy","lean","learned","left","legal","lethal","level","lewd","light","like","likeable","limping","literate","little","lively","lively","living","lonely","long","longing","long-term","loose","lopsided","loud","loutish","lovely","loving","low","lowly","lucky","ludicrous","lumpy","lush","luxuriant","lying","lyrical","macabre","macho","maddening","madly","magenta","magical","magnificent","majestic","makeshift","male","malicious","mammoth","maniacal","many","marked","massive","married","marvelous","material","materialistic","mature","mean","measly","meaty","medical","meek","mellow","melodic","melted","merciful","mere","messy","mighty","military","milky","mindless","miniature","minor","miscreant","misty","mixed","moaning","modern","moldy","momentous","motionless","mountainous","muddled","mundane","murky","mushy","mute","mysterious","naive","nappy","narrow","nasty","natural","naughty","nauseating","near","neat","nebulous","necessary","needless","needy","neighborly","nervous","new","next","nice","nifty","nimble","nine","nippy","noiseless","noisy","nonchalant","nondescript","nonstop","normal","nostalgic","nosy","noxious","null","numberless","numerous","nutritious","nutty","oafish","obedient","obeisant","obese","obnoxious","obscene","obsequious","observant","obsolete","obtainable","oceanic","odd","offbeat","old","old-fashioned","omniscient","one","onerous","open","opposite","optimal","orange","ordinary","organic","ossified","outgoing","outrageous","outstanding","oval","overconfident","overjoyed","overrated","overt","overwrought","painful","painstaking","pale","paltry","panicky","panoramic","parallel","parched","parsimonious","past","pastoral","pathetic","peaceful","penitent","perfect","periodic","permissible","perpetual","petite","petite","phobic","physical","picayune","pink","piquant","placid","plain","plant","plastic","plausible","pleasant","plucky","pointless","poised","polite","political","poor","possessive","possible","powerful","precious","premium","present","pretty","previous","pricey","prickly","private","probable","productive","profuse","protective","proud","psychedelic","psychotic","public","puffy","pumped","puny","purple","purring","pushy","puzzled","puzzling","quack","quaint","quarrelsome","questionable","quick","quickest","quiet","quirky","quixotic","quizzical","rabid","racial","ragged","rainy","rambunctious","rampant","rapid","rare","raspy","ratty","ready","real","rebel","receptive","recondite","red","redundant","reflective","regular","relieved","remarkable","reminiscent","repulsive","resolute","resonant","responsible","rhetorical","rich","right","righteous","rightful","rigid","ripe","ritzy","roasted","robust","romantic","roomy","rotten","rough","round","royal","ruddy","rude","rural","rustic","ruthless","sable","sad","safe","salty","same","sassy","satisfying","savory","scandalous","scarce","scared","scary","scattered","scientific","scintillating","scrawny","screeching","second","second-hand","secret","secretive","sedate","seemly","selective","selfish","separate","serious","shaggy","shaky","shallow","sharp","shiny","shivering","shocking","short","shrill","shut","shy","sick","silent","silent","silky","silly","simple","simplistic","sincere","six","skillful","skinny","sleepy","slim","slimy","slippery","sloppy","slow","small","smart","smelly","smiling","smoggy","smooth","sneaky","snobbish","snotty","soft","soggy","solid","somber","sophisticated","sordid","sore","sore","sour","sparkling","special","spectacular","spicy","spiffy","spiky","spiritual","spiteful","splendid","spooky","spotless","spotted","spotty","spurious","squalid","square","squealing","squeamish","staking","stale","standing","statuesque","steadfast","steady","steep","stereotyped","sticky","stiff","stimulating","stingy","stormy","straight","strange","striped","strong","stupendous","stupid","sturdy","subdued","subsequent","substantial","successful","succinct","sudden","sulky","super","superb","superficial","supreme","swanky","sweet","sweltering","swift","symptomatic","synonymous","taboo","tacit","tacky","talented","tall","tame","tan","tangible","tangy","tart","tasteful","tasteless","tasty","tawdry","tearful","tedious","teeny","teeny-tiny","telling","temporary","ten","tender tense","tense","tenuous","terrible","terrific","tested","testy","thankful","therapeutic","thick","thin","thinkable","third","thirsty","thoughtful","thoughtless","threatening","three","thundering","tidy","tight","tightfisted","tiny","tired","tiresome","toothsome","torpid","tough","towering","tranquil","trashy","tremendous","tricky","trite","troubled","truculent","true","truthful","two","typical","ubiquitous","ugliest","ugly","ultra","unable","unaccountable","unadvised","unarmed","unbecoming","unbiased","uncovered","understood","undesirable","unequal","unequaled","uneven","unhealthy","uninterested","unique","unkempt","unknown","unnatural","unruly","unsightly","unsuitable","untidy","unused","unusual","unwieldy","unwritten","upbeat","uppity","upset","uptight","used","useful","useless","utopian","utter","uttermost","vacuous","vagabond","vague","valuable","various","vast","vengeful","venomous","verdant","versed","victorious","vigorous","violent","violet","vivacious","voiceless","volatile","voracious","vulgar","wacky","waggish","waiting","","wakeful","wandering","wanting","warlike","warm","wary","wasteful","watery","weak","wealthy","weary","well-groomed","well-made","well-off","well-to-do","wet","whimsical","whispering","white","whole","wholesale","wicked","wide","wide-eyed","wiggly","wild","willing","windy","wiry","wise","wistful","witty","woebegone","womanly","wonderful","wooden","woozy","workable","worried","worthless","wrathful","wretched","wrong","wry","xenophobic","yellow","yielding","young","youthful","yummy","zany","zealous","zesty","zippy","zonked"])
    const verbes = new Set(["accept", "add", "admire", "admit", "advise", "afford", "agree", "alert", "allow", "amuse", "analyse", "announce", "annoy", "answer", "apologise", "appear", "applaud", "appreciate", "approve", "argue", "arrange", "arrest", "arrive", "ask", "attach", "attack", "attempt", "attend", "attract", "avoid", "back", "bake", "balance", "ban", "bang", "bare", "bat", "bathe", "battle", "beam", "beg", "behave", "belong", "bleach", "bless", "blind", "blink", "blot", "blush", "boast", "boil", "bolt", "bomb", "book", "bore", "borrow", "bounce", "bow", "box", "brake", "branch", "breathe", "bruise", "brush", "bubble", "bump", "burn", "bury", "buzz", "calculate", "call", "camp", "care", "carry", "carve", "cause", "challenge", "change", "charge", "chase", "cheat", "check", "cheer", "chew", "choke", "chop", "claim", "clap", "clean", "clear", "clip", "close", "coach", "coil", "collect", "colour", "comb", "command", "communicate", "compare", "compete", "complain", "complete", "concentrate", "concern", "confess", "confuse", "connect", "consider", "consist", "contain", "continue", "copy", "correct", "cough", "count", "cover", "crack", "crash", "crawl", "cross", "crush", "cry", "cure", "curl", "curve", "cycle", "dam", "damage", "dance", "dare", "decay", "deceive", "decide", "decorate", "delay", "delight", "deliver", "depend", "describe", "desert", "deserve", "destroy", "detect", "develop", "disagree", "disappear", "disapprove", "disarm", "discover", "dislike", "divide", "double", "doubt", "drag", "drain", "dream", "dress", "drip", "drop", "drown", "drum", "dry", "dust", "earn", "educate", "embarrass", "employ", "empty", "encourage", "end", "enjoy", "enter", "entertain", "escape", "examine", "excite", "excuse", "exercise", "exist", "expand", "expect", "explain", "explode", "extend", "face", "fade", "fail", "fancy", "fasten", "fax", "fear", "fence", "fetch", "file", "fill", "film", "fire", "fit", "fix", "flap", "flash", "float", "flood", "flow", "flower", "fold", "follow", "fool", "force", "form", "found", "frame", "frighten", "fry", "gather", "gaze", "glow", "glue", "grab", "grate", "grease", "greet", "grin", "grip", "groan", "guarantee", "guard", "guess", "guide", "hammer", "hand", "handle", "hang", "happen", "harass", "harm", "hate", "haunt", "head", "heal", "heap", "heat", "help", "hook", "hop", "hope", "hover", "hug", "hum", "hunt", "hurry", "identify", "ignore", "imagine", "impress", "improve", "include", "increase", "influence", "inform", "inject", "injure", "instruct", "intend", "interest", "interfere", "interrupt", "introduce", "invent", "invite", "irritate", "itch", "jail", "jam", "jog", "join", "joke", "judge", "juggle", "jump", "kick", "kill", "kiss", "kneel", "knit", "knock", "knot", "label", "land", "last", "laugh", "launch", "learn", "level", "license", "lick", "lie", "lighten", "like", "list", "listen", "live", "load", "lock", "long", "look", "love", "man", "manage", "march", "mark", "marry", "match", "mate", "matter", "measure", "meddle", "melt", "memorise", "mend", "mess up", "milk", "mine", "miss", "mix", "moan", "moor", "mourn", "move", "muddle", "mug", "multiply", "murder", "nail", "name", "need", "nest", "nod", "note", "notice", "number", "obey", "object", "observe", "obtain", "occur", "offend", "offer", "open", "order", "overflow", "owe", "own", "pack", "paddle", "paint", "park", "part", "pass", "paste", "pat", "pause", "peck", "pedal", "peel", "peep", "perform", "permit", "phone", "pick", "pinch", "pine", "place", "plan", "plant", "play", "please", "plug", "point", "poke", "polish", "pop", "possess", "post", "pour", "practise", "pray", "preach", "precede", "prefer", "prepare", "present", "preserve", "press", "pretend", "prevent", "prick", "print", "produce", "program", "promise", "protect", "provide", "pull", "pump", "punch", "puncture", "punish", "push", "question", "queue", "race", "radiate", "rain", "raise", "reach", "realise", "receive", "recognise", "record", "reduce", "reflect", "refuse", "regret", "reign", "reject", "rejoice", "relax", "release", "rely", "remain", "remember", "remind", "remove", "repair", "repeat", "replace", "reply", "report", "reproduce", "request", "rescue", "retire", "return", "rhyme", "rinse", "risk", "rob", "rock", "roll", "rot", "rub", "ruin", "rule", "rush", "sack", "sail", "satisfy", "save", "saw", "scare", "scatter", "scold", "scorch", "scrape", "scratch", "scream", "screw", "scribble", "scrub", "seal", "search", "separate", "serve", "settle", "shade", "share", "shave", "shelter", "shiver", "shock", "shop", "shrug", "sigh", "sign", "signal", "sin", "sip", "ski", "skip", "slap", "slip", "slow", "smash", "smell", "smile", "smoke", "snatch", "sneeze", "sniff", "snore", "snow", "soak", "soothe", "sound", "spare", "spark", "sparkle", "spell", "spill", "spoil", "spot", "spray", "sprout", "squash", "squeak", "squeal", "squeeze", "stain", "stamp", "stare", "start", "stay", "steer", "step", "stir", "stitch", "stop", "store", "strap", "strengthen", "stretch", "strip", "stroke", "stuff", "subtract", "succeed", "suck", "suffer", "suggest", "suit", "supply", "support", "suppose", "surprise", "surround", "suspect", "suspend", "switch", "talk", "tame", "tap", "taste", "tease", "telephone", "tempt", "terrify", "test", "thank", "thaw", "tick", "tickle", "tie", "time", "tip", "tire", "touch", "tour", "tow", "trace", "trade", "train", "transport", "trap", "travel", "treat", "tremble", "trick", "trip", "trot", "trouble", "trust", "try", "tug", "tumble", "turn", "twist", "type", "undress", "unfasten", "unite", "unlock", "unpack", "untidy", "use", "vanish", "visit", "wail", "wait", "walk", "wander", "want", "warm", "warn", "wash", "waste", "watch", "water", "wave", "weigh", "welcome", "whine", "whip", "whirl", "whisper", "whistle", "wink", "wipe", "wish", "wobble", "wonder", "work", "worry", "wrap", "wreck", "wrestle", "wriggle", "x-ray", "yawn", "yell", "zip", "zoom"])

    const insignificantWords = new Set([
        ...stopWordsSet,
        ...adjectives,
        ...verbes
    ]);

    const filteredWords = words.filter(word => {
        return word.length >= 4 && !insignificantWords.has(word.toLowerCase());
    });

    // remove duplicates from filteredWords
    const uniqueWords = new Set(filteredWords);

    return uniqueWords;
}

function getPremiumUpgradeRow(){
const row = document.createElement("div");
row.classList.add("row","getPremiumRow");
row.innerHTML = '<div class="col">Upgrade to <a target="_blank" rel="noopener noreferrer" href="https://tpt-informer.web.app/"><u>premium</u></a> to see more suggestions</div>';
return row 
}


