<?php

/*
* @author Balaji
* @name Turbo Spinner: Article Rewriter - PHP Script
* @copyright © 2017 ProThemes.Biz
*
*/

// Disable Errors
error_reporting(1);

function turbo_spin($post, $lang) {
    
    //Define spin Class
    require_once ('spin.class.php');

    //lang check
    if ($lang == "" || $lang == null){
        $lang = "en";
    }
    
    //spin the data
    $data = stripslashes($post);
    $spin = new spin_my_data;
    $spinned = $spin->spinMyData($data, $lang);

    //select any random synonymous word
    $spinned_data = $spin->randomSplit($spinned);
    return $spinned_data;
}

?>