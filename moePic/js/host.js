var g_a_log = getJsonData('log', JSON.stringify({
	r18: false, // r18模式
	lastHost: 'yande', // 最后打开的站点
	lastData: null,
	lastFinish: getNow_s() // 最后完成时间
}));

function clickHost(){
	if(getSelectHost() != g_v_search.host){
		var dom = $('#control-grid-'+g_v_search.host);
	    dom.click();
	    //GridLoaderFx.switchGrid(g_v_search.host);
	}
}

var g_i_layi = 0;
function removeLayoutTimer(){
	if(g_i_layi != 0){
		window.clearInterval(g_i_layi);
		g_i_layi = 0;
	}
}

function initLayoutTimer(s_host){
	removeLayoutTimer();
	var i_start = 0;
	var g_i_layi= window.setInterval(function(){
		i_start++;
		if(i_start > 10){
			window.clearInterval(g_i_layi);
			return;
		}else{
			if(s_host != getSelectHost()){
				console.log('remove');
				removeLayoutTimer();
				return;
			}
			initLayout();
		}
	}, 500);
}

function abortHttp(taskId){
	if(g_v_http[taskId] != undefined){
		window.clearTimeout(taskId);
		g_v_http[taskId].abort();
		g_v_http[taskId] = undefined;
	}
}

function getNow(){
	return new Date().getTime();
}

var g_a_r18 = []; // 所有过滤的图片
var g_a_r18_last = []; //保存最后一次被过滤的图片

function getData(host, s_url, load = false){
	 // return;
	if(!load){
		if(g_b_loading){
			return;
		}
		var now = new Date().getTime();
		if(now - g_i_lastloading < 3000){
			return;
		}
	}

	console.log('load: '+s_url);
	g_i_lastloading = now;

    var zero = g_v_imglist[host].imgs.length === 0;
	setLoading(true);
	//clickHost();

    //g_v_http.start = getNow();
    /* var timeoutTask = setTimeout(function(){
    	console.log('timeout');
    	setLoading(false);
    	abortHttp(timeoutTask);
	}, g_v_http.timeout);*/
	// g_v_http.http[timeoutTask] = 
	
	$.ajax({
    	url: s_url,
    	cache: false,
    	dataType: 'json',
    })
	    .done(function(data) {
	    	console.log(data);
	    	if(data === null) return;

	    	var data_count = data.res.length;
	    	if(data.errorMsg != ''){
	    		console.log('错误'.data.errorMsg);
	    		return;
	    	}
	    	g_v_imglist[host]['lastId'] = data.lastId;
	    	g_v_search.page = data.page;
	    	g_v_search.hasMore = data.hasMore;
	    	if(!data.hasMore){
	    		console.log('没有更多结果!');
	    	}else
	    	if(data.unload > 0){ // 断点加载
	    		if(g_v_search.host != host){
	    			console.log('站点切换,停止加载更多!');
	    		}else{
	    			console.log('数量不过,继续加载'+data.unload);
	    			var search = {'limit': data.unload};
	    			if(g_v_search.type == 'post'){
	    				search.lastId = g_v_imglist[host].lastId;
	    			}
	    			//getData(host, getPost(search), true);
	    		}
	    	}
	    	var loaded = 0;
	    	g_a_r18_last = [];
	    	$container = $('.grid--type-'+host);
	    	for(var v of data.res){
	    		if(g_v_imglist[host].ids.indexOf(v.id) !== -1){
	    			data.unload++;
	    			//console.log('图片'+v.id+'存在');
	    			continue;
	    		}
	    		loaded++;

	    		if(g_a_log.r18 === false && v.rating != undefined && v.rating != 's'){
	    			if(g_a_r18[host] == undefined) g_a_r18[host] = [];
	    			g_a_r18[host].push(v);
	    			g_a_r18_last.push(v);
	    			data_count--;
	    		}else{
	    			var i_index = g_v_imglist[host].imgs.push(v) - 1;
	    			v.host = host;
	    			g_v_imglist[host].ids.push(v.id);

	    			var s_large = v.sample_url;
	    			if(s_large == undefined) s_large = v.file_url;
		    		var dom = $(
		    			`<div class="grid__item" data-id-index=`+i_index+` data-host='`+host+`' data-pid='`+v.id+`'> 
							<img class='grid__img' 
							src="`+ getImageUrl(host, v.preview_url, 'prev') + `"
							data-src="`+getImageUrl(host, s_large, 'orgin')+`" 
							alt='`+ (v.title != undefined ? v.title : v.id) +`' 
							style="width:`+(getClientWidth() - 30) / 2+`px;height:`+getClientHeight() / 3+`px;border:1px solid white; background-color: rgba(`+getRandomNumber(0, 255)+', '+getRandomNumber(0, 255)+', '+getRandomNumber(0, 255)+`, 0.05);" 
							></div>
					`);
					$container.append( dom ).masonry().masonry( 'appended', dom );

					var img_loaded = 0;
					imagesLoaded(dom).on('progress', function( instance, image ) {
						img_loaded++;
						if(img_loaded === data_count){
							console.log('加载完毕1!');
							//$('.grid--type-'+host).masonry('layout');
							//initGallery();
						}
						if(!image.isLoaded){
							//image.img.alt = image.img.src;
							image.img.src = './img/404.jpg';
						}
						$(image.img).css({
							border: '',
							height: '',
							width: ''
						});
						if(g_v_search.host === host){
							$('.grid--type-'+host).masonry('layout');
						}else{
							console.log('站点切换,不调整layout');
						}
					});
	    		}
	    	}
	    })
	    .fail(function() { 
	    })
	    .always(function() {
	    	//initGallery(host);
			setLoading(false);
			console.log('过滤'+g_a_r18_last.length+'张图片', g_a_r18_last);
			// initLayout();
	    });
}

function getImageUrl(host, url, orgin = 'prev'){
	//if(g_v_imglist[host][orgin] != undefined && g_v_imglist[host][orgin]){
		return g_v_api+'/image.php?url='+btoa(url)+'&proxy=true';
	//}
	return url;
}

function openGallery(){
	g_v_gallery_info.open = true;
	g_v_gallery_info.openTime = 0;
	$('.up-menu').css('opacity',1).css('z-index', 999);
	$('.fm').not('.up-menu').css('opacity', 0).css('z-index', -1);
	$('#contactUs').css('opacity', 0).css('z-index', -1);
}

function closeGallery(host = ''){
	setLoading(false);
	
	var not = '';
	g_v_gallery_info.open = false;
	g_v_gallery_info.gallery.fullView = false;
	// if(!isDrawing()){
	// 	$('.up-menu').css('opacity', 0).css('z-index', -1);
	// }
	$('.fm').not('.up-menu').css('opacity', 1).css('z-index', 9999);
	$('#contactUs').css('opacity', 1).css('z-index', 9999);
     switcPause(true);
     closeMenu();
     _window_close();
}

function hideGalleryBar(){
	if($('.viewer-footer').css('opacity') > 0){
		$('.viewer-footer').css('opacity', 0);
		$('.viewer-footer').css('z-index', -1);
	}
}

function showGalleryBar(){
	if($('.viewer-footer').css('opacity') == 0){
		$('.viewer-footer').css('opacity', 1);
		$('.viewer-footer').css('z-index', 9999);
	}
}

var g_v_gallery_info = {
	gallery: undefined,
	opend: false, // 打开状态
	count: 0, // 打开相册时候加载图片的数量
	json: null, //当前浏览的图片 json
}

function getPicJson(host, index){
	if(g_v_imglist[host] != undefined && g_v_imglist[host].imgs.length >= index){
		return g_v_imglist[host].imgs[index]
	}
}

function getGridDom(s_host, s_id){
	return $('.grid__item[data-host="'+s_host+'"][data-pid="'+s_id+'"]');
}

function loadGallery(dom){
	var s_host = dom.attr('data-host');
	if(g_v_gallery_info.gallery == undefined){
		g_v_gallery_info.gallery = new Viewer(dom[0], {
			viewIndex: -1,
			loading: true,
			host: s_host,
			url(image) {
				var s_url = getImageUrl(s_host, $(image).attr('data-src'), 'orgin');
			    return s_url;
			  },
			  slideOnTouch: false,
			  zoomOnTouch: true,
			 minZoomRatio: 0.2,

			 view(event){
			 	// event.detail.originalImage, event.detail.image, event.detail.index
			 	host = $(this).parent().attr('data-host');
			 	var i_index = $(this).parent().attr('data-id-index');
			 	g_s_viewer = getPicJson(host, i_index);
			 	//console.log(g_s_viewer);
			 },
			 show(){
			 	showGalleryBar();
			 	openGallery();
			 },
			 hide(){
			  	closeGallery(s_host);
			 },
		});
	}else{
		g_v_gallery_info.gallery.setElement(dom[0]);
	}
}

function setHost(host, type = 'post', cache = false){
	g_v_search.host = host;
	g_v_search.type = type;
	g_v_search.url = g_v_api+'/api.php?host={host}&type={type}&page={page}&limit={limit}&safe={safe}&lastId={lastId}';

	g_v_search.proxy = false;
	switch(host){
		case 'yande':
		case 'bilibili':
			g_v_search.proxy = true;
			break;
	}
	getData(host, getPost());
}

function setSearchType(host, type){
	$('.tab_desc').remove();
	$('#control-grid-'+host).append($('<span class="tab_desc">'+type+'</span>'));
}

function getParam($array, $key, $default){
	return $array[$key] != undefined ? $array[$key] : $default;
}

function getPost($params = []){
	// https://konachan.com/tag.xml?limit={0}&order=count&name={1}
	return g_v_search.url
	.replace('{limit}', getParam($params, 'limit', g_v_search.limit))
	.replace('{host}', getParam($params, 'host', g_v_search.host))
	.replace('{type}', getParam($params, 'type', g_v_search.type))
	.replace('{page}', getParam($params, 'page', g_v_search.page))
	.replace('{safe}', getParam($params, 'r18', g_a_log.r18))
	.replace('{lastId}', getParam($params, 'lastId', ''))
	.replace('{name}', '')
	.replace('{order}', '')
	.replace('{tags}', '')
}

function nextPage(host = ''){
	if(host == '') host =g_v_search.host;
	g_v_search.page++;
	return getData(host, getPost());
}

function prevPage(){
	if(host == '') host =g_v_search.host;
	if(g_v_search.page > 0){
		g_v_search.page--;
		return getData(host, getPost());
	}
}
