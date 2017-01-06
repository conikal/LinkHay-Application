<?php 

include '../api/curl.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$cc = new cURL();
$linkhay = 'http://linkhay.com';
$vietid = 'http://vietid.net';
$username = (isset($_GET['username']) ? $_GET['username'] : '');
$password = (isset($_GET['password']) ? $_GET['password'] : '');
$url 	= (isset($_GET['url']) ? $_GET['url'] : '');
$type 	= (isset($_GET['type']) ? $_GET['type'] : 'link');

if (!$url) {
	$result = array('status' => false);
	$result = json_encode($result);
	print_r($result);
	exit();
}

/*-----------------------------
 LOGIN
-----------------------------
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

*/


/*-----------------------------
 LOAD CONTENT 
-----------------------------*/

$subject = $cc->get($url);
$subject = str_replace(array("\r\n", "\r", "\n"), "", $subject);

function parse_users_voted($subject) {
	preg_match('/<div class="V2-link-voter-list(.*?)<\/div><div class="V2-old-style-sidebar-box">/', $subject, $html_vote);

	if ($html_vote) {
		preg_match_all('/<img src="(.*?)" alt="(.*?)"\/>/', $html_vote[0], $voter);

		$users_voted = array();
		for ($i=0; $i < count($voter[2]); $i++) { 
			$user = array(
				'avatar' => $voter[1][$i],
				'username' => $voter[2][$i]
			);
			$user = (object) $user;
			array_push($users_voted, $user);
		}
		$users_voted = array_reverse($users_voted);
		$users_voted = array('users_voted' => ($users_voted ? $users_voted : '') );
	} else {
		$users_voted = array('users_voted' => false);
	}

	return $users_voted;
}

function parse_media_voted($subject) {
	preg_match('/ <div class="V2-link-voter-list">(.*?)<\/div>                    <\/div>    <\/div><\/div><\/div><\/div>/', $subject, $html_vote);
	//print_r($html_vote);
	if ($html_vote) {
		preg_match_all('/<img src="(.*?)" alt="(.*?)"\/>/', $html_vote[0], $voter);

		$users_voted = array();
		for ($i=0; $i < count($voter[2]); $i++) { 
			$user = array(
				'avatar' => $voter[1][$i],
				'username' => $voter[2][$i]
			);
			$user = (object) $user;
			array_push($users_voted, $user);
		}
		$users_voted = array_reverse($users_voted);
		$users_voted = array('users_voted' => ($users_voted ? $users_voted : '') );
	} else {
		$users_voted = array('users_voted' => false);
	}

	return $users_voted;
}


function parse_link_detail($subject) {
	preg_match('/<div class="V2-link-detail">(.*?)<\/div><\/div><div class="V2-comments/', $subject, $detail);

	if ($detail) {
		preg_match('/link-id="(.*?)" type="old-style">    <div class="counter">(.*?)<\/div>/', $detail[0], $link_id);

		preg_match('/<div class="title">                <h1><a href="(.*?)" class="(.*?)"(.*?)>(.*?)<\/a><\/h1>/', $detail[0], $title);

		preg_match('/<\/h1>                <div>(.*?)<\/div>                <span class/', $detail[0], $subtitle);

		preg_match('/<span class="date">(.*?)<\/span>/', $detail[0], $timeago);

		$vote_status = '';
		if ( preg_match('/disabled/', $detail[0]) ) {
			$vote_status = 'voted';
		} else {
			$vote_status = 'vote';
		}

		preg_match('/class="source">(.*?)<\/a>/', $detail[0], $domain);

		preg_match('/<div class="fb-like-box"><div class="fb-like" data-href="(.*?)" data-width=/', $detail[0], $url);

		preg_match('/<div id="admrecommen" data-url="(.*?)"><div id="admRecommendation">/', $detail[0], $link);

		preg_match('/class="cat">(.*?)<\/a>/', $detail[0], $category);

		preg_match('/class="user-link">                    <img src="(.*?)" alt="(.*?)">                    <span>(.*?)<\/span>/', $detail[0], $userinfo);

		preg_match('/class="thumbnail" target="_blank"><img src="(.*?)" \/><\/a>/', $detail[0], $thumbnail);

		preg_match('/><span>Loan tin<\/span><span>(.*?)<\/span><\/span>            <\/div>/', $detail[0], $html_reshare);
		if ($html_reshare) {
			preg_match_all('/<a href="\/u\/(.*?)">(.*?)<\/a>/', $html_reshare[1], $reshare);
		}
	}

	if ($detail) {
		$link_detail = array(
			'link_id' => ($link_id ? $link_id[1] : ''),
			'url' => ($url ? $url[1] : ''),
			'link' => ($link ? $link[1] : ''),
			'vote' => ($link_id ? $link_id[2] : ''),
			'title' => ($title ? $title[4] : ''),
			'subtitle' => ($subtitle ? $subtitle[1] : ''),
			'timeago' => ($timeago ? $timeago[1] : ''),
			'vote_status' => ($vote_status ? $vote_status : ''),
			'domain' => ($domain ? $domain[1] : ''),
			'category' => ($category ? $category[1] : ''),
			'username' => ($userinfo ? $userinfo[3] : ''),
			'avatar' => ($userinfo ? $userinfo[1] : ''),
			'thumbnail' => ($thumbnail ? $thumbnail[1] : ''),
			'reshare' => ($html_reshare ? $reshare[2] : '')
		);
		$link_detail = $link_detail;
	} else {
		$link_detail = false;
	}

	return $link_detail;
}

function parse_media_detail($subject) {
	preg_match('/<div class="info-box">(.*?)<\/div>        <\/div>        <div class=/', $subject, $detail);
	preg_match('/<div class="V2-vote-box(.*?)<\/div>        <div class="info-box">/', $subject, $vote_box);
	preg_match('/<div class="mediaV2-detail-content(.*?)<\/div>    <div class="mediaV2-df clearfix">/', $subject, $content);
	preg_match('/<div class="cat-block">(.*?)<div class="V2-link-voter-list">/', $subject, $channel);
	preg_match('/<div class="reshare-box">(.*?)<\/div>            <div class="V2-comments old-style/', $subject, $html_reshare);

	if ($detail || $vote_box) {
		preg_match('/link-id="(.*?)"/', $subject, $link_id);

		preg_match('/<div class="counter">(.*?)<\/div>/', $subject, $vote);

		preg_match('/<h3>(.*?)<\/h3>/', $detail[0], $title);

		preg_match('/<\/h3>                <div>(.*?)<\/div>            <\/div>/', $detail[0], $subtitle);

		preg_match('/<span class="date">(.*?)<\/span>/', $detail[0], $timeago);

		$vote_status = '';
		if ( preg_match('/disabled/', $vote_box[0]) ) {
			$vote_status = 'voted';
		} else {
			$vote_status = 'vote';
		}

		preg_match('/class="source">(.*?)<\/a>/', $detail[0], $domain);

		preg_match('/<div class="fb-send-box"><div class="fb-send" data-href="(.*?)"><\/div><\/div>/', $subject, $url);

		preg_match('/<img src="(.*?)"><\/div>/', $content[0], $link);

		preg_match('/<div class="name"><a href="(.*?)">(.*?)<\/a><\/div>/', $channel[0], $category);

		preg_match('/class="user-link">                    <img src="(.*?)" alt="(.*?)">                    <span>(.*?)<\/span>/', $detail[0], $userinfo);

		preg_match('/<img src="(.*?)"><\/div>/', $content[0], $thumbnail);

		
		if ($html_reshare) {
			preg_match_all('/<a href="\/u\/(.*?)">(.*?)<\/a>/', $html_reshare[0], $reshare);
		}
	}

	if ($detail) {
		$link_detail = array(
			'link_id' => ($link_id ? $link_id[1] : ''),
			'url' => ($url ? $url[1] : ''),
			'link' => ($link ? $link[1] : ''),
			'vote' => ($vote ? $vote[1] : ''),
			'title' => ($title ? $title[1] : ''),
			'subtitle' => ($subtitle ? $subtitle[1] : ''),
			'timeago' => ($timeago ? $timeago[1] : ''),
			'vote_status' => ($vote_status ? $vote_status : ''),
			'domain' => 'linkhay.com',
			'category' => ($category ? $category[2] : ''),
			'username' => ($userinfo ? $userinfo[3] : ''),
			'avatar' => ($userinfo ? $userinfo[1] : ''),
			'thumbnail' => ($thumbnail ? $thumbnail[1] : ''),
			'reshare' => ($html_reshare ? $reshare[2] : '')
		);
		$link_detail = $link_detail;
	} else {
		$link_detail = false;
	}

	return $link_detail;
}


function parse_html_comments($subject) {
	// Comments List

	preg_match_all('/<div class="V2-comment-item clearfix" comment-id="(.*?)">            <div class="V2-comment-lc">/', $subject, $comm_id);

	preg_match_all('/class="feed-photo"><img onerror="this.src=(.*?);" alt="(.*?)" src="(.*?)"><\/a>/', $subject, $userinfo);

	preg_match_all('/<a href="(.*?)" class="date">(.*?)<\/a>/', $subject, $time);

	preg_match_all('/<div class="V2-comment-body">                                (.*?)<\/div>/', $subject, $content);

	preg_match_all('/<i class="member-medal" color="(.*?)" border title="(.*?)"><\/i>/', $subject, $medal);

	preg_match_all('/<span class="counter(.*?)<\/span>    <i class="fa fa-thumbs-up/', $subject, $vote);

	preg_match_all('/<ul class="best-comments"><li><div class="V2-comment-item(.*?)<\/div><\/li><\/ul>/', $subject, $best_comments);
	if ($best_comments[0]) {
		preg_match_all('/<div class="V2-comment-item clearfix" comment-id="(.*?)">            <div class="V2-comment-lc">/', $best_comments[0][0], $top_comments);
		$top_comments = ($top_comments ? count($top_comments[1]) : 0);
	} else {
		$top_comments = 0;
	}

	$comments = array();
	for ($i=0; $i < count($comm_id[1]); $i++) {
		$comment = array(
			'id' => $comm_id[1][$i],
			'username' => $userinfo[2][$i],
			'avatar' => $userinfo[3][$i],
			'time' => $time[2][$i],
			'content' => $content[1][$i],
			'color' => $medal[1][$i],
			'medal' => $medal[2][$i],
			'vote' => substr($vote[1][$i], -1, 1)
		);
	$comment = (object) $comment;
	array_push($comments, $comment);
	}

	$result = array('comments' => $comments, 'number' => count($comm_id[1]), 'top_comments' => $top_comments);

	if ($comments) {
		$result = array('comments' => $comments, 'number' => count($comm_id[1]), 'top_comments' => $top_comments);
	} else {
		$result = array('comments' => false, 'number' => 0, 'top_comments' => 0);
	}

	return $result;
}

if ($type == 'media') {
	$detail = parse_media_detail($subject);
	$comments = parse_html_comments($subject);
	$users_voted = parse_media_voted($subject);
	$details = array_merge($detail, $comments, $users_voted, array('status' => true));
	$details = json_encode($details);
} else if ($type == 'quicknote') {
	$detail = parse_link_detail($subject);
	$comments = parse_html_comments($subject);
	$users_voted = parse_users_voted($subject);
	$details = array_merge($detail, $comments, $users_voted, array('status' => true));
	$details = json_encode($details);
} else if ($type == 'video') {
	$detail = parse_link_detail($subject);
	$comments = parse_html_comments($subject);
	$users_voted = parse_users_voted($subject);
	$details = array_merge($detail, $comments, $users_voted, array('status' => true));
	$details = json_encode($details);
} else {
	$detail = parse_link_detail($subject);
	$comments = parse_html_comments($subject);
	$users_voted = parse_users_voted($subject);
	$details = array_merge($detail, $comments, $users_voted, array('status' => true));
	$details = json_encode($details);
}

print_r($details);


/*-----------------------------
	LOGOUT
-----------------------------
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
*/

	


?>