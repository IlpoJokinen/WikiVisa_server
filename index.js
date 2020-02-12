const express = require('express')
const cors = require('cors')
const app = express()
const socket = require('socket.io')
const dummyData = require('./players.json')
const port = process.env.PORT || 3001
const wiki = require('wikijs').default

app.use(express.static('./client/build'))
app.get('/', (req, res) => res.send('Hello World!'))

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))
const io = socket(server)
app.use(cors())

function getCountryChoices(countries) {
    let promises = []
    countries.forEach(country => { 
        promises.push(wiki()
            .page(country)
            .then(page => page.info('capital'))
            .then(capital => {
                return capital
            })
        )
    })
    return Promise.all(promises)
}


function getQuestionTitle(type) {
    switch(type) {
        case 'capital':
            return 'Mikä on {} pääkaupunki?'
        default:
            return 'Question missing'
    }
}

function getCapitalQuestion() {
    let countries = []
    return wiki()
        .pagesInCategory('Category:Countries in Europe')
        .then(data => {
            let arr = []
            data.forEach((item, i) => {
                if(item.includes('Category:') && !item.includes(' by ') && !item.includes(' in ') && !item.includes('country') && !item.includes('Fictional')){
                    arr.push(item.split(':')[1])
                }
            })
            for(let i = 0; i < 4; i++) {
                let randomIndex = Math.floor(Math.random() * arr.length) 
                countries.push(arr[randomIndex])
                arr.splice(randomIndex, 1)
            }
        })
        .then(() => getCountryChoices(countries).then(
            choices => {
                return {
                    title: getQuestionTitle('capital'),
                    choices: choices
                }
            }
        ))
}

function getQuestion(type) {
    switch(type) {
        case 'capital':
            return getCapitalQuestion()
        default: 
            console.log('No question type defined')
    }
}

io.on("connection", (socket) => { 
    socket.emit("dummyData", dummyData)
    socket.on("get question", () => {
        const question = getQuestion('capital')
        question.then(data => {
            io.emit("send question", {
                question: data.title,
                choices: data.choices
            })
        })
    })
})