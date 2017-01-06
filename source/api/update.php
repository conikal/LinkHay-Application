<?php 

include '../api/curl.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$cc = new cURL();
$linkhay = 'http://linkhay.com';
$vietid = 'http://vietid.net';
$username = (isset($_GET['username']) ? $_GET['username'] : '');
$password = (isset($_GET['password']) ? $_GET['password'] : '');

/*-----------------------------
 LOGIN
-----------------------------*/
$login_status = '';
$oauth = $cc->get($linkhay . '/auth/request?type=modal');
$oauth = str_replace(array("\r\n", "\r", "\n"), "", $oauth);
preg_match('/var oauth_token		=	"(.*?)"/', $oauth, $token_key);
if (!$token_key) {
	$oauth = $cc->get($linkhay . '/auth/request?type=modal');
	$oauth = str_replace(array("\r\n", "\r", "\n"), "", $oauth);
	preg_match('/var oauth_token		=	"(.*?)"/', $oauth, $token_key);
}

if ($token_key) {
	$data_login = array(
		'email' => $username,
		'password' => $password,
		'login_btn' => 'Đăng nhập',
		'oauth_token' => $token_key[1],
		'processlogin' => 1,
		'username' => ''
	);

	$login = $cc->post($vietid . '/Authentication/Authenticate/', http_build_query($data_login));
	//echo $login;
	$login = str_replace(array("\r\n", "\r", "\n"), "", $login);
	preg_match('/&oauth_verifier=(.+?)&confirm=1&confirm=1/', $login, $confirm_key);
	if ($confirm_key) {
		$login_status = true;
	} else {
		$login_status = false;
	}
} else {
	$login_status = false;
}


/*-----------------------------
 LOAD CONTENT 
-----------------------------*/

$subject = $cc->get('http://touch.linkhay.com/ajax/getUpdate.php');

// items
//$subject = str_replace(array("\r\n", "\r", "\n"), "", $subject);
print_r($subject);

/*-----------------------------
	LOGOUT
-----------------------------*/
$app_key = '057ee7c8032ed1faa1cfe6a3051785fb';
$call_back = 'http://linkhay.com/auth/logout';

$post = array(
	'app_key' => $app_key,
	'call_back' => $call_back
	);
//$logout_app = $cc->get($vietid . '/OauthServerV2/logout', http_build_query($post));
$delete_key = $cc->post($vietid . '/OauthServerV2/Plogout', http_build_query($post));
$logout = $cc->post($vietid . '/OauthServerV2/Plogout', http_build_query($post));

//echo $logout;


?>