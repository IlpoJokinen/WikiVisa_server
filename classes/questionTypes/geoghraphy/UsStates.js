const Question = require("../../Question")

class UsStates extends Question{
    constructor(){
        super()
        //{ '0': 'Vermont', '1': '24923', '2': 'The Green Mountain State' } ]
        this.data = this.nodeCache.get("usStates")
        this.variants = [
            {
                "questionTitle": "Which of these U.S states is the largest in area",
                "answerTitle": "The Largest state is ",
                "attributesForDataSet": [0, 1]
            },
            {
                "questionTitle": "What is the nickname of #",
                "answerTitle": "The nickname of # is ",
                "attributesForDataSet": [0, 2]
            },
            {
                "questionTitle": "Which U.S state's nickname is #",
                "answerTitle": "#'s nickname is ",
                "attributesForDataSet": [0, 2]
            }
         ]
        this.random = Math.floor(Math.random() * this.variants.length)
        this.reconstructDataSetForTheVariant()
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
        this.setCorrectAnswer = this.random === 0 ? () => this.setCorrectAnswerMaxOrMin(1) : this.random === 1 ? () => this.setCorrectAnswerRandom(1, 0) : () => this.setCorrectAnswerRandom(0, 1)
    }

    chooseChoiceFilterer() {
        this.choiceFilterer = [0, 2].includes(this.random) ? () => this.filterChoices(0) : () => this.filterChoices(1)
    }
}

module.exports = UsStates