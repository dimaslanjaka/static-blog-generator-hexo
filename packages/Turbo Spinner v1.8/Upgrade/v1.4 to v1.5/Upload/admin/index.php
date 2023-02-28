<?php
session_start();
/**
 * @author Balaji
 * @copyright 2014
 */
 
error_reporting(1);
if(isset($_SESSION['login']))
{
    header("Location: dashboard.php");
    echo '<meta http-equiv="refresh" content="1;url=dashboard.php">';
}
else
{

}
$check_site = 1;
require_once('../config.php');
$con = mysqli_connect($mysql_host,$mysql_user,$mysql_pass,$mysql_database);

  if (mysqli_connect_errno())
  {
  $sql_error = mysqli_connect_error();
  $check_site = 0;
  goto myoff;
  }
  
      $query =  "SELECT * FROM admin where id='1'";
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $adminid =  Trim($row['user']);
    $password =   Trim($row['pass']);
    }
    
if($_SERVER['REQUEST_METHOD'] =='POST')
{
if ($adminid == htmlspecialchars(trim($_POST['userid'])))
  {
    if ($password == Md5(htmlspecialchars(trim($_POST['password']))))
    {
        
      echo ' <br> <br>    
      <div class="alert alert-success alert-dismissable">
                                        <i class="fa fa-check"></i>
                                        <button aria-hidden="true" data-dismiss="alert" class="close" type="button">x</button>
                                        <b>Alert!</b> Login Successful.Redirect to admin page wait...
                                    </div>';
    $_SESSION['login'] = true;
    header("Location: dashboard.php");
    echo '<meta http-equiv="refresh" content="1;url=dashboard.php">';
    }
    else
    {
    echo' <br> <br>  <div class="alert alert-danger alert-dismissable">
                                        <i class="fa fa-ban"></i>
                                        <button aria-hidden="true" data-dismiss="alert" class="close" type="button">x</button>
                                        <b>Alert!</b> Login Failed. Try Again! 
                                    </div> ';
    }
  }
  else
  {
    echo'   <div class="alert alert-danger alert-dismissable">
                                        <i class="fa fa-ban"></i>
                                        <button aria-hidden="true" data-dismiss="alert" class="close" type="button">x</button>
                                        <b>Alert!</b>Login Failed. Try Again! 
                                    </div> ';
  }
}

?>

<!DOCTYPE html>
<html class="bg-black">
    <head>
        <meta charset="UTF-8" />
        <title>Admin | Log in</title>
        <meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' name='viewport' />
        <!-- bootstrap 3.0.2 -->
        <link href="css/bootstrap.min.css" rel="stylesheet" type="text/css" />
        <!-- font Awesome -->
        <link href="css/font-awesome.min.css" rel="stylesheet" type="text/css" />
        <!-- Theme style -->
        <link href="css/AdminLTE.css" rel="stylesheet" type="text/css" />

        <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
        <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
        <!--[if lt IE 9]>
          <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
          <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
        <![endif]-->
    </head>
    <body class="bg-black">

        <div class="form-box" id="login-box">
            <div class="header">Sign In</div>
            <form action="index.php" method="post">
                <div class="body bg-gray">
                    <div class="form-group">
                        <input type="text" name="userid" class="form-control" placeholder="User ID"/>
                    </div>
                    <div class="form-group">
                        <input type="password" name="password" class="form-control" placeholder="Password"/>
                    </div>          
                    <div class="form-group">
                        <input type="checkbox" name="remember_me"/> Remember me
                    </div>
                </div>
                <div class="footer">                                                               
                    <button type="submit" class="btn bg-olive btn-block">Sign in</button>  
                </div>
            </form>

            <div class="margin text-center">
                <span>Sign in using social networks</span>
                <br/>
                <button class="btn bg-light-blue btn-circle"><i class="fa fa-facebook"></i></button>
                <button class="btn bg-aqua btn-circle"><i class="fa fa-twitter"></i></button>
                <button class="btn bg-red btn-circle"><i class="fa fa-google-plus"></i></button>

            </div>
        </div>


        <!-- jQuery 2.0.2 -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js"></script>
        <!-- Bootstrap -->
        <script src="js/bootstrap.min.js" type="text/javascript"></script>        

    </body>
</html>


<?php
mysqli_close($con);
?>

<?php
myoff:
if ($check_site == "0")
{
      echo ' 
    <html>
    <head>
        <meta charset="UTF-8">
        <link rel="icon" type="image/png" href="img/favicon.ico">

        <!-- social network metas -->
        <meta property="site_name" content="Turbo Spinner"/>
        <meta property="description" content="Turbo Spinner - A Article Rewriter " />
        <meta name="description" content="Turbo Spinner - A Article Rewriter " />

        <title>Offline Site - Turbo Spinner</title>
        <!-- bootstrap 3.0.2 -->
        <link href="css/bootstrap.min.css" rel="stylesheet" type="text/css" />
        <!-- font Awesome -->
        <link href="css/font-awesome.min.css" rel="stylesheet" type="text/css" />
        <!-- Ionicons -->
        <link href="css/ionicons.min.css" rel="stylesheet" type="text/css" />
        <!-- Theme style -->
        <link href="css/AdminLTE.css" rel="stylesheet" type="text/css" />

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
                        Turbo Spinner - A Article Rewriter
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

?>