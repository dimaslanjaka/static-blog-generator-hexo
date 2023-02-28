<?php
session_start(); 
/*
* @author Balaji
* @name Turbo Spinner: Article Rewriter - PHP Script
* @copyright © 2015 ProThemes.Biz
*
*/

// Disable Errors
error_reporting(1);

$filename = 'install.php';

if (file_exists($filename)) {
    echo "<br><br><b>Installer detected.. Please wait..</b>";
    header("Location: install.php");
    echo '<meta http-equiv="refresh" content="1;url=install.php">';
    exit();
}

require_once("core/cap.php");
require_once('config.php');

$date = date('jS F Y');
$ip = $_SERVER['REMOTE_ADDR'];
$data_ip = file_get_contents('php/ips.tdata');
$con = mysqli_connect($mysql_host,$mysql_user,$mysql_pass,$mysql_database);
$check_site = 1;
$ban_user = 1;

  if (mysqli_connect_errno())
  {
  $sql_error = mysqli_connect_error();
  $check_site = 0;
  goto myoff;
  }
    $query =  "SELECT * FROM capthca where id='0'";
    $result = mysqli_query($con,$query);
       	 	 	 	   
    while($row = mysqli_fetch_array($result)) {
    $color =  Trim($row['color']);
    $mode =   Trim($row['mode']);
    $mul =  Trim($row['mul']);
    $allowed =   Trim($row['allowed']);
    }
    
$_SESSION['captcha'] = elite_captcha($color,$mode,$mul,$allowed);
if (isset($_SESSION['limit_count']))
{
    
}
else
{
   $_SESSION['limit_count']=0; 
}
function str_contains($haystack, $needle, $ignoreCase = false) {
    if ($ignoreCase) {
        $haystack = strtolower($haystack);
        $needle   = strtolower($needle);
    }
    $needlePos = strpos($haystack, $needle);
    return ($needlePos === false ? false : ($needlePos+1));
}
    $query =  "SELECT * FROM site_info";
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $title =  Trim($row['title']);
    $des =   Trim($row['des']);
    $keyword =  Trim($row['keyword']);
    $site_name =   Trim($row['site_name']);
    $email =   Trim($row['email']);
    $twit =   Trim($row['twit']);
    $face =   Trim($row['face']);
    $gplus =   Trim($row['gplus']);
    $ga  =   Trim($row['ga']);
    }
    
    $query =  "SELECT * FROM ban_user";
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $banned_ip =  $banned_ip."::".$row['ip'];
    }
    if (strpos($banned_ip,$ip) !== false)
    {
        $ban_user = 0;
        goto banned_user;
    }
        $query =  "SELECT * FROM capthca WHERE id=".Trim('0');
        $result = mysqli_query($con,$query);
        
        while($row = mysqli_fetch_array($result)) {
        $cap_e =  Trim($row['cap_e']);
        }
    $query =  "SELECT @last_id := MAX(id) FROM page_view";
    
    $result = mysqli_query($con,$query);
    
    while($row = mysqli_fetch_array($result)) {
    $last_id =  $row['@last_id := MAX(id)'];
    }
    
    $query =  "SELECT * FROM page_view WHERE id=".Trim($last_id);
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $last_date =  $row['date'];
    }
    
    if($last_date == $date)
    {
         if (str_contains($data_ip, $ip)) 
        {
          $query =  "SELECT * FROM page_view WHERE id=".Trim($last_id);
          $result = mysqli_query($con,$query);
        
        while($row = mysqli_fetch_array($result)) {
        $last_tpage =  Trim($row['tpage']);
            }
        $last_tpage = $last_tpage +1;
        
          // Already IP is there!  So update only page view.
        $query = "UPDATE page_view SET tpage=$last_tpage WHERE id=".Trim($last_id);
        mysqli_query($con,$query);
        }
        else
        {
        $query =  "SELECT * FROM page_view WHERE id=".Trim($last_id);
        $result = mysqli_query($con,$query);
        
        while($row = mysqli_fetch_array($result)) {
        $last_tpage =  Trim($row['tpage']);
        $last_tvisit =  Trim($row['tvisit']);
        }
        $last_tpage = $last_tpage +1;
        $last_tvisit = $last_tvisit +1;
        
        // Update both tpage and tvisit.
        $query = "UPDATE page_view SET tpage=$last_tpage,tvisit=$last_tvisit WHERE id=".Trim($last_id);
        mysqli_query($con,$query);
        file_put_contents('php/ips.tdata',$data_ip."\r\n".$ip); 
        }
    }
    else
    { 
    //Delete the file and clear data_ip
    unlink("php/ips.tdata");
    $data_ip ="";
    
    // New date is created!
    $query = "INSERT INTO page_view (date,tpage,tvisit) VALUES ('$date','1','1')"; 
    mysqli_query($con,$query);
    
    //Update the IP!
    file_put_contents('php/ips.tdata',$data_ip."\r\n".$ip); 
    
    }
    
        $query =  "SELECT * FROM ads WHERE id='1'";
        $result = mysqli_query($con,$query);
        
        while($row = mysqli_fetch_array($result)) {
        $ads_1 =  Trim($row['ads_1']);
        $ads_2 =  Trim($row['ads_2']);
        
        }
    
?>
<!DOCTYPE html>
<html lang="en-US" class="no-js">
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
<head>
<meta charset="utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />

<title><?php echo $title; ?></title>
<meta name="description" content="<?php echo $des; ?>" />
<meta name="keywords" content="<?php echo $keyword; ?>" />

<!-- Mobile viewport -->
<meta name="viewport" content="width=device-width; initial-scale=1.0" />

<link rel="shortcut icon" href="images/favicon.png"  type="image/x-icon" />

<!-- CSS-->
<!-- Google web fonts. You can get your own bundle at http://www.google.com/fonts. Don't forget to update the CSS accordingly!-->
<link href='http://fonts.googleapis.com/css?family=Droid+Serif:400,700,400italic|Oswald:400,300' rel='stylesheet' type='text/css'>
<link rel='stylesheet prefetch' href='http://netdna.bootstrapcdn.com/font-awesome/3.1.1/css/font-awesome.css' />
<link rel="stylesheet" href="css/normalize.css" />
<link rel="stylesheet" href="css/theme.css" />

<!-- end CSS-->
    
<!-- JS-->
<script src="js/libs/modernizr-2.6.2.min.js"></script>
<!-- end JS-->


<!-- Style -->
<style type="text/css">
<!--
@media only screen and (min-width : 10px) and (max-width : 380px) {
#imagever
{
    margin-left: 0;
}
}
@media only screen and (min-width : 10px) and (max-width : 800px) {
.sp_grid_1
{
    width:25%;
    float: left;
    content: "";
    display: table;
    margin: 0 0 30px 0;
}
.sp_grid_2
{
    width:45%;
    float: left;
    content: "";
    display: table;
    margin: 0 0 30px 0;

}
.sp_grid_2 .imagever
{
    border: 4px solid #FFFFFF;
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 0, 0, 0.2) inset;
    transition: box-shadow 0.2s ease 0s;
}
.sp_grid_3
{
    float: left;
    content: "";
    display: table;
    margin: 0 0 30px 0;
}
}
.callout.callout-danger {
    background-color: #F2DEDE;
    border-color: #DFB5B4;
}
.callout.callout-success {
    background-color: #DFF0D8;
    border-color: #D6E9C6;
}
.callout {
    border-left: 5px solid #EEEEEE;
    margin: 0 0 20px;
    padding: 6px 3px 1px 15px;
}
.callout.callout-danger h4 {
    color: #B94A48;
}
.callout.callout-success h4 {
    color: #3C763D;
}
.callout h4 {
    margin-top: 0;
}
#lcontent{
    display:none;
}
#preloader{
    display:none;
}
#failed
{
    display:none;
}
#success{
    display:none;
}
#try_new{
    display:none;
}
.nav-item {
    line-height: 28px;
}
dd {
    margin-left: 0;
}
.nav-item  a {
    color: #AAB2BD;
    text-decoration: none;
}
@media only screen and (min-width : 801px) and (max-width : 1780px) {
.sp_grid_1
{
    width:25%;
    float: left;
    content: "";
    display: table;
    margin: 0 0 30px 0;
}
.sp_grid_2
{
    width:45%;
    float: left;
    content: "";
    display: table;
    margin: 0 0 30px 0;
    

}
.sp_grid_2 .imagever
{
    margin-top:-11px;
    border: 4px solid #FFFFFF;
    border-radius: 5px;
    float: right;
    transition: box-shadow 0.2s ease 0s;
}
.sp_grid_3
{
    float: left;
    content: "";
    display: table;
    margin: 9px 0 30px 0;
    margin-left: 50px;
}
#lcontent
{
    margin-bottom:360px;
}
#preloader
{
    padding: 260px;
    margin-bottom:230px;
}
}
-->
</style>

<script>
function tryAgain(){
    showLoading();
    $("#spin_new").show();
    $("#try_new").hide();
    $("#imagever").show();
    $("#failed").hide();
    $("#lcontent").hide();
    $("#index_content").show();
    hideLoading();
}
function showLoading() {
    $("#preloader").show();
    $("#index_content").hide();
    $("#lcontent").hide();
}
function hideLoading() {
    $("#preloader").hide();
}
function loadXMLDoc()
{
var xmlhttp;
var strr = jQuery("textarea#message").val();
var capc = $('input[name=scode]').val();
var la = $('select[id=lang]').val();
if (strr == "")
{
    alert('Enter the article to spin!');
    return false;
}
if (window.XMLHttpRequest)
  {// code for IE7+, Firefox, Chrome, Opera, Safari
  xmlhttp=new XMLHttpRequest();
  }
else
  {// code for IE6, IE5
  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
xmlhttp.onreadystatechange=function()
  {
  if (xmlhttp.readyState==4 && xmlhttp.status==200)
    {
    }
  }
showLoading();
$.post("php/verify.php", {scode:capc}, function(results){
if (results == 1) {
$.post("php/process.php", {data:strr,lang:la,scode:capc}, function(results){
    hideLoading();
    $("#spin_new").hide();
    $("#try_new").show();
    $("#try_again").hide();
    $("#imagever").hide();
    $("#success").show();
    $("#lcontent").show();
    $('#content').val(results);
});
}
else
{
    hideLoading();
    $("#spin_new").hide();
    $("#try_new").show();
    $("#imagever").hide();
    $("#failed").show();
    $("#lcontent").show();
    $('#content').val(strr);
}
});
}
</script>
</head>

<body id="home">
<!--[if lt IE 7]>
            <p class="chromeframe">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">activate Google Chrome Frame</a> to improve your experience.</p>
        <![endif]-->
<!-- header area -->
<?php include_once("php/header.php"); ?>
<!-- end header -->
 
 
<!-- hero area (the grey one with a slider) -->
    <section id="hero" class="clearfix">    
    
    <div class="wrapper">
    <br />
        <div id="index_content">
        		<!-- responsive FlexSlider image slideshow -->
        <textarea style="width: 100%;
    height: 370px;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    color: #666666;
    border: 0 none;
    border-radius: 4px;
    box-shadow: 0 0 0 0.5em #FFFFFF;
    background: url(images/note.png) repeat;
    font: normal 14px verdana;
    line-height: 25px;
    padding: 2px 10px;
    border: solid 1px #ddd;
    transition: all 0.1s ease-in-out 0s;
    animation-delay: 250ms;
    animation-name: slideInRight;
    animation-duration: 1s;
    animation-fill-mode: both;" id="message"></textarea>
                </div><!-- end grid div -->
                
                <div id="preloader" style="text-align:center;padding: 10px 0 0 0;">
                <img src="images/loading.gif" alt="loading" />
                </div>
                
                        <div id="lcontent">
        		<!-- responsive FlexSlider image slideshow -->
        <textarea style="width: 100%;
    height: 370px;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    color: #666666;
    border: 0 none;
    border-radius: 4px;
    box-shadow: 0 0 0 0.5em #FFFFFF;
    background: url(images/note.png) repeat;
    font: normal 14px verdana;
    line-height: 25px;
    padding: 2px 10px;
    border: solid 1px #ddd;
    transition: all 0.1s ease-in-out 0s;
    animation-delay: 250ms;
    animation-name: slideInRight;
    animation-duration: 1s;
    animation-fill-mode: both;" id="content"></textarea>
         
                      </div><!-- end grid div -->
                
      
<br /><br />
<div class="sp_grid_1"> 
<b>Language:</b>
<select class="form-control" id="lang">
  <option value="en">English</option>
  <option value="du">Dutch</option>
  <option value="fr">French</option>
  <option value="sp">Spanish</option>
  <option value="ge">Germany</option>
  <option value="tr">Turkish</option>
</select> 

</div>

  <div class="sp_grid_2">

<div id="imagever">
<?php
        if ($cap_e == "on")
        {
        echo '<b>Image verification: </b>';
        echo '<img src="' . $_SESSION['captcha']['image_src'] . '" alt="CAPTCHA" class="imagever">';  
        echo '<input style="width: 160px;" class="form-control" type="text" id="scode" name="scode"/>';
        }
        else
        {
         echo ''; 
        }
?>
  </div>
       <div id="failed">
       <div class="callout callout-danger">
        <h4>Oh No!</h4>
       <p>Captcha Code is Wrong.</p>
       </div>
       </div>
    <div id="success">
       <div class="callout callout-success">
        <h4>Wowww Success!</h4>
       <p>Your document successfully spinned.</p>
       </div>
       </div>
       </div>
       <div class="sp_grid_3">
       <div id="try_new">
       <a href="index.php" class="buttonlink">Try New Document</a> 
       <a class="buttonlink" onclick="tryAgain()" id="try_again" href="#">Try Again</a>
       </div>
       <div id="spin_new">
            <a href="#" onclick="loadXMLDoc()" class="buttonlink">Spin</a> <a href="index.php" class="buttonlink">Reset</a>
       </div>
       </div>
       <br />       <br />
        </div><!-- end .wrapper div -->
    </section><!-- end hero area -->


<!-- main content area -->   
   
<div class="wrapper clearfix">    
<!-- content area -->    
	<section id="content" class="wide-content">
    	<div class="clearfix" style="text-align:center;">
        
        <div id="xad1">
<?php echo "$ads_1"; ?>    
        </div></div>
   	  
       	<h1>About <?php echo $title; ?> </h1>
        <p>It is a advanced automatic article spinner can instantly rewrite any data into SEO friendly unique content. Helps to avoid duplicate content penalties from search engines.
        </p>
        
        <p>Turbo Spinner tool is a one-click article rewriter that requires no signup or registration if you want to use the free version. All you need to do is enter human readable text and you will get human readable text out. </p>
        <p> If you already have various weblog content, that you could turn this content into further, designated blog posts in seconds utilizing article rewriter tool. you should use this free service to show any number of blog posts into twice the amount of valuable, readable content for the same or exclusive blogs. </p>

<p>
Mostly turbo spinner rewrited text can be human readable text and 100% unquie from other services. So, very usefull for mass posting blog and web services.

</p>

	</section><!-- #end content area -->
</div><!-- #end div .wrapper -->



<section id="features"  class="greenelement vertical-padding" style="text-align:center;">
	<div class="wrapper clearfix">
    
    <h1 style="text-align:left;">Features</h1>
    
 	<div class="clearfix vertical-padding">   	
        <div class="grid_4">
            
            <h3>Turbo Spin and 100% Unique</h3><img src="images/spin.png" alt="Turbo Spin and 100% Unique" />           
      	</div>
        
        <div class="grid_4">
        	
        	<h3>API Access - Access Anywhere!</h3><img src="images/api.png" alt="API Access" />           
        </div> 
        
        <div class="grid_4">
        	
        	<h3>Responsive layout</h3><img src="images/res.png" alt="Responsive layout" />            
        </div>
     </div>
  
    </div><!-- #end div .wrapper -->
</section>

<!-- footer area -->    
<?php include_once("php/footer.php"); ?>
<!-- footer area end-->  

<!-- jQuery -->
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
<script>window.jQuery || document.write('<script src="js/libs/jquery-1.9.0.min.js">\x3C/script>')</script>

<!-- fire ups - read this file!  -->   
<script src="js/main.js"></script>

</body>
</html>
<?php
myoff:
if ($check_site == "0")
{
      echo ' 
    <html>
    <head>
        <meta charset="UTF-8">
        <link rel="icon" type="image/png" href="images/favicon.png">

        <!-- social network metas -->
        <meta property="site_name" content="Turbo Spinner"/>
        <meta property="description" content="Turbo Spinner: A Article Rewriter" />
        <meta name="description" content="Turbo Spinner: A Article Rewriter" />

        <title>Offline Site - Turbo Spinner: A Article Rewriter</title>
        <!-- bootstrap 3.0.2 -->
        <link href="admin/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
        <!-- font Awesome -->
        <link href="admin/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
        <!-- Ionicons -->
        <link href="admin/css/ionicons.min.css" rel="stylesheet" type="text/css" />
        <!-- Theme style -->
        <link href="admin/css/AdminLTE.css" rel="stylesheet" type="text/css" />

        <!--[if lt IE 9]>
          <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
          <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
        <![endif]-->
    </head>
       <body class="skin-blue">
    
    <aside class="right-side strech">                
                <!-- Content Header (Page header) -->
                <section class="content-header">
                    <h1>
                        TurboSpinner
                    </h1>
                    <ol class="breadcrumb">
                        <li><a href="index.php"><i class="fa fa-dashboard"></i> Home</a></li>
                        <li class="active">Offline Site</li>
                    </ol>
                </section>

                <!-- Main content -->
                <section class="content">
                 <br /> <br /> <br />
                    <div class="error-page">
                        <h2 class="headline"></h2>
                        <div class="error-content">
                            <h3><i class="fa fa-warning text-yellow"></i> Oops! SQL ERROR: '.$sql_error.'</h3>
                            <p>
                                Try to fix your site soon. 
                            </p>
                           
                        </div>
                    </div><!-- /.error-page -->

                </section><!-- /.content -->
            </aside>   </body> </html>';  
}
banned_user:
if ($ban_user == "0")
{
      echo ' 
    <html>
    <head>
        <meta charset="UTF-8">
        <link rel="icon" type="image/png" href="img/favicon.ico">

        <!-- social network metas -->
        <meta property="site_name" content="'.$site_name.'"/>
        <meta property="description" content="'.$des.'" />
        <meta name="description" content="'.$des.'" />

        <title>Banned User - '.$title.'</title>
        <!-- bootstrap 3.0.2 -->
        <link href="admin/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
        <!-- font Awesome -->
        <link href="admin/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
        <!-- Ionicons -->
        <link href="admin/css/ionicons.min.css" rel="stylesheet" type="text/css" />
        <!-- Theme style -->
        <link href="admin/css/AdminLTE.css" rel="stylesheet" type="text/css" />

        <!--[if lt IE 9]>
          <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
          <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
        <![endif]-->
    </head>
       <body class="skin-blue">
    
    <aside class="right-side strech">                
                <!-- Content Header (Page header) -->
                <section class="content-header">
                    <h1>
                        '.$site_name.'
                    </h1>
                    <ol class="breadcrumb">
                        <li><a href="index.php"><i class="fa fa-dashboard"></i> Home </a></li>
                        <li class="active">Banned User</li>
                    </ol>
                </section>

                <!-- Main content -->
                <section class="content">
                 <br /> <br /> <br />
                    <div class="error-page">
                        <h2 class="headline"></h2>
                        <div class="error-content">
                          <h3><i class="fa fa-warning text-yellow"></i> Oops! Access Denied </h3>
                            <p>
                                What happened?<br>
                                The owner of this website has banned your IP address.  
                            </p>
                           
                        </div>
                    </div><!-- /.error-page -->

                </section><!-- /.content -->
            </aside>   </body> </html>';  
}
?>
<?php
mysqli_close($con);
block:
//nothing
?>