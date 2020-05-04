const { nodeCache } = require("../fetchFromDb")

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
            if(this.isADuplicate(randomItems, randomItem)){
                i--
                continue;
            }
            randomItems.push(randomItem)
        }
        return randomItems
    }
    //tarkistaa ettei randomisoinnissa tule duplikaatteja 
    isADuplicate(randomItems, randomItem) {
        let zeros = randomItems.map(r => r[0])
        let ones = randomItems.map(r => r[1])
        if(zeros.includes(randomItem[0])){
            return true
        }else if(ones.includes(randomItem[1])){
            return true
        } else return false
    }

    controlThatOnlyOneCorrectAnswer(choiceIndex) {
        //etsi datasta oikean vastauksen kaikki ilmentymät ja laita ne kielet listaan
        let answerCountrysLanguages = this.data.filter(x => x[0] === this.randomizedItems[this.answer.index][0]).map(x => x[1])
        //väärät vastaukset listassa
        let withoutCorrectAnswer = this.randomizedItems.filter((x, i) => i !== this.answer.index)
        //etsi datasta jokaisen väärän vastauksen virallisetkielet ja laita ne listaan ja tarkista löytyykö samoja kuin oikean vastauksen kielilistalta 
        //jos löytyy niin korvaa
        let newChoices = withoutCorrectAnswer.map(item => {
            let itemsOfficialLanguages = this.data.filter(x => x[0] === item[0]).map(x => x[1]).concat(item[1])
            if(this.haveCommonElements(answerCountrysLanguages, itemsOfficialLanguages)){

                return this.replaceObject(answerCountrysLanguages)
                
            }
            else return item
        })
        //päivitä choicet
        this.choices = newChoices.map(choice => choice[choiceIndex])
        this.choices.splice(this.answer.index, 0, this.answer.name)
    }

    haveCommonElements(arr1, arr2) { 
        return arr1.some(item => arr2.includes(item)) 
    } 

    replaceObject(answerCountrysLanguagesArray) {
        while(true) {
            let randomIndex = Math.floor(Math.random() * this.data.length),
                randomItem = this.data[randomIndex];
            let allInstances = this.data.filter(x => x[0] === randomItem[0]).map(x => x[1])
            if(this.haveCommonElements(answerCountrysLanguagesArray, allInstances)){
                continue
            } else {
                return randomItem
            }
        }
    }


    reconstructDataSetForTheVariant() {
        this.data = this.data.map(obj => {
            let newObj = {}
            this.variants[this.random].dataset.split(",").forEach((key, i) => {
                newObj[i] = obj[key]
            })
            return newObj
        })
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
        delete this.answerObjectsOtherAttribute
    }

    setCorrectAnswerRandom(indexForAnswer, indexForTitles) {
        const randomItemIndex = Math.floor(Math.random() * this.randomizedItems.length)
        const randomItem = this.randomizedItems[randomItemIndex]
        this.answerObjectsOtherAttribute = randomItem[indexForTitles]
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