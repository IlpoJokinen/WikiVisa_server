const express = require('express')
const app = express()
const socket = require('socket.io')
const dummyData = require('./players.json')
const port = process.env.PORT || 3001
const wiki = require('wikijs').default

app.use(express.static('./client/build'))
app.get('/', (req, res) => res.send('Hello World!'))

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))
const io = socket(server)

const prefixes = ['Capitals by continent', 'Countries']
const getRandomPrefix = () => Math.floor(Math.random() * prefixes.length) + 1
let questionCategory = "";
//

let ignore = ['(country)', 'Post-', 'micro', 'states']
wiki()
.pagesInCategory('Category:Countries in Europe')
.then((data) => {
    let arr = [], countries = [];
    data.forEach((item, i) => {
        if(item.includes('Category:') && !item.includes(' by ') && !item.includes(' in ')  && !item.includes('country') && !item.includes('Fictional')){
            arr.push(item.split(':')[1])
        }
    })
    for(let i = 0; i < 4; i++) {
        countries.push(arr[Math.floor(Math.random() * arr.length)])
    }
    let obj = {}
    let promises = []
    countries.forEach((country, i) => {        
        promises.push(wiki()
        .page(country)
        .then(page => page.info('capital'))
        .then((capital) => {
            obj[country] = capital
        })
    )})
    Promise.all(promises).then(() => console.log(obj))    
})

function stmt(item) {
    ignore.forEach((row, i) => {
        if(item.includes(row)){
            
            return true
        }
    })
    return false
}

/*

    // Mikä on Suomen pääkaupunki
    // Helsinki

    let obj = {
        'Finland': true,
        'Sweden': false,
        'Australia': false,
        'Germany': false,
    }

    let arr = ['Finland', 'Sweden', 'Germany', 'Australia']
    for(let i = 0; i < 4; i++) {
        wiki()
        .page(arr[i])
        .then(page => {
            let c = page.info('capital')
        })
        .then(console.log); 
    }
*/
    
//

io.on("connection", (socket) => { 

    socket.emit("dummyData", dummyData)

    
    socket.on("click", (data) => {
        socket.broadcast.emit("someoneClicked", data)
        socket.emit("senderConfirmation", "message sent")
    })
})

    
