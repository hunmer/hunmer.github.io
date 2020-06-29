var g_index = -1;
var g_json = [];
var g_max;
var g_keys = [];
var g_load = 40;
g_page = -1;
var g_v_playing;

function loadPage(page){
    var i_max_page = parseInt(g_max / g_load)+1;
    if(page > 0 && page <= i_max_page){
        g_page = page;
        M.Modal.getInstance($('#modal2')).close();

         $('.pagination').remove();
         toTop();
         var c = 0;
         var start, end;
       
            start = (page - 1) * g_load;
            if(start < 0) start = 0;
            end = start + g_load;
            if(end > g_max) end = g_max - 1;

            var html = ``;
            var ranking = {undefined: 0, 1: 0, 2: 0, 3: 0};
            for(var i = start; i <= end; i++){
                var index = getIndex(i);
                var json = g_json[index];

                ranking[json.ranking]++;
                // if(json.ranking != undefined){
                // }
                 html = html + `<li class="collection-item avatar z-depth-2 waves-effect block" key='`+index+`' index=`+c+`>
                    <img data-src="`+json.thumbUrl+`" class="lazyload circle">
                    <span class="title">`+json.name+`</span>
                    <p>`+json.artistString +`<br><div class="chip">
                       `+getTime(json.lengthSeconds)+`</div><div class="chip `+getColorBySongType(json.songType)+` white-text">`+json.songType+`</div>
                    </p>
                    <a href="#!" class="secondary-content"><i class="material-icons">`+(isLike(json.id) !== -1?'favorite':'favorite_border')+`</i></a>
                  </li>`;
                c++;
            }
            $('.input-field il li')
            $('#list').html(`<li class="collection-header">
                <div class="input-field">
                <select>
                  <option value="" disabled selected>Choose Ranking</option>
                  <option value="1">Ranking 1 -- `+ranking[1]+` songs</option>
                  <option value="2">Ranking 2 -- `+ranking[2]+` songs</option>
                  <option value="3">Ranking 3 -- `+ranking[3]+` songs</option>
                </select>
                <label>`+g_config.playlist+`</label>
              </div>
            </li>`+html);
            $('select').formSelect();

            if(g_v_playing === undefined){ // 首次播放
                var dom = getDomByKey(g_config.lastPlayId);
                if(dom.length > 0){
                   loadIndex(dom);
                }else{
                    loadIndex(getDomByIndex(0));
                }
             }

            // 加载页面选择器
             if(page == i_max_page){
                start = i_max_page - 4;
                if(start <= 0) start = 1;
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


            $(".lazyload").lazyload({effect: "fadeIn"});
            var html = '';
            for(var i = start; i<end;i++){
               html = html + `<li index='`+i+`' class="`+(i == page ? 'active' : 'waves-effect')+`"><a href="#!">`+i+`</a></li>`;
            }
            if(!b_end){
                if(i_max_page > 5){
                     html = html + `<li index='-1' class='waves-effect'><a class='modal-trigger' href="#modal2">...</a></li>`;
                }
               
                // 最后一页显示
                 html = html + `<li index='`+i_max_page+`' class="waves-effect"><a href="#!">`+i_max_page+`</a></li>`;

            }else{
                // 把... 换到前面
                if(i_max_page > 5){
                    html = `<li index='-1' class='waves-effect'><a class='modal-trigger' href="#modal2">...</a></li>` + html;
                }
            }
            html = `<ul class="pagination center" style="height: 100px;">
                  <li class="`+(page == 1 ? 'disabled': 'waves-effect')+`"><a href="#!"><i class="material-icons">chevron_left</i></a></li>`+ html+`<li class="`+(b_end ? 'disabled': 'waves-effect')+`"><a href="#!"><i class="material-icons">chevron_right</i></a></li>
             </ul>`;

             $('#list').after($(html));
        }
}

function addToList(i,key, json){
   
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
    return g_json[getIndex(index)];
}



function getDomByIndex(index){
    index = getCurrentIndex(index);
    return $('.collection-item.avatar[index='+index+']');
}

function getDomByKey(key){
    return $('.collection-item.avatar[key='+key+']');
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


function switchVideo(){
   var video = $('video')[0];
    if(!video.paused){
        video.pause();
    }
    g_i_playIn = 0;
}


//loadIndex(getDomByIndex(1));
function loadIndex(dom){
    clearInterval(g_timer_getNewURL);
    switchVideo();

    var index;
    if(typeof(dom) === 'number'){
        dom = getDomByIndex(dom);
    }else{
        index = dom.attr('index');
        if(index === undefined){
            closeSearch();
            M.Sidenav.getInstance($('.sidenav')).close();
            console.log(dom);
            index = parseInt(dom.attr('page'));
            if(index != g_page){
                loadPage(index);
            }
            dom = $('#list .collection-item.avatar[key='+dom.attr('key')+']');
            g_index = dom.attr('index');
        }else{
            g_index = parseInt(index);
        }
    }

    $('.playing').removeClass('playing');
    $(dom).addClass('playing');

    var key = dom.attr('key');
    var json = g_json[key];
    g_config.lastPlayId = key;
    local_saveJson('config', g_config);

    g_v_playing = json;
    $('#song_name').html(json.name);
    $('#song_artist').html(json.artistString);
    $('#song_cover')[0].src = json.thumbUrl;

    $('#_card_'+g_config.playlist+' img')[0].src =  json.thumbUrl;

    json.key = key;
    g_a_coll[g_config.playlist].lastPlay = json;
    console.log(key, json);
     $('#cover_btn')[0].style.backgroundImage = 'url("'+json.thumbUrl+'")';
    var tilte = json.name+' - '+json.artistString;
    $('.brand-logo').text(tilte);
     M.Toast.dismissAll();
    M.toast({html: tilte+'<button class="btn-flat toast-action" onclick="toTop();">UP ↑</button>', classes: 'rounded', displayLength: 2000});
  
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
    $('#videoBox iframe').remove();
    $('.video-container').hide();
    dom = $('#videoBox video').show()[0];
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

    if(url.indexOf('nicovideo.jp') !== -1){
        g_timer_getNewURL = setInterval(function(){
            $.get(url+'&dump=true', function(data) {
                if(data != ''){
                    g_s_url = data;
                }
            });
        }, 20 * 1000);
    }

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
        addHistory();
        g_i_playIn = 0;
        switchNext();
    }
    dom.onerror = function(){
        dom.src = g_s_url;
        //dom.load();
    }
}

function addHistory(){
    if(g_v_playing !== undefined){
          for(var i = 0; i<g_v_history.length;i++){
            if(i>10){
                g_v_history.splice(i, 1);
            }else
            if(g_v_history[i].id == g_v_playing.id){
                g_v_history.splice(i, 1);
            }
        }
         g_v_history.unshift(g_v_playing);
        local_saveJson('his', g_v_history);
    }
}

function openHistory(){
    var c = 0;
    var html = '';
    var json;
    for(var i = 0; i<g_v_history.length;i++){
        c++;
        json = g_v_history[i];
         html = html + `<li style="padding-top: 10px;text-align:center" class="collection-item waves-effect block" key='`+getIndexById(json.id, 2)+`' page=`+(parseInt(c / g_load) + 1)+`>`+json.name+`<a href="#!" class="secondary-content"><i class="material-icons">`+(isLike(json.id) !== -1?'favorite':'favorite_border')+`</i></a>
          </li>`;
    }
    $('#history .collection').html(html);
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

function getIndexById(id, mode = 1){
    if(mode===1){
        var dom = $('.collection-item.avatar[index='+id+']');
        if(dom.length > 0){
            return dom.attr('key');
        }
    }else{
        for(var i in g_json){
            if(g_json[i].id == id){
                return i;
            }
        }
    }
    return -1;
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

