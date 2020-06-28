$(function() {
       $('.sidenav').sidenav();
       $('.tabs').tabs();
         $('select').formSelect();
         $('.fixed-action-btn').floatingActionButton({
          hoverEnabled: false
         });
         $('.modal').modal({
          onOpenStart: function(){
             var i_max_page = parseInt(g_max / g_load);
             var s_html = '<div class="row">';
             for(var i=0;i<i_max_page;i++){
              s_html = s_html + '<div class="col s3" onclick="loadPage('+i+')">'+i+'</div>';
             }
              s_html = s_html + '</div>';
              $('#modal2 .modal-content').html(s_html);
          }
         });
       var q = $.get('js/data.json');
      q.always(function(){
          g_json = JSON.parse(q.responseText);
          g_keys = Object.keys(g_json.likes);
          g_max = g_keys.length;
          loadPage(1);
      });


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
});   

function openSearch(){
      $('.nav-extended').hide();
      $('nav#search').show().focus();
      setTimeout(function() {$('input#search').focus() }, 100);
}

function closeSearch(){
      $('.nav-extended').show();
      $('nav#search').hide();
      $('input#search').val('');
}

/*g_a_coll = {
  like: {songs: [], lastPlay: null}
};
local_saveJson('coll', g_a_coll);
*/
var g_s_playlist = 'like';
var g_a_coll = local_readJson('coll', {
  like: {songs: [], lastPlay: null}
});

var g_likes_id = [];
for(var i in g_a_coll.like.songs){
  g_likes_id.push(g_a_coll.like.songs[i].id);
}

initColl();
function initColl(){
  for(var i in g_a_coll){
    var name = i;
    switch(i){
      case 'like':
        name = '我喜欢的音乐';
        break;
    }
    var pic = '';
    var last =  g_a_coll[i].lastPlay;
    var lastName = '';
    if(last === null){
      lastName = '';
      pic = g_a_coll[i].songs.length > 0 ? g_a_coll[i].songs[0].thumbUrl : '';
    }else{
      lastName = last.name + ' - ' + last.artistString;
      pic = last.thumbUrl; 
    }
    console.log(last, lastName);

     $(`
      <div class="col s4">
        <div class="card">
          <div class="card-image">
            <span class="white-text badge blue left floatTag">`+g_a_coll[i].songs.length+`</span>

            <img src="`+pic+`" style="cursor:pointer">
            <span class="card-title">`+name+`</span>
            <a class="btn-floating halfway-fab waves-effect waves-light red"><i class="material-icons" onclick='loadPlayList("`+i+`")'>play_circle_filled</i></a>
          </div>
          <div class="card-content" style="cursor:pointer">
            <p>`+lastName+`</p>
          </div>
        </div>
      </div>`).appendTo('#test2 .row');
   
  }
}

function loadPlayList(coll){
  console.log('loadPlayList', coll);
}

function addToFavorite(json, coll = 'like'){
  if(g_a_coll[coll] != undefined){
    if(isFavorite(json.id, coll) === -1){
      g_a_coll[coll].songs.push(json);
      local_saveJson('coll', g_a_coll);
    }
  }
}

function removeFromFavorite( json, coll = 'like'){
  if(g_a_coll[coll] != undefined){
    var i = isFavorite(json.id, coll);
    if(i !== -1){
      g_a_coll[coll].songs.splice(i, 1);
      local_saveJson('coll', g_a_coll);
    }
  }
}


function isFavorite(id, coll = 'like'){
  console.log(id);
  for(var i=0;i<g_a_coll[coll].songs.length;i++){
    if(g_a_coll[coll].songs[i]['id'] == id){
      return i;
    }
  }
  return -1;
}

function isLike(id,){
  for(var i=0;i<g_likes_id.length;i++){
    if(g_likes_id[i] == id){
      return i;
    }
  }
  return -1;
}



$(document).on('click', 'i.material-icons', function(event) {
      var par = $(this.parentElement);
      switch(this.innerHTML){
            case 'grade':
              var j = g_json.likes[par.parent().attr('key')];
              console.log(j);
              if(par.hasClass('not-active')){
                addToFavorite(j);
              }else{
                removeFromFavorite(j);
              }
              par.toggleClass('not-active');
              event.stopPropagation();
              break;
      }
}).
on('click', '.collection-item.avatar', function(event) {
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
      $('html,body').animate({ scrollTop: 0 }, 500);
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