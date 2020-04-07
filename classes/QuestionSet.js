const AreaQuestion = require("./questionTypes/geoghraphy/Area")
const PopulationQuestion = require("./questionTypes/geoghraphy/Population")
const OfficialLanguageQuestion = require("./questionTypes/geoghraphy/OfficialLanguage")
const CapitalQuestion = require("./questionTypes/geoghraphy/Capital")
const NhlPointsQuestion = require("./questionTypes/sport/NhlPoints")
const WinterOlympicYearQuestion = require("./questionTypes/sport/winterOlympicYear")

let categories = {
    Geography: ["area", "officialLanguage", "population", "capital"],
    Sport: ["nhlPoints", "winterOlympicYear"]
}

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
            let questionTypes = categories[randomizedCategory]
            let randomizedQuestionType = this.randomizeQuestionType(questionTypes)
            
            switch(randomizedCategory){
                case "Geography": 
                    createdQuestion = this.createGeographyQuestion(randomizedQuestionType); break;
                case "Sport":
                    createdQuestion = this.createSportsQuestion(randomizedQuestionType); break;
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
            case "area":
                return new AreaQuestion()
            case "capital":
                return new CapitalQuestion()
            case "population":
                return new PopulationQuestion()
            case "officialLanguage":
                return new OfficialLanguageQuestion()
        }
    }

    createSportsQuestion(questionType) {
        switch(questionType) {
            case "nhlPoints": 
                return new NhlPointsQuestion()
            case "winterOlympicYear": 
                return new WinterOlympicYearQuestion()    
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