const AreaQuestion = require("./questionTypes/geoghraphy/Area")
const PopulationQuestion = require("./questionTypes/geoghraphy/Population")
const OfficialLanguageQuestion = require("./questionTypes/geoghraphy/OfficialLanguage")
const CapitalQuestion = require("./questionTypes/geoghraphy/Capital")

let categories = {
    Geoghraphy: ["area", "officialLanguage", "population", "capital"]
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
                case "Geoghraphy": 
                    createdQuestion = this.createGeoghraphyQuestion(randomizedQuestionType); break;
                //case "History": 
                //case "Sports"
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

    createGeoghraphyQuestion(questionType) {
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