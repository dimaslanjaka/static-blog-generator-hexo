<?php
/*
 * @author Balaji
 */
error_reporting(1);

$data_host = htmlspecialchars(Trim($_POST['data_host']));
$data_name = htmlspecialchars(Trim($_POST['data_name']));
$data_user = htmlspecialchars(Trim($_POST['data_user']));
$data_pass = htmlspecialchars(Trim($_POST['data_pass']));

$con = mysqli_connect($data_host,$data_user,$data_pass,$data_name);

if (mysqli_connect_errno()){
    echo "0";
    goto fx;
}


$data = '<?php
/*
 * @author Balaji
 */
error_reporting(1);

// MySQL Hostname
$mysql_host = "'.$data_host.'";

// MySQL Username
$mysql_user = "'.$data_user.'";

// MySQL Password
$mysql_pass = "'.$data_pass.'";

// MySQL Database Name
$mysql_database = "'.$data_name.'";

?>';

file_put_contents('config.php',$data);

echo "1";

fx:
?>