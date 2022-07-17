var g_coll = {
    list: {},
    init: function() {
        const self = this;
        registerAction('toggleClass', (dom, action) => {
            dom = $(dom).addClass(action[1]);
            dom.siblings().removeClass(action[1]);
        });

        const coll_saveTo = n => {
            self.set(g_cache.preview.vid, Object.assign(g_cache.preview.video, {
                folder: n,
            }))
            toast('保存成功', 'success');
            domSelector('coll_list').html(n);
        }

        registerAction('coll_list', (dom, action) => {
            let ret = {};
            for (let [id, item] of Object.entries(this.list)) {
                let name = item.folder || '默认';
                if (!ret[name]) ret[name] = [];
                ret[name].push(id);
            }

            //  
            var h = '';
            for (let name in ret) {
                h += `
                <li data-action="toggleClass,bg-primary" class="${ g_cache.preview && name == g_cache.preview.video.folder ? 'am-active' : ''}">
                    <span class="am-badge am-badge-success">
                    ${ret[name].length}</span>
                    <b>${name}</b>
                </li>
                 `
            }

            showModal({
                title: '选择专辑',
                msg: `<ul class="am-list am-list-static am-list-border">${h}</ul>`,
                btns: btns => {
                    btns[0] = {
                        text: '新建',
                        props: `data-action="coll_new"`
                    }
                    btns[1].text = '保存';
                    return btns;
                }
            }).then(() => {
                name = $('.am-modal-dialog .bg-primary b').html();
                if (action[1]) {
                    // 显示目录视频
                    self.coll_load(name);
                    return;
                }
                // 保存视频目录属性
                coll_saveTo(name);
            })

        });

        this.list = local_readJson('coll', {
         
        });

        registerAction('coll_new', () => {
            showModal({
                type: 'prompt',
                title: '新建专辑',
            }).then((s) => {
                if (!isEmpty(s)) {
                    coll_saveTo(s);
                }
            })
        })

        $('[data-tab-panel-coll]').html(`
            <div class="w-full">
             ${this.getHTML('coll_list,select')}

            <div class="float-end">
                <button class="am-btn" data-action="coll_menu"><span class="am-icon-caret-down"></span></button>
            </div>
            </div>
            <hr data-am-widget="divider"class="am-divider am-divider-default" />
              <div id="coll_videos" class="mt-10">
                    <ul data-am-widget="gallery" class="am-gallery am-avg-sm-1 am-avg-md-2 am-avg-lg-4 am-gallery-imgbordered">
                        
                    </ul>
                </div>
        `)
    },

    coll_save: function(key, val) {
        this.set()
    },
    coll_load: function(name) {
        domSelector('coll_list,select').html(name);
        $('#coll_videos ul').html('');

        let h = ``;
        this.keys = this.coll_items(name);
        for(let vid of this.keys){
            let item = this.list[vid];
              h += g_app.getItemHtml(vid, item);
        }
        for (let el of $('#coll_videos ul').append(h).find('li')) g_app.io.observe(el)
    },

    coll_items: function(name){
         return Object.keys(this.list).filter(key => {
            return this.list[key].folder == name;
         })
    },

    get_folder: function(key) {
        let d = this.get(key);
        return d && d.folder ? d.folder : '选择专辑';
    },

    set: function(key, vals) {
        this.list[key] = vals;
        this.save();
    },

    get: function(key) {
        return this.list[key];
    },

    remove: function(key) {
        delete this.list[key];
        domSelector({ vid: key }, '#coll_videos ').remove();
        this.save();
    },

    save: function(save = true) {
        save && local_saveJson('coll', this.list);
        this.update();
    },

    getHTML: function(action = 'coll_list', folder = '') {
        return `<span data-action="${action}" class=" am-text-lg am-badge am-badge-success">${folder || '选择专辑'}</span>`;
    },

    update: function() {
        return;
        for (let select of $('.select_coll')) {
            console.log($(select).next());
            $(select).next().remove(); // 移除生成的dropdown
            $(select).replaceWith(this.getHTML(select.dataset.change));
        }
        $('.select_coll[data-am-selected]').selected();
    }
}
g_coll.init();