-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: HotelManagement
-- ------------------------------------------------------
-- Server version	8.0.43-0ubuntu0.24.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Bookings`
--

DROP TABLE IF EXISTS `Bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Bookings` (
  `BookingID` int NOT NULL AUTO_INCREMENT,
  `GuestID` int NOT NULL,
  `RoomID` int NOT NULL,
  `CheckIn` date DEFAULT NULL,
  `CheckOut` date DEFAULT NULL,
  `Status` enum('Pending','Confirmed','Cancelled') DEFAULT 'Pending',
  PRIMARY KEY (`BookingID`),
  KEY `GuestID` (`GuestID`),
  KEY `RoomID` (`RoomID`),
  CONSTRAINT `Bookings_ibfk_1` FOREIGN KEY (`GuestID`) REFERENCES `Guests` (`GuestID`),
  CONSTRAINT `Bookings_ibfk_2` FOREIGN KEY (`RoomID`) REFERENCES `Rooms` (`RoomID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Bookings`
--

LOCK TABLES `Bookings` WRITE;
/*!40000 ALTER TABLE `Bookings` DISABLE KEYS */;
INSERT INTO `Bookings` (`BookingID`, `GuestID`, `RoomID`, `CheckIn`, `CheckOut`, `Status`) VALUES (1,1,4,'2025-10-25','2025-10-27','Confirmed'),(2,2,2,'2025-10-26','2025-10-28','Pending'),(6,1,1,'2025-10-28','2025-10-29','Confirmed');
/*!40000 ALTER TABLE `Bookings` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `UpdateRoomStatus` AFTER INSERT ON `Bookings` FOR EACH ROW BEGIN
    UPDATE Rooms
    SET Status = 'Booked'
    WHERE RoomID = NEW.RoomID;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `LogBookingInsert` AFTER INSERT ON `Bookings` FOR EACH ROW BEGIN
    DECLARE staff_id INT;
    
    SET staff_id = 1; 
    INSERT INTO Logs(StaffID, Action)
    VALUES(staff_id, CONCAT('Booked room ', NEW.RoomID, ' for guest ', NEW.GuestID));
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `FoodOrders`
--

DROP TABLE IF EXISTS `FoodOrders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `FoodOrders` (
  `OrderID` int NOT NULL AUTO_INCREMENT,
  `GuestID` int NOT NULL,
  `Item` varchar(100) DEFAULT NULL,
  `Quantity` int DEFAULT NULL,
  `Status` enum('Pending','Delivered') DEFAULT 'Pending',
  `OrderTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`OrderID`),
  KEY `GuestID` (`GuestID`),
  CONSTRAINT `FoodOrders_ibfk_1` FOREIGN KEY (`GuestID`) REFERENCES `Guests` (`GuestID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FoodOrders`
--

LOCK TABLES `FoodOrders` WRITE;
/*!40000 ALTER TABLE `FoodOrders` DISABLE KEYS */;
INSERT INTO `FoodOrders` (`OrderID`, `GuestID`, `Item`, `Quantity`, `Status`, `OrderTime`) VALUES (1,1,'Pizza',1,'Delivered','2025-10-28 13:44:16'),(2,1,'Burger',2,'Pending','2025-10-28 13:44:16'),(3,2,'Pasta',1,'Delivered','2025-10-28 13:44:16'),(4,1,'Pizza Margherita',1,'Delivered','2025-10-28 13:58:19'),(5,1,'Caesar Salad',2,'Pending','2025-10-28 13:58:19'),(6,1,'Chocolate Cake',1,'Delivered','2025-10-28 13:58:19'),(7,1,'burger',4,'Pending','2025-10-28 14:46:58');
/*!40000 ALTER TABLE `FoodOrders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `GuestDashboard`
--

DROP TABLE IF EXISTS `GuestDashboard`;
/*!50001 DROP VIEW IF EXISTS `GuestDashboard`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `GuestDashboard` AS SELECT 
 1 AS `GuestID`,
 1 AS `GuestName`,
 1 AS `Email`,
 1 AS `RoomNumber`,
 1 AS `RoomType`,
 1 AS `CheckIn`,
 1 AS `CheckOut`,
 1 AS `FoodItem`,
 1 AS `Quantity`,
 1 AS `FoodStatus`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `Guests`
--

DROP TABLE IF EXISTS `Guests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Guests` (
  `GuestID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `Name` varchar(100) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`GuestID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `Guests_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Guests`
--

LOCK TABLES `Guests` WRITE;
/*!40000 ALTER TABLE `Guests` DISABLE KEYS */;
INSERT INTO `Guests` (`GuestID`, `UserID`, `Name`, `Email`, `Phone`) VALUES (1,1,'John Doe','john@example.com','1234567890'),(2,2,'Jane Smith','jane@example.com','0987654321');
/*!40000 ALTER TABLE `Guests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Logs`
--

DROP TABLE IF EXISTS `Logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Logs` (
  `LogID` int NOT NULL AUTO_INCREMENT,
  `StaffID` int DEFAULT NULL,
  `Action` varchar(255) DEFAULT NULL,
  `ActionTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`LogID`),
  KEY `StaffID` (`StaffID`),
  CONSTRAINT `Logs_ibfk_1` FOREIGN KEY (`StaffID`) REFERENCES `Staff` (`StaffID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Logs`
--

LOCK TABLES `Logs` WRITE;
/*!40000 ALTER TABLE `Logs` DISABLE KEYS */;
INSERT INTO `Logs` (`LogID`, `StaffID`, `Action`, `ActionTime`) VALUES (1,1,'Booked room 4 for guest 1','2025-10-28 13:44:12'),(2,1,'Booked room 2 for guest 2','2025-10-28 13:44:12'),(5,1,'Booked room 1 for guest 1','2025-10-28 14:46:49');
/*!40000 ALTER TABLE `Logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Rooms`
--

DROP TABLE IF EXISTS `Rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Rooms` (
  `RoomID` int NOT NULL AUTO_INCREMENT,
  `RoomNumber` varchar(10) NOT NULL,
  `Type` enum('Single','Double','Suite') NOT NULL,
  `Status` enum('Available','Booked') DEFAULT 'Available',
  `Price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`RoomID`),
  UNIQUE KEY `RoomNumber` (`RoomNumber`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Rooms`
--

LOCK TABLES `Rooms` WRITE;
/*!40000 ALTER TABLE `Rooms` DISABLE KEYS */;
INSERT INTO `Rooms` (`RoomID`, `RoomNumber`, `Type`, `Status`, `Price`) VALUES (1,'101','Single','Booked',1500.00),(2,'102','Double','Booked',2500.00),(3,'103','Suite','Available',5000.00),(4,'201','Single','Booked',1500.00),(5,'202','Double','Available',2500.00),(13,'401','Single','Available',2000.00),(14,'205','Single','Available',2000.00);
/*!40000 ALTER TABLE `Rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Staff`
--

DROP TABLE IF EXISTS `Staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Staff` (
  `StaffID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `Name` varchar(100) DEFAULT NULL,
  `Position` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`StaffID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `Staff_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Staff`
--

LOCK TABLES `Staff` WRITE;
/*!40000 ALTER TABLE `Staff` DISABLE KEYS */;
INSERT INTO `Staff` (`StaffID`, `UserID`, `Name`, `Position`) VALUES (1,3,'Admin User','Manager');
/*!40000 ALTER TABLE `Staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(50) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `Role` enum('Guest','Staff') NOT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Username` (`Username`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` (`UserID`, `Username`, `PasswordHash`, `Role`, `Email`, `Phone`, `CreatedAt`) VALUES (1,'guest1','guest123','Guest',NULL,NULL,'2025-10-28 13:44:23'),(2,'guest2','guest123','Guest',NULL,NULL,'2025-10-28 13:44:23'),(3,'staff1','staff123','Staff',NULL,NULL,'2025-10-28 13:44:23');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'HotelManagement'
--

--
-- Final view structure for view `GuestDashboard`
--

/*!50001 DROP VIEW IF EXISTS `GuestDashboard`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `GuestDashboard` AS select `g`.`GuestID` AS `GuestID`,`g`.`Name` AS `GuestName`,`g`.`Email` AS `Email`,`r`.`RoomNumber` AS `RoomNumber`,`r`.`Type` AS `RoomType`,`b`.`CheckIn` AS `CheckIn`,`b`.`CheckOut` AS `CheckOut`,`f`.`Item` AS `FoodItem`,`f`.`Quantity` AS `Quantity`,`f`.`Status` AS `FoodStatus` from (((`Guests` `g` left join `Bookings` `b` on((`g`.`GuestID` = `b`.`GuestID`))) left join `Rooms` `r` on((`b`.`RoomID` = `r`.`RoomID`))) left join `FoodOrders` `f` on((`g`.`GuestID` = `f`.`GuestID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-28 21:27:03
