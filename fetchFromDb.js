const { connectToDatabase } = require("./db")
const NodeCache = require( "node-cache" );
const nodeCache = new NodeCache();
let conn = connectToDatabase()
let cacheObject = {}

async function fetchFromDb(){
    try {
        let data = await fetchAllQuestionData()
        createCacheObjects(data)
        return new Promise(resolve => resolve())
    } catch (err) {
        return new Promise((resolve, reject) => reject(err))
    }
}

function createCacheObjects(data){
    setCategoryPrettyNames(data)
    setCategories(data)
    setQuestions(data)
    setVariants(data)
    nodeCache.set("data", cacheObject)
}   

function setCategoryPrettyNames(data) {
    let categoryPrettyNames = new Set(data.map(row => row.category_pretty_name))
    nodeCache.set("categoryPrettyNames", categoryPrettyNames)
}

function setCategories(data) {
    let categories = new Set(data.map(row => row.category_name))
    categories.forEach(category => {
        cacheObject[category] = {}
    })
}

function setQuestions(data) {
    data.forEach(obj => {
        let category = obj.category_name
        cacheObject[category][obj.question_name] = {query: obj.query, variants: [], data: []}
    }) 
}

function setVariants(data){
    data.forEach(obj => {
        let category = obj.category_name
        let question = obj.question_name
        cacheObject[category][question].variants.push({questionTitle: obj.question_title, answerTitle: obj.answer_title, dataset: obj.dataset, runningNumber: obj.running_number})
        cacheObject[category][question].variants.sort((a, b) => a.runningNumber - b.runningNumber)
    })
}

async function fetchAllQuestionData() {
    try {
        let all = await conn.query(`SELECT questions.question_name, questions.query, variants.answer_title, variants.question_title, variants.running_number, variant_datasets.dataset, categories.category_name, categories.category_pretty_name 
        FROM variants 
        INNER JOIN variant_datasets 
        ON variants.dataset = variant_datasets.id 
        INNER JOIN questions 
        ON variants.question_id = questions.id INNER JOIN categories 
        ON questions.category_id = categories.id`
        ).then(([rows]) => rows)
        return new Promise(resolve => resolve(all))
    } catch (err) {
        return new Promise((resolve, reject) => reject(err))
    }
    
}

module.exports = { fetchFromDb, nodeCache }