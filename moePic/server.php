<?php
	error_reporting(-1);
	$s_url = urldecode(base64_decode($_GET['url']));
	if($s_url != ''){
		$ch = curl_init();
		curl_setopt ($ch, CURLOPT_URL, $s_url);
		//curl_setopt($ch, CURLOPT_HEADER, 0);
		curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, 30);
		curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1); // 不输出内容
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // 对认证证书来源的检查
		curl_setopt($ch, CURLOPT_PROXY, '127.0.0.1:1080');
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE); // 从证书中检查SSL加密算法是否存在
		$content = curl_exec($ch);
		curl_close($ch);
		echo $content;
	}
?>