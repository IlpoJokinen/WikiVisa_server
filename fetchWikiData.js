const fetch = require("node-fetch");
const { nodeCache } = require("./fetchFromDb")

const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchFromWikiData() {
    console.log("fetching from Wikidata")
    let cacheObject = nodeCache.get("data")
    let keys = Object.keys(cacheObject)
    for (let i = 0; i < keys.length; i++) {
        let categoryName = keys[i]
        let categoryObject = cacheObject[categoryName]
        await fetchQuestionDataByCategory(categoryObject, categoryName)
        await sleep(1500)
    }
    updateCategoryPrettyNames()
    console.log("cacheObject", nodeCache.get("data"))
    console.log("prettyNames for categories", nodeCache.get("categoryPrettyNames"))
}

async function fetchQuestionDataByCategory(categoryObject, categoryName) {
    let keys = Object.keys(categoryObject)
    for (let i = 0; i < keys.length; i++) {
        let questionName = keys[i]
        let query = categoryObject[questionName].query
        try {
            let data = await fetchData(encodeURI(query))
            let filteredData = filterData(data)
            addFilteredDataToCacheObject(categoryName, questionName, filteredData)
        } catch (e) {
            removeFailedQuestionFromCacheObject(categoryName, questionName)
            console.log(e)
        }
    }
    checkIfCategoryHasQuestion(categoryName)
}

async function fetchData(sql) {
    let response = await fetch(`https://query.wikidata.org/sparql?query=${sql}&format=json`)
    let data = await response.json()
    return data.results.bindings
}   

function filterData(data) {
    let filteredData = []
    data.forEach(row => {
        let obj = {}, keys = Object.keys(row)
        keys.forEach((key, i) => {
            obj[key] = row[key].value
        })
        filteredData.push(obj)
    })
    return filteredData
}

function addFilteredDataToCacheObject(categoryName, questionName, filteredData) {
    let cacheObject = nodeCache.take("data")
    cacheObject[categoryName][questionName].data = filteredData
    delete cacheObject[categoryName][questionName].query
    nodeCache.set("data", cacheObject)
}

function removeFailedQuestionFromCacheObject(categoryName, questionName) {
    let cacheObject = nodeCache.take("data")
    delete cacheObject[categoryName][questionName]
    nodeCache.set("data", cacheObject)
}

function checkIfCategoryHasQuestion(categoryName) {
    let cacheObject = nodeCache.get("data")
    if (Object.keys(cacheObject[categoryName]).length === 0) {
        let cacheObject = nodeCache.take("data")
        delete cacheObject[categoryName]
        nodeCache.set("data", cacheObject)
    }
}

function updateCategoryPrettyNames() {
    let cacheObject = nodeCache.get("data")
    let prettyNamesWithIds = nodeCache.take("categoryPrettyNames")
    let successfulCategories = new Set(Object.keys(cacheObject))
    let successfulPrettyNames = prettyNamesWithIds.filter(x => {
        if(successfulCategories.has(x.prettyName.toLowerCase())){
            return x
        } 
    })
    nodeCache.set("categoryPrettyNames", successfulPrettyNames)
}

module.exports = { fetchFromWikiData, nodeCache }