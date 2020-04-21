const fetch = require("node-fetch");
const { nodeCache } = require("./fetchFromDb")

const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchFromWikiData () {
    let cacheObject = nodeCache.get("data")
    let keys = Object.keys(cacheObject)
    for(let i = 0; i < keys.length; i++) {
        let categoryObject = cacheObject[keys[i]]
        let categoryName = keys[i]
        await fetchQuestionDataByCategory(categoryObject, categoryName)
        await sleep(1500)
    }
    console.log("cacheObject", nodeCache.get("data"))
    console.log("prettyNames for categories", nodeCache.get("categoryPrettyNames"))
}

async function fetchQuestionDataByCategory(categoryObject, categoryName) {
    let keys = Object.keys(categoryObject)
    for(let i = 0; i < keys.length; i++){
        let query = categoryObject[keys[i]].query
        try {
            let data = await fetchData(encodeURI(query))
            let filteredData = filterData(data)
            let cacheObject = nodeCache.take("data")
            cacheObject[categoryName][keys[i]].data = filteredData
            delete cacheObject[categoryName][keys[i]].query
            nodeCache.set("data", cacheObject)
        } catch(e) {
            console.log(e)
        }
    }
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
        }
    )
    return filteredData
}

module.exports = { fetchFromWikiData, nodeCache }