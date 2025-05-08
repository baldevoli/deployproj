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
INSERT INTO `items` VALUES ('100000000001','Sona Masoori Rice',NULL,25.00,1,'Premium quality rice popular in Indian households','Grain',1),('100000000002','Toor Dahl (Red Lentils)',179,1.25,NULL,'High-protein lentils used in Indian cooking','Lentil',2),('100000000003','Black chickpeas (channa)',85,1.25,NULL,'Protein-rich legumes ideal for curries','Legume',2),('100000000004','Maggi Noodles',NULL,0.50,200,'Instant noodles, a student favorite snack','Instant',3),('100000000005','PARLE KREAM BOUR',NULL,0.49,5,'Cream-filled biscuits, sweet and crunchy','Snack',4),('100000000006','P HID SEEK BOURB',NULL,0.49,10,'Classic Indian chocolate biscuits','Snack',4),('100000000007','SW MASL BANA',NULL,0.99,10,'Savory banana chips with masala seasoning','Snack',4),('100000000008','GOP SNACK PE CHO',NULL,1.29,10,'Crunchy Indian snack with spicy peas','Snack',4),('100000000009','AD BANGA MIX',NULL,1.99,10,'Traditional Indian mixture snack','Snack',4),('100000000010','SW BHEL CUP',NULL,1.29,10,'Instant bhel puri snack in a cup','Instant',3),('100000000011','MAGIC MAS UPMA',NULL,1.29,10,'Instant upma – a savory South Indian breakfast','Instant',3),('100000000012','KURKURE MSL',NULL,0.89,10,'Spicy Indian-style corn puff snack','Snack',4),('100000000013','LAYS CHILE LIMON',NULL,0.89,10,'Tangy and spicy potato chips','Snack',4),('100000000014','MTR navaratan korma',NULL,2.99,10,'Ready-to-eat royal vegetable curry','Meal',5),('100000000015','MTR alu muttar',NULL,2.99,10,'Potato and peas curry in tomato gravy','Meal',5),('100000000016','MTR mutter paneer',NULL,2.99,10,'Cottage cheese and peas in curry sauce','Meal',5),('100000000017','Mixed vegetable curry',NULL,2.99,10,'Assorted vegetables in traditional curry','Meal',5),('100000000018','MTR palak paneer',NULL,2.99,10,'Spinach and cottage cheese curry','Meal',5),('100000000019','MTR shahi paneer',NULL,2.99,10,'Rich and creamy paneer curry','Meal',5),('100000000020','MTR bhindi masala',NULL,2.99,10,'Spicy okra curry with Indian spices','Meal',5),('100000000021','MTR alu methi',NULL,2.99,10,'Potatoes cooked with fenugreek leaves','Meal',5),('100000000022','MTR chana masala',NULL,2.99,10,'Chickpeas cooked in tangy tomato gravy','Meal',5),('100000000023','MTR kadhi pakora',NULL,2.99,10,'Spiced yogurt curry with fritters','Meal',5),('100000000024','GITS paneer tikka masala',NULL,2.99,10,'Paneer cubes in tikka-style gravy','Meal',5),('100000000025','GITS bhindi masala',NULL,2.99,10,'Ready-to-eat okra in spicy curry','Meal',5),('100000000026','GITS pau bhakti',NULL,2.99,10,'Instant version of classic street food pav bhaji','Instant',3),('100000000027','GITS paneer makhani',NULL,2.99,10,'Creamy tomato-based paneer curry','Meal',5),('100000000028','GITS aloo raswala',NULL,2.99,10,'Spiced potato curry with gravy','Meal',5),('100000000029','GITS veg biryani',NULL,2.99,10,'Flavored rice with mixed vegetables','Meal',5),('100000000030','5 Minute khana aloo mutter',NULL,2.99,10,'Quick aloo-mutter curry in 5 minutes','Instant',3),('100000000031','5 Minute khana pao bhaji',NULL,2.99,10,'Instant pav bhaji mix ready in 5 minutes','Instant',3),('100000000032','fries',NULL,12.00,11,'food item','Lentil',2),('100000000033','fries',NULL,1.00,12,'name ','Snack',14),('100000000034','fries',NULL,1.00,12,'make ','food',14),('12800000000000000001','testbarcode',NULL,12.00,212,'test','Other',14);
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-14 16:54:24
