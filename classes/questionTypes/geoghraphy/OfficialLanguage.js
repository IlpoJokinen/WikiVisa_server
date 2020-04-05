const Question = require("../../Question")

class OfficialLanguage extends Question {
    
    constructor(){
        super()
        this.data = this.nodeCache.get("officialLanguage")
        this.variants = [
            {
                "questionTitle": 'What is the official language of #',
                "answerTitle": 'The Official language of # is '
            },
            {
                "questionTitle": "Which country's official language is #",
                "answerTitle": '# is the official language of '
            }
        ]
        this.random = Math.floor(Math.random() * this.variants.length)
        this.chooseAnswerSetter()
        this.chooseChoiceFilterer()
        this.setChoices()
        this.removeUnusedAttributes()
    }

    setChoices() {
        this.randomizedItems = this.getRandomItems(4)
        this.choices = this.choiceFilterer()
        this.setCorrectAnswer()
    }

    chooseAnswerSetter() {
        this.setCorrectAnswer = this.random === 0 ? () => this.setCorrectAnswerRandom(1, 0) : () => this.setCorrectAnswerRandom(0, 1)
    }

    chooseChoiceFilterer() {
        this.choiceFilterer = this.random === 0 ? () => this.filterChoices(1) : () => this.filterChoices(0)
    }
}

module.exports = OfficialLanguage