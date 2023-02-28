<?php
session_start();
/*
 * @author Balaji
 */
error_reporting(1);
require_once('../config.php');
require_once('../core/spin.php');
$con = mysqli_connect($mysql_host,$mysql_user,$mysql_pass,$mysql_database); 
if ($_SERVER['REQUEST_METHOD'] == 'POST')
{
        
    $query =  "SELECT * FROM site_info";
    $result = mysqli_query($con,$query);
        
    while($row = mysqli_fetch_array($result)) {
    $req =   Trim($row['req']);
    $lm =   Trim($row['lm']);
    }
    if ($req == '0')
    {
        $req ="99999999565466547452143657568969454";
    }
        $query =  "SELECT * FROM capthca WHERE id=".Trim('0');
        $result = mysqli_query($con,$query);
        
        while($row = mysqli_fetch_array($result)) {
        $cap_e =  Trim($row['cap_e']);
        }
        if ($cap_e == "on")
        {
        
    $scode = strtolower(htmlspecialchars(Trim($_POST['scode'])));
    $cap_code = strtolower($_SESSION['captcha']['code']);
    if ($cap_code == $scode)
    {
    if (isset($_POST['data']))
    {
        $article_count = str_word_count(stripslashes($_POST['data']));
    if ($_SESSION['limit_count'] > $req)
    {
        echo 'You have reached the limit, Upgrade your access!';
    }
    else
    {
     if ($lm == "0")
    {
        $spined = turbo_spin(stripslashes($_POST['data']),stripslashes($_POST['lang']));
        $spined = ucfirst($spined);
        $spined= preg_replace_callback("|([.!?]\s*\w)|", function ($matches) {
             return strtoupper($matches[0]);
        } , $spined);
        echo $spined;
        if (!isset($_SESSION['limit_count']))
        {
        $_SESSION['limit_count'] =1;
        }
        else
        {
        $_SESSION['limit_count'] = $_SESSION['limit_count'] + 1;
        }
    }
    else
    {
        if ($article_count <= $lm)
        {
        $spined = turbo_spin(stripslashes($_POST['data']),stripslashes($_POST['lang']));
        $spined = ucfirst($spined);
        $spined= preg_replace_callback("|([.!?]\s*\w)|", function ($matches) {
             return strtoupper($matches[0]);
        } , $spined);
        echo $spined;
        if (!isset($_SESSION['limit_count']))
        {
        $_SESSION['limit_count'] =1;
        }
        else
        {
        $_SESSION['limit_count'] = $_SESSION['limit_count'] + 1;
        }   
        }
        else
        {
            echo "Word count exceeded the limit";
        }
    }
    }
    }
    }
    else
    {
        echo "Captcha is Wrong";
    } 
    }
    else
    {
          if (isset($_POST['data']))
    {
        $article_count = str_word_count(stripslashes($_POST['data']));
            if ($_SESSION['limit_count'] == $req)
    {
        echo 'You have reached the limit, Upgrade your access!';
    }
    else
    {
            if ($lm == "0")
    {
        $spined = turbo_spin(stripslashes($_POST['data']),stripslashes($_POST['lang']));
        $spined = ucfirst($spined);
        $spined= preg_replace_callback("|([.!?]\s*\w)|", function ($matches) {
             return strtoupper($matches[0]);
        } , $spined);
        echo $spined;
        if (!isset($_SESSION['limit_count']))
        {
        $_SESSION['limit_count'] =1;
        }
        else
        {
        $_SESSION['limit_count'] = $_SESSION['limit_count'] + 1;
        }
    }
    else
    {
        if ($article_count <= $lm)
        {
        $spined = turbo_spin(stripslashes($_POST['data']),stripslashes($_POST['lang']));
        $spined = ucfirst($spined);
        $spined= preg_replace_callback("|([.!?]\s*\w)|", function ($matches) {
             return strtoupper($matches[0]);
        } , $spined);
        echo $spined;  
        if (!isset($_SESSION['limit_count']))
        {
        $_SESSION['limit_count'] =1;
        }
        else
        {
        $_SESSION['limit_count'] = $_SESSION['limit_count'] + 1;
        } 
        }
        else
        {
            echo "Word count exceeded the limit";
        }
    } 
    }     
    }
    }
}   
?>