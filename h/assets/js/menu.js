var g_menu = {
    buildItems: function(list){
        var h = '';
        for(var d of list){
            h += `
            <li class="${d.class || ''}"><a data-action="${d.action}"><span class="mr-2 am-icon-${d.icon}"></span>${d.text}</a></li>`
        }
        return '<ul class="am-list">'+h+'</ul>';
    },
    init: function() {
      

    },

    hideMenu: function(key) {
        $('#rm_' + key).modal('close');
    },
    unregisterMenu: function(name) {
        delete g_menu.list[name];
    },
    list: {},
    registerMenu: function(opts) {
        g_menu.list[opts.name] = opts;
        var id = 'rm_' + opts.name;
        $(`
             <div id="${id}" class="am-modal-actions">
                <div class="am-modal-actions-group">
                    ${opts.html}
                </div>
                <div class="am-modal-actions-group">
                    <button class="am-btn am-btn-secondary am-btn-block" data-am-modal-close>取消</button>
                </div>
            </div>
        `).appendTo('body');

        registerContextMenu(opts.selector, (dom, event) => {
            g_menu.showMenu(opts.name, dom, event);
        });
    },

    getMenu: function(name) {
        return g_menu.list[name];
    },

    showMenu: function(name, dom, event) {
        var opts = g_menu.getMenu(name);
        var id = 'rm_' + opts.name;
        var key;

        g_menu.target = dom;
        if(typeof(opts.dataKey) == 'function'){
            key = opts.dataKey(dom)
        }else
        if(dom){
            key = dom.attr(opts.dataKey);
        }

        g_menu.key = key;
        if(opts.onShow){
            if(opts.onShow(key, dom, event) === false) return;
        }
        var par = $('#' + id).attr('data-key', key).modal('open');

    }

}

g_menu.init();
var g_down = {};

function registerContextMenu(selector, callback) {
    $('body')
        .on('touchstart', selector, function(event) {
            var dom = $(this);
            g_down.start = getNow();
            g_down.element = dom;
            g_down.task = setTimeout(function() {
                if (g_down.start > 0) {
                    g_down.holding = true;
                    event.originalEvent.preventDefault(true);
                    event.originalEvent.stopPropagation();
                    callback(g_down.element, event);
                }
                g_down.start = 0;
                g_down.task = -1;

            }, 1500);
        })
        .on('touchend', selector, function(event) {
            if (g_down.task != -1) {
                clearTimeout(g_down.task);
            }
            g_down.start = 0;
            if (g_down.holding) {
                event.originalEvent.preventDefault(true);
                event.originalEvent.stopPropagation();
            }
            g_down.holding = false;
        })
        .on('contextmenu', selector, function(event) {
            var dom = $(this);
            event.originalEvent.preventDefault(true);
            event.originalEvent.stopPropagation();
            g_down.element = dom;
            callback(g_down.element, event);
        });
}