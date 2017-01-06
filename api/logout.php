<?php
include '../api/curl.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$cc = new cURL();
$linkhay = 'http://linkhay.com';
$vietid = 'http://vietid.net';


$app_key = '057ee7c8032ed1faa1cfe6a3051785fb';
$call_back = 'http://linkhay.com/auth/logout';

$post = array(
	'app_key' => $app_key,
	'call_back' => $call_back
	);
$delete_key = $cc->post($vietid . '/OauthServerV2/Plogout', http_build_query($post));
$logout = $cc->post($vietid . '/OauthServerV2/Plogout', http_build_query($post));

echo $logout;

?>