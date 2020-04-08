const fetch = require("node-fetch");
const NodeCache = require( "node-cache" );
const nodeCache = new NodeCache();
let queriesFetched = 0

const { 
    getCountriesWithOfficialLanguages,
    getCountriesWithCapitals,
    getCountriesWithPopulation,
    getCountriesArea,
    getNhlPlayersWithPointsMoreThanTwoHundred,
    getWinterOlympicGames
} = require('./wikiQuery.js')


let questionTypesWithQueries = [
    {questionTypeStr: "area", query: encodeURI(getCountriesArea())},
    {questionTypeStr: "population", query: encodeURI(getCountriesWithPopulation())},
    {questionTypeStr: "officialLanguage", query: encodeURI(getCountriesWithOfficialLanguages())},
    {questionTypeStr: "capital", query: encodeURI(getCountriesWithCapitals())},
    {questionTypeStr: "nhlPlayersPoints", query: getNhlPlayersWithPointsMoreThanTwoHundred()},
    {questionTypeStr: "winterOlympics", query: getWinterOlympicGames()}

]

function fetchAllTheDataToCache () {
    let fetchOneByOne = setInterval(() => {
        if(queriesFetched < questionTypesWithQueries.length) {
            init(questionTypesWithQueries[queriesFetched].questionTypeStr, questionTypesWithQueries[queriesFetched].query)
        } else {
            clearInterval(fetchOneByOne)
        }
    }, 3000)
}

function init(questionTypeStr, query) {
    fetchData(query).then(data => {
        let filteredData = filterData(data)
        nodeCache.set(questionTypeStr, filteredData)
        queriesFetched++
    })
}

function fetchData(sql) {
    return fetch(`https://query.wikidata.org/sparql?query=${sql}&format=json`)
    .then(response => response.json())
    .then(data => {
        return data.results.bindings
    })
    .catch(error => console.log(error))
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

module.exports = { fetchAllTheDataToCache, nodeCache }