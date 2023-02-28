<?php
/*
 * @author Balaji
 */
error_reporting(1);

?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>TurboSpinner | Installer panel</title>
        <meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' name='viewport'>
        <!-- bootstrap 3.0.2 -->
        <link href="admin/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
        <!-- font Awesome -->
        <link href="admin/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
        <!-- Ionicons -->
        <link href="admin/css/ionicons.min.css" rel="stylesheet" type="text/css" />
        <!-- Morris chart -->
        <link href="admin/css/morris/morris.css" rel="stylesheet" type="text/css" />
        <!-- jvectormap -->
        <link href="admin/css/jvectormap/jquery-jvectormap-1.2.2.css" rel="stylesheet" type="text/css" />
        <!-- bootstrap wysihtml5 - text editor -->
        <link href="admin/css/bootstrap-wysihtml5/bootstrap3-wysihtml5.min.css" rel="stylesheet" type="text/css" />
        <!-- Theme style -->
        <link href="admin/css/AdminLTE.css" rel="stylesheet" type="text/css" />

        <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
        <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
        <!--[if lt IE 9]>
          <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
          <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
        <![endif]-->
        
 <script>
function loadXMLDoc()
{
var xmlhttp;
var sql_host = $('input[name=data_host]').val();
var sql_name = $('input[name=data_name]').val();
var sql_user = $('input[name=data_user]').val();
var sql_pass = $('input[name=data_pass]').val();
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
$.post("process.php", {data_host:sql_host,data_name:sql_name,data_user:sql_user,data_pass:sql_pass}, function(results){
if (results == 0) {
     $("#alert1").show();
     $("#index_1").show();
     $("#index_2").hide();
}
else
{
     $("#alert1").hide();
     $("#alert2").show();
     $("#index_1").hide();
     $("#index_2").show();
}
});
}
</script>   

<script>
function findoc()
{
var xmlhttp;
var user = $('input[name=admin_user]').val();
var pass = $('input[name=admin_pass]').val();
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
$.post("finish.php", {admin_user:user,admin_pass:pass}, function(results){
     $("#alert1").hide();
     $("#alert2").hide();
     $("#index_1").hide();
     $("#index_2").hide();
     $("#index_3").show();
     $("#index_3").append(results);
});
}
</script>     
<style>
 #alert1{ display:none; }
 #alert2{ display:none; }
 #index_2{ display:none; }
 #index_3{ display:none; } </style>     
    </head>
    <body class="skin-blue">
        <!-- header logo: style can be found in header.less -->
        <header class="header">
            <a href="install.php" class="logo">
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
              
            </nav>
        </header>
        <div class="wrapper row-offcanvas row-offcanvas-left">
        <aside class="left-side sidebar-offcanvas">
                <!-- sidebar: style can be found in sidebar.less -->
                <section class="sidebar">
                    <!-- Sidebar user panel -->
                    <div class="user-panel">
                        <div class="pull-left image">
                            <img src="admin/img/admin.jpg" class="img-circle" alt="User Image" />
                        </div>
                        <div class="pull-left info">
                            <p>Hello, Admin</p>

                            <a href="#"><i class="fa fa-circle text-success"></i> Online</a>
                        </div>
                    </div>
                    <!-- sidebar menu: : style can be found in sidebar.less -->
                    <ul class="sidebar-menu">
                        <li class="active">
                            <a href="install.php">
                                <i class="fa fa-laptop"></i> <span>Installer</span>
                            </a>
                        </li>
                        
                    </ul>
                </section>
                <!-- /.sidebar -->
            </aside>
              <aside class="right-side">
                <!-- Content Header (Page header) -->
                <section class="content-header">
                    <h1>
                        Turbo Spinner
                        <small>Installer panel</small>
                    </h1>
                    <ol class="breadcrumb">
                        <li><a href="#"><i class="fa fa-dashboard"></i> Admin</a></li>
                        <li class="active">Installer</li>
                    </ol>
                </section>

                <!-- Main content -->
                <section class="content">
                
              <div id="alert1">   
               <div class="alert alert-danger alert-dismissable">
                                        <i class="fa fa-ban"></i>
                                        <button aria-hidden="true" data-dismiss="alert" class="close" type="button">x</button>
                                        <b>Alert!</b> Database connection failed.
                                    </div>
              </div>
              <div id="alert2">  
              <div class="alert alert-success alert-dismissable">
                                        <i class="fa fa-check"></i>
                                        <button aria-hidden="true" data-dismiss="alert" class="close" type="button">x</button>
                                        <b>Alert!</b> Database connection success.
              </div>  
              </div>
<div id="index_1">    
        <div class="row">
        <div class="col-xs-12">
                            <div class="box">
                                <div class="box-header">
                                  <h3 class="box-title">Requirement's Check</h3>
        
                                </div><!-- /.box-header -->
                                <div class="box-body table-responsive no-padding">
                                    <table class="table table-hover">
                                        <tbody><tr>
                                            <th>#</th>
                                            <th>File / Folder name</th>
                                            <th>Status</th>
                                        </tr>
                                        <tr>
                                            <td>1</td>
                                            <td>Configuration file ('config.php')</td>
                                            
                                         <?php   
                                         $filename = 'config.php';
                                         if (is_writable($filename)) {
    echo '<td><span class="label label-success">Writable</span></td>';
} else {
    echo '<td><span class="label label-danger">Not Writable</span></td>';
        $fa = '1';
}

?>

                                            
                                        </tr>
                                        <tr>
                                            <td>2</td>
                                            <td>Synonymous Database</td>
 <?php   
                                         $filename = 'core/en_db.sdata';
                                         if (is_writable($filename)) {
    echo '<td><span class="label label-success">Writable</span></td>';
} else {
    echo '<td><span class="label label-danger">Not Writable</span></td>';
    $fa = '1';
}

?>
                                        </tr>
                                                                                                    <tr>
                                            <td>3</td>
                                            <td>PHP Version (Yours version <?php echo phpversion(); ?>) </td>
 <?php   
                                         if (strnatcmp(phpversion(),'5.3.0') >= 0)
{
    echo '<td><span class="label label-success">Okay</span></td>';
}
else
{
    echo '<td><span class="label label-danger">Not Okay</span></td>';
    $fa = '1';
}
?>
                                        </tr>

                                        <tr>
                                            <td>4</td>
                                            <td>Mysqli extension</td>
 <?php   
if(function_exists('mysqli_connect'))
{
    echo '<td><span class="label label-success">Okay</span></td>';
}
else
{
    echo '<td><span class="label label-danger">Not Okay</span></td>';
    $fa = '1';
}
?>
                                        </tr>
                                                                 <tr>
                                            <td>5</td>
                                            <td>file_get_contents()</td>
 <?php   
if(ini_get('allow_url_fopen'))
{
    echo '<td><span class="label label-success">Okay</span></td>';
}
else
{
    echo '<td><span class="label label-danger">Not Okay</span></td>';
    $fa = '1';
}
?>
                                        </tr>
                                    </tbody></table>
                                </div><!-- /.box-body -->
                            </div><!-- /.box -->
                        </div>
             </div>  
             <div class="box box-primary">
                                <div class="box-header">
                                    <h3 class="box-title">Database Connection</h3>
                                </div><!-- /.box-header -->
                                <!-- form start -->
                                    <div class="box-body">
                                        <div class="form-group">
                                            <label for="data_host">Database Host</label>
                                            <input type="text" placeholder="Enter database name" name="data_host" id="data_host" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label for="data_name">Database Name</label>
                                            <input type="text" placeholder="Enter database name" name="data_name" id="data_name" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label for="data_user">Database Username</label>
                                            <input type="text" placeholder="Enter database username" name="data_user" id="data_user" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label for="data_pass">Database Password</label>
                                            <input type="password" placeholder="Enter database password" name="data_pass" id="data_pass" class="form-control">
                                        </div>
                                    </div><!-- /.box-body -->

                                    <div class="box-footer">    
                                       <?php  if(isset($fa)) { ?>
                                          <button class="btn btn btn-primary" disabled>Submit</button>
                                    <?php } else { ?>                                      
                                              <button class="btn btn btn-primary" onclick="loadXMLDoc()" >Submit</button>
                                     <?php } ?>   
                                    </div>

                            </div>
                               </div>
                               
                               
 <div id="index_2">  
       <div class="box box-primary">
                                <div class="box-header">
                                    <h3 class="box-title">Admin Details</h3>
                                </div><!-- /.box-header -->
                                <!-- form start -->
                                    <div class="box-body">
                                        <div class="form-group">
                                            <label for="admin_user">Admin Username</label>
                                            <input type="text" placeholder="Enter admin username" name="admin_user" id="admin_user" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label for="admin_pass">Admin Password</label>
                                            <input type="password" placeholder="Enter admin password" name="admin_pass" id="admin_pass" class="form-control">
                                        </div>
                                    </div><!-- /.box-body -->

                                    <div class="box-footer">                                   
                                           <button class="btn btn btn-primary" onclick="findoc()" >Submit</button>
                                    </div>

                            </div>
    </div>
    
     <div id="index_3">  
       </div>
                </section>         
        </div>

        <!-- add new calendar event modal -->


          <!-- jQuery 2.0.2 -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js"></script>
        <!-- jQuery UI 1.10.3 -->
        <script src="admin/js/jquery-ui-1.10.3.min.js" type="text/javascript"></script>
        <!-- Bootstrap -->
        <script src="admin/js/bootstrap.min.js" type="text/javascript"></script>
        <!-- Morris.js charts -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/raphael/2.1.0/raphael-min.js"></script>
        <script src="admin/js/plugins/morris/morris.min.js" type="text/javascript"></script>
        <!-- Sparkline -->
        <script src="admin/js/plugins/sparkline/jquery.sparkline.min.js" type="text/javascript"></script>
        <!-- jvectormap -->
        <script src="admin/js/plugins/jvectormap/jquery-jvectormap-1.2.2.min.js" type="text/javascript"></script>
        <script src="admin/js/plugins/jvectormap/jquery-jvectormap-world-mill-en.js" type="text/javascript"></script>
        <!-- Bootstrap WYSIHTML5 -->
        <script src="admin/js/plugins/bootstrap-wysihtml5/bootstrap3-wysihtml5.all.min.js" type="text/javascript"></script>
        <!-- iCheck -->
        <script src="admin/js/plugins/iCheck/icheck.min.js" type="text/javascript"></script>
        
        <!-- AdminLTE App -->
        <script src="admin/js/AdminLTE/app.js" type="text/javascript"></script>
        <script src="admin/js/AdminLTE/dashboard.js" type="text/javascript"></script>     


    </body>
</html>