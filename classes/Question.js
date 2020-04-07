const { nodeCache } = require("../fetchData")

class Question {

    constructor() {
        this.nodeCache = nodeCache
    }
    
    setAnswerTitle(string) {
        this.answerTitle = this.variants[this.random].answerTitle.replace("#", string)
    }

    setQuestionTitle(string) {
        this.title = this.variants[this.random].questionTitle.replace('#', string)
    }

    filterChoices(indexOfChoice) {
        let choices = []
        this.randomizedItems.forEach(item => {
            choices.push(item[indexOfChoice])  
        })
        return choices
    }

    getRandomItems(numberOfItems) {
        let randomItems = []
        for(let i = 0; i < numberOfItems; i++) {
            let randomIndex = Math.floor(Math.random() * this.data.length),
                randomItem = this.data[randomIndex];
            this.data.splice(randomIndex, 1)
            let choices = randomItems.map(i => i[1])
            if(choices.includes(randomItem[1])){
                i--
                continue;
            }
            randomItems.push(randomItem)
        }
        return randomItems
    }

    reconstructDataSetForTheVariant() {
        this.data = this.data.map(obj => {
            let newObj = {}
            this.variants[this.random].attributesForDataSet.forEach((key, i) => {
                newObj[i] = obj[key]
            })
            return newObj
        })
        console.log(this.data)
    }

    removeUnusedAttributes() {
        delete this.data
        delete this.randomizedItems
        delete this.answerTitle
        delete this.setCorrectAnswer
        delete this.choiceFilterer
        delete this.random
        delete this.setQuestionTitle
        delete this.setAnswerTitle
        delete this.variants
        delete this.nodeCache
    }

    setCorrectAnswerRandom(indexForAnswer, indexForTitles) {
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
    
    setCorrectAnswerMaxOrMin(minOrMax) {
        this.setQuestionTitle()
        let index = 0
        let helper = {}
        minOrMax === 0 ? helper[1] = Infinity : helper[1] = -Infinity
    
        if(minOrMax === 0){
            this.randomizedItems.forEach((c, i) => {
                if(parseInt(c[1]) < helper[1]){
                    index = i
                    helper = c
                }
            })
        } else if(minOrMax === 1){
            this.randomizedItems.forEach((c, i) => {
                if(parseInt(c[1]) > helper[1]){
                    index = i
                    helper = c
                }
            })
        }
        let beautifiedValue = (Math.round(parseFloat(helper[1]) * 100) / 100).toLocaleString('en').replace(/,/g," ",)
        this.setAnswerTitle(beautifiedValue)
        this.answer = {
            name: helper[0],
            index: index,
            answerTitle: this.answerTitle
        }
    }
    
    setCorrectAnswerNearest(){
        const randomItemIndex = Math.floor(Math.random() * this.randomizedItems.length)
        const randomItem = this.randomizedItems[randomItemIndex]
    
        this.setQuestionTitle(randomItem[0])
        this.setAnswerTitle(randomItem[0])
    
        let smallestDifference = Infinity
        let answerItem = {}
        let index
        let toCompare = randomItem[1]
        //filtteröidään vastausvaihtoehdoista pois verrokkimaa. Esim. Brasilia, jos kysymys on 'mikä näistä maista on pinta-alaltaan lähinnä Brasiliaa'
        this.choices = this.choices.filter(c => c !== randomItem[0])
    
        this.randomizedItems.filter(c => c[1] !== toCompare).forEach((c, i) => {
            let difference = (c[1] - toCompare)**2
            if(difference < smallestDifference){
                answerItem = c
                index = i
                smallestDifference = difference
            }
        })
    
        this.answer = {
            name: answerItem[0],
            index: index,
            answerTitle: this.answerTitle
        }
    
    }
}
module.exports = Question