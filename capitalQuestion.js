const wiki = require('wikijs').default

function getNationalCapitalsOfCountriesTable() {
    return wiki().page("List_of_national_capitals").then(
        page => {
            return page.tables()
        }
    )
}

function getNationalCapitalsOfCountries() {
    return new Promise((resolve, reject) => {
        let gettingTable = getNationalCapitalsOfCountriesTable()
        gettingTable.then(data => {
            if(!data[0].length) {
                reject("No data in National Capitals table")
            }
            let capitalData = cleanData(data[0]),
                country = "",
                choices = [],
                randomCountryIndex = Math.floor(Math.random() * 4)
            for(let i = 0; i < 4; i++) {
                let randomIndex = Math.floor(Math.random() * capitalData.length),
                    randomCountry = capitalData[randomIndex]
                capitalData.splice(randomIndex, 1) // remove country from pool
                if(i == randomCountryIndex) {
                    country = randomCountry.country
                }
                choices.push(randomCountry.city)
            }
            resolve({
                title: getQuestionTitle('capital', country),
                choices: choices
            })
        })
    })
}

function excludeOn(string) {
    let excludeWhen = ['(', '(claimed)', 'factor'],
        found = false
    excludeWhen.forEach(excludedString => {
        if(string.includes(excludedString)){
            return true 
        }
    })
    return found
}

function cleanData(data) {
    let arr = []
    data.forEach(capital => {
        capital.country = capital.country.replace('}}', '')
        capital.city = capital.city.replace('}}', '')
        if(!excludeOn(capital.country) || !excludeOn(capital.city)) {
            arr.push({
                city: capital.city,
                country: capital.country
            })
        } 
    })
    return arr
}

function getQuestionTitle(type, data) {
    switch(type) {
        case 'capital':
            return `What is the capital of ${data}`
        default:
            return 'Question missing'
    }
}

module.exports = { getNationalCapitalsOfCountries }