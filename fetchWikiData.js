const fetch = require("node-fetch");
const { nodeCache } = require("./fetchFromDb")

const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchFromWikiData () {
    const questionsWithQueries = nodeCache.get("questionsWithQueries")
    for(let i = 0; i < questionsWithQueries.length; i++) {
        await init(questionsWithQueries[i].question_name, encodeURI(questionsWithQueries[i].query))
        await sleep(1500)
    }
}

async function init(questionName, query) {
    try {
        let data = await fetchData(query)
        let filteredData = filterData(data)
        nodeCache.set(questionName, filteredData)
    } catch(e) {
        console.log(e)
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
        if(true) {//keys.length === 2
            keys.forEach((key, i) => {
                obj[i] = row[key].value
            }) 
            filteredData.push(obj)
        }
    })
    console.log(filteredData)
    return filteredData
}

module.exports = { fetchFromWikiData, nodeCache }