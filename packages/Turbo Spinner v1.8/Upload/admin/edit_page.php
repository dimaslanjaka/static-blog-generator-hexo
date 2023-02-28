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
    
   	if ($_SERVER['REQUEST_METHOD'] == 'POST')
	{
    if (isset($_POST{'editme'})) {
    $edit_me_id =  htmlspecialchars(Trim($_POST['editme']));
    $page_name = htmlspecialchars(Trim($_POST['page_name']));
    $page_title = htmlspecialchars(Trim($_POST['page_title']));
    $page_content = $_POST['data'];
    
    $query = "UPDATE pages SET last_date='$date', page_name='$page_name', page_title='$page_title', page_content='$page_content' WHERE id='$edit_me_id'"; 
    mysqli_query($con,$query);   
    }
	else
    {
    $page_name = htmlspecialchars(Trim($_POST['page_name']));
    $page_title = htmlspecialchars(Trim($_POST['page_title']));
    $page_content = $_POST['data'];
    
    $query = "INSERT INTO pages (last_date,page_name,page_title,page_content) VALUES ('$date','$page_name','$page_title','$page_content')"; 
    mysqli_query($con,$query);  
    }
    $page_name = "";
    $page_title = "";
    $page_content = "";       
    }
    
if (isset($_GET{'edit'})) {
        
$page_id = trim($_GET['edit']);
$sql = "SELECT * FROM pages where id='$page_id'";
$result = mysqli_query($con, $sql);

//we loop through each records
while($row = mysqli_fetch_array($result)) {
//populate and display results data in each row
$page_name = $row['page_name'];
$page_title = $row['page_title'];
$page_content = $row['page_content'];
}
    }
    
?>

<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Admin Section | Dashboard</title>
        <meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' name='viewport'>
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
                        <li>
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
                           <li class="active">
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
                        Custom Pages
                        <small>Control panel</small>
                    </h1>
                    <ol class="breadcrumb">
                        <li><a href="#"><i class="fa fa-sitemap"></i> Admin</a></li>
                        <li class="active">Custom Pages</li>
                    </ol>
                </section>

                <!-- Main content -->
                <section class="content">

                    <div class='row'>
                        <div class='col-md-12'>
                            <div class='box box-info'>
                                <div class='box-header'>
                                    <h3 class='box-title'>Add Custom Page<small></small></h3>
                                    <!-- tools box -->
                                    <div class="pull-right box-tools">
                                        <button class="btn btn-info btn-sm" data-widget='collapse' data-toggle="tooltip" title="Collapse"><i class="fa fa-minus"></i></button>
                                        <button class="btn btn-info btn-sm" data-widget='remove' data-toggle="tooltip" title="Remove"><i class="fa fa-times"></i></button>
                                    </div><!-- /. tools -->
                                </div><!-- /.box-header -->
                                 <form method="POST" action="edit_page.php">
                                         <div class="form-group pad">
                                            <label for="page_name">Page Name (Must be a keyword without any space eg. about_us)</label>
                                            <input type="text" placeholder="Enter page name" value="<?php echo $page_name; ?>" name="page_name" id="page_name" class="form-control">
                                        </div>
                                             <div class="form-group pad">
                                            <label for="page_title">Page title</label>
                                            <input type="text" placeholder="Enter title here" value="<?php echo $page_title; ?>" name="page_title" id="page_title" class="form-control">
                                        </div>
                                        <?php
                                        if (isset($_GET{'edit'})) 
                                        {
                                          echo '<input type="hidden" value='.$_GET{'edit'}.'id="editme" name="editme" />'; 
                                        }        
                                        ?>
                                <div class='box-body pad'>
                                <textarea id="editor1" name="data" rows="10" cols="80"><?php echo $page_content; ?></textarea>    
                                <br />                                
                                    <button class="btn btn-info btn-sm">Save</button>                    
                                    </form>
                                </div>
                            </div><!-- /.box -->

                        </div><!-- /.col-->
                    </div><!-- ./row -->

         <div class="box box-info">
                                <div class="box-header">
                                    <!-- tools box -->

                                    <h3 class="box-title">
                                        Recently added page's
                                    </h3>
                                </div>

                                <div class="box-body">
                                    <table class="table table-striped">
                                                 <tbody><tr>
                                           <th>Added Date</th>
                                            <th>Page Name</th>
                                            <th>Page Title</th>
                                             <th>View</th>
                                             <th>Edit</th>
                                            <th>Delete</th>
                                        </tr>
                                    
<?php     

if (isset($_GET{'delete'})) {
$delete = htmlspecialchars(Trim($_GET['delete']));
$query = "DELETE FROM pages WHERE id=$delete";
$result = mysqli_query($con,$query);

    if (mysqli_errno($con)) {   
    echo '<div class="alert alert-danger alert-dismissable">
                                        <i class="fa fa-ban"></i>
                                        <button aria-hidden="true" data-dismiss="alert" class="close" type="button">x</button>
                                        <b>Alert!</b> '.mysqli_error($con).'
                                    </div>';
    }
    else
    {
        echo '
        <div class="alert alert-success alert-dismissable">
                                        <i class="fa fa-check"></i>
                                        <button aria-hidden="true" data-dismiss="alert" class="close" type="button">x</button>
                                        <b>Alert!</b> Site deleted from database successfully.
                                    </div>';
    }
}    
$rec_limit = 20;   
$query = "SELECT count(id) FROM pages";
$retval = mysqli_query($con,$query);
 
$row = mysqli_fetch_array($retval);
$rec_count = Trim($row[0]);



if (isset($_GET{'page'})) { //get the current page
$page = $_GET{'page'} + 1;
$offset = $rec_limit * $page;
} else {
// show first set of results
$page = 0;
$offset = 0;
}
$left_rec = $rec_count - ($page * $rec_limit);
//we set the specific query to display in the table
$sql = "SELECT * FROM pages ORDER BY `id` DESC LIMIT $offset, $rec_limit";
$result = mysqli_query($con, $sql);
$no =1;
//we loop through each records
while($row = mysqli_fetch_array($result)) {
//populate and display results data in each row
echo '<tr>';
echo '<td>' . $row['last_date'] . '</td>';
echo '<td>' . $row['page_name'] . '</td>';
echo '<td>' . $row['page_title'] . '</td>';
$myid = $row['id'];
echo '<td>' . "<a class='btn btn-success btn-sm' href=../pages.php?page=".$row['page_name']."> View </a>" . '</td>';
echo '<td>' . "<a class='btn btn-primary btn-sm' href=".$_PHP_SELF."?edit=".$myid."> Edit </a>" . '</td>';
echo '<td>' . "<a class='btn btn-danger btn-sm' href=".$_PHP_SELF."?delete=".$myid."> Delete </a>" . '</td>';
$no++;
}
echo '</tr>';
echo '</tbody>';
echo '</table>';
//we display here the pagination
echo '<ul class="pager">';
if ($left_rec < $rec_limit) {
$last = $page - 2;
if ($last < 0)
{

}
else
{
    echo @"<li><a href=\"$_PHP_SELF?page=$last\">Previous</a></li>";
}
} else if ($page == 0) {
echo @"<li><a href=\"$_PHP_SELF?page=$page\">Next</a></li>";
} else if ($page > 0) {
$last = $page - 2;
echo @"<li><a href=\"$_PHP_SELF?page=$last\">Previous</a></li> ";
echo @"<li><a href=\"$_PHP_SELF?page=$page\">Next</a></li>";
}
echo '</ul>';
?>
    
                                </div><!-- /.box-body -->

                                <div class="box-footer">

                                </div>
                            </div>
                          
                 
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
        <!-- iCheck -->
        <script src="js/plugins/iCheck/icheck.min.js" type="text/javascript"></script>
        <!-- AdminLTE App -->
        <script src="js/AdminLTE/app.js" type="text/javascript"></script>
        <script src="js/AdminLTE/dashboard.js" type="text/javascript"></script>     
        <!-- jQuery 2.0.2 -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js"></script>
        <!-- CK Editor -->
        <script src="js/plugins/ckeditor/ckeditor.js" type="text/javascript"></script>
        <!-- Bootstrap WYSIHTML5 -->
        <script src="js/plugins/bootstrap-wysihtml5/bootstrap3-wysihtml5.all.min.js" type="text/javascript"></script>
        <script type="text/javascript">
            $(function() {
                // Replace the <textarea id="editor1"> with a CKEditor
                // instance, using default configuration.
                CKEDITOR.replace('editor1');
                //bootstrap WYSIHTML5 - text editor
                $(".textarea").wysihtml5();
            });
        </script>

    </body>
</html>
<?php
mysqli_close($con);
?>