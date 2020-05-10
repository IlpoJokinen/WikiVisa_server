const Question = require("../../Question")

class VideoGames extends Question{
    constructor(){
        super()
        this.data = this.nodeCache.get("data").games.videoGames.data
        this.variants = this.nodeCache.get("data").games.videoGames.variants
        this.random = Math.floor(Math.random() * this.variants.length)
        //tämä funktio hoitaa datan muokkaamisen oikeanlaiseen muotoon kyseistä varianttia varten
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
    //tässä valitaan oikean vastauksen määrittävä funktio variantin mukaan
    chooseAnswerSetter() {
        this.setCorrectAnswer = () => this.setCorrectAnswerRandom(1, 0)
    }
    //tässä valitaan vastausvaihtoehdot määrittävä funktio variantin mukaan
    chooseChoiceFilterer() {
        this.choiceFilterer = () => this.filterChoices(1)
    }
}

module.exports = VideoGames