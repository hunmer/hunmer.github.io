// ==UserScript==
// @name         视频自动播放
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match       embed.nicovideo.jp/watch/*
// @match      www.youtube.com/embed/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var server;
    
    setTimeout(function() {
        if (location.href.indexOf('embed.nicovideo.jp') !== -1) {
            server = 'niconico';
            if (isPause()) {
                document.querySelector('.f1sha0mi').click();
            };
        } else
        if (location.href.indexOf('youtube.com') !== -1) {
            server = 'youtube';
            if (isPause()) {
                document.getElementsByClassName('ytp-play-button ytp-button')[0].click();
            };
        }
    }, 2000);

    function isPause() {
        switch (server) {
            case 'niconico':
                return document.querySelector("button[data-title='Play']") == undefined;

            case 'youtube':
                return document.getElementsByClassName('ytp-play-button ytp-button')[0].title.indexOf('(k)') !== -1;
        }
    }


    var tick = setInterval(function() {
        switch (server) {
            case 'niconico':
                if (document.getElementsByClassName('finished').length > 0 || document.getElementsByClassName('VideoEndScreenContainer-content').length > 0) {
                    console.log('over');
                    toNextUrl();
                    clearInterval(tick);
                }
                break;

            case 'youtube':
                var s = document.getElementsByClassName('ytp-time-duration')[0].innerHTML;
                if (s != '' && s != '00:00' && s == document.getElementsByClassName('ytp-time-current')[0].innerHTML) {
                    console.log('over');
                    toNextUrl();
                    clearInterval(tick);
                }
                break;
        }
    }, 1000);

    function toNextUrl(){
        var url = string_getRightText(location.search, '&nextUrl=');
        console.log(url);
        location.href = url;
    }

    function string_getRightText(s_text, s_search){
        var i = s_text.indexOf(s_search);
        if(i != -1){
            i+=s_search.length;
            return s_text.substr(0-(s_text.length-i));
        }
        return '';
    }
})();