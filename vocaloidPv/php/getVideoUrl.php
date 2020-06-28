<?php
	error_reporting(-1);
	set_time_limit(0);
	$s_url = $_GET['url'];
	$ch = curl_init();

	if(strpos($s_url, 'bilibili.com') === false){
		$s_url = urlencode($s_url) . '&format=best%5Bprotocol%3Dhttps%5D%2Fbest%5Bprotocol%3Dhttp%5D%2Fbestvideo%5Bprotocol%3Dhttps%5D%2Fbestvideo%5Bprotocol%3Dhttp%5D';
	}else
	if(strpos($s_url, 'soundcloud.com') === false){
		$s_url = getStringByStartAndEnd($s_url, 'url=', '&') . '&format=http_mp3_128';
	}
	$options =  array(
		CURLOPT_URL => 'https://alltubedownload.net/download?url='.$s_url,
		CURLOPT_HEADER => false,
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_TIMEOUT => 30,
		CURLOPT_PROXYAUTH => CURLAUTH_BASIC,
		CURLOPT_SSL_VERIFYPEER => false,
		CURLOPT_SSL_VERIFYHOST => false,
		CURLOPT_PROXY => "127.0.0.1",
		CURLOPT_PROXYPORT => 1080,
		CURLOPT_FOLLOWLOCATION => TRUE,
		CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36 Edg/81.0.416.58'
	);
	curl_setopt_array($ch, $options);

	if(strpos($s_url, 'bandcamp.com') !== false){
		curl_setopt($ch, CURLOPT_URL, urldecode($s_url));
		$content = getStringByStartAndEnd(curl_exec($ch), 'var playerdata = ', '};').'}';
		$json = json_decode($content, true);
		header('Location: '.$json['tracks'][0]['file']['mp3-128']);
		curl_close($ch);
		exit();
	}
	
	curl_exec($ch);
	$return_url = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL); //获取重定向url
	curl_close($ch);
	//die($s_url);
	if(strpos($s_url, 'bilibili.com') || $_GET['dump']){
		echo $return_url;
	}else{
		header('Location: '.$return_url);
	}

function getStringByStartAndEnd($s_text, $s_start, $s_end, $i_start = 0, $b_end = false){
	if(($i_start = strpos($s_text, $s_start, $i_start)) !== false){
		if(($i_end = strpos($s_text, $s_end, $i_start + strlen($s_start))) === false){
			if($b_end){
				$i_end = strlen($s_text);
			}else{
				return '';
			}
		}
		return substr($s_text, $i_start + strlen($s_start), $i_end - $i_start - strlen($s_start));
	}
	return '';
}
