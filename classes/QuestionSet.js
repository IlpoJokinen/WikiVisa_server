const OfficialLanguageQuestion = require("./questionTypes/geoghraphy/OfficialLanguage")
const NhlPointsQuestion = require("./questionTypes/sport/NhlPoints")
const WinterOlympicYearQuestion = require("./questionTypes/sport/WinterOlympicYear")
const LiteratureNobelistQuestion = require("./questionTypes/culture/LiteratureNobelist")
const CountryQuestion = require("./questionTypes/geoghraphy/Country")
const UsStatesQuestion = require("./questionTypes/geoghraphy/UsStates")
const WarQuestion = require("./questionTypes/history/War")
const { nodeCache } = require("../fetchFromDb")

let cacheObject = nodeCache.get("data")

class QuestionSet {

    constructor(categories, numberOfQuestions) {
        this.questions = []
        this.categories = categories
        this.numberOfQuestions = numberOfQuestions
        this.createQuestionArray()
    }

    createQuestionArray() {
        for(let i = 0; i < this.numberOfQuestions; i++){
            let createdQuestion
            let randomizedCategory = this.randomizeCategory()
            let questionTypes = Object.keys(cacheObject[randomizedCategory])
            let randomizedQuestionType = this.randomizeQuestionType(questionTypes)

            switch(randomizedCategory){
                case "geography": 
                    createdQuestion = this.createGeographyQuestion(randomizedQuestionType); break;
                case "sport":
                    createdQuestion = this.createSportQuestion(randomizedQuestionType); break;
                case "culture":
                    createdQuestion = this.createCultureQuestion(randomizedQuestionType); break;   
                case "history":
                    createdQuestion = this.createHistoryQuestion(randomizedQuestionType); break;   

            }
            createdQuestion.id = i;
            this.questions.push(createdQuestion)
        }
        this.ready = true
    }

    randomizeCategory() {
        let random = Math.floor(Math.random() * this.categories.length)
        let randomizedCategory = this.categories[random]
        return randomizedCategory
    }

    randomizeQuestionType(questionTypes) {
        let random = Math.floor(Math.random() * questionTypes.length)
        let randomizedQuestionType = questionTypes[random]
        return randomizedQuestionType
    }

    createGeographyQuestion(questionType) {
        switch(questionType) {
            case "officialLanguage":
                return new OfficialLanguageQuestion()
            case "country":
                return new CountryQuestion()
            case "usStates":
                return new UsStatesQuestion()
        }
    }

    createSportQuestion(questionType) {
        switch(questionType) {
            case "nhlPoints": 
                return new NhlPointsQuestion()
            case "winterOlympicYear": 
                return new WinterOlympicYearQuestion()    
        }
    }

    createCultureQuestion(questionType) {
        switch(questionType) {
            case "literatureNobelist": 
                return new LiteratureNobelistQuestion()
        }
    }

    createHistoryQuestion(questionType) {
        switch(questionType) {
            case "war": 
                return new WarQuestion()
        }
    }

    get() {
        return new Promise((res, rej) => {
            let counter = setInterval(() => {
                if(this.ready) {
                    clearInterval(counter)
                    res(this.questions)
                }
            }, 100)
        })
    }
}
module.exports = QuestionSet