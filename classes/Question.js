const fetch = require("node-fetch");

const { 
    getUsStates,
    getCountriesWithOfficialLanguages,
    getCountriesWithCapitals
} = require('../wikiQuery.js')

class Question {

    constructor(category) {
        this.init(category)
    }

    init(category) {
        this.setOptions(category)
        this.setQuestionTitle()
        this.fetchData(this.options.query).then(data => {
            this.filterData(data)
            this.setChoices()
            this.options.ready = true
        })
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
        }
        this.options.query = encodeURI(query)
    }

    setQuestionTitle() {
        switch(this.options.category) {
            case 'officialLanguage':
                this.title = `What is the official language of #`; break
            case 'capital':
                this.title = `What is the capital of #`; break
            default:
                this.title = 'Question missing' 
        }
    }

    setChoices() {
        let randomizedItems = this.getRandomItems(this.options.choiceCount)
        this.choices = this.filterChoices(randomizedItems)
        this.setCorrectAnswer(randomizedItems)
    }

    filterChoices(items) {
        let choices = []
        items.forEach(item => {
            choices.push(item[1])  
        })
        return choices
    }

    setCorrectAnswer(choices) {
        const randomItemIndex = Math.floor(Math.random() * choices.length)
        const randomItem = choices[randomItemIndex]
        this.updateQuestionTitle(randomItem[0])
        this.answer = {
            name: randomItem[1],
            index: randomItemIndex 
        }
    }

    getRandomItems(numberOfItems) {
        let randomItems = []
        for(let i = 0; i < numberOfItems; i++) {
            let randomIndex = Math.floor(Math.random() * this.filteredData.length),
                randomItem = this.filteredData[randomIndex];
            this.filteredData.splice(randomIndex, 1)
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
    }

    setOptions(category) {
        this.options = {
            "officialLanguage": {
                "choiceCount": 4 
            },
            "capital" : {
                "choiceCount": 4
            },
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
            }, 1000)
        })
    }
}

module.exports = { Question }