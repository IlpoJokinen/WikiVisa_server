-- --------------------------------------------------------
-- Host:                         localhost
-- Server version:               8.0.19 - MySQL Community Server - GPL
-- Server OS:                    Linux
-- HeidiSQL Version:             11.0.0.5919
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Dumping database structure for heroku_aa145278c41bde1
CREATE DATABASE IF NOT EXISTS `heroku_aa145278c41bde1` /*!40100 DEFAULT CHARACTER SET utf8 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `heroku_aa145278c41bde1`;

-- Dumping structure for table heroku_aa145278c41bde1.accounts
CREATE TABLE IF NOT EXISTS `accounts` (
  `id` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `removedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table heroku_aa145278c41bde1.account_statistics
CREATE TABLE IF NOT EXISTS `account_statistics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `total_points` int DEFAULT NULL,
  `games_played` int DEFAULT NULL,
  `games_won` int DEFAULT NULL,
  `games_lost` int DEFAULT NULL,
  `winrate` int DEFAULT NULL,
  `modifiedAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `removedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `account_statistics_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table heroku_aa145278c41bde1.categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `category_pretty_name` varchar(255) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `removedAt` datetime DEFAULT NULL,
  `active` tinyint DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table heroku_aa145278c41bde1.profiles
CREATE TABLE IF NOT EXISTS `profiles` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `gamertag` varchar(255) NOT NULL,
  `firstname` varchar(255) DEFAULT NULL,
  `lastname` varchar(255) DEFAULT NULL,
  `sex` tinyint DEFAULT NULL,
  `age` int DEFAULT NULL,
  `modifiedAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `removedAt` datetime DEFAULT NULL,
  UNIQUE KEY `gamertag` (`gamertag`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table heroku_aa145278c41bde1.questions
CREATE TABLE IF NOT EXISTS `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `question_name` varchar(100) NOT NULL,
  `question_pretty_name` varchar(255) NOT NULL,
  `query` varchar(2000) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `removedAt` datetime DEFAULT NULL,
  `active` tinyint DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `question_name` (`question_name`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table heroku_aa145278c41bde1.statistics
CREATE TABLE IF NOT EXISTS `statistics` (
  `highest_player_count` int DEFAULT NULL,
  `games_played` int DEFAULT NULL,
  `unique_user_count` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table heroku_aa145278c41bde1.variants
CREATE TABLE IF NOT EXISTS `variants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `variant_name` varchar(100) NOT NULL,
  `variant_pretty_name` varchar(255) NOT NULL,
  `dataset` int NOT NULL DEFAULT '0',
  `answer_title` varchar(255) NOT NULL,
  `question_title` varchar(255) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `removedAt` datetime DEFAULT NULL,
  `active` tinyint DEFAULT '1',
  `running_number` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `variant_name` (`variant_name`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `variants_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=222 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table heroku_aa145278c41bde1.variant_datasets
CREATE TABLE IF NOT EXISTS `variant_datasets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dataset` varchar(255) DEFAULT NULL,
  `dataset_index` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=111 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
