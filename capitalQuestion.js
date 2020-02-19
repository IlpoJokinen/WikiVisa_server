const wiki = require('wikijs').default



function getCountryChoices(countries) {
    let promises = []
    countries.forEach(country => { 
        promises.push(wiki()
            .page(country)
            .then(page => {
                
                return page.info('capital')
            })
            .then(capital => {
                //kosovo vatica
                console.log(country)
                if(country === "Croatia" || country === "Switzerland") {
                    console.log(capital)
                    console.log(capital[1])
                    return capital[1]
                }
            
                console.log(capital)
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
    console.log("2")
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
            console.log(arr)
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

module.exports = { getCapitalQuestion }

