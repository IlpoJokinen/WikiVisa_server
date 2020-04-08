const Question = require("../../Question")

class LiteratureNobelist extends Question{
    //[{0:kirjailijan nimi, 1, kirjanNimi, 2: synnyinvuosi 3: kuolinvuosi, 4: nobelpalkinnon vuosi}]
    constructor(){
        super()
        this.data = this.nodeCache.get("literatureNobelist")
        this.variants = [
            {
                "questionTitle": "Which of the following books is written by Nobel price winning author #",
                "answerTitle": "# wrote the book ",
                "attributesForDataSet": [0, 1]
            },
            {
                "questionTitle": "All of the these authors won the Nobel prize in literature, but who wrote the book #",
                "answerTitle": "# was written by ",
                "attributesForDataSet": [0, 1]
            },
            {
                "questionTitle": "Which year Nobel price winning author # was born",
                "answerTitle": "# was born in ",
                "attributesForDataSet": [0, 2]
            },
            {
                "questionTitle": "Which year Nobel price winning author # died",
                "answerTitle": "# died in ",
                "attributesForDataSet": [0, 3]
            },
            {
                "questionTitle": "Which year did # receive Nobel price in literature",
                "answerTitle": "# received the price in ",
                "attributesForDataSet": [0, 4]
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
        this.setCorrectAnswer = [0, 2, ,3, 4].includes(this.random) ? () => this.setCorrectAnswerRandom(1, 0) : () => this.setCorrectAnswerRandom(0, 1)
    }
    chooseChoiceFilterer() {
        this.choiceFilterer = this.random === 1 ? () => this.filterChoices(0) : () => this.filterChoices(1)
    }
}

module.exports = LiteratureNobelist