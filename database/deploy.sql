-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: retriever_essential
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `product_id` varchar(20) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `weight_amount` float DEFAULT NULL,
  `price_per_unit` decimal(10,2) NOT NULL,
  `order_quantity` int DEFAULT NULL,
  `description` text,
  `type` varchar(50) DEFAULT NULL,
  `vendor_id` int DEFAULT NULL,
  `max_signout_quantity` int DEFAULT NULL,
  `max_signout_weight` float DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  KEY `fk_vendor` (`vendor_id`),
  CONSTRAINT `fk_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`vendor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES ('100000000001','Test Item 1',0,1.00,2,'Test description 1','Testitem',20,5,5),('100000000004','Test Item 2',2,2.00,NULL,'Test description 2','Test',21,5,5),('1000000000050','Test Item 14',NULL,1.00,100,'Test description 14','Test',25,5,5),('1000000000059','TestV',NULL,1.00,90,'Test 59','Test',27,5,5),('200000000001','Test Item 3',3,3.00,0,'Test description 3','Test',22,5,5),('2000000000011','Test Item 4',0,4.00,5,'Test description 4','Test',22,5,5),('200000000002','Test Item 5',0,5.00,5,'Test description 5','Test',23,5,5),('200000000003','Test Item 6',6,6.00,NULL,'Test description 6','Test',21,5,5),('200000000004','Test Item 7',0,7.00,5,'Test description 7','Test',21,5,5),('200000000005','Test Item 8',8,8.00,NULL,'Test description 8','Test',22,5,5),('200000000006','Test Item 9',0,9.00,5,'Test description 9','Test',22,5,5),('200000000007','Test Item 10',10,10.00,NULL,'Test description 10','Test',23,5,5),('200000000008','Test Item 11',NULL,11.00,11,'Test description 11','Test',23,5,5),('200000000009','Test Item 12',NULL,12.00,12,'Test description 12','Test',24,5,5),('200000000010','Test Item 13',NULL,13.00,13,'Test description 13','Test',24,5,5);
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(10) NOT NULL,
  `product_id` varchar(20) NOT NULL,
  `quantity_taken` float NOT NULL,
  `user_status` varchar(20) NOT NULL,
  `taken_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `user_id` (`user_id`),
  KEY `transactions_ibfk_2` (`product_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `items` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (4,'UO60232','200000000002',1,'undergraduate','2025-05-02 02:28:56'),(5,'UO60232','200000000002',2,'undergraduate','2025-05-02 02:39:40'),(6,'UO60232','200000000006',10,'undergraduate','2025-05-02 02:50:14'),(7,'UO60232','200000000004',11,'undergraduate','2025-05-04 07:38:32'),(8,'UO60232','200000000003',5,'undergraduate','2025-05-04 07:38:32'),(9,'UO60232','200000000006',1,'undergraduate','2025-05-04 07:38:32'),(10,'GT39685','200000000007',2,'graduate','2025-05-04 07:46:34'),(11,'GT39685','200000000008',1,'graduate','2025-05-04 07:46:34'),(12,'GT39685','200000000006',12,'graduate','2025-05-04 07:48:54'),(13,'GT39685','200000000006',4,'graduate','2025-05-04 07:50:17'),(14,'GT39685','200000000003',1,'graduate','2025-05-04 07:50:25'),(15,'GT39685','200000000006',1,'graduate','2025-05-04 07:51:32'),(16,'UO60232','200000000005',1,'undergraduate','2025-05-04 08:16:27'),(17,'UO60232','200000000008',1,'undergraduate','2025-05-04 08:16:34'),(18,'UO60232','200000000008',2,'undergraduate','2025-05-04 08:19:02'),(19,'UO60232','200000000009',3,'undergraduate','2025-05-04 08:20:03'),(20,'UO60232','200000000002',1,'undergraduate','2025-05-04 09:23:03'),(21,'UO60232','200000000004',1,'undergraduate','2025-05-04 09:23:03'),(22,'UO60232','200000000006',1,'undergraduate','2025-05-04 09:23:03'),(23,'UO60232','200000000004',50,'undergraduate','2025-05-04 09:33:35'),(24,'UO60232','200000000001',1,'undergraduate','2025-05-05 03:19:39'),(25,'UO60232','100000000001',2,'undergraduate','2025-05-05 03:19:39'),(26,'UO60232','200000000005',2,'undergraduate','2025-05-05 03:20:36'),(27,'UO60232','200000000006',6,'undergraduate','2025-05-05 03:20:36'),(28,'UO60232','100000000004',10,'undergraduate','2025-05-05 17:53:26'),(29,'UO60232','200000000005',1,'undergraduate','2025-05-05 22:20:00'),(30,'UO60232','100000000004',50,'undergraduate','2025-05-05 22:20:48'),(31,'UO60232','200000000005',1,'undergraduate','2025-05-05 22:20:48'),(32,'UO60232','100000000004',10,'undergraduate','2025-05-06 03:44:31'),(33,'UO60232','200000000001',10,'undergraduate','2025-05-06 03:44:31'),(34,'UO60232','1000000000059',5,'undergraduate','2025-05-06 18:39:20'),(35,'TT83676','1000000000059',5,'graduate','2025-05-06 18:40:36'),(36,'UO60232','100000000001',3,'undergraduate','2025-05-06 21:03:51');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` varchar(10) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(20) NOT NULL,
  `status` enum('Graduate','Undergraduate','Admin') NOT NULL,
  `role` enum('admin','student') DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('GT39685','Grad','Test','grad@gmail.com','9823711371','123456','Graduate','student'),('TT83676','Test','Two','teattwo@gmail.com','9822373221','123456','Graduate','student'),('UA57449','user','admin','admin@gmail.com','0912837427','123456','Admin','admin'),('UO60232','user','one','a@fsd.vcn','9810951011','123456','Undergraduate','student');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendors` (
  `vendor_id` int NOT NULL AUTO_INCREMENT,
  `vendor_name` varchar(100) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `address` text,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`vendor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendors`
--

LOCK TABLES `vendors` WRITE;
/*!40000 ALTER TABLE `vendors` DISABLE KEYS */;
INSERT INTO `vendors` VALUES (20,'Vendor-1','V1P','V1 address','983289323','v1@gmail.com'),(21,'Vendor-2','V2P','v2 address','982498243','v2@gmil.com'),(22,'Vendor-3','V3P','V3 address','9000000003','v3@gmail.com'),(23,'Vendor-4','V4P','V4 address','9000000004','v4@gmail.com'),(24,'Vendor-5','V5P','V5 address','9000000005','v5@gmail.com'),(25,'Vendor-6','V6P','V6 address','9000000006','v6@gmail.com'),(27,'Test_V','test person','vendor address','9812873222','testv@gmail.com');
/*!40000 ALTER TABLE `vendors` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-08  0:26:15
