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

let ignore = ['(country)', 'Post-', 'micro', 'states']

function getQuestion() {
    let choices = [], promises = []
    wiki()
    .pagesInCategory('Category:Countries in Europe')
    .then((data) => {
        let arr = [], countries = [];
        data.forEach((item, i) => {
            if(item.includes('Category:') && !item.includes(' by ') && !item.includes(' in ') && !item.includes('country') && !item.includes('Fictional')){
                arr.push(item.split(':')[1])
            }
        })
        
        for(let i = 0; i < 4; i++) {
            let random = Math.floor(Math.random() * arr.length) // random country
            countries.push(arr[random])
            arr.splice(random, 1)
        }
        
        countries.forEach((country, i) => { 
            promises.push(wiki()
                .page(country)
            )
        })
    })
    Promise.all(promises).then((data) => {
        console.log(data)
        data.forEach((e, i) => {
            e.then(page => page.info('capital'))
            .then((capital) => {
                choices.push(capital)
            })
        })
        return choices
    })
}
    
io.on("connection", (socket) => { 
    
    socket.emit("dummyData", dummyData)
    
    socket.on("get question", () => {
        let choices = getQuestion()
        io.emit("send question", {
            question: 'Mikä on Suomen pääkaupunki',
            choices: choices
        })
    })
    
})