<?php
session_start();
/*
 * @author Balaji
 */
error_reporting(1);
require_once('../config.php');
$con = mysqli_connect($mysql_host,$mysql_user,$mysql_pass,$mysql_database);  
if ($_SERVER['REQUEST_METHOD'] =='POST')
{
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
        echo "1";
    }
    else
    {
        echo "0";
    }
    }
    else
    {
        echo '1';
    }
}
?>