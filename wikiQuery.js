function getUsStates() {    
    return `SELECT ?stateLabel WHERE {
        ?state wdt:P31 wd:Q35657 .
        SERVICE wikibase:label {
            bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" .
        }
    }`
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
    
module.exports = { 
    getUsStates,
    getCountriesWithOfficialLanguages,
    getCountriesWithCapitals 
}