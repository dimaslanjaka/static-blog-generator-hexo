<?php

/*
 * @author Balaji
 * @name Turbo Spinner: Article Rewriter - PHP Script
 * @copyright 2021 ProThemes.Biz
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
if (isset($_GET{'page'})) { 
$page_name = htmlspecialchars(trim($_GET['page']));
$sql = "SELECT * FROM pages where page_name='$page_name'";
$result = mysqli_query($con, $sql);

while($row = mysqli_fetch_array($result)) {

$page_title = $row['page_title'];
$page_content = $row['page_content'];
$last_date = $row['last_date'];
}
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

<title><?php echo $page_title; ?></title>
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
.buttonlink {
    background: none repeat scroll 0 0 #5EC79E;
    border-radius: 7px;
    color: #FFFFFF;
    display: block;
    float: left;
    margin: 10px 15px 10px 0;
    padding: 10px;
    text-decoration: none;
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
<?php echo $page_title; ?>
</h2>
</div>
<div class="content_new">
<div class="box-radius">
<div class="row">
<?php echo $page_content; ?>
</div><br /><br /><br />
</div>
</div>
<div style="text-align: center;" id="adx-area"> <br /><br />
<?php echo $ads_1; ?> 
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