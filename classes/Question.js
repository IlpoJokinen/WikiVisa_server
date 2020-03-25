const fetch = require("node-fetch");
const NodeCache = require( "node-cache" );
const nodeCache = new NodeCache();

const { 
    getUsStates,
    getCountriesWithOfficialLanguages,
    getCountriesWithCapitals,
    getCountriesWithPopulation,
    getCountriesArea
} = require('../wikiQuery.js')

class Question {

    constructor(id, category) {
        this.id = id
        this.init(category)
    }

    init(category) {
        this.setOptions(category)
        this.setQuestionTitle()
        if(nodeCache.has(category)){
            let dataInCache = nodeCache.get(category)
            this.filteredData = dataInCache
            this.setChoices()
            this.options.ready = true
        } else {
            this.fetchData(this.options.query).then(data => {
                this.filterData(data)
                nodeCache.set(category, this.filteredData)
                this.setChoices()
                this.options.ready = true
            })
        }
    }

    fetchData(sql) {
        return fetch(`https://query.wikidata.org/sparql?query=${sql}&format=json`)
        .then(response => response.json())
        .then(data => {
            return data.results.bindings
        })
        .catch(error => console.log(error))
    }   

    filterData(data) {
        this.filteredData = []
        data.forEach(row => {
            let obj = {}, keys = Object.keys(row)
            if(keys.length === 2) {
                keys.forEach((key, i) => {
                    obj[i] = row[key].value
                }) 
                this.filteredData.push(obj)
            }
        })
    }

    setQuery() {
        let query
        switch(this.options.category) {
            case 'officialLanguage': query = getCountriesWithOfficialLanguages(); break
            case 'capital': query = getCountriesWithCapitals(); break
            case 'population': query = getCountriesWithPopulation(); break
            case 'area': query = getCountriesArea(); break

        }
        this.options.query = encodeURI(query)
    }

    setQuestionTitle() {
        switch(this.options.category) {
            case 'officialLanguage':
                this.title = `What is the official language of #`; break
            case 'capital':
                this.title = `What is the capital of #`; break
            case 'population':
                this.title = `#`; break
            case 'area':
                this.title = `#`; break
            default:
                this.title = 'Question missing' 
        }
    }

    setChoices() {
        this.randomizedItems = this.getRandomItems(this.options.choiceCount)
        this.choices = this.filterChoices(this.randomizedItems)
        this.options.setCorrectAnswer()
    }

    filterChoices(items) {
        let choices = []
        items.forEach(item => {
            choices.push(item[1])  
        })
        return choices
    }

    setCorrectAnswerRandom() {
        const randomItemIndex = Math.floor(Math.random() * this.randomizedItems.length)
        const randomItem = this.randomizedItems[randomItemIndex]
        this.updateQuestionTitle(randomItem[0])
        this.answer = {
            name: randomItem[1],
            index: randomItemIndex 
        }
    }

    setCorrectAnswerMaxOrMin() {
        let random = Math.round(Math.random())
        let title = this.options.titleVariants[random]
        this.updateQuestionTitle(title)
        
        let index = 0
        let helper = {}
        random === 0 ? helper[0] = Infinity : helper[0] = -Infinity

        if(random === 0){
            this.randomizedItems.forEach((c, i) => {
                if(parseInt(c[0]) < helper[0]){
                    index = i
                    helper = c
                }
            })
        } else if(random === 1){
            this.randomizedItems.forEach((c, i) => {
                if(parseInt(c[0]) > helper[0]){
                    index = i
                    helper = c
                }
            })
        }
        this.answer = {
            name: helper[1],
            index: index
        }
    }

    getRandomItems(numberOfItems) {
        let randomItems = []
        for(let i = 0; i < numberOfItems; i++) {
            let randomIndex = Math.floor(Math.random() * this.filteredData.length),
                randomItem = this.filteredData[randomIndex];
            this.filteredData.splice(randomIndex, 1)
            let choices = randomItems.map(i => i[1])
            if(choices.includes(randomItem[1])){
                i--
                continue;
            }
            randomItems.push(randomItem)
        }
        return randomItems
    }

    updateQuestionTitle(string) {
        this.title = this.title.replace('#', string)
    }

    getQuestionTitle() {
        return this.title
    }

    removeUnusedAttributes() {
        delete this.options
        delete this.filteredData
        delete this.randomizedItems
    }

    setOptions(category) {
        this.options = {
            "officialLanguage": {
                "choiceCount": 4,
                "setCorrectAnswer": () => this.setCorrectAnswerRandom()
            },
            "capital" : {
                "choiceCount": 4,
                "setCorrectAnswer": () => this.setCorrectAnswerRandom()
            },
            "population": {
                "choiceCount": 3,
                "setCorrectAnswer": () => this.setCorrectAnswerMaxOrMin(),
                "titleVariants": ['Which country has the smallest population', 'Which country has the biggest population']
            }, 
            "area": {
                "choiceCount": 3,
                "setCorrectAnswer": () => this.setCorrectAnswerMaxOrMin(),
                "titleVariants": ['Which country is the smallest by area', 'Which country is the biggest by area']
            }
        }[category]
        this.options.category = category
        this.setQuery()
    }

    get() {
        return new Promise((res, rej) => {
            let counter = setInterval(() => {
                if(this.options.ready) {
                    clearInterval(counter)
                    this.removeUnusedAttributes()
                    res(this)
                }
            }, 100)
        })
    }
}
module.exports = {Question}