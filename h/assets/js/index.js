$(function() {
    if (location.search == '') location.href = '?t=' + new Date().getTime()
    const checkAction = function(event, action) {
        if (this.classList.contains('disabled')) return;
        doAction(this, this.dataset[action], event);
    }
    $(document)
        .on('click', '[data-action]', function(event) {
            checkAction.call(this, event, 'action');
        })
        .on('dblclick', '[data-dbaction]', function(event) {
            checkAction.call(this, event, 'dbaction');
        })
        .on('change', '[data-change]', function(event) {
            checkAction.call(this, event, 'change');
        })
        .on('input', '[data-input]', function(event) {
            checkAction.call(this, event, 'input');
        })
        .on('contextmenu', '[data-contenx]', function(event) {
            checkAction.call(this, event, 'contenx');
        })
        .on('closed.modal.amui', function(event) {
            // 关闭Modal删除DOM
             if (event.target.classList.contains('am-modal-confirm')) {
                event.target.remove();
            }
        });

    // window.addEventListener("popstate", function(event) {
    //     window.history.pushState(null, null, "index.html");
    //     if (go_back()) {
    //         $autojs.invoke('finish');
    //     }
    // });

    $('.am-tabs-bd').on('scroll', function(event) {
        let top = this.scrollTop;
        domSelector('toTop').toggleClass('hide', top == 0)
        if (top + this.offsetHeight + 50 >= this.scrollHeight) {
            let now = new Date().getTime();
            if (now >= g_cache.nextPage) {
                g_cache.nextPage = now + 1000;
                if($('li.am-active').text() == '最新'){
                    g_app.nextPage();
                }
            }
        }
    });
});

function doAction(dom, action, event) {
    var action = action.split(',');
    if (g_actions[action[0]]) {
        g_actions[action[0]](dom, action, event);
    }
    switch (action[0]) {
        case 'toTop':
            $('.am-tabs-bd').animate({ scrollTop: 0 }, 500);
            break;

          case 'data_export':
            var d = {};
            for (var key of local_getList()) {
                d[key] = localStorage.getItem(key);
            }
            downloadData(JSON.stringify(d), 'data_' + (new Date().format('yyyy_MM_dd_hh_mm_ss')) + '.json');
            break;
        case 'data_import':
            $('#upload').click();
            break;
    }
}