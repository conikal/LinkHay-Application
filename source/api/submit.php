<?php 

include '../api/curl.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$cc = new cURL();
$linkhay = 'http://linkhay.com';
$vietid = 'http://vietid.net';
$username = (isset($_GET['username']) ? $_GET['username'] : '');
$password = (isset($_GET['password']) ? $_GET['password'] : '');

$url = (isset($_GET['url']) ? $_GET['url'] : '');
$cat = (isset($_GET['cat']) ? $_GET['cat'] : '');
$title = (isset($_GET['title']) ? $_GET['title'] : '');
$desc = (isset($_GET['desc']) ? $_GET['desc'] : '');
$thumb = (isset($_GET['thumb']) ? $_GET['thumb'] : '');
$embed = (isset($_GET['embed']) ? $_GET['embed'] : '');
$sensitive = (isset($_GET['sensitive']) ? $_GET['sensitive'] : 0);
$act = (isset($_GET['act']) ? $_GET['act'] : 'save');
$request = (isset($_GET['request']) ? $_GET['request'] : 'ajax');

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
$data_submit = array(
	'url' => $url,
	'cat' => $cat,
	'title' => $title,
	'desc' => $desc,
	'thumb' => $thumb,
	'embed' => $embed,
	'sensitive' => $sensitive,
	'act' => $act,
	'request' => $request
	);

$subject = $cc->post($linkhay . '/actions/link/post/linkhay.php', http_build_query($data_submit));
preg_match('/"result":"(.*?)"/', $subject, $result);
preg_match('/"link":"(.*?)"/', $subject, $link);
preg_match('/"message":"(.*?)"/', $subject, $message);
$submit = array();
if ($result) $submit['result'] = $result[1];
if ($link) $submit['link'] = stripslashes($link[1]);
if ($message) $submit['message'] = $message[1];
$submit = json_encode($submit);
print_r($submit);



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