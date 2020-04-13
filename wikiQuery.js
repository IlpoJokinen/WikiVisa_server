function getUsStates() {    
    return `SELECT ?stateLabel ?areaLabel ?nickname
    WHERE {
            ?state wdt:P31 wd:Q35657 .
            ?state wdt:P1449 ?nickname .
            ?state wdt:P2046 ?area.
                   FILTER (!regex(?nickname, "(الولاية الذهبية|Y Dalaith Aur|Old Line State|Talaith y Grand Canyon)", "i") ).
      
            SERVICE wikibase:label {
                bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" .
            }
        }
        GROUP BY ?stateLabel ?areaLabel ?nickname`
}

//Note return countries several times if country has several official lannguages i.e Finland return Finnish and Swedish
function getCountriesWithOfficialLanguages(){
    //filter former country
    //filter ancient civilisation
    return `SELECT DISTINCT ?countryLabel ?officialLanguageLabel WHERE {
        ?country wdt:P31 wd:Q3624078 . 
        FILTER NOT EXISTS {?country wdt:P31 wd:Q3024240} 
        FILTER NOT EXISTS {?country wdt:P31 wd:Q28171280} 
        OPTIONAL {?country wdt:P37 ?officialLanguage} 
            SERVICE wikibase:label {bd:serviceParam wikibase:language "en"}
        } ORDER BY ?countryLabel`
}

function getCountriesWithCapitals(){
    //filter former country
    //filter ancient civilisation
    //filter countries with no capital
    return `SELECT DISTINCT ?countryLabel ?capitalLabel WHERE {
        ?country wdt:P31 wd:Q3624078 .
        FILTER NOT EXISTS {?country wdt:P31 wd:Q3024240} 
        FILTER NOT EXISTS {?country wdt:P31 wd:Q28171280} 
        FILTER NOT EXISTS {?capital wdt:P31 wd:capital}
        OPTIONAL { ?country wdt:P36 ?capital } .
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
    }
    ORDER BY ?countryLabel`
}

function getCountriesWithPopulation(){
    return `SELECT DISTINCT ?countryLabel ?population
    {
      ?country wdt:P31 wd:Q6256 ;
               wdt:P1082 ?population .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
    }
    GROUP BY ?population ?countryLabel
    ORDER BY DESC(?population)`
}

//country area in km2 
function getCountriesArea (){
 
    return `SELECT DISTINCT ?countryLabel ?area WHERE {
        ?country wdt:P31 wd:Q3624078.
        FILTER(NOT EXISTS { ?country wdt:P31 wd:Q3024240. })
        FILTER(NOT EXISTS { ?country wdt:P31 wd:Q28171280. })
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        OPTIONAL { ?country wdt:P2046 ?area. }
      }
      ORDER BY (?countryLabel)

    `

}



//link decoded from file md5 and country name
function getCountriesAndFlags(){
    let query =
     `SELECT ?label ?flag 
         WHERE {
         ?ident wdt:P31 wd:Q3624078;
             rdfs:label ?label.
             ?ident wdt:P41 ?image.
 
         BIND(REPLACE(wikibase:decodeUri(STR(?image)), "http://commons.wikimedia.org/wiki/Special:FilePath/", "") AS ?fileName)
         BIND(REPLACE(?fileName, " ", "_") AS ?safeFileName)
         BIND(MD5(?safeFileName) AS ?fileNameMD5)
         BIND(CONCAT("https://upload.wikimedia.org/wikipedia/commons/", SUBSTR(?fileNameMD5, 1 , 1 ), "/", SUBSTR(?fileNameMD5, 1 , 2 ), "/", ?safeFileName) AS ?flag)
         FILTER((LANG(?label)) = "en")
         
         }
         ORDER BY ?label
 `
         return query;
 }
// All planets in our solar system
 function getPlanets(){
     return  `SELECT DISTINCT ?itemLabel WITH {
        SELECT ?class ?item {
          ?class wdt:P279* wd:Q17362350 .
          ?item wdt:P31 ?class .
        }
      } AS %items WHERE { 
        INCLUDE %items .
        SERVICE wikibase:label {
          bd:serviceParam wikibase:language "en"
        }
      } `
 }

//Work in progress wont for some reason return periodic table column 1 elements
// and also now return column 8 which today is purely theoretical
function getPeriodicTable(){
    `SELECT DISTINCT ?element ?symbol ?period ?periodNumber
    WHERE
    {
      ?element wdt:P31 wd:Q11344 ;
           wdt:P246 ?symbol ;
           wdt:P279 ?group ;
           wdt:P279 ?period;
      OPTIONAL {
      ?group wdt:P31 wd:Q83306 ;
         p:P31 [pq:P1545 ?groupNumber] .
      } 
      ?period wdt:P31 wd:Q101843 ;
         p:P31 [pq:P1545 ?periodNumber] .
    
    }
    
    ORDER BY ?symbol
    `

    return query; 
}

function getNhlPlayersWithPointsMoreThanTwoHundred (){
    let query =  `SELECT DISTINCT ?itemLabel ?pointsLabel 
    WHERE 
    {
      ?item wdt:P31 wd:Q5 .
      ?item wdt:P641 wd:Q41466 .
      ?item wdt:P118 wd:Q1215892 .
      
      ?item wdt:P6544 ?points .
      ?item wdt:P569 ?dob .
      FILTER (?points > 200 && YEAR(?dob) > 1980)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
    }`
    let encoded = "SELECT%20DISTINCT%20%3FitemLabel%20%3FpointsLabel%20%3FgoalsLabel%20%3FassistsLabel%20%0A%20%20%20%20WHERE%20%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%3Fitem%20wdt%3AP31%20wd%3AQ5%20.%0A%20%20%20%20%20%20%3Fitem%20wdt%3AP641%20wd%3AQ41466%20.%0A%20%20%20%20%20%20%3Fitem%20wdt%3AP118%20wd%3AQ1215892%20.%0A%20%20%20%20%20%20%0A%20%20%20%20%20%20%3Fitem%20wdt%3AP6544%20%3Fpoints%20.%0A%20%20%20%20%20%20%3Fitem%20wdt%3AP6545%20%3Fassists%20.%0A%20%20%20%20%20%20%3Fitem%20wdt%3AP6509%20%3Fgoals%20.%0A%20%20%20%20%20%20%3Fitem%20wdt%3AP569%20%3Fdob%20.%0A%20%20%20%20%20%20FILTER%20%28%3Fpoints%20%3E%20200%20%26%26%20YEAR%28%3Fdob%29%20%3E%201980%29%0A%20%20%20%20%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2Cen%22.%20%7D%0A%20%20%20%20%7D"
    return encoded
}

function getWinterOlympicGames() {
    let query = `SELECT ?itemLabel ?countryLabel WHERE {
        ?item wdt:P31 wd:Q82414;
          wdt:P17 ?country.
        ?item wdt:P585 ?pit .
      FILTER (YEAR(?pit) > 1950 && YEAR(?pit) < 2020)
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
      }
      `
      let encoded = `SELECT%20%3FitemLabel%20%3FcountryLabel%20WHERE%20%7B%0A%20%20%20%20%20%20%20%20%3Fitem%20wdt%3AP31%20wd%3AQ82414%3B%0A%20%20%20%20%20%20%20%20%20%20wdt%3AP17%20%3Fcountry.%0A%20%20%20%20%20%20%20%20%3Fitem%20wdt%3AP585%20%3Fpit%20.%0A%20%20%20%20%20%20FILTER%20%28YEAR%28%3Fpit%29%20%3E%201950%20%26%26%20YEAR%28%3Fpit%29%20%3C%202020%29%0A%20%20%20%20%20%20%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2Cen%22.%20%7D%0A%20%20%20%20%20%20%7D`
      return encoded
}

function nobelLiterature() {
  let query = `SELECT ?laurateLabel ?yearOfPriceReceived (SAMPLE(?bookLabel) AS ?bLabel) ?birthYearLabel ?deathYearLabel {
    ?laurate p:P166 ?p166stm .
    ?p166stm ps:P166 wd:Q37922; pq:P585 ?time .
    ?laurate wdt:P800 ?book.
    ?book rdfs:label ?bookLabel.
    FILTER(LANG(?bookLabel) = "en").
    FILTER (!regex(?bookLabel, "(1944-1959)"))
    ?laurate wdt:P569 ?birth .
    BIND(YEAR(?birth) AS ?birthYear)
    ?laurate wdt:P570 ?death .
    BIND(YEAR(?death) AS ?deathYear)
    BIND(YEAR(?time) AS ?yearOfPriceReceived)
    OPTIONAL { ?p166stm pq:P6208 ?p6208 . FILTER(LANG(?p6208)='en') }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  }
  GROUP BY ?laurateLabel ?bLabel ?birthYearLabel ?deathYearLabel ?yearOfPriceReceived`
  return query
}

function countries() {
  return `SELECT DISTINCT ?countryLabel ?capitalLabel ?area ?population ?continentLabel
  WHERE {
          ?country wdt:P31 wd:Q6256 ;
                   rdfs:label ?countryLabel;
                   FILTER(LANG(?countryLabel) = "en").
                   FILTER (!regex(?countryLabel, "(netherlands|Egypt|Kazakhstan|united states|south africa)", "i") ) .
          ?country wdt:P1082 ?population;
                   wdt:P2046 ?area;
                   wdt:P36 ?capital;
                   wdt:P30 ?continent.
        
    SERVICE wikibase:label {
      bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" .
    }
  }
  GROUP BY ?countryLabel ?capitalLabel ?area ?population ?continentLabel`
}

let questionTypesWithQueries = [
  {questionTypeStr: "officialLanguage", query: encodeURI(getCountriesWithOfficialLanguages())},
  {questionTypeStr: "nhlPlayersPoints", query: getNhlPlayersWithPointsMoreThanTwoHundred()},
  {questionTypeStr: "winterOlympics", query: getWinterOlympicGames()},
  {questionTypeStr: "literatureNobelist", query: encodeURI(nobelLiterature())},
  {questionTypeStr: "country", query: encodeURI(countries())},
  {questionTypeStr: "usStates", query: encodeURI(getUsStates())}
]
    
module.exports =  questionTypesWithQueries
