const Question = require("../../Question")

class Country extends Question{
    //[{ '0': maa, '1': 'Pääkaupunki', '2': 'area', '3': 'population', '4': 'Maanonsa' }] datan muoto cachessa
    constructor(){
        super()
        this.data = this.nodeCache.get("country") 
        this.variants = [
            {
                "questionTitle": 'What is the capital of #',
                "answerTitle": 'Capital of # is ',
                "attributesForDataSet": [0, 1]
            },
            {
                "questionTitle": '# is the capital of ...',
                "answerTitle": '# is the capital of ',
                "attributesForDataSet": [0, 1]
            },
            {
                "questionTitle": 'Which country is the smallest by area',
                "answerTitle": 'The smallest country with an area of # km² is ',
                "attributesForDataSet": [0, 2]
            },
            {
                "questionTitle": 'Which country is the biggest by area',
                "answerTitle": 'The biggest country with an area of # km² is ',
                "attributesForDataSet": [0, 2]
            },
            {
                "questionTitle": 'Which country is the closest in size to #',
                "answerTitle": 'The closest country in size to # is ',
                "attributesForDataSet": [0, 2]
            },
            {
                "questionTitle": 'Which country has the smallest population',
                "answerTitle": 'The smallest population of # is in ',
                "attributesForDataSet": [0, 3]
            },
            {
                "questionTitle": 'Which country has the biggest population',
                "answerTitle": 'The biggest population of # is in ',
                "attributesForDataSet": [0, 3]
            },
            {
                "questionTitle": 'Which country has the population closest in size to #',
                "answerTitle": 'The population most similar in size to # is in  ',
                "attributesForDataSet": [0, 3]
            },
            {
                "questionTitle": "# is a country in ...",
                "answerTitle": "# is in ",
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
        if(this.random === 1) {
            this.setCorrectAnswer = () => this.setCorrectAnswerRandom(0, 1)
        } else if([0, 8].includes(this.random)) {
            this.setCorrectAnswer = () => this.setCorrectAnswerRandom(1, 0)
        } else if ([2, 5].includes(this.random)){
            this.setCorrectAnswer = () => this.setCorrectAnswerMaxOrMin(0)
        } else if ([3, 6].includes(this.random)){
            this.setCorrectAnswer = () => this.setCorrectAnswerMaxOrMin(1)
        } else if ([4, 7].includes(this.random)) {
            this.setCorrectAnswer = () => this.setCorrectAnswerNearest()
        }
    }
    chooseChoiceFilterer() {
        this.choiceFilterer = [0, 8].includes(this.random) ? () => this.filterChoices(1) : () => this.filterChoices(0)
    }
}

module.exports = Country