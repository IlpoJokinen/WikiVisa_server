const fetch = require("node-fetch");
//const { nodeCache } = require("./nodeCache")
const NodeCache = require( "node-cache" );
const nodeCache = new NodeCache();

const { 
    getUsStates,
    getCountriesWithOfficialLanguages,
    getCountriesWithCapitals,
    getCountriesWithPopulation,
    getCountriesArea
} = require('./wikiQuery.js')


let questionTypes = [
    {questionTypeStr: "area", query: encodeURI(getCountriesArea())},
    {questionTypeStr: "population", query: encodeURI(getCountriesWithPopulation())},
    {questionTypeStr: "officialLanguage", query: encodeURI(getCountriesWithOfficialLanguages())},
    {questionTypeStr: "capital", query: encodeURI(getCountriesWithCapitals())}
    
]

function fetchAllTheDataToCache () {
    questionTypes.forEach(type => init(type.questionTypeStr, type.query))
}

function init(questionTypeStr, query) {
    fetchData(query).then(data => {
        let filteredData = filterData(data)
        nodeCache.set(questionTypeStr, filteredData)
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
        if(keys.length === 2) {
            keys.forEach((key, i) => {
                obj[i] = row[key].value
            }) 
            filteredData.push(obj)
        }
    })
    return filteredData
}

module.exports = { fetchAllTheDataToCache, nodeCache }