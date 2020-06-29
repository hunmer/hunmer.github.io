$(function() {
       $('.sidenav').sidenav();
       $('.collapsible').collapsible({
        onOpenStart: function(dom){
          switch(dom.id){
            case 'history':
              openHistory();
              break;
          }
        }
       });
        $('.tabs').tabs({
            duration: 500,
         });
         $('select').formSelect();
         $('.fixed-action-btn').floatingActionButton({
          hoverEnabled: false
         });
         $('.modal').modal({
          onOpenStart: function(){
            console.log('aa');
             var i_max_page = parseInt(g_max / g_load);
             var s_html = '<form action="#">';
             for(var i=0;i<i_max_page;i++){
              s_html = s_html + `<p><label onclick="loadPage(`+i+`)"><input class="with-gap" name="group3" type="radio" `+(i==g_page ? 'checked' : '')+` /><span>`+i+`</span></label></p>`;
             }
              s_html = s_html + '</form>';
              $('#modal2 .modal-content').html(s_html);
          }
         });

       window.history.pushState(null, null, "#");
       window.addEventListener("popstate", function(event) {
          window.history.pushState(null, null, "#");
          event.preventDefault(true);
          var dom = $('.tab .active');
          if(dom.attr('href') != '#test1'){
            M.Tabs.getInstance($('.tabs')).select('test1');
          }
       });
     var g_v_grid_down = {
        start: 0,
        task: -1,
        element: null,
        holding: false
      };
     $('body')
      .on('touchstart', '#floatingMenu', function(event) {
        g_v_grid_down.start = getNow();
        g_v_grid_down.task = window.setTimeout(function(){
          if(g_v_grid_down.start > 0){
            g_v_grid_down.holding = true;
            if($('.playing').length > 0){
              $('html,body').animate({ scrollTop: $('.playing').offset().top - $(window).height() / 2 }, 500);
            }
          }
          g_v_grid_down.start = 0;
          g_v_grid_down.task = -1;
          event.stopPropagation();
        }, 1000);
      })
      .on('touchend', '#floatingMenu', function(event) {
        if(g_v_grid_down.task != -1){
          window.clearTimeout(g_v_grid_down.task);
        }
        g_v_grid_down.start = 0;
        if(g_v_grid_down.holding){
          event.stopPropagation();
        }
        g_v_grid_down.holding = false;
      })
      $('.dropdown-trigger').dropdown({
            alignment: 'center',
          onCloseEnd: function(){
            var dom = $('#selecter_mode :selected')[0];
            switch(dom.value){
                case '视频播放':
                g_config.playMode = 1;
                break;

               case '音频播放':
                g_config.playMode = 2;
                break;

                case '源地址播放':
                g_config.playMode = 0;
                break;

                default:
                  return;
            }
            local_saveJson('config', g_config);
            console.log('close', );
          }
        });
        initColl();
});   

function searchByKeyword(){
   var s = $('#search input').val();
   var html = '';
   var json, page;
   var c = 0;
    for(var i of g_keys){
      json = g_json[i];
      c++;
      if(json.name.indexOf(s) !== -1){
        page = parseInt(c / g_load) + 1;
        html = html + `<li class="collection-item avatar z-depth-2 waves-effect block" style='width: 100%;color: black;'  key='`+i+`' page=`+page+`>
          <img data-src="`+json.thumbUrl+`" class="lazyload circle">
          <span class="title">`+json.name+`</span>
          <p>`+json.artistString +`<br><div class="chip">
             `+getTime(json.lengthSeconds)+`</div><div class="chip `+getColorBySongType(json.songType)+` white-text">`+json.songType+`</div>
          </p></li>`;
      }
    }
    $('#search .collection').html(html);
    $(".lazyload").lazyload({effect: "fadeIn"});
}

function getNow(){
  return new Date().getTime();
}

function openSearch(){
      $('#search .collection').html('');
      $('.nav-extended').hide();
      $('nav#search').show().focus();
      setTimeout(function() {$('._content').hide();$('#search input').focus(); }, 100);
}

function closeSearch(){
      $('.nav-extended').show();
      $('nav#search').hide();
      $('input#search').val('');
      $('div._content.active').show();
      $('#search .collection').html('');

}

function initColl(coll = ''){
  var html = '';
  var pic, last, lastName;
  for(var i in g_a_coll){
    if(coll != '' && i != coll) continue;

    last =  g_a_coll[i].lastPlay;
    if(last === null){
      //lastName = '';
       pic = g_a_coll[i].songs != undefined && g_a_coll[i].songs.length > 0 ? g_a_coll[i].songs[0].thumbUrl : '';
    }else{
      //lastName = last.name + ' - ' + last.artistString;
      pic = last.thumbUrl; 
    }
    if(pic === '') pic = 'images/user.jpg';

     html = html + `<div class="col s6">
        <div class="card" id='_card_`+i+`'>
          <div class="card-image">
            <span class="white-text badge blue left floatTag">`+(g_a_coll[i].count != undefined ? g_a_coll[i].count : g_a_coll[i].songs.length)+`</span>

            <img src="`+pic+`" style="cursor:pointer">
            <a class="btn-floating halfway-fab waves-effect waves-light red"><i class="material-icons" onclick='loadPlayList("`+i+`")'>play_circle_filled</i></a>
          </div>
          <div class="card-content" style="cursor:pointer">
            <p>`+i+`</p>
          </div>
        </div>
      </div>`;
           // <span class="card-title nowarp _shadow_1">`+i+`</span>

  }
  $('#test2 .row').html(html);

  if(coll == '' && g_a_coll[g_config.playlist] != undefined){ // 初次加载列表
    loadPlayList(g_config.playlist);
  }else{
    loadPlayList('default')
  }
}

function loadPlayList(coll){
  console.log('loadPlayList', coll);
  M.Tabs.getInstance($('.tabs')).select('test1');
  g_config.playlist = coll;
  local_saveJson('config', g_config);
  if(coll == 'default'){
    var q = $.get('js/data.json');
    q.always(function(){
      loadJson(q.responseText);
    });
  }else{
    if(g_a_coll[coll].lastPlay != null){
       g_config.lastPlayId = g_a_coll[coll].lastPlay.key;
    }
    loadJson(g_a_coll[coll].songs);
  }
}

function loadJson(json){
  if(typeof(json) == 'string'){
    g_json = JSON.parse(json);
  }else{
    g_json = json;
  }
    g_keys = Object.keys(g_json);
    g_max = g_keys.length;
    var c = 0;
    for(var i in g_keys){
      c++;
      if(i == g_config.lastPlayId){
        loadPage(parseInt(c / g_load) + 1);
        return;
      }
    }
    loadPage(1);
}

$(document).on('click', 'i.material-icons', function(event) {
      var par = $(this.parentElement.parentElement);
      switch(this.innerHTML){
            case 'favorite':
            var key = par.attr('key');
              var j = g_json[key];
              removeFromFavorite(key, j);
              event.stopPropagation();
              break;

            case 'favorite_border':
            var key = par.attr('key');
              var j = g_json[key];
              addToFavorite(key, j);
              event.stopPropagation();
              break;
      }
}).
on('click', '.collection-item', function(event) {
      loadIndex($(this));
})
.on('click', '.pagination li', function(event) {
  var dom = $(this);
  var d = dom.find('i');
  if(d.length > 0){
    console.log(d[0].innerText);
    if(d[0].innerText == 'chevron_left'){
      loadPage(g_page-1);
    }else{
      loadPage(g_page+1);
    }
  }else{
    loadPage(dom.attr('index'));
  }
})
.on('click', '#floatingMenu i', function(event) {
  switch(this.innerText){
    case 'keyboard_arrow_up': 
      toTop();
      break;

    case 'search':
      window.open('https://music.163.com/#/search/m/?s='+encodeURIComponent(g_v_playing.name+' '+g_v_playing.artistString));
      break;

    case 'get_app':
      window.open(g_s_url);
      break;

    case 'public':
      window.open('https://'+g_v_playing.playerHtml);
      break;
  }


});
function toTop(){
    $('html,body').animate({ scrollTop: 0 }, 500);
}

/*var ha = ($('#videoBox').offset().top + $('#videoBox').height());
$(window).scroll(function() {
  if ($(window).scrollTop() > ha+150) {
  } else if ($(window).scrollTop() < ha+50) {
    $('#videoBox').removeClass('out').addClass('in');
  } else {
    $('#videoBox').removeClass('in').addClass('out');
  };
});
*/