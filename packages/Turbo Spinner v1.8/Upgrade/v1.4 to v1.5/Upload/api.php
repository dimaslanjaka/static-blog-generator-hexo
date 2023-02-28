<?php

/*
* @author Balaji
* @name Turbo Spinner: Article Rewriter - PHP Script
* @copyright © 2017 ProThemes.Biz
*
*/

// Disable Errors
error_reporting(1);

require_once('config.php');

function str_contains($haystack, $needle, $ignoreCase = false) {
    if ($ignoreCase) {
        $haystack = strtolower($haystack);
        $needle   = strtolower($needle);
    }
    $needlePos = strpos($haystack, $needle);
    return ($needlePos === false ? false : ($needlePos+1));
}
$date = date('jS F Y');
$ip = $_SERVER['REMOTE_ADDR'];
$data_ip = file_get_contents('php/ips.tdata');
$check_site  = 1;

$con = mysqli_connect($mysql_host,$mysql_user,$mysql_pass,$mysql_database);

  if (mysqli_connect_errno())
  {
  $sql_error = mysqli_connect_error();
  $check_site = 0;
  goto myoff;
  }


if ($_SERVER['REQUEST_METHOD'] == POST)
{
if(isset( $_POST['api_key']))
{
$api_key = Trim(htmlspecialchars($_POST['api_key']));
$lang = Trim(htmlspecialchars($_POST['lang']));
if ($lang =="" || $lang== null)
{
    $lang = "en";
}
$article = htmlspecialchars($_POST['article']);
$article_count = str_word_count($article);
$query = mysqli_query($con, "SELECT * FROM api_access WHERE api_key='$api_key'");

if(mysqli_num_rows($query) > 0){
    //api_key_exists
    $api_key_exists =1;    
    while($row = mysqli_fetch_array($query)) {
    $ex_date =  Trim($row['ex_date']);
    $request =   Trim($row['request']);
    $xlimit =  Trim($row['xlimit']);
    $remain =   Trim($row['remain']);
    $api_key =   Trim($row['api_key']);
    }
    $exp = explode("/",$ex_date);
    $input_time = mktime(0, 0, 0, $exp[1], $exp[0], $exp[2]);

    $current_time = mktime(0, 0, 0, date('m'), date('d'), date('Y'));

    if ($input_time < $current_time)
    {
    echo "Oh no, API key is expired";
    }
    else
    {
    $remain_c  = $remain + $request;
    if ($request == "0")
    {
    }
    else
    {
    if ($remain_c == $request)
    {
        echo "You have reached the limit";
        goto apioff;
    }
    }
    
    if ($xlimit == "0")
    {
        
    }
    else
    {
        if ($article_count <= $xlimit)
        {
            
        }
        else
        {
         echo "Word count exceeded the limit";
         goto apioff;
        }
    }
    // Else everyhting is okay!
    require_once('core/spin.php');
    $spined = turbo_spin($article,$lang);
    $spined = ucfirst($spined);
    $spined= preg_replace_callback("|([.!?]\s*\w)|", function ($matches) {
         return strtoupper($matches[0]);
    } , $spined);
    echo $spined;
    $query =  "INSERT INTO recent_api (ip,last_date,api_key) VALUES ('$ip','$date','$api_key')"; 
    $result = mysqli_query($con,$query);
    if ($request == "0")
    {}
    else
    {
    $remain = $remain - "1";  
    $query =  "UPDATE api_access SET remain=$remain WHERE api_key='$api_key'";
    $result = mysqli_query($con,$query);
    }
    }
}
else
{
//api_key_not_exists
    echo 'API key not exists';
}
}
else
{
    echo 'No API Key';
}
}

if ($_SERVER['REQUEST_METHOD'] == GET)
{
$date = date('jS F Y');
$ip = $_SERVER['REMOTE_ADDR'];
$data_ip = file_get_contents('php/ips.tdata');
$con = mysqli_connect($mysql_host,$mysql_user,$mysql_pass,$mysql_database);
$check_site = 1;

  if (mysqli_connect_errno())
  {
  $sql_error = mysqli_connect_error();
  $check_site = 0;
  goto myoff;
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

<title>API Access - <?php echo $title; ?></title>
<meta name="description" content="<?php echo $des; ?>" />
<meta name="keywords" content="<?php echo $keyword; ?>" />

<!-- Mobile viewport -->
<meta name="viewport" content="width=device-width; initial-scale=1.0" />

<link rel="shortcut icon" href="images/favicon.png"  type="image/x-icon" />

<!-- CSS-->
<!-- Google web fonts. You can get your own bundle at http://www.google.com/fonts. Don't forget to update the CSS accordingly!-->
<link href='https://fonts.googleapis.com/css?family=Droid+Serif:400,700,400italic|Oswald:400,300' rel='stylesheet' type='text/css'>
<link rel='stylesheet prefetch' href='https://netdna.bootstrapcdn.com/font-awesome/3.1.1/css/font-awesome.css' />
<link rel="stylesheet" href="css/normalize.css" />
<link rel="stylesheet" href="css/theme.css" />

<!-- end CSS-->
    
<!-- JS-->
<script src="js/libs/modernizr-2.6.2.min.js"></script>
<!-- end JS-->


<!-- Style -->
<style type="text/css">
<!--
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
    padding: 15px 30px 15px 15px;
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
.box-radius {
    background: none repeat scroll 0 0 #FFFFFF;
    border: 1px solid #E1E1E1;
    border-radius: 5px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
    padding: 60px 20px;
}
.content_new {
margin-bottom: 35px;
}
.header_new
{
    padding: 25px 0;
    width:100%;
}
.header_new h2 small {
    color: #AAAAAA;
    font-size: 14px;
    margin-left: 30px;    
}
.con_new
{
    margin-left: auto;
    margin-right: auto;
    padding-left: 15px;
    padding-top: 16px;
    padding-right: 15px;
    content: " ";
    clear: both;
    width: 87%;

}
.col-lg-5
{
    float:left;
    width:50%;
}
.form-control
{
    background-color: #FFFFFF;
    background-image: none;
    border: 1px solid #CCCCCC;
    border-radius: 4px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.075) inset;
    color: #555555;
    padding: 6px 12px;
    margin: 0;
    min-width:150px;
    width:40%;
    margin-bottom:10px;
}
.buttonlink{ 
	background:#5ec79e; 
	border-radius:7px; 
	color:#fff;
	display:block;
	padding:10px;
	text-decoration:none;
}
.buttonlink:hover{
	background:#887dc2;
}

.table {
    margin-bottom: 20px;
    width: 100%;
}
table {
    background-color: rgba(0, 0, 0, 0);
    max-width: 100%;
}
table {
    border-collapse: collapse;
    border-spacing: 0;
}
.table > thead > tr > th, .table > tbody > tr > th, .table > tfoot > tr > th, .table > thead > tr > td, .table > tbody > tr > td, .table > tfoot > tr > td {
    border-bottom: 1px solid #DDDDDD;
    line-height: 1.42857;
    padding: 8px;
    vertical-align: top;
}
th {
    text-align: left;
}
.box .box-body {
    border-radius: 0 0 3px 3px;
    padding: 10px;
}
.no-padding {
    padding: 0 !important;
}
.bul
{
   color: #FFFFFF;
   padding: 7px;
   margin-left:9px;
   margin-right:9px;
   background-color: #2ecc71;
   border-radius: 30px;
}
-->
</style>
</head>
<?php
  
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
<body id="home">
<!--[if lt IE 7]>
            <p class="chromeframe">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">activate Google Chrome Frame</a> to improve your experience.</p>
        <![endif]-->
<!-- header area -->
<?php include_once("php/header.php"); ?>
<!-- end header -->
 
<!-- hero area (the grey one with a slider) -->
<section id="hero" class="clearfix"> 
<div class="con_new">
<div class="header_new">
<h2>
API Access
<small>Rewrite from anywhere.</small>
</h2>
</div>
<div class="content_new">
<div class="box-radius">
<div class="row">

<h2><?php echo $site_name; ?> API</h2>
<p><?php echo $site_name; ?> provides a Web API which can be used for automation of article spinning service. 
Below you can find general information about API usage and description of how to use it.</p>

<br />

<?php if(isset($_GET['api_key']))
{
    $api_key = Trim(htmlspecialchars($_GET['api_key']));
    $query =  "SELECT * FROM api_access WHERE api_key='$api_key'";
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $ex_date =  Trim($row['ex_date']);
    $request =   Trim($row['request']);
    $xlimit =  Trim($row['xlimit']);
    $remain =   Trim($row['remain']);
    }
    if ($ex_date =="" || $ex_date ==null)
    {
                    echo '<h3>API Key Stats:</h3>
<br />
<b>API KEY:</b> API Key not valid or expired! <br /><br />
';

    }else
    {
            echo '<h3>API Key Stats:</h3>
<br />

<b>API KEY:</b> <span class="bul">'.$api_key.'</span><br /><br />

<b>Expiry date:</b> <span class="bul">'.$ex_date.'</span><br /><br />

<b>No. of request allowed:</b> <span class="bul">'.$request.'</span><br /><br />

<b>Word limit/per request:</b> <span class="bul">'.$xlimit.'</span><br /><br />

<b>Remaining request:</b> <span class="bul">'.$remain.'</span><br /><br />
';
    }    
}
else
{
?>
<h3>How to:</h3>
<br />

<b class="bul">1.</b> Request a API Key from site admin. (<a href="contact.php" target="_blank" title="Contact US">Contact US</a>)<br /><br />

<b class="bul">2.</b> Get Free or Purchase as many spin credits as your website or application will need.<br /><br />

<b class="bul">3.</b> Integrate <?php echo $site_name; ?> Service requests into your website or application.<br /><br />

<b class="bul">4.</b> Sit back and let <?php echo $site_name; ?> work for you. All day, every day.<br /><br /><br />

<h3>Check your API credit </h3>
<br />
Enter your API key:
<script>
function validateForm() {
    var x = document.forms["form1"]["api_key"].value;
    if (x == null || x == "") {
        alert("Filled out API key!");
        return false;
    }
}
</script>  
<form method="GET" action="api.php" id="form1" onsubmit="return validateForm()">
<input type="text" name="api_key" id="api_key" value="" class="form-control"/> <br />
<input type="submit" value="Submit" class="buttonlink" />
</form> <br />
<?php
}
?>

<br />
<h3>Operation: To Spin</h3>
<br />


<b style="color: #c0392b;">Request:</b>
<br /><br />
Url: http://<?php echo $_SERVER['SERVER_NAME']; ?>/api.php<br />

Http Method: POST<br />
Data: Request object with following properties listed below <br /><br />

<div class="box-body table-responsive no-padding">
                                    <table class="table table-hover">
                                        <tbody><tr>
                                            <th>Name</th>
                                            <th>Description</th>
                                        </tr>
                                        <tr>
                                            <td>api_key</td>
                                            <td>API Key given by site admin.</td>
                                        </tr>
                                        <tr>
                                            <td>article</td>
                                            <td>Data needed to spin.</td>
                                        </tr>
                                            <tr>
                                            <td>lang</td>
                                            <td>What language is this? Supported Language's Code: en,fr,ge,du,sp,tr.</td>
                                        </tr>
                                    </tbody></table>
                                </div><!-- /.box-body -->
<br />                               
<b style="color: #c0392b;">Response:</b>
<br /><br />

SEO friendly unique content and human readable text will be generated as output. In case any error happens. It will return
any of them following message.<br /><br /><br />
<b style="color: #c0392b;">Error Response:</b>
<br /><br />
  <div class="box-body table-responsive no-padding">
                                    <table class="table table-hover">
                                        <tbody><tr>
                                            <th>Name</th>
                                            <th>Description</th>
                                        </tr>
                                        <tr>
                                            <td>No API Key</td>
                                            <td>API Key not inserted on the request</td>
                                        </tr>
                                        <tr>
                                            <td>API key not exists</td>
                                            <td>Your API key deleted by site admin</td>
                                        </tr>
                                <tr>
                                            <td>Word count exceeded the limit</td>
                                            <td>You have exceeded the word count limit given by site admin.</td>
                                        </tr>
                                     <tr>
                                            <td>You have reached the limit</td>
                                            <td>Almost, your spin credits over.</td>
                                        </tr>
                                     <tr>
                                            <td>Oh no, API key is expired</td>
                                            <td>It looks API key will be expired. Renew it!</td>
                                        </tr>
                                    </tbody></table>
                                </div><!-- /.box-body -->
<br /><br />
<h3>API Sample:</h3>
<b style="color: #2980b9; font-size: 15px;">Use PHP to make a <?php echo $site_name; ?> API Request and display the results on a web page:</b>
<br /><br />
<textarea id="message" style="width: 100%;
    height: 444px;
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
    animation-fill-mode: both;"><?php 
    
echo '<?php
    $api_url = "http://'.$_SERVER['SERVER_NAME'].'/api.php";
    $api_key = "Your-API-Key";
    $article = "Enter an article, need to spin......";
    $lang = "en";
    
    $cookie=tempnam("/tmp","CURLCOOKIE");
    $agent = "Mozilla/5.0 (Windows; U; Windows NT 5.0; en-US; rv:1.7.12) Gecko/20050915 Firefox/1.0.7";
    $ch = curl_init();
    
        $data = "api_key=$api_key&article=$article&lang=$lang";
        curl_setopt($ch, CURLOPT_URL,"$api_url");    
	curl_setopt($ch, CURLOPT_USERAGENT, $agent);
	curl_setopt($ch,CURLOPT_ENCODING,"gzip,deflate");
	curl_setopt($ch, CURLOPT_HTTPHEADER, Array("Content-Type: application/x-www-form-urlencoded","Accept: */*"));
	curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_REFERER, "http://prothemes.biz");
	curl_setopt($ch, CURLOPT_AUTOREFERER, 1);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS,"$data");
	$html=curl_exec($ch);
	$lastUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
    
    	echo "<pre>$html</pre>";
        
?>';?></textarea>

<br /> <br />

<a class="buttonlink violet large" style="text-align: center;" href="sample/php_api_sample.zip">Download PHP Sample</a>

 <br />    
 
<br /><br /><br />
<b style="color: #2980b9; font-size: 15px;"> Use C# to make a standard <?php echo $site_name; ?> API 'spin' Request (this is a simple console app but it can be adapted into an ASP.NET MVC.NET web page): :</b>
<br /><br />
<textarea id="message" style="width: 100%;
    height: 444px;
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
    animation-fill-mode: both;"><?php 
    
echo '
using System;
using System.Diagnostics;
using System.Net;
using System.IO;

class Program
{
    static void Main(string[] args)
    {
        string textToSpin = "Enter a article, need to spin......";
        string api_key = "Your-API-KEY";
        string serviceUri = "http://'.$_SERVER['SERVER_NAME'].'/api.php";
        string lang = "en";

        string post_data = "api_key=" + api_key + "&article=" + textToSpin + "&lang=" + lang;

        // create a request
        HttpWebRequest request = (HttpWebRequest)
        WebRequest.Create(serviceUri); 
        request.Method = "POST";

        // turn our request string into a byte stream
        byte[] postBytes = System.Text.Encoding.ASCII.GetBytes(post_data);

        // this is important - make sure you specify type this way
        request.ContentType = "application/x-www-form-urlencoded";
        request.ContentLength = postBytes.Length;
        Stream requestStream = request.GetRequestStream();

        // now send it
        requestStream.Write(postBytes, 0, postBytes.Length);
        requestStream.Close();

        // grab te response and print it out to the console
        HttpWebResponse response = (HttpWebResponse)request.GetResponse();
        Console.WriteLine(new StreamReader(response.GetResponseStream()).ReadToEnd());
        Console.ReadLine();
    }
}';?></textarea>      

<br /> <br />

<a class="buttonlink violet large" style="text-align: center;" href="sample/Tubro_Spinner_Console.zip">Download C# Sample</a>
                                    
</div><br /><br />
</div>
</div>
<div style="text-align: center;" id="adx-area"> <br /><br />
<?php echo "$ads_1"; ?>    
</div>   

<br /><br />
</section>
<!-- footer area -->    
<?php include_once("php/footer.php"); ?>
<!-- footer area end-->  

<!-- jQuery -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
<script>window.jQuery || document.write('<script src="js/libs/jquery-1.9.0.min.js">\x3C/script>')</script>

<!-- fire ups - read this file!  -->   
<script src="js/main.js"></script>

</body>
</html>
<?php
}
?>

<?php
apioff:
//API End!

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
?>