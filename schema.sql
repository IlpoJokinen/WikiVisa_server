CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email varchar(255) NOT NULL,
  password varchar(255) NOT NULL,
  createdAt datetime DEFAULT CURRENT_TIMESTAMP,
  modifiedAt datetime DEFAULT NULL,
  removedAt datetime DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS account_statistics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  total_points INTEGER DEFAULT NULL,
  games_played INTEGER DEFAULT NULL,
  games_won INTEGER DEFAULT NULL,
  games_lost INTEGER DEFAULT NULL,
  winrate INTEGER DEFAULT NULL,
  modifiedAt datetime DEFAULT NULL,
  removedAt datetime DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES accounts (id)
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_name varchar(100) NOT NULL,
  category_pretty_name varchar(255) NOT NULL,
  createdAt datetime DEFAULT CURRENT_TIMESTAMP,
  modifiedAt datetime DEFAULT NULL,
  removedAt datetime DEFAULT NULL,
  active tinyint(4) DEFAULT '1'
);

CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  gamertag varchar(255) NOT NULL,
  firstname varchar(255) DEFAULT NULL,
  lastname varchar(255) DEFAULT NULL,
  sex tinyint(4) DEFAULT NULL,
  age INTEGER DEFAULT NULL,
  modifiedAt datetime DEFAULT NULL,
  removedAt datetime DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES accounts (id)
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  question_name varchar(100) NOT NULL,
  question_pretty_name varchar(255) NOT NULL,
  query varchar(2000) DEFAULT NULL,
  createdAt datetime DEFAULT CURRENT_TIMESTAMP,
  modifiedAt datetime DEFAULT NULL,
  removedAt datetime DEFAULT NULL,
  active tinyint(4) DEFAULT '1',
  FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE TABLE IF NOT EXISTS statistics (
  highest_player_count INTEGER DEFAULT NULL,
  games_played INTEGER DEFAULT NULL,
  unique_user_count INTEGER DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  variant_name varchar(100) NOT NULL,
  variant_pretty_name varchar(255) NOT NULL,
  dataset INTEGER NOT NULL DEFAULT '0',
  answer_title varchar(255) NOT NULL,
  question_title varchar(255) NOT NULL,
  createdAt datetime DEFAULT CURRENT_TIMESTAMP,
  modifiedAt datetime DEFAULT NULL,
  removedAt datetime DEFAULT NULL,
  active tinyint(4) DEFAULT '1',
  FOREIGN KEY (question_id) REFERENCES questions (id)
);

CREATE TABLE IF NOT EXISTS variant_datasets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dataset varchar(255) DEFAULT NULL,
  dataset_index varchar(255) DEFAULT NULL
);

INSERT INTO categories (`id`, `category_name`, `category_pretty_name`, `createdAt`, `modifiedAt`, `removedAt`, `active`) VALUES
	(1, 'geography', 'Geography', '2020-04-14 05:32:11', NULL, NULL, 1),
	(2, 'sport', 'Sport', '2020-04-14 05:32:11', NULL, NULL, 1),
	(3, 'it', 'IT', '2020-04-14 05:32:11', NULL, NULL, 1),
	(4, 'landmarks', 'Landmarks', '2020-04-14 05:32:12', NULL, NULL, 1),
	(5, 'history', 'History', '2020-04-14 05:32:12', NULL, NULL, 1),
	(6, 'math', 'Mathematics', '2020-04-14 05:32:12', NULL, NULL, 1),
	(7, 'people', 'People', '2020-04-14 05:32:12', NULL, NULL, 1);

INSERT INTO questions (`id`, `category_id`, `question_name`, `question_pretty_name`, `query`, `createdAt`, `modifiedAt`, `removedAt`, `active`) VALUES
	(1, 1, 'country', 'Country', 'SELECT DISTINCT ?countryLabel ?capitalLabel ?area ?population ?continentLabel', '2020-04-14 05:47:13', '2020-04-14 05:48:26', NULL, 1),
	(2, 1, 'officialLanguage', 'Official Language', 'SELECT DISTINCT ?countryLabel ?officialLanguageLabel WHERE {', '2020-04-14 05:47:13', '2020-04-14 05:47:55', NULL, 1),
	(3, 1, 'usStates', 'States of the United States', 'SELECT ?stateLabel ?areaLabel ?nickname', '2020-04-14 05:47:13', '2020-04-14 05:48:35', NULL, 1),
	(4, 2, 'nhlPoints', 'NHL Points', 'SELECT DISTINCT ?itemLabel ?pointsLabel \r\n    WHERE \r\n    {\r\n      ?item wdt:P31 wd:Q5 .\r\n      ?item wdt:P641 wd:Q41466 .\r\n      ?item wdt:P118 wd:Q1215892 .\r\n      \r\n      ?item wdt:P6544 ?points .\r\n      ?item wdt:P569 ?dob .\r\n      FILTER (?points > 200 && YEAR(?dob) > 1980)\r\n      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }\r\n    }', '2020-04-14 05:47:13', '2020-04-14 05:51:08', NULL, 1),
	(5, 2, 'winterOlympicYear', 'Winter Olympics', 'SELECT ?itemLabel ?countryLabel WHERE {', '2020-04-14 05:47:13', '2020-04-14 05:49:12', NULL, 1),
	(6, 7, 'literatureNobelist', 'Literature Nobelists', 'SELECT ?laurateLabel ?yearOfPriceReceived (SAMPLE(?bookLabel) AS ?bLabel) ?birthYearLabel ?deathYearLabel {', '2020-04-14 05:47:13', '2020-04-14 05:48:51', NULL, 1);

INSERT INTO variants (`id`, `question_id`, `variant_name`, `variant_pretty_name`, `dataset`, `answer_title`, `question_title`, `createdAt`, `modifiedAt`, `removedAt`, `active`) VALUES
	(1, 1, 'countryCapital', 'Country of Capital', 2, 'Capital of # is', 'What is the capital of #', '2020-04-14 06:11:35', '2020-04-14 06:43:15', NULL, 1),
	(2, 1, 'capitalCountry', 'Capital of Country', 2, '# is the capital of', '# is the capital of ...', '2020-04-14 06:11:35', '2020-04-14 06:43:13', NULL, 1),
	(3, 1, 'smallestCountryArea', 'Smallest Country By Area', 3, 'The smallest country with an area of # km² is', 'Which country is the smallest by area', '2020-04-14 06:11:35', '2020-04-14 06:54:57', NULL, 1),
	(4, 1, 'largestCountryArea', 'Largest Country By Area ', 3, 'The largest country with an area of # km² is', 'Which country is the largest by area', '2020-04-14 06:11:35', '2020-04-14 06:55:00', NULL, 1),
	(5, 1, 'closestCountryInArea', 'Country Closest In Area', 3, 'The closest country in size to # is', 'Which country is the closest in size to #', '2020-04-14 06:11:36', '2020-04-14 06:55:02', NULL, 1),
	(6, 1, 'smallestCountryByPopulation', 'Smallest Country By Population', 4, 'The smallest population of # is in', 'Which country has the smallest population', '2020-04-14 06:11:36', '2020-04-14 06:56:09', NULL, 1),
	(7, 1, 'largestCountryByPopulation', 'Largest Country By Population', 4, 'The largest population of # is in', 'Which country has the largest population', '2020-04-14 06:11:36', '2020-04-14 06:56:12', NULL, 1),
	(8, 1, 'closestCountryInPopulation', 'Country Closest In Population', 4, 'The population most similar in size to # is in', 'Which country has the population closest in size to #', '2020-04-14 06:11:36', '2020-04-14 06:56:14', NULL, 1),
	(9, 1, 'continentOfCountry', 'Continent Of Country', 5, '# is in', '# is a country in ...', '2020-04-14 06:11:36', '2020-04-14 06:56:17', NULL, 1),
	(10, 4, 'playersPoints', 'Total Points Of Player', 6, 'With # points the most points has scored', 'Who of these NHL players has scored the most points', '2020-04-14 06:26:18', '2020-04-14 06:56:29', NULL, 1),
	(11, 4, 'playersGoals', 'Total Goals Of Player', 7, 'With # goals the most goals has scored', 'Who of these NHL players has scored the most goals', '2020-04-14 06:26:18', '2020-04-14 06:56:30', NULL, 1),
	(12, 4, 'playersAssists', 'Total Assists Of Player', 8, 'With # assists the most assists has recorded', 'Who of these NHL players has the most assists recorded', '2020-04-14 06:26:18', '2020-04-14 06:56:32', NULL, 1);

INSERT INTO variant_datasets (`id`, `dataset`, `dataset_index`) VALUES
	(2, 'countryLabel,capitalLabel', '0,1'),
	(3, 'countryLabel,areaLabel', '0,2'),
	(4, 'countryLabel,populationLabel', '0,3'),
	(5, 'countryLabel,continentLabel', '0,4'),
	(6, 'playerLabel,pointsLabel', '0,1'),
	(7, 'playerLabel,goalsLabel', '0,2'),
	(8, 'playerLabel,assistLabel', '0,3'),
	(9, 'stateLabel,areaLabel', '0,1'),
	(10, 'stateLabel,nicknameLabel', '0,2'),
	(11, 'countryLabel,officialLanguageLabel', '0,1'),
	(12, 'authorLabel,yearOfPrizeReceivedLabel', '0,1'),
	(13, 'authorLabel,bookLabel', '0,2'),
	(14, 'authorLabel,birthYearLabel', '0,3'),
	(15, 'authorLabel,deathYearLabel', '0,4'),
	(16, 'itemLabel,countryLabel', '0,1');