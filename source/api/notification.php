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
$subject = $cc->get($linkhay . '/core/notification/index');
$reset = $cc->get($linkhay . '/core/notification/resetNewCounter');

// items
$subject = str_replace(array("\r\n", "\r", "\n"), "", $subject);
preg_match_all('/<li class="V2-notif-item(.*?)<\/a><\/li>/', $subject, $items);
//print_r($items);http://linkhay.com/core/notification/resetNewCounter?t=1474368814017&_=1474368814017

$notifications = array();
foreach ($items[0] as $id => $item) {
	// ID
	preg_match('/notif-id="(.*?)"><a href=/', $item, $id);
	// URL
	preg_match('/<a href="(.*?)" class="clearfix">/', $item, $url);
	// Thumbnail
	preg_match('/<div class="V2-notif-thumb"><img src="(.*?)" onerror=/', $item, $thumbnail);
	// Icon
	preg_match('/<div class="V2-notif-icon">        <img src="(.*?)" onerror=/', $item, $icon);
	// User
	preg_match('/<span class="V2-notif-user"><span>(.*?)<\/span><\/span>/', $item, $username);
	// description
	preg_match('/<div class="V2-notif-desc"><span class="V2-notif-user"><span>(.*?)<\/span><\/span>(.*?)<\/div>/', $item, $description);
	// title
	preg_match('/<span class="V2-notif-dest-title" href="(.*?)">(.*?)<\/span>/', $item, $title);
	// action
	preg_match('/<span class="V2-notif-action">(.*?)<\/span>/', $item, $action);
	// time
	preg_match('/<span class="V2-notif-date">(.*?)<\/span>/', $item, $timeago);
	// status
	preg_match('/<li class="V2-notif-item (.*?) clearfix mrk-insert-trigger" osc-insert-cb=/', $item, $status);

	$notification = array(
		'id' => ($id ? $id[1] : ''),
		'url' => ($url ? $url[1] : ''),
		'thumbnail' => ($thumbnail ? $thumbnail[1] : ''),
		'icon' => ($icon ? $icon[1] : ''),
		'username' => ($username ? $username[1] : ''),
		'description' => ($description ? $description[2] : ''),
		'title' => ($title ? $title[2] : ''),
		'action' => ($action ? $action[1] : ''),
		'timeago' => ($timeago ? $timeago[1] : ''),
		'status' => ($status ? $status[1] : '')
	);

	$notification = (object) $notification;
	array_push($notifications, $notification);
}

$result = array('notifications' => $notifications, 'login_status' => $login_status);
$result = json_encode($result);
print_r($result);

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