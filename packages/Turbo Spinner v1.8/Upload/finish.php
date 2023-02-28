<?php
/*
 * @author Balaji
 */
error_reporting(1);
require_once("config.php");

$admin_user = htmlspecialchars(Trim($_POST['admin_user']));
$admin_pass = Md5(htmlspecialchars(Trim($_POST['admin_pass'])));

$con = mysqli_connect($mysql_host,$mysql_user,$mysql_pass,$mysql_database);

  if (mysqli_connect_errno())
  {
  echo "Failed to connect:". mysqli_connect_error()."<br>";
  }

$sql = "CREATE TABLE admin 
(
id INT NOT NULL AUTO_INCREMENT,
PRIMARY KEY(id),
user VARCHAR(250),
pass VARCHAR(250)
)";
    // Execute query
    if (mysqli_query($con,$sql)) {
    echo "Admin Table created successfully <br>";
    } else {
    echo "Error creating table: " . mysqli_error($con)."<br>";
     }
     
    $query = "INSERT INTO admin (user,pass) VALUES ('$admin_user','$admin_pass')"; 
    mysqli_query($con,$query);
    
$sql = "CREATE TABLE admin_history 
(
id INT NOT NULL AUTO_INCREMENT,
PRIMARY KEY(id),
last_date VARCHAR(255),
ip VARCHAR(255)
)";
    // Execute query
    if (mysqli_query($con,$sql)) {
    echo "Admin History Table created successfully <br>";
    } else {
    echo "Error creating table: " . mysqli_error($con)."<br>";
     }
   $query = "INSERT INTO admin_history (last_date,ip) VALUES ('14th July 2016','23.54.2.43')"; 
   mysqli_query($con,$query);
   $query = "INSERT INTO admin_history (last_date,ip) VALUES ('14th July 2016','26.32.34.33')"; 
   mysqli_query($con,$query);
   $query = "INSERT INTO admin_history (last_date,ip) VALUES ('15th July 2016','31.7.42.03')"; 
   mysqli_query($con,$query);
   
   
   $sql = "CREATE TABLE page_view 
(
id INT NOT NULL AUTO_INCREMENT,
PRIMARY KEY(id),
date VARCHAR(255),
tpage VARCHAR(255),
tvisit VARCHAR(255)
)";
    // Execute query
    if (mysqli_query($con,$sql)) {
    echo "Page view Table created successfully <br>";
    } else {
    echo "Error creating table: " . mysqli_error($con)."<br>";
     }
     
        $query = "INSERT INTO page_view(date,tpage,tvisit) VALUES ('14th July 2016','9','1')"; 
         mysqli_query($con,$query);
        $query = "INSERT INTO page_view(date,tpage,tvisit) VALUES ('15th July 2016','14','1')"; 
         mysqli_query($con,$query);


   
   $sql = "CREATE TABLE ads 
(
id INT(255),
ads_1 mediumtext,
ads_2 mediumtext
)";
    // Execute query
    if (mysqli_query($con,$sql)) {
    echo "Ads Table created successfully <br>";
    } else {
    echo "Error creating table: " . mysqli_error($con)."<br>";
     }
     
     $query = "INSERT INTO ads (id,ads_1,ads_2) VALUES ('1','<center>
 <div >
<img class=\"imageres\" src=\"images/ad700.png\">
</div>  <br /> <br /> </center> ','<div>
<img class=\"imageres\" src=\"images/ad.png\">
</div>')"; 
     mysqli_query($con,$query);
     
     
$sql = "CREATE TABLE site_info 
(
id INT(255),
title VARCHAR(255),
des text,
keyword mediumtext,
site_name VARCHAR(255),
email text,
twit text,
face text,
gplus text,
ga text,
req text,
lm VARCHAR(255)
)";
    // Execute query
    if (mysqli_query($con,$sql)) {
    echo "Site Info Table created successfully <br>";
    } else {
    echo "Error creating table: " . mysqli_error($con)."<br>";
     }
     
     $query = "INSERT INTO site_info (id,title,des,keyword,site_name,email,twit,face,gplus,ga,req,lm) VALUES ('0','Turbo Spinner:  Article Rewriter','It is a advanced article rewriter and spinner which turns your existing content into hundreds of unique content.','spinner, rewriter, article, turbospinner','Turbo Spinner','admin@prothemes.biz','https://twitter.com/','https://www.facebook.com/','https://plus.google.com/','UA-','0','0')"; 
     mysqli_query($con,$query);

  $sql = "CREATE TABLE ban_user 
(
id INT NOT NULL AUTO_INCREMENT,
PRIMARY KEY(id),
ip VARCHAR(255),
last_date VARCHAR(255)
)";
    // Execute query
    if (mysqli_query($con,$sql)) {
    echo "Ban User Table created successfully <br>";
    } else {
    echo "Error creating table: " . mysqli_error($con)."<br>";
     }
     
     $query = "INSERT INTO ban_user (id,ip,last_date) VALUES ('1','2.2.2.2','17th June 2016')"; 
     mysqli_query($con,$query);
     
         $sql = "CREATE TABLE pages 
(
id INT NOT NULL AUTO_INCREMENT,
PRIMARY KEY(id),
last_date VARCHAR(255),
page_name VARCHAR(255),
page_title mediumtext,
page_content text
)";
    // Execute query
    if (mysqli_query($con,$sql)) {
    echo "Pages Table created successfully <br>";
    } else {
    echo "Error creating table: " . mysqli_error($con)."<br>";
     }
     
     $query = "INSERT INTO pages (last_date,page_name,page_title,page_content) VALUES ('17th July 2016','tos','Terms of use','<p><strong>Please edit this page..</strong></p><br><br><br><br><br><br><br><br><br><br>')"; 
     mysqli_query($con,$query); 
     $query = "INSERT INTO pages (last_date,page_name,page_title,page_content) VALUES ('17th July 2016','privacy','Privacy Policy','<p><strong>Please edit this page..</strong></p><br><br><br><br><br><br><br><br><br><br>')"; 
     mysqli_query($con,$query); 
     $query = "INSERT INTO pages (last_date,page_name,page_title,page_content) VALUES ('17th July 2016','faq','FAQ','<p><strong>Please edit this page..</strong></p><br><br><br><br><br><br><br><br><br><br>')"; 
     mysqli_query($con,$query); 
     
         $sql = "CREATE TABLE capthca 
(
id INT(255),
cap_e VARCHAR(255),
mode VARCHAR(255),
mul VARCHAR(255),
allowed text,
color mediumtext
)";
    // Execute query
    if (mysqli_query($con,$sql)) {
    echo "Capthca Table created successfully <br>";
    } else {
    echo "Error creating table: " . mysqli_error($con)."<br>";
     }
     
     $query = "INSERT INTO capthca (id,cap_e,mode,mul,allowed,color) VALUES ('0','on','Normal','off','ABCDEFGHJKLMNPRSTUVWXYZabcdefghjkmnprstuvwxyz234567891','#7f8c8d')"; 
     mysqli_query($con,$query); 
     
$sql = "CREATE TABLE recent_api 
(
id INT NOT NULL AUTO_INCREMENT,
PRIMARY KEY(id),
ip VARCHAR(255),
last_date text,
api_key text
)";
    // Execute query
    if (mysqli_query($con,$sql)) {
    echo "Recent API Access Table created successfully <br>";
    } else {
    echo "Error creating table: " . mysqli_error($con)."<br>";
     }
     
     $query = "INSERT INTO recent_api (ip,last_date,api_key) VALUES ('23.53.71.22','17th July 2016','9f9d7af8a048117718564005f52edb5a')"; 
     mysqli_query($con,$query);
     $query = "INSERT INTO recent_api (ip,last_date,api_key) VALUES ('24.64.71.24','18th July 2016','615a48b32b6ef1159e6103e813321923')"; 
     mysqli_query($con,$query);
     $query = "INSERT INTO recent_api (ip,last_date,api_key) VALUES ('73.53.71.51','18th July 2016','9f9d7af8a048117718564005f52edb5a')"; 
     mysqli_query($con,$query);
     $query = "INSERT INTO recent_api (ip,last_date,api_key) VALUES ('13.53.71.22','19th July 2016','9cba48b55b6ef1196e6103e8135d7077')"; 
     mysqli_query($con,$query);
     
           
   $sql = "CREATE TABLE api_access 
(
id INT NOT NULL AUTO_INCREMENT,
PRIMARY KEY(id),
api_key mediumtext,
ex_date mediumtext,
request mediumtext,
xlimit VARCHAR(7000),
remain VARCHAR(8000)
)";
    // Execute query
    if (mysqli_query($con,$sql)) {
    echo "API Access Table created successfully <br> <br>";
    } else {
    echo "Error creating table: " . mysqli_error($con)."<br>";
     }
   
    $query = "INSERT INTO api_access(api_key,ex_date,request,xlimit,remain) VALUES ('9f9d7af8a048117718564005f52edb5a','14/07/2016','0','0','0')"; 
  mysqli_query($con,$query);   
    $query = "INSERT INTO api_access(api_key,ex_date,request,xlimit,remain) VALUES ('85f32d5e40b4f0916e197d3e64e841a6','14/07/2016','0','0','0')"; 
  mysqli_query($con,$query);   
    $query = "INSERT INTO api_access(api_key,ex_date,request,xlimit,remain) VALUES ('9cba48b55b6ef1196e6103e8135d7077','14/07/2016','0','0','0')"; 
  mysqli_query($con,$query);   
    $query = "INSERT INTO api_access(api_key,ex_date,request,xlimit,remain) VALUES ('02ba48b32b6ef1196e6103e8135d7012','14/07/2016','0','0','0')"; 
  mysqli_query($con,$query);  
      $query = "INSERT INTO api_access(api_key,ex_date,request,xlimit,remain) VALUES ('615a48b32b6ef1159e6103e813321923','14/07/2016','0','0','0')"; 
  mysqli_query($con,$query);  
  
  unlink('install.php');
  unlink('process.php');
  unlink('finish.php');
  
  echo 'Installation Complete! <br> <br>';  
?>
  <a href="index.php" class="btn btn-info" >Index Page</a>   <a href="admin/index.php" class="btn btn-info">Admin Panel</a>
