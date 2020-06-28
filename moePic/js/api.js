
var g_v_window;
// _window_picInfo('.menu-wrap');

function _window_close(){
  if(g_v_window != undefined){
    g_v_window.fadeOut(3000, function(){
      g_v_window.remove();
    });
  }
}

function _window_picInfo_switch(){
  if(g_v_window != undefined){
    _window_close();
  }else{
    _window_picInfo();
  }
}

function _window_picInfo(json = ''){
  if(json == '') json = getViewingJson();
  if(typeof(json) != 'object') return;
  _window_close();

  var r = _getPicDetail(json);
  var s_html = `
    <div class="menu-wrap">
    <nav class="menu">
     <div class="icon-list">
        <a href="`+r.authorHome+`" target='_blank'><i class="fa fa-fw fa-home" action_name="home"></i></a>
        <a href="#"><i class="fa fa-fw fa-power-off"  action_name="close"></i></a>
      </div>
      <div class="profile"><img src="`+r.avatar+`"/></div>
      <div class="profile_info"><span>`+r.author+`</span></div>
      <div class="link-list">
        <a href="`+r.url+`" target='_blank'><span>Id: `+r.id+` (`+r.host+`)</span></a>
        <a href="#"><span>评分: `+r.rating+`</span></a>
        <a href="`+r.source+`" target='_blank'><span>来源: `+r.uploadIn+`</span></a>
        <a href="#"><span>上传时间: `+getUploadTime(json.created_at)+`</span></a>
      </div>
      `;
      var s_1 = '';
      for(var v of r.pics){
        if(v.size > 0){
          s_1 = s_1 + '<a href="'+v.url+'" target="_blank"><span>'+v.name+': '+v.width+'x'+v.height+'('+getFileSize(v.size)+')</span></a>';
        }
      }
      if(s_1 != '') s_html = s_html + '<div class="link-list">'+s_1+'</div>';
    g_v_window = $(s_html+'</nav></div>');
   $('body').append(g_v_window);

   if(r.avatar != 'img/user.png'){
     imagesLoaded(g_v_window.find('img')).on('fail', function(instance,load_img ) {
      console.log(load_img);
       load_img.img.src = 'img/user.png';
     });
   }
  
}

function _getPicDetail(json){
  var r = {
    id: json.id,
    host: json.host,
    pics: []
  };
  r.author = _get_s(json.author, 'unknow');
  switch(r.host){
    case 'yande':
      r.avatar = 'https://yande.re/data/avatars/'+json.creator_id+'.jpg';
      r.url = 'https://yande.re/post/show/'+r.id;
      r.authorHome = 'https://yande.re/user/show/'+r.creator_id;
      break;

    default:
      r.avatar = 'img/user.png';
  }

  if(json.sample_url != undefined){
    r.pics.push({url: json.sample_url,name:'sample', width: _get_s(json.sample_width, 0), height: _get_s(json.sample_height, 0), size: _get_s(json.sample_file_size, 0)});
  }
  if(json.jpeg_url != undefined){
    r.pics.push({url: json.jpeg_url,name:'jpeg',width: _get_s(json.jpeg_width, 0), height: _get_s(json.jpeg_height, 0), size: _get_s(json.jpeg_file_size, 0)});
  }
  if(json.file_url != undefined){
    r.pics.push({url: json.file_url,name:'orgin',width: _get_s(json.width, 0), height: _get_s(json.height, 0), size: _get_s(json.file_size, 0)});
  }
   if(json.preview_url != undefined){
    r.pics.push({url: json.preview_url,name:'preview',width: _get_s(json.preview_width, 0), height: _get_s(json.preview_height, 0), size: _get_s(json.preview_size, 0)});
  }

  r.uploadTime = getUploadTime(json.created_at);
  r.source = json.source;
   if(r.source.indexOf('pximg') || r.source.indexOf('pixiv')){
      r.uploadIn = 'pixiv';
    }else
    if(r.source.indexOf('twitter')){
      r.uploadIn ='twitter';
    }else{
       r.uploadIn ='unknow'
    }

  switch(json.rating){
    case 's':
       r.rating = 'Safe';
       break;

    case 'q':
       r.rating = 'Qeustionable';
       break;
  }
  return r;
}



function getFileSize(fileByte) {
    var fileSizeByte = parseInt(fileByte);
    if(isNaN(fileSizeByte)) return 'null';
    var fileSizeMsg = "";
    if (fileSizeByte < 1048576) fileSizeMsg = (fileSizeByte / 1024).toFixed(2) + "KB";
    else if (fileSizeByte == 1048576) fileSizeMsg = "1MB";
    else if (fileSizeByte > 1048576 && fileSizeByte < 1073741824) fileSizeMsg = (fileSizeByte / (1024 * 1024)).toFixed(2) + "MB";
    else if (fileSizeByte > 1048576 && fileSizeByte == 1073741824) fileSizeMsg = "1GB";
    else if (fileSizeByte > 1073741824 && fileSizeByte < 1099511627776) fileSizeMsg = (fileSizeByte / (1024 * 1024 * 1024)).toFixed(2) + "GB";
    else fileSizeMsg = "文件超过1TB";
    return fileSizeMsg;
}

function _get_s(o, d = ''){
  return o === undefined ? d : o;
}

function getUploadTime(t){
  var t = parseInt(t);
  if(!isNaN(t)) t *= 1000;
  return new Date(t).toLocaleString().replace(/:\d{1,2}$/,' ')
}


// "https://yande.re/post.xml?page={0}&limit={1}&tags={2}", //XML
//                 "https://yande.re/tag.xml?limit={0}&order=count&name={1}",

// "https://konachan.com/post.json?page={0}&limit={1}&tags={2}",
//                 "https://konachan.com/tag.xml?limit={0}&order=count&name={1}",

//  "https://danbooru.donmai.us/posts.json?page={0}&limit={1}&tags={2}",
//                     "https://danbooru.donmai.us/tags/autocomplete.json?search%5Bname_matches%5D={0}",


// "http://behoimi.org/post/index.xml?page={0}&limit={1}&tags={2}",
//                 "http://behoimi.org/tag/index.xml?limit={0}&order=count&name={1}",

// "https://safebooru.org/index.php?page=dapi&s=post&q=index&pid={0}&limit={1}&tags={2}",
//             "https://safebooru.org/index.php?page=dapi&s=tag&q=index&order=name&limit={0}&name={1}",

// "https://lolibooru.moe/post.xml?page={0}&limit={1}&tags={2}", //XML
//                     "https://lolibooru.moe/tag.xml?limit={0}&order=count&name={1}",

//    "https://gelbooru.com/index.php?page=dapi&s=post&q=index&pid={0}&limit={1}&tags={2}",
//    "https://gelbooru.com/index.php?page=dapi&s=tag&q=index&order=name&limit={0}&name={1}",


function setActiveTab(host){
	$('.countrySelection-item.active').removeClass('active');
	$('#control-grid-'+host).addClass("active");
  setSearchType(host, g_v_search.type);
	//$("#countrySelection-items").scrollLeft($('#control-grid-'+host).offset().left);
}

function getRandomNumber(min, max){
	return Math.floor(min + Math.random() * (max-min+1));
}

function getSelectHost(){
	var dom = $('.countrySelection-item.active');
	if(dom.length == 0){
		return g_a_log.lastHost;
	}
	return dom[0].title;
}

function getSelectLayout(){
	return '.grid--type-'+getSelectHost();
}
function getSL(){
	return $(getSelectLayout());
}

function initLayout(){
	getSL().masonry('layout');
}

var g_a_list = [];

//获取滚动条当前的位置     
function getScrollTop() {
　　　　var scrollTop = 0;
   　　if (document.documentElement && document.documentElement.scrollTop) {
      　　scrollTop = document.documentElement.scrollTop;
   　　} else if (document.body) {
   　　　　scrollTop = document.body.scrollTop;
   　　}
   　　return scrollTop;
}
//获取当前可视范围的高度 
function getClientHeight() {
　　　　 return window.screen.availHeight;
}

//获取当前可视范围的高度 
function getClientWidth() {
　　　　return window.screen.availWidth;
}


 //获取文档完整的高度
function getScrollHeight(){
        return (Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
}

function getImageSafeSize(naturalWidth, naturalHeight, viewerWidth, viewerHeight){
	var aspectRatio = naturalWidth / naturalHeight;
    var width = viewerWidth;
    var height = viewerHeight;
    if (viewerHeight * aspectRatio > viewerWidth) {
      height = viewerWidth / aspectRatio;
    } else {
      width = viewerHeight * aspectRatio;
    }
    width = Math.min(width * 0.9, naturalWidth);
    height = Math.min(height * 0.9, naturalHeight);
    return {
      naturalWidth: naturalWidth,
      naturalHeight: naturalHeight,
      aspectRatio: aspectRatio,
      ratio: width / naturalWidth,
      width: width,
      height: height,
      left: (viewerWidth - width) / 2,
      top: (viewerHeight - height) / 2
   };
}

function getLocalData(k, d = ''){
    if(window.localStorage){
        var v = localStorage.getItem(k);
        if(v != null){
            return v;
        }
        // 不存在自动保存
        localStorage.setItem(k, d);
    }
    return d;
}

function getNow_s(){
    return Date.parse(new Date()) / 1000;
}

function setLocalData(k, v){
    return window.localStorage ? localStorage.setItem(k, v) : false;
}

function _secToTime(t){
  var h = parseInt(t / 3600);
  t %= 3600;
  var m = parseInt(t / 60);
  t %= 60;
  return _fiterZero(h, ':')+_fiterZero(m,':')+_fiterZero(t);
}

function _fiterZero(i, f = ''){
  if(i <= 0) return '';
  return (i < 10 ? '0'+i : i) + f;
}