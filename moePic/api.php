<?php
set_time_limit(0);
//error_reporting(-1);
//var_dump($s_url);
$GLOBALS['r18'] = 0;
$GLOBALS['safe'] = 0;
$GLOBALS['try'] = 0;
$GLOBALS['res'] = [];
$GLOBALS['hasMore'] = true;
$GLOBALS['errorMsg'] = '';

// http://127.0.0.1/masonry/new/api.php?host=yande&type=post&page=1&limit=20
// http://127.0.0.1/masonry/new/api.php?host=yande&type=tag&page=1&name=
// if($_GET['test'] == ''){
	// echo file_get_contents('./test/yande_test1.json');
	// exit();
	// $_GET['file'] = './test/minitokyo.html';
	// $_GET['host'] = 'minitokyo';
	// $_GET['limit'] = 30;
	// $_GET['page'] = 1;
//}
initSite();
$s_url = initUrl();
if($s_url != ''){
	Main($s_url);
}

function initUrl(){
	switch ($_GET['type']) {
		case 'tag':
			$s_url = $_GET['tag'];
			break;

		default:
			$s_url = $_GET['post'];
	}
	if(substr($s_url, 0, 1) == '/'){
		$s_url = $_GET['home'] . $s_url;
	}
	$s_url = str_replace('{page}', $_GET['page'], $s_url);
	// $_GET['limit']
	$s_url = str_replace('{limit}', 60, $s_url);
	$s_url = str_replace('{type}', $_GET['type'], $s_url);
	$s_url = str_replace('{category}', $_GET['category'], $s_url);
	$s_url = str_replace('{tags}', $_GET['tags'], $s_url);
	$s_url = str_replace('{name}', $_GET['name'], $s_url);
	$s_url = str_replace('{id}', $_GET['id'], $s_url);
	$s_url = str_replace('{cid}', $_GET['cid'], $s_url);
	return $s_url;
}

function retry($code){
	if($code !== 200){
		$GLOBALS['network_try']++;
	}else{
		$GLOBALS['network_try'] = 0;
	}
	$GLOBALS['try']++;
	if($GLOBALS['try'] > 20){
		$GLOBALS['errorMsg'] = '加载次数过多';
	}else
	if($GLOBALS['network_try'] > 3){
		$GLOBALS['errorMsg'] = '响应超时';
	}else{
		return;
	}
	echorRes();
}
function Rand_IP(){
	srand(microtime(true));
    return round(rand(600000, 2550000) / 10000).".".round(rand(600000, 2550000) / 10000).".".round(rand(600000, 2550000) / 10000).".".round(rand(600000, 2550000) / 10000);
}

function Main($s_url){
	$code = 200;
	if($_GET['file'] != ''){
		$content = file_get_contents($_GET['file']);
	}else{
		$ch = curl_init();
		$options =  array(
			CURLOPT_HEADER => false,
			CURLOPT_URL => $s_url,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_FOLLOWLOCATION => true,
			CURLOPT_REFERER => 'https://www.google.com/',
			CURLOPT_TIMEOUT => 30,
			CURLOPT_PROXYAUTH => CURLAUTH_BASIC,
        	CURLOPT_HTTPHEADER => array('X-FORWARDED-FOR:'.Rand_IP(), 'CLIENT-IP:'.Rand_IP()),
			CURLOPT_SSL_VERIFYPEER => false,
			CURLOPT_SSL_VERIFYHOST => false,
			CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36 Edg/81.0.416.58'
		);
		if($_GET['proxy']){
			$options[CURLOPT_PROXY] = "127.0.0.1";
			$options[CURLOPT_PROXYPORT] = 1080;
		}
		curl_setopt_array($ch, $options);
		$content = curl_exec($ch);

		$code = curl_getinfo($ch,CURLINFO_HTTP_CODE);
		curl_close($ch);
		if($_GET['save']){
			file_put_contents('./test/'.date('Y_m_d H_i_s').'.html', $content);
		}
	}
	if($content != ''){
		if($_GET['parse'] == 'xml'){ 
			$json = simplexml_load_string($content);
			$json = json_encode($json);
			$json = json_decode($json, true);
			$_GET['func']($json);
		}else
		if($_GET['parse'] == 'html'){
			include_once 'simple_html_dom.php';
			$html = str_get_html($content);
			if(count($html) > 0){
				$_GET['func']($html);
			}
		}else{
			$json = json_decode($content, true);
			$_GET['func']($json);
		}
	}
	var_dump($s_url, $content);
	retry($code);
}

function bilibili($json){
	$a = [];
	$r = [];
	$json = $json['data']['items'];
	foreach ($json as $key => $value) {
		$a['id'] = $value['item']['doc_id'];
		$a['title'] = $value['item']['title'];
		$a['created_at'] = $value['item']['upload_time'];
		$a['uploader_id'] = $value['user']['uid'];
		$a['author'] = $value['user']['name'];

		foreach($value['item']['pictures'] as $k => $v) {
			$a['width'] = $v['img_width'];
			$a['height'] = $v['img_height'];
			$a['sample_url'] = $v['img_src'];
			$a['file_size'] = $v['img_size'];
			$a['preview_url'] = $v['img_src'].'@150w_108h_1e.webp';
			$a['preview_height'] = 108;
			$a['preview_width'] = 150;
			$r[] = $a;
		}
	}
	echoJson($r);
}

function host1($json){
	if(isset($json['post'])){
		$json = $json['post'];
	}
	echoJson($json);
}

function kawaiinyan($json){
	$a = [];
	$r = [];
	$json = $json['images'];
	foreach ($json as $key => $value) {
		$id_1 = substr($value['id'], 0, 2);
		$id_2 = substr($value['id'], 2, 2);
		$id_3 = substr($value['id'], 4, strlen($value['id'])-4);
		if(isset($value['adv_link'])){
			$a['source'] = $value['adv_link'];
		}
		$a['sample_url'] = 'https://0.s.kawaiinyan.com/i/'.$id_1.'/'.$id_2.'/'.$id_3.'/big.jpg';
		$a['preview_url'] = 'https://0.s.kawaiinyan.com/i/'.$id_1.'/'.$id_2.'/'.$id_3.'/small.jpg';
		$a['preview_height'] = 125;
		$a['preview_width'] = 200;
		$a['tags'] = $value['tags'];
		$r[] = $a;
	}
	echoJson($r);
}


function worldcosplay($json){
	$a = [];
	$r = [];
	$json = $json['list'];
	foreach ($json as $key => $value) {
		$a['id'] = $value['photo']['id'];
		$a['title'] = $value['character']['name'];
		$a['created_at'] = $value['photo']['created_at'];

		$a['uploader_id'] = $value['member']['id'];
		$a['author'] = $value['member']['nickname'];
		$a['icon'] = $value['member']['icon_url'];
		$a['form'] = $value['member']['national_flag_url'];

		$a['sample_url'] = $value['photo']['large_url'];
		$a['preview_url'] = $value['photo']['thumbnail_url_display'];
		$a['preview_height'] = $value['photo']['thumbnail_width'];
		$a['preview_width'] = $value['photo']['thumbnail_height'];
		$r[] = $a;
	}
	echoJson($r);
}

function sankakucomplex($html){
	// https://chan.sankakucomplex.com/?page=2
	$a = [];
	$r = [];
	foreach ($html->find('span.thumb') as $v) {
		if($v->parent()->class != 'popular-preview-post'){
			$a = [];
			$img = $v->find('img', 0);
			$a['preview_url'] = 'https:'.$img->src;
			$a['tags'] = getString_left($img->title, ' Rating:');
			$a_1 = str_replace($a['tags'], '', $img->title);
			$a['rating'] = strtolower(substr(getStringByStartAndEnd($a_1, 'Rating:', ' '), 0, 1));
			$a['score'] = getStringByStartAndEnd($a_1, 'Score:', ' ');
			$a['width'] = getStringByStartAndEnd($a_1, 'Size:', 'x');
			$a['height'] = getStringByStartAndEnd($a_1, $a['width'].'x', ' ');
			$a['user'] = getString_right($a_1, 'User:');
			$a['preview_width'] = $img->width;
			$a['preview_height'] = $img->height;
			$r[] = $a;
			//https://cs.sankakucomplex.com/data/preview/5a/c2/5ac2bda12a29f3d4138c2ff485c549c1.jpg
			// <img class="preview" src="//cs.sankakucomplex.com/data/preview/53/32/5332688d8fbb87591e7cf3be8d304b98.jpg" title="girls_und_panzer anchovy high_resolution female long_hair megane pixiv_id_493018 solo Rating:Safe Score:0.0 Size:1280x1680 User:reichan" alt="" width="114" height="150">
		}
	}
	echoJson($r);
}

function anime_picture($html){
	$a = [];
	$r = [];
	$o = ['common_preview_img_'];
	$i = 0;
	$p = [];
	switch($_GET['type']){
		case 'post':
			$p[] = '.img_cp';
			break;

		case 'girls':
			$p[] = '.img_sp';
			break;

		case 'rank':
			$p[] = '.post_content.index_page';
			$p[] = '.img_sp';
				break;
	}
	foreach ($html->find($p[0]) as $k => $v) {
		$type = '';
		$imgs = [];
		if(count($p) > 1){
			if($i === 0){
				$type = 'new';
			}else
			if($i === 1){
				$type = 'day';
				$o[0] = 'most_rating_day_img_';
			}else
			if($i === 2){
				$type = 'week';
				$o[0] = 'most_rating_week_img_';
			}else
			if($i === 3){
				$p[1] = 'img[alt="avatar"]';
				$type = 'user';
			}else{
				continue;
			}
			$imgs = $v->find($p[1]);
		}else{
			$imgs = [$v];
		}
		if($type != '' && !isset($r[$type])){
			$r[$type] = [];
		}
		foreach ($imgs as $k => $v) {
			if($i === 3){
				$a['id'] = getStringByStartAndEndFromEnd($v->src, '.png', '/');
			}else{
				$a['id'] = str_replace($o[0], '',$v->id);
			}
			$a['preview_url'] = 'https:'.$v->src;

			if($type == ''){
				$r[] = $a;
			}else{
				$r[$type][] = $a;
			}
		}
		$i++;
	}
	echoJson($r);
	
}

function lolibooru($html){
	foreach(getStringByStartAndEnd_array($html, 'Post.register(', '})') as $v){
		$json = json_decode($v.'}', true);
		$r[] = $json;
	}
	echoJson($r);
}

function zerochan($html){
	// p -> page 
	// s -> id | fav
	// https://www.zerochan.net/?d=0 -> All
	// https://www.zerochan.net/?d=1 -> Large and better
	// https://www.zerochan.net/?d=2 ->  Only very largeSort

	$html = getString_replaceRight(getStringByStartAndEnd($html, '"itemListElement": ', '</script>'), '}');
	$json = json_decode($html, true);
	foreach($json as $v) {
		$a['preview_url'] = $v['thumbnailUrl'];
		$a['sample_url'] = $v['url'];
		$a['title'] = $v['name'];
		$r[] = $a;
	}
	echoJson($r);
}

function shuushuu($html){
	foreach ($html->find('.image_thread') as $v) {
		$a = [];
		$a['id'] = $v->id;
		$img = $v->find('img', 0);
		$a['preview_url'] = 'https://e-shuushuu.net'.$img->src;
		$a['sample_url'] = 'https://e-shuushuu.net'.$v->find('.thumb_image', 0)->href;

		$meta = $v->find('.meta', 0);
		$a['author'] = $meta->find('dd', 0)->children(0)->title;
		$a['created_at'] =  $meta->find('dd', 1)->plaintext;
		$a['size'] =  trim($meta->find('dd', 2)->plaintext);
		$s = $v->find('dd', 3)->plaintext;
		$a['width'] = getString_left($s, 'x');
		$a['height'] = getStringByStartAndEnd($s, $a['width'].'x', ' ');

		$i = 4;
		foreach (['tags', 'char', 'artist'] as $n) {
			$a[$n] = [];
			$d1 = $meta->find('dd', $i);
			if(count($d1) > 0){
				foreach($d1->find('.tag') as $v1){
					if(is_object($v1)){
						$d = $v1->find('a', 0);
						$a[$n][getString_right($d->href, '/')] = $d->plaintext;
					}
				}
			}
			$i++;
		}
		$r[] = $a;

	}
	echoJson($r);
}


function minitokyo($html){
	// t : 1 -> 1week,2 -> 1 month,3 -> 3months, 4-> 1year, 0 -> all
	// http://gallery.minitokyo.net/wallpapers?order=id
	// http://gallery.minitokyo.net/wallpapers?order=favorites
	// http://gallery.minitokyo.net/wallpapers?order=id#
	// http://gallery.minitokyo.net/mobile
	$a = [];
	switch($_GET['type']){
		case 'mobile':
			foreach ($html->find('img') as $v) {
			$a['id'] = getStringByStartAndEndFromEnd($v->src, '.', '/');
			if($a['id'] != null){
				$a['preview_url'] = $v->src;
				$a['sample_url'] = str_replace('view', 'downloads', $v->src);
				$a['width'] =getString_left($v->title, 'x');
				$a['height'] =getString_right($v->title, 'x');
				$a['title'] = $v->alt;
				$r[] = $a;
			}
		}
		break;

		case 'post':
			foreach ($html->find('.scans li') as $v) {
				$a = [];
				$a['id'] = getString_right($v->find('a', 0)->href, '/');
				if($a['id'] != null){
					$img = $v->find('img', 0);
					$a['preview_url'] = $img->src;
					$a['sample_url'] = str_replace('view', 'downloads', $img->src);
					$a['preview_width'] =getStringByStartAndEnd($img->style, 'width: ', 'px');
					$a['preview_height'] =getStringByStartAndEnd($img->style, 'height: ', 'px');
					$a['title'] = $v->find('a', 1)->plaintext;
					$a['author'] = $v->find('a', 3)->plaintext;
					$s = getStringByStartAndEndFromEnd($v->lastChild()->plaintext, ',', ' ');
					$a['width'] = trim(getString_left($s, 'x'));
					$a['height'] = getString_right($s, 'x');
					$a['favorite'] = getStringByStartAndEnd($v->lastChild()->plaintext, ', ', ' ');
					$r[] = $a;
				}
			}
			break;
	}
	// var_dump($r);
	echoJson($r);
}
function e926($html){
	$a = [];
	foreach ($html->find('#posts-container article') as $v) {
		$a['id'] = $v->{'data-id'};
		$a['tags'] = $v->{'data-tags'};
		$a['rating'] = $v->{'data-rating'};
		$a['uploader_id'] = $v->{'data-uploader-id'};
		$a['author'] = $v->{'data-uploader'};
		//$v->{'data-file-ext'};
		$a['sample_url'] = $v->{'data-file-url'};
		$a['large_url'] = $v->{'data-large-file-url'};
		$a['preview_url'] = $v->{'data-preview-file-url'};
		$r[] = $a;

	}
	echoJson($r);
}

function hypnohub($html){
	$a = [];
	foreach ($html->find('#post-list-posts li') as $v) {
		$img = $v->find('img', 0);
		$a['id'] = str_replace('p', '', $v->id);
		$a['uploader_id'] = getString_right($v->class, '-');
		$a['preview_url'] = $img->src;
		$a['sample_url'] = $v->find('a', 1)->href;
		$a['rating'] = strtolower(substr(getStringByStartAndEnd($img->title, 'Rating: ', ' '), 0, 1));;
		$a['score'] = getStringByStartAndEnd($img->title, 'Score: ', ' ');
		$a['tags'] = getStringByStartAndEnd($img->title, 'Tags: ', ' User: ');
		$a['author'] = getString_right($img->title, 'User: ');
		$a['preview_width'] = $img->width;
		$a['preview_height'] = $img->height;
		$r[] = $a;
	}
	echoJson($r);
}

function rule34($html){
	$a = [];
	foreach ($html->find('.shm-thumb.thumb') as $v) {
		$img = $v->find('img', 0);
		$a['id'] = $v->{'data-post-id'};
		$a['preview_url'] = $img->src;
		$m = explode(' // ', $img->title);
		$md5 = getStringByStartAndEnd($img->src, '_thumbs/', '/');

		$a['author'] = $m[0];
		$a['width'] = getString_left($m[1], 'x');
		$a['height'] = getString_right($m[1], 'x');
		$a['size'] = $m[2];
		$a['ext'] = $m[3];
		$a['tags'] = $v->{'data-tags'};
		$a['preview_width'] = $img->width;
		$a['preview_height'] = $img->height;
		$a['sample_url'] = 'https://iris.paheal.net/_images/'.$md5.'/'.$a['id'].' '.$a['tags'].'.'.$a['ext'];
		$r[] = $a;
	}
	echoJson($r);
}

function getStringByStartAndEnd_array($s_text, $s_start, $s_end, $i_start = 0){
	$res = [];
	while(true){
		if(($i_start = strpos($s_text, $s_start, $i_start)) !== false){
			if(($i_end = strpos($s_text, $s_end, $i_start + strlen($s_start))) !== false){
				$res[] = substr($s_text, $i_start + strlen($s_start), $i_end - $i_start - strlen($s_start));
				$i_start = $i_end + strlen($s_end);
				continue;
			}
		}
		break;
	}
	return $res;
}

function getString_left($s_text, $s_search){
	if(($i_start = strpos($s_text, $s_search, $i_start)) !== false){
		return substr($s_text, 0, $i_start);
	}
}


function getString_right($s_text, $s_search){
	$i_end = getStringSearchEnd($s_text, $s_search);
	if($i_end != -1){
		$i_end += strlen($s_search);
		return substr($s_text, $i_end, strlen($s_text) - $i_end);
	}
}

function getString_replaceRight($s_text, $s_search){
	$i_end = getStringSearchEnd($s_text, $s_search);
	if($i_end != -1){
		$i_end += strlen($s_search);
		return substr($s_text, 0, $i_end - strlen($s_search));
	}
}


function getStringByStartAndEnd($s_text, $s_start, $s_end, $i_start = 0, $b_end = false){
	if(($i_start = strpos($s_text, $s_start, $i_start)) !== false){
		if(($i_end = strpos($s_text, $s_end, $i_start + strlen($s_start))) === false){
			if($b_end){
				$i_end = strlen($s_text);
			}else{
				return;
			}
		}
		return substr($s_text, $i_start + strlen($s_start), $i_end - $i_start - strlen($s_start));
	}
}

function getStringSearchEnd($s_text, $s_search, $max = 0){
	$i_last = -1;
	$i_start = 0;
	while(true){
		$i_start = strpos($s_text, $s_search, $i_start);
		if($i_start === false) break;
		if($max > 0 && $i_start > $max){
			return $i_last;
		}
		$i_last = $i_start;
		$i_start = $i_start + strlen($s_search);
	}
	return $i_last;
}

function getStringByStartAndEndFromEnd($s_text, $s_end, $s_start){
	$i_end = getStringSearchEnd($s_text, $s_end);
	if($i_end != -1){
		$i_start = getStringSearchEnd($s_text, $s_start, $i_end);
		if($i_start != -1){
			$i_start += strlen($s_start); 
			return substr($s_text,$i_start, $i_end-$i_start);
		}
	}
}

function echoJson($json){
	if(is_array($json) || is_object($json)){
		foreach ($json as $k => $v){
			if($_GET['type'] == 'post'){ // 如果是时间线的话
				$GLOBALS['lastId'] = $v['id'];
				if($_GET['lastId'] > 0 && $v['id'] <= $_GET['lastId']){
					continue;
				}
			}
			if(isset($v['@attributes'])){
				$v = $v['@attributes'];
			}
			if(isset($v['tag_string'])){
				$v['tags'] = $v['tag_string'];
				unset($v['tag_string']);
			}
			if(isset($v['preview_file_url'])){
				$v['preview_url'] = $v['preview_file_url'];
				unset($v['preview_file_url']);
			}
			if($_GET['r18'] == false && isset($v['rating']) && $v['rating'] != 's'){
				$GLOBALS['r18']++;
			}else{
				$GLOBALS['safe']++;
			}
			//$v['host'] = $_GET['host'];
			$GLOBALS['res'][] = $v;
			if($GLOBALS['safe'] >= $_GET['limit']){
				echorRes();
				exit();
			}
		}
		//if(count($GLOBALS['res']) > $_GET['limit']){ // 考虑数据太多可能会对客户端造成的问题
		if($_GET['loadAll'] != ''){ // 一次性全部加载
			nextPage();
		}else{
			echorRes();
		}
	}
}

function echorRes(){
	echo json_encode([
		'limit' => $_GET['limit'],
		'lastId' => $GLOBALS['lastId'],
		'unload' => $_GET['limit'] - $GLOBALS['safe'],
		'r18' => $GLOBALS['r18'],
		'hasMore' => $GLOBALS['hasMore'],
		'errorMsg' => $GLOBALS['errorMsg'],
		'safe' => $GLOBALS['safe'],
		'page' => $_GET['page'],
		'res' => $GLOBALS['res']
	]);
	exit();
}

function nextPage(){
	$_GET['page']++;
	Main(initUrl());
}

function initSite(){
	$_GET['home'] = '';
	$_GET['func'] = '';
	$_GET['parse'] = 'json';
	$host = $_GET['host'];
	switch($host){
		case 'yande':
			$_GET['func'] = host1;
			$_GET['home'] = 'https://yande.re';
			$_GET['post'] = '/post.json?page={page}&limit={limit}&tags={tags}';
			$_GET['tag'] = '/tag.json?limit={limit}&order=count&name={name}';
			$_GET['proxy'] = true;
			break;

		case 'konachan':
			$_GET['func'] = host1;
			$_GET['home'] = 'https://konachan.net';
			$_GET['post'] = '/post.json?page={page}&limit={limit}&tags={tags}';
			$_GET['tag'] = '/tag.json?limit={limit}&order=count&name={name}';
			break;

		case 'sakugabooru':
			$host = 1;
			$_GET['func'] = host1;
			$_GET['home'] = 'https://sakugabooru.com';
			$_GET['post'] = '/post.json?page={page}&limit={limit}&tags={tags}';
			$_GET['tag'] = '/tag.json?limit={limit}&order=count&name={name}';
			break;

		case 'danbooru':
			$_GET['func'] = host1;
			$_GET['home'] = 'https://danbooru.donmai.us';
			$_GET['post'] = '/posts.json?page={page}&limit={limit}&tags={tags}';
			$_GET['tag'] = '/tags/autocomplete.json?search%5Bname_matches%5D={name}';
			break;

		case 'behoimi':
			$_GET['func'] = host1;
			$_GET['home'] = 'http://behoimi.org';
			$_GET['post'] = '/post/index.json?page={page}&limit={limit}&tags={tags}';
			$_GET['tag'] = '/tag/index.xml?limit={limit}&order=count&name={name}';
			break;

		case 'safebooru':
			$_GET['func'] = host1;
			$_GET['parse'] = 'xml';
			$_GET['home'] = 'https://safebooru.org';
			$_GET['post'] = '/index.php?page=dapi&s=post&q=index&limit={limit}&pid={page}&tags={tags}&cid={cid}&id={id}';
			$_GET['tag'] = '/index.php?page=dapi&s=tag&q=index&order=name&limit={limit}&name={name}';
			break;

		case 'gelbooru':
			$_GET['func'] = host1;
			$_GET['parse'] = 'xml';
			$_GET['home'] = 'https://gelbooru.com';
			$_GET['post'] = '/index.php?page=dapi&s=post&q=index&pid={page}&limit={limit}&tags={tags}';
			$_GET['tag'] = '/index.php?page=dapi&s=tag&q=index&order=name&limit={limit}&name={name}';
			break;

		case 'worldcosplay':
			$_GET['home'] = 'https://worldcosplay.net';
			$_GET['post'] = '/api/photo/list?page={page}&limit={limit}&sort=created_at&direction=descend';
			break;

		case 'kawaiinyan':
			$_GET['home'] = 'https://kawaiinyan.com';
			$_GET['post'] = '/new.json?tags={tags}&size=&orient=&page={page}';
			break;

		case 'bilibili':
			if($_GET['type'] == 'post'){
				$_GET['type'] = 'new'; // hot
			}
			// all cos sifu
			if(!isset($_GET['category'])){
				$_GET['category'] = 'all';
			}
			$_GET['home'] = 'https://h.bilibili.com/d';
			$_GET['post'] = 'https://api.vc.bilibili.com/link_draw/v2/Doc/list?category={category}&type={type}&page_num={page}&page_size={limit}';
			break;

		case 'anime_picture':
			$url = 'view_posts';
			if($_GET['type'] == 'girls'){
				$url = 'anime_girls';
			}
			$_GET['parse'] = 'html';
			$_GET['home'] = 'https://anime-pictures.net';
			// anime_girls || view_posts
			$_GET['post'] = '/pictures/'.$url.'/{page}?lang=en';
			break;

		case 'sankakucomplex':
			$_GET['parse'] = 'html';
			$_GET['home'] = 'https://chan.sankakucomplex.com';
			$_GET['post'] = '/?page={page}';
			break;

		case 'lolibooru':
			$_GET['parse'] = 'html';
			$_GET['home'] = 'https://lolibooru.moe';
			$_GET['post'] = '/post?page={page}';
			break;

		case 'zerochan':
			$_GET['parse'] = 'html';
			$_GET['home'] = 'https://www.zerochan.net';
			$_GET['post'] = '/?p={page}';
			break;

		case 'shuushuu':
			$_GET['parse'] = 'html';
			$_GET['home'] = 'https://e-shuushuu.net';
			$_GET['post'] = '/?page={page}';
			//https://e-shuushuu.net/httpreq.php?mode=show_all_meta&image_id=1023543&referer= 
			break;

		case 'minitokyo':
			$_GET['parse'] = 'html';
			$_GET['home'] = 'http://gallery.minitokyo.net';
			$_GET['post'] = '/wallpapers?order=id&display=thumbnails&page={page}';

			break;

		case 'e926':
		case 'e621':
			$_GET['parse'] = 'html';
			$_GET['home'] = 'https://'.$_GET['host'].'.net';
			$_GET['post'] = '/posts?page={page}';
			break;

		case 'hypnohub':
			$_GET['parse'] = 'html';
			$_GET['home'] = 'https://hypnohub.net';
			$_GET['post'] = '/post?page={page}';
			break;

		case 'rule34':
			$_GET['parse'] = 'html';
			$_GET['home'] = 'https://rule34.paheal.net';
			$_GET['post'] = '/post/list/{page}';
			break;

		default:
			exit();
	}
	if($_GET['func'] == null) $_GET['func'] = $_GET['host'];
	if(!isset($_GET['lastId'])) $_GET['lastId'] = 0;
}

?>