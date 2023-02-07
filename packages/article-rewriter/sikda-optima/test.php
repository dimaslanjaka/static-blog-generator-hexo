<?php

$curl = curl_init();
$useragent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0';
$cooks2 = file_get_contents(__DIR__ . '/session.txt');
$postdata = "_search=false&nd=$time&rows=$rows&page=$page&sidx=&sord=desc&dari=$tgl&keyword=NAMA_LENGKAP&cari=$nama&status=";
curl_setopt_array($curl, array(
  CURLOPT_URL => 'https://sikda-optima.com/sikda-optima/t_apotik/t_apotikantrianxml',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS => $postdata,
  CURLOPT_HTTPHEADER => array(
    'Accept:  text/html, /; q=0.01',
    'Accept-Encoding:  gzip, deflate, br',
    'Accept-Language:  en-US,en;q=0.9',
    'Connection:  keep-alive',
    'Cookie:  ' . $cooks2,
    'DNT:  1',
    'Host:  sikda-optima.com',
    'Referer:  https://sikda-optima.com/sikda-optima/dashboard',
    'Sec-Fetch-Dest:  empty',
    'Sec-Fetch-Mode:  cors',
    'Sec-Fetch-Site:  same-origin',
    'User-Agent: ' . $useragent,
    'X-Requested-With:  XMLHttpRequest',
    // 'sec-ch-ua:  '.$useragent,
    'sec-ch-ua-mobile:  ?0',
    'sec-ch-ua-platform:  "Windows"'
  ),
));

$response = curl_exec($curl);
