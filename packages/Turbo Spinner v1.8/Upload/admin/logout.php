<?php
session_start();
/**
 * @author Balaji
 * @copyright 2017
 */
error_reporting(1);

if(isset($_SESSION['login']))
unset($_SESSION['login']);

session_destroy();

echo "<br> <b> Logout Successfull...... </b> <br>";
echo '<meta http-equiv="refresh" content="1;url=index.php">';


?>