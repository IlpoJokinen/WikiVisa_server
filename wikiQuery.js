function getUsStates() {    
    return `SELECT ?stateLabel ?areaLabel ?nicknameLabel
    WHERE {
            ?state wdt:P31 wd:Q35657 .
            ?state wdt:P1449 ?nickname .
            ?state wdt:P2046 ?area.
                   FILTER (!regex(?nickname, "(الولاية الذهبية|Y Dalaith Aur|Old Line State|Talaith y Grand Canyon)", "i") ).
      
            SERVICE wikibase:label {
                bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" .
            }
        }
        GROUP BY ?stateLabel ?areaLabel ?nicknameLabel`
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
    let query =  `SELECT DISTINCT ?playerLabel ?pointsLabel ?goalsLabel ?assistsLabel
    WHERE 
    {
      ?player wdt:P31 wd:Q5 ;
              rdfs:label ?playerLabel.
              FILTER(LANG(?playerLabel) = "en").
              FILTER (!regex(?playerLabel, "(Jamie McGinn|Сем Райнгарт|Цукер, Джейсон|Corey Perry)", "i") ).
      ?player wdt:P641 wd:Q41466 .
      ?player wdt:P118 wd:Q1215892 .
      ?player wdt:P6544 ?points .
      ?player wdt:P6509 ?goals .
      ?player wdt:P6545 ?assists .
      ?player wdt:P569 ?dob .
      FILTER (?points > 200 && YEAR(?dob) > 1980) .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
   }
    GROUP BY ?playerLabel ?pointsLabel ?goalsLabel ?assistsLabel`
    let encoded = "SELECT%20DISTINCT%20%3FplayerLabel%20%3FpointsLabel%20%3FgoalsLabel%20%3FassistsLabel%0A%20%20%20%20WHERE%20%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%3Fplayer%20wdt%3AP31%20wd%3AQ5%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20rdfs%3Alabel%20%3FplayerLabel.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20FILTER%28LANG%28%3FplayerLabel%29%20%3D%20%22en%22%29.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20FILTER%20%28%21regex%28%3FplayerLabel%2C%20%22%28Jamie%20McGinn%7C%D0%A1%D0%B5%D0%BC%20%D0%A0%D0%B0%D0%B9%D0%BD%D0%B3%D0%B0%D1%80%D1%82%7C%D0%A6%D1%83%D0%BA%D0%B5%D1%80%2C%20%D0%94%D0%B6%D0%B5%D0%B9%D1%81%D0%BE%D0%BD%7CCorey%20Perry%29%22%2C%20%22i%22%29%20%29.%0A%20%20%20%20%20%20%3Fplayer%20wdt%3AP641%20wd%3AQ41466%20.%0A%20%20%20%20%20%20%3Fplayer%20wdt%3AP118%20wd%3AQ1215892%20.%0A%20%20%20%20%20%20%3Fplayer%20wdt%3AP6544%20%3Fpoints%20.%0A%20%20%20%20%20%20%3Fplayer%20wdt%3AP6509%20%3Fgoals%20.%0A%20%20%20%20%20%20%3Fplayer%20wdt%3AP6545%20%3Fassists%20.%0A%20%20%20%20%20%20%3Fplayer%20wdt%3AP569%20%3Fdob%20.%0A%20%20%20%20%20%20FILTER%20%28%3Fpoints%20%3E%20200%20%26%26%20YEAR%28%3Fdob%29%20%3E%201980%29%20.%0A%20%20%20%20%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2Cen%22.%20%7D%0A%20%20%20%7D%0AGROUP%20BY%20%3FplayerLabel%20%3FpointsLabel%20%3FgoalsLabel%20%3FassistsLabel"
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
  let query = `SELECT ?laurateLabel  (SAMPLE(?bLabel) AS ?bookLabel) ?birthYearLabel ?deathYearLabel ?yearOfPrizeReceivedLabel {
    ?laurate p:P166 ?p166stm .
    ?p166stm ps:P166 wd:Q37922; pq:P585 ?time .
    ?laurate wdt:P800 ?b.
    ?b rdfs:label ?bLabel.
    FILTER(LANG(?bLabel) = "en").
    FILTER (!regex(?bLabel, "(1944-1959|O priči i pričanju|Bhanusimha Thakurer Padabali)"))
    ?laurate wdt:P569 ?birth .
    BIND(YEAR(?birth) AS ?birthYear)
    ?laurate wdt:P570 ?death .
    BIND(YEAR(?death) AS ?deathYear)
    BIND(YEAR(?time) AS ?yearOfPrizeReceived)
    OPTIONAL { ?p166stm pq:P6208 ?p6208 . FILTER(LANG(?p6208)='en') }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  }
  GROUP BY ?laurateLabel ?bookLabel ?birthYearLabel ?deathYearLabel ?yearOfPrizeReceivedLabel`
  return query
}

function countries() {
  return `SELECT DISTINCT ?countryLabel ?capitalLabel ?areaLabel ?populationLabel ?continentLabel
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
  GROUP BY ?countryLabel ?capitalLabel ?areaLabel ?populationLabel ?continentLabel`
}

function wars() {
  return `SELECT ?warLabel ?startYear ?endYear ?partOfLabel
  WHERE 
  {
    ?war wdt:P31 wd:Q198;
         rdfs:label ?warLabel.
         FILTER(LANG(?warLabel) = "en").
    ?war p:P361 ?partOfStream .
    OPTIONAL{ ?war wdt:P361 ?partOf }
    
    ?partOf rdfs:label ?partOfLabel.
        FILTER(LANG(?partOfLabel) = "en").
    ?war wdt:P580 ?sYear .
    BIND(YEAR(?sYear) AS ?startYear)
    ?war wdt:P582 ?eYear .
    BIND(YEAR(?eYear) AS ?endYear)
    ?war wdt:P585 ?pit.
    FILTER(YEAR(?sYear) > 1900).
    FILTER(YEAR(?pit) > 1900).
     FILTER (!regex(?warLabel, "(.*[0-9].*|Pig War|Contra insurgency|Albanian resistance during World War II|World War I outside Europe|Romania during World War I|World War II in Yugoslavia|South-East Asian theatre of World War II)", "i") ).
    FILTER (regex(?warLabel, "(war|conflict)", "i")).
    FILTER (!regex(?partOfLabel, "(Eastern Front)", "i")).
  
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  }
  GROUP BY ?warLabel ?startYear ?endYear ?partOfLabel `
}

let questionTypesWithQueries = [
  {questionTypeStr: "officialLanguage", query: encodeURI(getCountriesWithOfficialLanguages())},
  {questionTypeStr: "nhlPlayersPoints", query: getNhlPlayersWithPointsMoreThanTwoHundred()},
  {questionTypeStr: "winterOlympics", query: getWinterOlympicGames()},
  {questionTypeStr: "literatureNobelist", query: encodeURI(nobelLiterature())},
  {questionTypeStr: "country", query: encodeURI(countries())},
  {questionTypeStr: "usStates", query: encodeURI(getUsStates())},
  {questionTypeStr: "war", query: encodeURI(wars())}
]
    
module.exports =  questionTypesWithQueries
