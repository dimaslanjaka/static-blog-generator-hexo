<?php
session_start();
/*
 * @author Balaji
 */
 
error_reporting(1);
if(isset($_SESSION['login']))
{

}
else
{
    header("Location: index.php");
    echo '<meta http-equiv="refresh" content="1;url=index.php">';
}
require_once('../config.php');
$total_page = $total_visit ="0";

$date = date('jS F Y');
$ip = $_SERVER['REMOTE_ADDR'];

  $con = mysqli_connect($mysql_host,$mysql_user,$mysql_pass,$mysql_database);

  if (mysqli_connect_errno())
  {
  echo "<br>Failed to connect to MySQL: " . mysqli_connect_error();
  }
    $query =  "SELECT @last_id := MAX(id) FROM admin_history";
    
    $result = mysqli_query($con,$query);
    
    while($row = mysqli_fetch_array($result)) {
    $last_id =  $row['@last_id := MAX(id)'];
    }
    
    $query =  "SELECT * FROM admin_history WHERE id=".Trim($last_id);
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $last_date =  $row['last_date'];
    $last_ip =  $row['ip'];
    }

    if($last_ip == $ip )
    {
    if($last_date == $date)
    {
        
    }
    else
    {
    $query = "INSERT INTO admin_history (last_date,ip) VALUES ('$date','$ip')"; 
    mysqli_query($con,$query);
    }  
    }
    else
    {
    $query = "INSERT INTO admin_history (last_date,ip) VALUES ('$date','$ip')"; 
    mysqli_query($con,$query);
    }
    
    
    $query =  "SELECT * FROM page_view";
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $total_page =  $total_page + Trim($row['tpage']);
    $total_visit =  $total_visit + Trim($row['tvisit']);
    }
    
    $query =  "SELECT @last_id := MAX(id) FROM page_view";
    
    $result = mysqli_query($con,$query);
    
    while($row = mysqli_fetch_array($result)) {
    $page_last_id =  $row['@last_id := MAX(id)'];
    }
    
    $query =  "SELECT * FROM page_view WHERE id=".Trim($page_last_id);
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $today_page =  $row['tpage'];
    $today_visit =  $row['tvisit'];
    }
    

    $query =  "SELECT * FROM site_info";
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $admin_email =   Trim($row['email']);
    }
?>

<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>Admin Section | Dashboard</title>
        <meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' name='viewport' />
        <!-- bootstrap 3.0.2 -->
        <link href="css/bootstrap.min.css" rel="stylesheet" type="text/css" />
        <!-- font Awesome -->
        <link href="css/font-awesome.min.css" rel="stylesheet" type="text/css" />
        <!-- Ionicons -->
        <link href="css/ionicons.min.css" rel="stylesheet" type="text/css" />
        <!-- Morris chart -->
        <link href="css/morris/morris.css" rel="stylesheet" type="text/css" />
        <!-- jvectormap -->
        <link href="css/jvectormap/jquery-jvectormap-1.2.2.css" rel="stylesheet" type="text/css" />
        <!-- fullCalendar -->
        <link href="css/fullcalendar/fullcalendar.css" rel="stylesheet" type="text/css" />
        <!-- Daterange picker -->
        <link href="css/daterangepicker/daterangepicker-bs3.css" rel="stylesheet" type="text/css" />
        <!-- bootstrap wysihtml5 - text editor -->
        <link href="css/bootstrap-wysihtml5/bootstrap3-wysihtml5.min.css" rel="stylesheet" type="text/css" />
        <!-- Theme style -->
        <link href="css/AdminLTE.css" rel="stylesheet" type="text/css" />

        <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
        <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
        <!--[if lt IE 9]>
          <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
          <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
        <![endif]-->
    </head>
    <body class="skin-blue">
        <!-- header logo: style can be found in header.less -->
        <header class="header">
            <a href="dashboard.php" class="logo">
                <!-- Add the class icon to your logo image or logo icon to add the margining -->
                TurboSpinner
            </a>
            <!-- Header Navbar: style can be found in header.less -->
            <nav class="navbar navbar-static-top" role="navigation">
                <!-- Sidebar toggle button-->
                <a href="#" class="navbar-btn sidebar-toggle" data-toggle="offcanvas" role="button">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </a>
                <div class="navbar-right">
                    <ul class="nav navbar-nav">
                     
                                            <!-- User Account: style can be found in dropdown.less -->
                        <li class="dropdown user user-menu">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                                <i class="glyphicon glyphicon-user"></i>
                                <span>Admin<i class="caret"></i></span>
                            </a>
                            <ul class="dropdown-menu">
                                <!-- User image -->
                                <li class="user-header bg-light-blue">
                                    <img src="img/admin.jpg" class="img-circle" alt="User Image" />
                                                          <p>
                                        Welcome back, Admin
                                        <small>Manage your site</small>
                                    </p>
                                </li>
                                <!-- Menu Body -->
                                <!-- Menu Footer-->
                                <li class="user-footer">
                                    <div class="pull-left">
                                <a href="../index.php" class="btn btn-default btn-flat">Site Index</a>
                                    </div>
                                    <div class="pull-right">
                                        <a href="logout.php" class="btn btn-default btn-flat">Sign out</a>
                                    </div>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
        <div class="wrapper row-offcanvas row-offcanvas-left">
            <!-- Left side column. contains the logo and sidebar -->
            <aside class="left-side sidebar-offcanvas">
                <!-- sidebar: style can be found in sidebar.less -->
                <section class="sidebar">
                    <!-- Sidebar user panel -->
                    <div class="user-panel">
                        <div class="pull-left image">
                            <img src="img/admin.jpg" class="img-circle" alt="User Image" />
                        </div>
                        <div class="pull-left info">
                            <p>Hello, Admin</p>

                            <a href="#"><i class="fa fa-circle text-success"></i> Online</a>
                        </div>
                    </div>
                    <!-- sidebar menu: : style can be found in sidebar.less -->
                    <ul class="sidebar-menu">
                        <li class="active">
                            <a href="dashboard.php">
                                <i class="fa fa-dashboard"></i> <span>Dashboard</span>
                            </a>
                        </li>
                        <li>
                            <a href="site.php">
                                <i class="fa fa-th"></i> <span>Manage Site</span>
                            </a>
                        </li>
                        <li>
                            <a href="api.php">
                                <i class="fa fa-bar-chart-o"></i> <span>API Access</span> 
                            </a>
                        </li>
                        <li>
                            <a href="acc.php">
                                <i class="fa fa-laptop"></i> <span>Admin Account</span> 
                            </a>
                        </li>
                         <li>
                            <a href="ads.php">
                                <i class="fa fa-thumbs-up"></i> <span>Site Ads</span> 
                            </a>
                        </li>
                        <li>
                            <a href="ban_user.php">
                                <i class="fa fa-group"></i> <span>Ban User</span> 
                            </a>
                        </li>
                                <li>
                            <a href="capthca.php">
                                <i class="fa fa-desktop"></i> <span>Captcha</span> 
                            </a>
                        </li>
                                                                <li>
                            <a href="edit_page.php">
                                <i class="fa fa-sitemap"></i> <span>Pages</span> 
                            </a>
                        </li>
                                      <li>
                            <a href="synonyms.php">
                                <i class="fa fa-book"></i> <span>Add Synonyms</span> 
                            </a>
                        </li>
                    </ul>
                </section>
                <!-- /.sidebar -->
            </aside>

            <!-- Right side column. Contains the navbar and content of the page -->
            <aside class="right-side">
                <!-- Content Header (Page header) -->
                <section class="content-header">
                    <h1>
                        Dashboard
                        <small>Control panel</small>
                    </h1>
                    <ol class="breadcrumb">
                        <li><a href="#"><i class="fa fa-dashboard"></i> Admin</a></li>
                        <li class="active">Dashboard</li>
                    </ol>
                </section>

                <!-- Main content -->
                <section class="content">

                    <!-- Small boxes (Stat box) -->
                    <div class="row">
                        <div class="col-lg-3 col-xs-6">
                            <!-- small box -->
                            <div class="small-box bg-aqua">
                                <div class="inner">
                                    <h3>
                                        <?php echo $today_page; ?>
                                    </h3>
                                    <p>
                                        Today Page Views
                                    </p>
                                </div>
                                <div class="icon">
                                      <i class="ion ion-stats-bars"></i>
                                </div>
                            </div>
                        </div><!-- ./col -->
                        <div class="col-lg-3 col-xs-6">
                            <!-- small box -->
                            <div class="small-box bg-green">
                                <div class="inner">
                                    <h3>
                                        <?php echo $total_page; ?>
                                    </h3>
                                    <p>
                                        Total Page Views
                                    </p>
                                </div>
                                <div class="icon">
                                    <i class="ion ion-stats-bars"></i>
                                </div>
                            </div>
                        </div><!-- ./col -->
                        <div class="col-lg-3 col-xs-6">
                            <!-- small box -->
                            <div class="small-box bg-yellow">
                                <div class="inner">
                                    <h3>
                                      <?php echo $today_visit; ?>
                                    </h3>
                                    <p>
                                    Today Unique Visitors
                                    </p>
                                </div>
                                <div class="icon">
                                        <i class="ion ion-pie-graph"></i>
                                </div>
                            </div>
                        </div><!-- ./col -->
                        <div class="col-lg-3 col-xs-6">
                            <!-- small box -->
                            <div class="small-box bg-red">
                                <div class="inner">
                                    <h3>
                                        <?php echo $total_visit; ?>
                                    </h3>
                                    <p>
                                       Total Unique Visitors
                                    </p>
                                </div>
                                <div class="icon">
                                    <i class="ion ion-pie-graph"></i>
                                </div>
                            </div>
                        </div><!-- ./col -->
                    </div><!-- /.row -->

                    <!-- top row -->
                    <div class="row">
                        <div class="col-xs-12 connectedSortable">
                            
                        </div><!-- /.col -->
                    </div>
                    <!-- /.row -->

                    <!-- Main row -->
                    <div class="row">
                        <!-- Left col -->
                        <section class="col-lg-6 connectedSortable"> 
                            <!-- Box (with bar chart) -->
                            <div class="box box-danger" id="loading-example">
                                <div class="box-header">
                                    <!-- tools box -->
                                    <div class="pull-right box-tools">
                                        <button class="btn btn-danger btn-sm" data-widget='collapse' data-toggle="tooltip" title="Collapse"><i class="fa fa-minus"></i></button>
                                        <button class="btn btn-danger btn-sm" data-widget='remove' data-toggle="tooltip" title="Remove"><i class="fa fa-times"></i></button>
                                    </div><!-- /. tools -->
                                   <i class="fa fa-map-marker"></i>

                                    <h3 class="box-title">Recent API Access</h3>
                                </div><!-- /.box-header -->

        <?php 
    $query =  "SELECT COUNT(*) FROM recent_api";
    
    $result = mysqli_query($con,$query);

    $row = $result->fetch_row();
    $user_last_id = $row[0];
    
    $query =  "SELECT * FROM recent_api WHERE id=".Trim($user_last_id);
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $last_date =  $row['last_date'];
    $ip =  $row['ip'];
    $api_key =  $row['api_key'];
    }
        
        ?>
                       
                                <div class="box-body">
                                    <table class="table table-bordered">
                                        <tbody><tr>
                                            <th style="width: 10px">#</th>
                                            <th>API Key</th>
                                            <th>User IP</th>
                                            <th style="width: 130px">Date</th>
                                        </tr>
                                        <tr>
                                            <td>1.</td>
                                            <td><?php echo $api_key; ?></td>
                                            <td><span class="badge bg-red"><?php echo $ip; ?></span></td>
                                            <td><?php echo $last_date; ?></td>
                                        </tr>
    <?php                                   
    $user_last_id = $user_last_id - 1;                               
    $query =  "SELECT * FROM recent_api WHERE id=".Trim($user_last_id);
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $last_date =  $row['last_date'];
    $ip =  $row['ip'];
    $api_key =  $row['api_key'];
    }
    ?>
                                        <tr>
                                            <td>2.</td>
                                            <td><?php echo $api_key; ?></td>
                                            <td><span class="badge bg-yellow"><?php echo $ip; ?></span></td>
                                                 <td><?php echo $last_date; ?></td>
                                        </tr>
                                            <?php                                   
    $user_last_id = $user_last_id - 1;                               
    $query =  "SELECT * FROM recent_api WHERE id=".Trim($user_last_id);
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $last_date =  $row['last_date'];
    $ip =  $row['ip'];
    $api_key =  $row['api_key'];
    }
    ?>
                                        <tr>
                                            <td>3.</td>
                                            <td><?php echo $api_key; ?></td>

                                            <td><span class="badge bg-light-blue"><?php echo $ip; ?></span></td>
                                          <td><?php echo $last_date; ?></td>
                                        </tr>
                                            <?php                                   
    $user_last_id = $user_last_id - 1;                               
    $query =  "SELECT * FROM recent_api WHERE id=".Trim($user_last_id);
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $last_date =  $row['last_date'];
    $ip =  $row['ip'];
    $api_key =  $row['api_key'];
    }
    ?>
                                        <tr>
                                            <td>4.</td>
                                            <td><?php echo $api_key; ?></td>
                                            <td><span class="badge bg-green"><?php echo $ip; ?></span></td>
                                             <td><?php echo $last_date; ?></td>
                                        </tr>
                                            <?php                                   
    $user_last_id = $user_last_id - 1;                               
    $query =  "SELECT * FROM recent_api WHERE id=".Trim($user_last_id);
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $last_date =  $row['last_date'];
    $ip =  $row['ip'];
    $api_key =  $row['api_key'];
    }
    ?>
                                         <tr>
                                            <td>5.</td>
                                            <td><?php echo $api_key; ?></td>

                                            <td><span class="badge bg-purple"><?php echo $ip; ?></span></td>
                                        <td><?php echo $last_date; ?></td>
                                        </tr>
                                    </tbody></table>
                                </div><!-- /.box-body -->
                       
                 
                                <div class="box-footer">
                         
                                </div><!-- /.box-footer -->
                            </div><!-- /.box -->        


                            <!-- quick email widget -->
                            <div class="box box-info">
                                <div class="box-header">
                                    <i class="fa fa-envelope"></i>
                                    <h3 class="box-title">Quick Email</h3>
                                    <!-- tools box -->
                                    <div class="pull-right box-tools">
                                        <button class="btn btn-info btn-sm" data-widget="remove" data-toggle="tooltip" title="Remove"><i class="fa fa-times"></i></button>
                                    </div><!-- /. tools -->
                                </div>
     <?php

	// Set email to send messages to
	$email = $admin_email;

	// Do not edit anything from here unless you know what you are doing
	$contactErrors = array();

	if ($_SERVER['REQUEST_METHOD'] == 'POST')
	{	
		if(trim($_POST['subject']) === '')
		{
			$contactErrors['subject'] = 'Subject is required.';
		}
		else
		{
 		$subject = trim($_POST['subject']);
		}
		
        $name = "Admin";
        
		if(trim($_POST['email']) === '')
		{
			$contactErrors['email'] = 'Your email address is required.';
		}
		else if (!preg_match("^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,10})$^", trim($_POST['email'])))
		{
			$contactErrors['email'] = 'Your email address seems to be invalid.';
		}
		else
		{
			$emailTo = trim($_POST['email']);
		}
		
		if(trim($_POST['message']) === '')
		{
			$contactErrors['message'] = 'Your message is required.';
		}
		else
		{
			if (function_exists('stripslashes'))
			{
				$message = stripslashes(trim($_POST['message']));
			}
			else
			{
				$message = trim($_POST['message']);
			}
		}
		
		if (empty($contactErrors) && trim($emailTo) !== '')
		{			
			$body = "Name: $name \n\nEmail: $email \n\nMessage: $message";
			$headers = 'From: ' . $name . ' <' . $emailTo . '>' . "\r\n" . 'Reply-To: ' . $email;
			
			mail($emailTo, $subject, $body, $headers);
			$emailSent = true;
		}
    if (isset($emailSent))
    {
       echo '
       <div class="alert alert-success alert-dismissable">
       <i class="fa fa-check"></i>
       <button aria-hidden="true" data-dismiss="alert" class="close" type="button">x</button>
       <b>Alert!</b> Message Sent Successfully.
       </div>';
    }
    else
    {
        
        echo '
        <div class="alert alert-danger alert-dismissable">
       <i class="fa fa-ban"></i>
       <button aria-hidden="true" data-dismiss="alert" class="close" type="button">x</button>
         <b>Alert!</b> Error - Try Again (Message Failed)
        </div>';
    }
    }
    ?>
                                                   
                                
                                 <form action="dashboard.php" method="post">
                                <div class="box-body">
                                
                                        <div class="form-group">
                                            <input type="email" class="form-control"  id="email" name="email" placeholder="Email to:"/>
                                        </div>
                                        <div class="form-group">
                                            <input type="text" class="form-control"  id="subject" name="subject" placeholder="Subject"/>
                                        </div>
                                        <div>
                                            <textarea name= "message" id="message" class="textarea" placeholder="Message" style="width: 100%; height: 125px; font-size: 14px; line-height: 18px; border: 1px solid #dddddd; padding: 10px;"></textarea>
                                        </div>
                            
                                </div>
                                <div class="box-footer clearfix">
                                    <button class="pull-right btn btn-default" id="sendEmail">Send <i class="fa fa-arrow-circle-right"></i></button>
                                </div>
                                
                                        </form>
                            </div>

                        </section><!-- /.Left col -->
                        <!-- right col (We are only adding the ID to make the widgets sortable)-->
                        <section class="col-lg-6 connectedSortable">
                            <!-- Map box -->
                            <div class="box box-primary">
                                <div class="box-header">
                                    <!-- tools box -->
                                 <div class="pull-right box-tools">
                                        <button class="btn btn-primary btn-sm" data-widget='collapse' data-toggle="tooltip" title="Collapse"><i class="fa fa-minus"></i></button>
                                        <button class="btn btn-primary btn-sm" data-widget='remove' data-toggle="tooltip" title="Remove"><i class="fa fa-times"></i></button>
                                    </div><!-- /. tools -->
                                    <i class="fa fa-desktop"></i>
                                    <h3 class="box-title">
                                        Admin History
                                    </h3>
                                </div>

                                <div class="box-body">
                                    <table class="table table-striped">
                                    
    <?php                                                                
    $query =  "SELECT * FROM admin_history WHERE id=".Trim($last_id);
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $last_date =  $row['last_date'];
    $ip =  $row['ip'];
    }
    ?>
    
                                        <tbody><tr>
                                            <th style="width: 10px">#</th>
                                            <th>Last Login Date</th>
                                            <th>IP</th>
                                        </tr>
                                        <tr>
                                            <td>1.</td>
                                            <td><?php echo $last_date; ?></td>
                                            <td><span class="badge bg-red"><?php echo $ip; ?></span></td>
                                        </tr>
                                        
    <?php   
    $last_id = $last_id - 1;                                                             
    $query =  "SELECT * FROM admin_history WHERE id=".Trim($last_id);
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $last_date =  $row['last_date'];
    $ip =  $row['ip'];
    }
    ?>      
                                        <tr>
                                            <td>2.</td>
                                          <td><?php echo $last_date; ?></td>
                                            <td><span class="badge bg-yellow"><?php echo $ip; ?></span></td>
                                        </tr>
                                        
                                                         
    <?php   
    $last_id = $last_id - 1;                                                             
    $query =  "SELECT * FROM admin_history WHERE id=".Trim($last_id);
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $last_date =  $row['last_date'];
    $ip =  $row['ip'];
    }
    ?>                         
                                        <tr>
                                            <td>3.</td>
                                        <td><?php echo $last_date; ?></td>
                                            <td><span class="badge bg-light-blue"><?php echo $ip; ?></span></td>
                                        </tr>
                                        
                                        
                                                      
    <?php   
    $last_id = $last_id - 1;                                                             
    $query =  "SELECT * FROM admin_history WHERE id=".Trim($last_id);
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $last_date =  $row['last_date'];
    $ip =  $row['ip'];
    }
    ?>                            
                                        <tr>
                                            <td>4.</td>
                                       <td><?php echo $last_date; ?></td>
                                            <td><span class="badge bg-green"><?php echo $ip; ?></span></td>
                                        </tr>
                                        
                                                  
    <?php   
    $last_id = $last_id - 1;                                                             
    $query =  "SELECT * FROM admin_history WHERE id=".Trim($last_id);
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $last_date =  $row['last_date'];
    $ip =  $row['ip'];
    }
    ?>                                
                                        
                                                    <tr>
                                            <td>5.</td>
                                         <td><?php echo $last_date; ?></td>
                                            <td><span class="badge bg-purple"><?php echo $ip; ?></span></td>
                                        </tr>
                                    </tbody></table>
                                </div><!-- /.box-body -->

                                <div class="box-footer">

                                </div>
                            </div>
                            <!-- /.box -->

                <div class="box box-success" id="loading-example">
                                <div class="box-header">
                                    <!-- tools box -->
                                    <div class="pull-right box-tools">
                                        <button class="btn btn-success btn-sm" data-widget='collapse' data-toggle="tooltip" title="Collapse"><i class="fa fa-minus"></i></button>
                                        <button class="btn btn-success btn-sm" data-widget='remove' data-toggle="tooltip" title="Remove"><i class="fa fa-times"></i></button>
                                    </div><!-- /. tools -->
                                   <i class="fa fa-map-marker"></i>

                                    <h3 class="box-title">Daily PageViews</h3>
                                </div><!-- /.box-header -->

        <?php 
    
    $query =  "SELECT * FROM page_view WHERE id=".Trim($page_last_id);
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $date =  $row['date'];
    $tpage =  $row['tpage'];
    $tvisit =  $row['tvisit'];
    }
        
        ?>
                       
                                <div class="box-body">
                                    <table class="table table-bordered">
                                        <tbody><tr>
                                            <th style="width: 10px">#</th>
                                            <th>Date</th>
                                            <th>Unique Visitors</th>
                                            <th style="width: 130px">PageViews</th>
                                        </tr>
                                        <tr>
                                            <td>1.</td>
                                            <td><?php echo $date; ?></td>
                                           <td><?php echo $tvisit; ?></td>
                                           <td><?php echo $tpage; ?></td>
                                        </tr>
    <?php                                   
    $page_last_id = $page_last_id - 1;                               
    $query =  "SELECT * FROM page_view WHERE id=".Trim($page_last_id);
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $date =  $row['date'];
    $tpage =  $row['tpage'];
    $tvisit =  $row['tvisit'];
    }
    ?>
                                        <tr>
                                            <td>2.</td>
                                                  <td><?php echo $date; ?></td>
                                           <td><?php echo $tvisit; ?></td>
                                           <td><?php echo $tpage; ?></td>
                                        </tr>
                                            <?php                                   
    $page_last_id = $page_last_id - 1;                               
    $query =  "SELECT * FROM page_view WHERE id=".Trim($page_last_id);
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $date =  $row['date'];
    $tpage =  $row['tpage'];
    $tvisit =  $row['tvisit'];
    }
    ?>
                                        <tr>
                                            <td>3.</td>
                                          <td><?php echo $date; ?></td>
                                           <td><?php echo $tvisit; ?></td>
                                           <td><?php echo $tpage; ?></td>
                                        </tr>
                                            <?php                                   
    $page_last_id = $page_last_id - 1;                               
    $query =  "SELECT * FROM page_view WHERE id=".Trim($page_last_id);
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $date =  $row['date'];
    $tpage =  $row['tpage'];
    $tvisit =  $row['tvisit'];
    }
    ?>
                                        <tr>
                                            <td>4.</td>
                                            <td><?php echo $date; ?></td>
                                           <td><?php echo $tvisit; ?></td>
                                           <td><?php echo $tpage; ?></td>
                                        </tr>
                                            <?php                                   
    $page_last_id = $page_last_id - 1;                               
    $query =  "SELECT * FROM page_view WHERE id=".Trim($page_last_id);
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $date =  $row['date'];
    $tpage =  $row['tpage'];
    $tvisit =  $row['tvisit'];
    }
    ?>
                                         <tr>
                                            <td>5.</td>
                                        <td><?php echo $date; ?></td>
                                           <td><?php echo $tvisit; ?></td>
                                           <td><?php echo $tpage; ?></td>
                                        </tr>
                                    </tbody></table>
                                </div><!-- /.box-body -->
                       
                 
                                <div class="box-footer">
                         
                                </div><!-- /.box-footer -->
                            </div><!-- /.box -->      
                        </section><!-- right col -->
                    </div><!-- /.row (main row) -->

                </section><!-- /.content -->
            </aside><!-- /.right-side -->
        </div><!-- ./wrapper -->

        <!-- add new calendar event modal -->


          <!-- jQuery 2.0.2 -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js"></script>
        <!-- jQuery UI 1.10.3 -->
        <script src="js/jquery-ui-1.10.3.min.js" type="text/javascript"></script>
        <!-- Bootstrap -->
        <script src="js/bootstrap.min.js" type="text/javascript"></script>
        <!-- Morris.js charts -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/raphael/2.1.0/raphael-min.js"></script>
        <script src="js/plugins/morris/morris.min.js" type="text/javascript"></script>
        <!-- Sparkline -->
        <script src="js/plugins/sparkline/jquery.sparkline.min.js" type="text/javascript"></script>
        <!-- jvectormap -->
        <script src="js/plugins/jvectormap/jquery-jvectormap-1.2.2.min.js" type="text/javascript"></script>
        <script src="js/plugins/jvectormap/jquery-jvectormap-world-mill-en.js" type="text/javascript"></script>
        <!-- daterangepicker -->
        <script src="js/plugins/daterangepicker/daterangepicker.js" type="text/javascript"></script>
        <!-- Bootstrap WYSIHTML5 -->
        <script src="js/plugins/bootstrap-wysihtml5/bootstrap3-wysihtml5.all.min.js" type="text/javascript"></script>
        <!-- iCheck -->
        <script src="js/plugins/iCheck/icheck.min.js" type="text/javascript"></script>
        
        <!-- AdminLTE App -->
        <script src="js/AdminLTE/app.js" type="text/javascript"></script>
        <script src="js/AdminLTE/dashboard.js" type="text/javascript"></script>     


    </body>
</html>
<?php
mysqli_close($con);
?>