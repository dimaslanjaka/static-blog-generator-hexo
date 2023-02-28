<?php
/*
 * @author Balaji
 */
error_reporting(1);
?>
    <header class="wrapper clearfix">
		       
        <div id="banner">        
        	<div id="logo"><a href="/"><img src="images/logo.png" alt="logo" /></a></div> 
        </div>
        
        <nav id="topnav" role="navigation">
        <div class="menu-toggle">Menu</div>  
        <ul class="srt-menu" id="menu-main-navigation">
        <li <?php if (strpos($_SERVER['PHP_SELF'],'index.php') !== false)
                        echo 'class="current"';
                        ?>><a href="/">Home</a></li>
          
        <li <?php if (strpos($_SERVER['PHP_SELF'],'api.php') !== false)
                        echo 'class="current"';
                        ?>><a href="api.php">API Access</a> </li>
        
        <li <?php if (strpos($_SERVER['PHP_SELF'],'pages.php') !== false)
                        echo 'class="current"';
                        ?>><a href="#">Pages</a>
        
        <ul>
    <?php
    $query =  "SELECT * FROM pages";
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $page_name =  Trim($row['page_name']);
    $p_title =  Trim($row['page_title']);
    $cl = "";
    if (strpos($_SERVER['QUERY_STRING'],$page_name) !== false)
    $cl = "active";
    echo '<li class="'.$cl.'"><a href="pages.php?page='.$page_name.'">'.$p_title.'</a></li>';
    }
    ?>
                </ul>
        </li>
       	<li <?php if (strpos($_SERVER['PHP_SELF'],'contact.php') !== false)
                        echo 'class="current"';
                        ?>><a href="contact.php">Contact US</a></li>
        <li <?php if (strpos($_SERVER['PHP_SELF'],'about.php') !== false)
                        echo 'class="current"';
                        ?>><a href="about.php">About US</a></li>
		</ul>     
		</nav><!-- #topnav -->
  
    </header>