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
    
    setChoices() {
        this.randomizedItems = this.getRandomItems(this.options.choiceCount)
        this.choices = this.filterChoices(this.randomizedItems)
        this.options.setCorrectAnswer()
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

    filterChoices(items) {
        //Tässä käytetään oliomuuttuja randomia, jonka perusteella on päätetty myös kysymysvariaatio, määrittämään nyt se mitä
        //valitaan vastausvaihtoehdoiksi. Eli haluammeko valita esim. neljä maata vai neljä pääkaupunkia.
        //Kysymyksissä "area" ja "population" haluamme valita molemmissa varianteissa maita, emme koskaan niitä lukuja.
        let indexForChoices = this.random === 1 || ["area", "population"].includes(this.options.category) ? 0 : 1
        let choices = []
        items.forEach(item => {
            choices.push(item[indexForChoices])  
        })
        return choices
    }

    setCorrectAnswerRandom() {
        //myös tässä täytyy päättää random oliomuuttujan avulla kumpi olion attribuutti, esim. maa vai pääkaupunki asetetaan kysymykseen
        //ja kumpi vastaukseen
        let indexForAnswer = this.random === 0 ? 1 : 0,
            indexForTitles = this.random === 0 ? 0 : 1

        const randomItemIndex = Math.floor(Math.random() * this.randomizedItems.length)
        const randomItem = this.randomizedItems[randomItemIndex]
        this.setQuestionTitle(randomItem[indexForTitles])
        this.setAnswerTitle(randomItem[indexForTitles])
        this.answer = {
            name: randomItem[indexForAnswer],
            index: randomItemIndex,
            answerTitle: this.answerTitle
        }
    }

    setCorrectAnswerMaxOrMin() {
        this.setQuestionTitle()
        
        let index = 0
        let helper = {}
        this.random === 0 ? helper[1] = Infinity : helper[1] = -Infinity

        if(this.random === 0){
            this.randomizedItems.forEach((c, i) => {
                if(parseInt(c[1]) < helper[1]){
                    index = i
                    helper = c
                }
            })
        } else if(this.random === 1){
            this.randomizedItems.forEach((c, i) => {
                if(parseInt(c[1]) > helper[1]){
                    index = i
                    helper = c
                }
            })
        }
        this.setAnswerTitle(helper[1])
        this.answer = {
            name: helper[0],
            index: index,
            answerTitle: this.answerTitle
        }
    }

    setAnswerTitle(string) {
        this.answerTitle = this.options.variants[this.random].answerTitle.replace("#", string)
    }

    setQuestionTitle(string) {
        this.title = this.options.variants[this.random].questionTitle.replace('#', string)
    }

    getQuestionTitle() {
        return this.title
    }

    removeUnusedAttributes() {
        delete this.options
        delete this.filteredData
        delete this.randomizedItems
        delete this.answerTitle
    }

    setOptions(category) {
        let options = {
            "officialLanguage": {
                "choiceCount": 4,
                "setCorrectAnswer": () => this.setCorrectAnswerRandom(), 
                "variants": [
                    {
                        "questionTitle": 'What is the official language of #',
                        "answerTitle": 'The Official language of # is '
                    },
                    {
                        "questionTitle": "Which country's official language is #",
                        "answerTitle": '# is the official language of '
                    }
                ]
            },
            "capital" : {
                "choiceCount": 4,
                "setCorrectAnswer": () => this.setCorrectAnswerRandom(),
                "variants": [
                    {
                        "questionTitle": 'What is the capital of #',
                        "answerTitle": 'Capital of # is '
                    },
                    {
                        "questionTitle": '# is the capital of ...',
                        "answerTitle": '# is the capital of '
                    }
                ]
            },
            "population": {
                "choiceCount": 3,
                "setCorrectAnswer": () => this.setCorrectAnswerMaxOrMin(),
                "variants": [
                    {
                        "questionTitle": 'Which country has the smallest population',
                        "answerTitle": 'The smallest population of # is in '
                    },
                    {
                        "questionTitle": 'Which country has the biggest population',
                        "answerTitle": 'The biggest population of # is in '
                    }
                ]
            }, 
            "area": {
                "choiceCount": 3,
                "setCorrectAnswer": () => this.setCorrectAnswerMaxOrMin(), 
                "variants": [
                    {
                        "questionTitle": 'Which country is the smallest by area',
                        "answerTitle": 'The smallest country with an area of # km² is '
                    },
                    {
                        "questionTitle": 'Which country is the biggest by area',
                        "answerTitle": 'The biggest country with an area of # km² is '
                    }
                ]
            }
        }
        this.options = options[category]
        this.options.category = category
        this.random = Math.floor(Math.random() * this.options.variants.length)
        this.setQuery()
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