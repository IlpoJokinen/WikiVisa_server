const Question = require("../../Question")

class War extends Question{
    constructor(){
        super()
        this.data = this.nodeCache.get("war")
        this.variants = [
            {
                "questionTitle": "Which of the following wars ended most recently",
                "answerTitle": "Most recently, in the year of # ended",
                "attributesForDataSet": [0, 2]
            },
            {
                "questionTitle": "Which year did # end",
                "answerTitle": "# ended in ",
                "attributesForDataSet": [0,2]
            },
            {
                "questionTitle": "Which year did # start",
                "answerTitle": "# started in",
                "attributesForDataSet": [0,1]
            },
            {
                "questionTitle": "Which war or conflict was # part of",
                "answerTitle": "# was part of",
                "attributesForDataSet": [0, 3]
            },
            {
                "questionTitle": "Which war was part of #",
                "answerTitle": "Part of # was",
                "attributesForDataSet": [0, 3]
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
        this.setCorrectAnswer = this.random === 0 ? () => this.setCorrectAnswerMaxOrMin(1) : this.random === 4 ? () => this.setCorrectAnswerRandom(0, 1) : () => this.setCorrectAnswerRandom(1, 0) 
    }
    chooseChoiceFilterer() {
        this.choiceFilterer = [0, 4].includes(this.random) ? () => this.filterChoices(0) : () => this.filterChoices(1)
    }
}

module.exports = War