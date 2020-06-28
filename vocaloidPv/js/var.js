var g_index = -1;
var g_json = [];
var g_max;
var g_keys = [];
var g_load = 40;
g_page = -1;
var g_v_playing;

function loadPage(page){
    var i_max_page = parseInt(g_max / g_load);
    if(page > 0 && page <= i_max_page && page !== g_page){
        g_page = page;
        M.Modal.getInstance($('#modal2')).close();

        console.log('load Page:', page);
         $('.collection').html('<li class="collection-header"><h4>Playlist</h4></li>');
         $('.pagination').remove();
         $(document).scrollTop(0);

         var start, end;
       
            start = (page - 1) * g_load;
            end = start + g_load;
            if(end > g_max) end = g_max - 1;

            var c = 0;
            for(var i = start; i < end; i++){
                var index = getIndex(i);
                var j = g_json.likes[index];
                //console.log(i, j['name'], j['thumbUrl']);
                addToList(c,index, g_json.likes[index]);
                c++;

            }

            // 加载页面选择器
             if(page == i_max_page){
                start = i_max_page - 4;
                end = i_max_page + 1;
                b_end = true;
            }else{
                start = page - 2;
                if(start <= 0) start = 1;
                end = start+5;
                var b_end = false;
                if(end > g_max){
                    b_end = true;
                    end = g_max - 1;
                }
             }
            var html = '';
            for(var i = start; i<end;i++){
               html = html + `<li index='`+i+`' class="`+(i == page ? 'active' : 'waves-effect')+`"><a href="#!">`+i+`</a></li>`;
            }
            if(!b_end){
                html = html + `<li index='-1' class='waves-effect'><a class='modal-trigger' href="#modal2">...</a></li>`;
                // 最后一页显示
                 html = html + `<li index='`+i_max_page+`' class="waves-effect"><a href="#!">`+i_max_page+`</a></li>`;

            }else{
                // 把... 换到前面
                html = `<li index='-1' class='waves-effect'><a class='modal-trigger' href="#modal2">...</a></li>` + html;
            }
            html = `<ul class="pagination center" style="height: 100px;">
                  <li class="`+(page == 1 ? 'disabled': 'waves-effect')+`"><a href="#!"><i class="material-icons">chevron_left</i></a></li>`+ html+`<li class="`+(b_end ? 'disabled': 'waves-effect')+`"><a href="#!"><i class="material-icons">chevron_right</i></a></li>
             </ul>`;

             $('.collection').after($(html));
        }
}

function addToList(i,key, json){
    var dom = $(`<li class="collection-item avatar z-depth-2" key='`+key+`' index=`+i+`>
        <img src="`+json.thumbUrl+`" alt="" class="circle">
        <span class="title">`+json.name+`</span>
        <p>`+json.artistString +`<br><div class="chip">
           `+getTime(json.lengthSeconds)+`</div><div class="chip `+getColorBySongType(json.songType)+` white-text">`+json.songType+`</div>
        </p>
        <a href="#!" class="secondary-content`+(isLike(json.id) === -1 ? ' not-active' : '')+`"><i class="material-icons">grade</i></a>
      </li>`);
     dom.appendTo('.collection');
     if(g_v_playing === undefined){
        loadIndex(dom);
     }
}

function getColorBySongType(type){
    switch(type){
        case 'Original':
            return 'green';

        case 'Cover':
            return 'blue';

         case 'Remix':
            return 'red';

        default:
            return 'black';
    }
}

function getTime(i){
    return _i(parseInt(i / 60)) + ':'+_i(parseInt(i % 60));
}

function _i(i){
    return i<10 ? '0'+i : i;
}

function getCurrentIndex(index){
    if(index < 0){
        index = g_max - 1;
    }else
    if(index > g_max - 1){
        index = 0;
    }
    return index;
}

function getJsonbyIndex(index){
    index = getCurrentIndex(index);
    return g_json.likes[getIndex(index)];
}



function getDomByIndex(index){
    index = getCurrentIndex(index);
    return $('.collection-item.avatar[index='+index+']');
}

var g_timer_getNewURL = 0;
var g_s_url = '';
var g_i_playIn = 0;
setInterval(function(){
    var video = $('video')[0];
    if(!video.paused){
        g_i_playIn = video.currentTime;
        if(!$('#cover_btn').hasClass('rotate')){
            $('#cover_btn').addClass('rotate');
        }
    }else{
        g_i_playIn = 0;
        $('#cover_btn').removeClass('rotate');
    }
}, 1000);

//loadIndex(getDomByIndex(1));
function loadIndex(dom){
    clearInterval(g_timer_getNewURL);

    if(typeof(dom) === 'number'){
        dom = getDomByIndex(dom);
    }else{
        g_index = parseInt(dom.attr('index'));
    }
    $('.playing').removeClass('playing');
    $(dom).addClass('playing');

    var key = dom.attr('key');
    var json = g_json.likes[key];
    g_v_playing = json;
    g_a_coll[g_s_playlist].lastPlay = json;
    console.log(key, json);

     $('#cover_btn')[0].style.backgroundImage = 'url("'+json.thumbUrl+'")';
    var tilte = json.name+' - '+json.artistString;
    $('.brand-logo').text(tilte);
     M.Toast.dismissAll();
    M.toast({html: '播放 -> '+tilte, classes: 'rounded', displayLength: 2000});
  

    var dom;
    var url 
    if(json.playerHtml.indexOf('cdn.piapro.jp') !== -1){
        url = 'https://'+json.playerHtml;
    }else{
        url = 'https://neysummer-vocaloidpv.glitch.me/?url='+getVideoHomepage('https://'+json.playerHtml);
        // url = 'php/getVideoUrl.php?url='+getVideoHomepage('https://'+json.playerHtml);
    }
    $('#videoBox').css('backgroundImage', "url('"+json.thumbUrl+"')");
    if(g_config.playMode === 0){ // iframe
        $('#videoBox iframe').remove();
        $('#videoBox video').hide()[0].pause();
        dom = $(`<iframe style="display: none;" width="853" height="480" src="`+url+`" frameborder="0" allowfullscreen></iframe>`).appendTo('.video-container')[0];
         dom.onload = function(){
            dom.style.display = '';
             $(document).scrollTop(0);
        }
        return;
    }
    if(g_config.playMode === 2){

    }
    $('.video-container').hide();
    dom = $('#videoBox video').show()[0];
    $('#videoBox iframe').remove();
    dom.poster = json.thumbUrl;
    if(url.indexOf('bilibili.com') !== -1){
         $.get(url, function(data) {
            if(data != ''){
                 if (flvjs.isSupported()) {
                    var flvPlayer = flvjs.createPlayer({
                        type: 'flv',
                        url: data
                    });
                    flvPlayer.attachMediaElement(dom);
                    flvPlayer.load();
                    flvPlayer.play();
                }
            }
        });
    }else{
        dom.pause();
        g_s_url = url;
        dom.src = url;
        dom.load();
    }

    // 被cors拦截
   /* if(url.indexOf('nicovideo.jp') !== -1){
        g_timer_getNewURL = setInterval(function(){
            $.get(url+'&dump=true', function(data) {
                if(data != ''){
                    g_s_url = data;
                }
            });
        }, 20 * 1000);
    }*/

    dom.onloadstart = function(){
         if(g_i_playIn > 0){
            dom.currentTime = g_i_playIn;
            g_i_playIn = 0;
        }
    }
    dom.oncanplay = function(){
        if(dom.paused){
            dom.play();
        }
    }
   /* dom.ontimeupdate = function(){
        console.log(dom.currentTime);
    }*/
    dom.onended = function(){
        console.log('eee');
        g_i_playIn = 0;
        switchNext();
    }
    dom.onerror = function(){
        //dom.src = g_s_url;
        dom.load();
    }
}

function getVideoHomepage(url){
    if(url.indexOf('embed.nicovideo.jp') !== -1){
        return url.replace('embed.nicovideo.jp', 'www.nicovideo.jp');
    }
    if(url.indexOf('bilibili.com') !== -1){
        return url.replace('embed.nicovideo.jp', 'www.nicovideo.jp');
    }
    return url;
}

function switchNext(){
	if(g_index > g_max - 1){
		g_index = 0;
	}else{
		g_index++;
	}
	loadIndex(g_index);
}

function switchPrev(){
	if(g_index == 0){
		g_index = g_max - 1;
	}else{
		g_index--;
	}
	loadIndex(g_index);
}

function getIndex(i){
    return g_keys[i];
}

function randomNum(minNum,maxNum){ 
    switch(arguments.length){ 
        case 1: 
            return parseInt(Math.random()*minNum+1,10); 
        break; 
        case 2: 
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
        break; 
            default: 
                return 0; 
            break; 
    } 
} 

var g_config = local_readJson('config', {
  'index': 1,
  'playMode': 0, // iframe播放
});
//$('#selecter_mode li:eq('+g_config.playMode+1+')').addClass('selected');
// 播放器本地存储信息
// 参数：键值、数据
function local_saveJson(key, data) {
    if (window.localStorage) {
        key = 'vm_' + key;    // 添加前缀，防止串用
        data = JSON.stringify(data);
        return localStorage.setItem(key, data);
    }
    return false;
}

// 播放器读取本地存储信息
// 参数：键值
// 返回：数据
function local_readJson(key, defaul = '') {
    if(!window.localStorage) return defaul;
    key = 'vm_' + key;
    var r = JSON.parse(localStorage.getItem(key));
    return r === null ? defaul : r;
}

function getLocalItem(key, defaul = '') {
    var r = null;
    if(window.localStorage){
        r = localStorage.getItem('vm_' + key);
    }
    return r === null ? defaul : r;
}

function setLocalItem(key, value) {
    if(window.localStorage){
       return localStorage.setItem('vm_' + key, value);
    }
    return false;
}