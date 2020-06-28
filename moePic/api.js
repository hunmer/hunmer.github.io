var $GLOBALS = {};
var $_GET = {};
$GLOBALS['r18'] = 0;
$GLOBALS['safe'] = 0;
$GLOBALS['try'] = 0;
$GLOBALS['res'] = [];
$GLOBALS['hasMore'] = true;
$GLOBALS['errorMsg'] = '';

			// anime_picture sankakucomplex lolibooru zerochan shuushuu minitokyo e926 e621 hypnohub rule34

$_GET['type'] = 'post';
$_GET['host'] = 'rule34';
$_GET['file'] = 'https://yande.re/post.json';

initSite();
$s_url = initUrl();
if($s_url != ''){
	Main($s_url);
}

function initUrl(){
	if($_GET['file'] != undefined) return $_GET['file'];
	switch ($_GET['type']) {
		case 'tag':
			$s_url = $_GET['tag'];
			break;

		default:
			$s_url = $_GET['post'];
	}
	if(s_url.substr(0, 1) == '/'){
		$s_url = $_GET['home']+$s_url;
	}
	$s_url = $s_url.replace('{page}', $_GET['page']);
	$s_url = $s_url.replace('{limit}', 60);
	$s_url = $s_url.replace('{type}', $_GET['type']);
	$s_url = $s_url.replace('{category}', $_GET['category']);
	$s_url = $s_url.replace('{tags}', $_GET['tags']);
	$s_url = $s_url.replace('{name}', $_GET['name']);
	$s_url = $s_url.replace('{id}', $_GET['id']);
	$s_url = $s_url.replace('{cid}', $_GET['cid']);
	return $s_url;
}

function retry($code){
	return;
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

function Main($s_url){
	$code = 200;
	var $content = '';
	$.ajax({
		url: $s_url,
		type: 'GET',
		dataType: $_GET['parse'],
	})
	.done(function(data) {
		console.log(data);
		runFunction($_GET['func'], data);
		//console.log(data);
	})
	.fail(function() {
		console.log("error");
	})
	.always(function() {
		console.log("complete");
		retry($code);
	});
}

function runFunction($func, $content){
	if($_GET['parse'] == 'html'){
		$content = $($($.parseHTML($content, false)));
	}else
	if($_GET['parse'] == 'xml'){

	}
	switch($func){
		case 'host1':
			host1($content);
			break;

		case 'minitokyo':
			minitokyo($content);
			break;
	}
}

function bilibili($json){
	var $a = [];
	var $r = [];
	$json = $json['data']['items'];
	for(var $value of $json) {
		$a['id'] = $value['item']['doc_id'];
		$a['title'] = $value['item']['title'];
		$a['created_at'] = $value['item']['upload_time'];
		$a['uploader_id'] = $value['user']['uid'];
		$a['author'] = $value['user']['name'];

		for(var $v of $value['item']['pictures']) {
			$a['width'] = $v['img_width'];
			$a['height'] = $v['img_height'];
			$a['sample_url'] = $v['img_src'];
			$a['file_size'] = $v['img_size'];
			$a['preview_url'] = $v['img_src']+'@150w_108h_1e.webp';
			$a['preview_height'] = 108;
			$a['preview_width'] = 150;
			$r.push($a);
		}
	}
	echoJson($r);
}

function host1($json){
	if($json['post'] != undefined){
		$json = $json['post'];
	}
	echoJson($json);
}

function kawaiinyan($json){
	var $a = [];
	var $r = [];
	$json = $json['images'];
	for (var $value of $json) {
		$id_1 = $value['id'].substr(0, 2);
		$id_2 = $value['id'].substr(2, 2);
		$id_3 = $value['id'].substr(4, strlen($value['id'])-4);
		if($value['adv_link'] != undefined){
			$a['source'] = $value['adv_link'];
		}
		$a['sample_url'] = 'https://0.s.kawaiinyan.com/i/'+$id_1+'/'+$id_2+'/'+$id_3+'/big.jpg';
		$a['preview_url'] = 'https://0.s.kawaiinyan.com/i/'+$id_1+'/'+$id_2+'/'+$id_3+'/small.jpg';
		$a['preview_height'] = 125;
		$a['preview_width'] = 200;
		$a['tags'] = $value['tags'];
		$r.push($a);
	}
	echoJson($r);
}

function worldcosplay($json){
	var $a = [];
	var $r = [];
	$json = $json['list'];
	for (var $value of $json) {
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
		$r.push($a);
	}
	echoJson($r);
}

function sankakucomplex($html){
	// https://chan.sankakucomplex.com/?page=2
	var $a = [];
	var $r = [];
	for (var v of $html.find('span.thumb')) {
		if($v.parent().attr('className') != 'popular-preview-post'){
			$a = [];
			$img = $v.find('img')[0];
			$a['preview_url'] = 'https:'.$img.src;
			$a['tags'] = getString_left($img.title, ' Rating:');
			$a_1 = str_replace($a['tags'], '', $img.title);
			$a['rating'] = getStringByStartAndEnd($a_1, 'Rating:', ' ').substr(0, 1).toLowerCase();
			$a['score'] = getStringByStartAndEnd($a_1, 'Score:', ' ');
			$a['width'] = getStringByStartAndEnd($a_1, 'Size:', 'x');
			$a['height'] = getStringByStartAndEnd($a_1, $a['width']+'x', ' ');
			$a['user'] = getString_right($a_1, 'User:');
			$a['preview_width'] = $img.width;
			$a['preview_height'] = $img.height;
			$r.push($a);
			//https://cs.sankakucomplex.com/data/preview/5a/c2/5ac2bda12a29f3d4138c2ff485c549c1.jpg
			// <img class="preview" src="//cs.sankakucomplex.com/data/preview/53/32/5332688d8fbb87591e7cf3be8d304b98.jpg" title="girls_und_panzer anchovy high_resolution female long_hair megane pixiv_id_493018 solo Rating:Safe Score:0.0 Size:1280x1680 User:reichan" alt="" width="114" height="150">
		}
	}
	echoJson($r);
}

function anime_picture($html){
	var $a = [];
	var $r = [];
	var $o = ['common_preview_img_'];
	var $i = 0;
	var $p = [];
	switch($_GET['type']){
		case 'post':
			$p.push('.img_cp');
			break;

		case 'girls':
			$p.push('.img_sp');
			break;

		case 'rank':
			$p.push('.post_content.index_page');
			$p.push('.img_sp');
				break;
	}
	for (var v of $html.find($p[0])) {
		var $type = '';
		var $imgs = [];
		if($p.length > 1){
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
			$imgs = $v.find($p[1]);
		}else{
			$imgs = [$v];
		}
		if($type != '' && $r[$type] == undefined){
			$r[$type] = [];
		}
		for (var v of $imgs) {
			if($i === 3){
				$a['id'] = getStringByStartAndEndFromEnd($v.src, '.png', '/');
			}else{
				$a['id'] = $o[0].replace('',$v.id);
			}
			$a['preview_url'] = 'https:'+$v.src;

			if($type == ''){
				$r.push($a);
			}else{
				$r[$type].push($a);
			}
		}
		$i++;
	}
	echoJson($r);
	
}

function lolibooru($html){
	for(var v of getStringByStartAndEnd_array($html, 'Post.register(', '})')){
		$json = JSON.parse($v+'}');
		$r.push($json);
	}
	echoJson($r);
}

function zerochan($html){
	// p . page 
	// s . id | fav
	// https://www.zerochan.net/?d=0 . All
	// https://www.zerochan.net/?d=1 . Large and better
	// https://www.zerochan.net/?d=2 .  Only very largeSort

	var $html = getString_replaceRight(getStringByStartAndEnd($html, '"itemListElement": ', '</script>'), '}');
	$json = JSON.parse($html);
	for(var $v of $json) {
		$a['preview_url'] = $v['thumbnailUrl'];
		$a['sample_url'] = $v['url'];
		$a['title'] = $v['name'];
		$r.push($a);
	}
	echoJson($r);
}

function shuushuu($html){
	var $a = [];
	for (var $v of $html.find('.image_thread')) {
		$a['id'] = $v.id;
		$img = $v.find('img')[0];
		$a['preview_url'] = 'https://e-shuushuu.net'.$img.src;
		$a['sample_url'] = 'https://e-shuushuu.net'.$v.find('.thumb_image').href;

		$meta = $v.find('.meta');
		$a['author'] = $meta.find('dd').children(0).title;
		$a['created_at'] =  $meta.find('dd')[1].html();
		$a['size'] =  trim($meta.find('dd')[2].html());
		$s = $v.find('dd')[3].html();
		$a['width'] = getString_left($s, 'x');
		$a['height'] = getStringByStartAndEnd($s, $a['width']+'x', ' ');

		var $i = 4;
		var $d1 = $meta.find('dd');
		for (var $n of ['tags', 'char', 'artist']) {
			$a[$n] = [];
			if($d1.length > $i){
				var $v1 = $d1[$i].find('.tag');
				if($v1.length > 0){
					$d = $v1.find('a')[0];
					$a[$n][getString_right($d.href, '/')] = $d.html();
				}
			}
			$i++;
		}
		$r.push($a);

	}
	echoJson($r);
}


function minitokyo($html){
	// t : 1 . 1week,2 . 1 month,3 . 3months, 4. 1year, 0 . all
	// http://gallery.minitokyo.net/wallpapers?order=id
	// http://gallery.minitokyo.net/wallpapers?order=favorites
	// http://gallery.minitokyo.net/wallpapers?order=id#
	// http://gallery.minitokyo.net/mobile
	var $a = [];
	var $r = [];
	switch($_GET['type']){
		case 'mobile':
			for (var $v of $html.find('img')) {
			$a['id'] = getStringByStartAndEndFromEnd($v.src, '.', '/');
			if($a['id'] != null){
				$a['preview_url'] = $v.src;
				$a['sample_url'] = str_replace('view', 'downloads', $v.src);
				$a['width'] =getString_left($v.title, 'x');
				$a['height'] =getString_right($v.title, 'x');
				$a['title'] = $v.alt;
				$r.push($a);
			}
		}
		break;

		case 'post':
			$html.find('.scans li').each(function(index, el) {
				$a = [];
				$v = $(el);
				var $link = $v.find('a');
				$a['id'] = getString_right($link[0].href, '/');
				if($a['id'] != null){
					$img = $v.find('img')[0];

					$a['preview_url'] = $img.src;
					$a['sample_url'] = $img.src.replace('view', 'downloads');
					$a['width'] =getString_left($img.title, 'x');
					$a['height'] =getString_right($img.title, 'x');
					var s = $($v.find('p')[0]).text().split(' by ');
					$a['title'] = s[0].trim();
					$a['author'] = s[1].trim();
					$r.push($a);
			}
		});
		break;
	}
	// var_dump($r);
	echoJson($r);
}
function e926($html){
	var $a = [];
	for (var $v of $html.find('#posts-container article')) {
		$a['id'] = $v.attr('data-id');
		$a['tags'] = $v.attr('data-tags');
		$a['rating'] = $v.attr('data-rating');
		$a['uploader_id'] = $v.attr('data-uploader-id');
		$a['author'] = $v.attr('data-uploader');
		//$v.{'data-file-ext'};
		$a['sample_url'] = $v.attr('data-file-url');
		$a['large_url'] = $v.attr('data-large-file-url');
		$a['preview_url'] = $v.attr('data-preview-file-url');
		$r.push($a);
	}
	echoJson($r);
}

function hypnohub($html){
	var $a = [];
	for (var $v of $html.find('#post-list-posts li')) {
		$img = $v.find('img')[0];
		$a['id'] = $v.id.replace('p', '');
		$a['uploader_id'] = getString_right($v.class, '-');
		$a['preview_url'] = $img.src;
		$a['sample_url'] = $v.find('a')[1].href;
		$a['rating'] = getStringByStartAndEnd($img.title, 'Rating: ', ' ').substr(0, 1).toLowerCase();
		$a['score'] = getStringByStartAndEnd($img.title, 'Score: ', ' ');
		$a['tags'] = getStringByStartAndEnd($img.title, 'Tags: ', ' User: ');
		$a['author'] = getString_right($img.title, 'User: ');
		$a['preview_width'] = $img.width;
		$a['preview_height'] = $img.height;
		$r.push($a);
	}
	echoJson($r);
}

function rule34($html){
	var $a = [];
	for (var $v of $html.find('.shm-thumb.thumb')) {
		$img = $v.find('img')[0];
		$a['id'] = $v.attr('data-post-id');
		$a['preview_url'] = $img.src;
		$m = $img.title.split(' // ');
		$md5 = getStringByStartAndEnd($img.src, '_thumbs/', '/');

		$a['author'] = $m[0];
		$a['width'] = getString_left($m[1], 'x');
		$a['height'] = getString_right($m[1], 'x');
		$a['size'] = $m[2];
		$a['ext'] = $m[3];
		$a['tags'] = $v.attr('data-tags');
		$a['preview_width'] = $img.width;
		$a['preview_height'] = $img.height;
		$a['sample_url'] = 'https://iris.paheal.net/_images/'+$md5+'/'+$a['id']+' '+$a['tags']+'.'+$a['ext'];
		$r.push($a);
	}
	echoJson($r);
}

function getStringByStartAndEnd_array($s_text, $s_start, $s_end, $i_start = 0){
	if(typeof($s_text) != 'string') return [];
	var $res = [];
	while(true){
		if(($i_start = $s_text.indexOf($s_start, $i_start)) !== -1){
			if(($i_end = $s_text.indexOf($s_end, $i_start + $s_start.length)) !== -1){
				$res.push($s_text.substr($i_start + $s_start.length, $i_end - $i_start - $s_start.length));
				$i_start = $i_end + $s_end.length;
				continue;
			}
		}
		break;
	}
	return $res;
}

getStringByStartAndEnd_array('[b][c][d]', '[', ']');

function getString_left($s_text, $s_search){
	if(typeof($s_text) != 'string') return '';
	var $i_start;
	if(($i_start = $s_text.indexOf($s_search, $i_start)) !== -1){
		return $s_text.substr( 0, $i_start);
	}
}


function getString_right($s_text, $s_search){
	if(typeof($s_text) != 'string') return '';
	var $i_end = getStringSearchEnd($s_text, $s_search);
	if($i_end != -1){
		$i_end += $s_search.length;
		return $s_text.substr($i_end, $s_text.length - $i_end);
	}
}

function getString_replaceRight($s_text, $s_search){
	if(typeof($s_text) != 'string') return '';
	var $i_end = getStringSearchEnd($s_text, $s_search);
	if($i_end != -1){
		$i_end += $s_search.length;
		return $s_text.substr(0, $i_end - $s_search.length);
	}
}


function getStringByStartAndEnd($s_text, $s_start, $s_end, $i_start = 0, $b_end = false){
	if(typeof($s_text) != 'string') return '';
	var $i_end;
	if(($i_start = $s_text.indexOf( $s_start, $i_start)) !== -1){
		if(($i_end = $s_text.indexOf($s_text, $s_end, $i_start + $s_start.length)) === -1){
			if($b_end){
				$i_end = $s_text.length;
			}else{
				return;
			}
		}
		return $s_text.substr($i_start + $s_start.length, $i_end - $i_start - $s_start.length);
	}
}

function getStringSearchEnd($s_text, $s_search, $max = 0){
	if(typeof($s_text) != 'string') return '';
	if(typeof($s_search) != 'string') return '';
	var $i_last = -1;
	var $i_start = 0;
	while(true){
		$i_start = $s_text.indexOf( $s_search, $i_start);
		if($i_start === -1) break;
		if($max > 0 && $i_start > $max){
			return $i_last;
		}
		$i_last = $i_start;
		$i_start = $i_start + $s_search.length;
	}
	return $i_last;
}

function getStringByStartAndEndFromEnd($s_text, $s_end, $s_start){
	if(typeof($s_text) != 'string') return '';
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
	if(typeof($json) == 'object'){
		for (var $v of $json){
			if($_GET['type'] == 'post'){ // 如果是时间线的话
				$GLOBALS['lastId'] = $v['id'];
				if($_GET['lastId'] > 0 && $v['id'] <= $_GET['lastId']){
					continue;
				}
			}
			if($v['@attributes'] != undefined){
				$v = $v['@attributes'];
			}
			if($v['tag_string'] != undefined){
				$v['tags'] = $v['tag_string'];
				delete $v['tag_string'];
			}
			if($v['preview_file_url'] != undefined){
				$v['preview_url'] = $v['preview_file_url'];
				delete $v['preview_file_url'];
			}
			if($_GET['r18'] == false && $v['rating'] != undefined && $v['rating'] != 's'){
				$GLOBALS['r18']++;
			}else{
				$GLOBALS['safe']++;
			}
			//$v['host'] = $_GET['host'];
			$GLOBALS['res'].push($v);
			if($GLOBALS['safe'] >= $_GET['limit']){
				echorRes();
				return;
			}
		}
		//if(count($GLOBALS['res']) > $_GET['limit']){ // 考虑数据太多可能会对客户端造成的问题

		// if($_GET['loadAll'] != ''){ // 一次性全部加载
		// 	nextPage();
		// }else{
		// 	echorRes();
		// }
	}
	console.log($GLOBALS);
}

function echorRes(){
	return {
		limit: $_GET['limit'],
		lastId: $GLOBALS['lastId'],
		unload: $_GET['limit'] - $GLOBALS['safe'],
		r18: $GLOBALS['r18'],
		hasMore: $GLOBALS['hasMore'],
		errorMsg: $GLOBALS['errorMsg'],
		safe: $GLOBALS['safe'],
		page: $_GET['page'],
		res: $GLOBALS['res']
	};
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
			if($_GET['category'] == undefined){
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
			$_GET['post'] = '/pictures/'+$url+'/{page}?lang=en';
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
			$_GET['home'] = 'https://'+$_GET['host']+'.net';
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
			return;
	}
	if($_GET['func'] == '') $_GET['func'] = $_GET['host'];
	if($_GET['lastId'] == undefined) $_GET['lastId'] = 0;
}