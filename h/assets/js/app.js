const g_app = {
    pege: 0,
    datas: {},
    titles: [],
    init: function() {
        let self = this;
        this.loadPage(0);
        this.io = new IntersectionObserver(
            ioes => {
                ioes.forEach(ioe => {
                    const el = ioe.target
                    const intersectionRatio = ioe.intersectionRatio
                    if (intersectionRatio > 0) {
                        if (!el.inited && intersectionRatio <= 1) {
                            el.inited = true;
                            el.querySelector('video').play();
                            //io.unobserve(el)
                        }
                    } else
                    if (el.inited) {
                        el.inited = false;
                        el.querySelector('video').pause();
                    }
                    el.onload = el.onerror = () => io.unobserve(el)
                })
            })
        g_menu.registerMenu({
            name: 'video_item',
            selector: '[data-action="item_click"]',
            dataKey: 'data-vid',
            html: g_menu.buildItems([{
                action: 'video_download',
                class: 'text-success',
                text: '下载预览',
                icon: 'download'
            }, {
                action: 'video_url',
                class: 'text-success',
                text: '打开链接',
                icon: 'link'
            }, {
                action: 'video_favorite',
                class: 'text-success',
                text: '收藏',
                icon: 'star'
            }, {
                action: 'coll_removeItem',
                class: 'text-danger',
                text: '从收藏移除',
                icon: 'trash'
            }]),
            onShow: key => {
                let item = g_coll.get(key)
                g_cache.preview = {
                    vid: key,
                    video: self.getVideo(key)
                }
                domSelector('coll_removeItem').toggleClass('hide', !item);
                domSelector('video_favorite').html(item && item.folder ? item.folder : '收藏');
            }
        });

        registerAction(['video_download', 'video_url', 'video_favorite', 'coll_removeItem'], (dom, action) => {
            let vid = g_menu.key;
            let detail = self.getVideo(vid);
            switch (action[0]) {
                case 'coll_removeItem':
                    g_coll.remove(vid);
                    break;
                case 'video_favorite':
                    doAction(dom, 'coll_list');
                    break;
                case 'video_url':
                    ipc_send('copy', detail.url);
                    break;

                case 'video_download':
                    var xhr = new XMLHttpRequest();
                    xhr.onreadystatechange = function() {
                        if (this.readyState == 4 && this.status == 200) {
                            var blobURL = window.URL.createObjectURL(this.response);
                            var anchor = document.createElement('a');
                            anchor.download = detail.title + '.mp4';
                            anchor.href = blobURL;
                            anchor.click();
                        }
                    }
                    xhr.open('GET', detail.preview);
                    xhr.responseType = 'blob';
                    xhr.send();
                    break;
            }
            g_menu.hideMenu('video_item')
        })

        registerAction('item_click', dom => {
            g_menu.showMenu('user_item', $(dom))
        })
    },
    getVideo: function(vid) {
        return this.datas[vid]
    },
    nextPage: function() {
        this.loadPage(++this.page)
    },
    prevPage: function() {
        this.loadPage(--this.page)
    },
    loadPage: function(page) {
        let self = this;
        $(`
            <h4 id="loading" class="text-center">Loading...</h4>
        `).appendTo('#video_list');
        if (page >= 0) {
            this.page = page;
            // +'?limit=5'
            fetch('https://api.avgle.com/v1/videos/' + page).then(response => {
                $('#loading').remove();
                if (response.status == 200) {
                    response.json().then(function(data) {
                        if (data.success) {
                            let h = '';
                            for (let item of data.response.videos) {
                                if (item.title.startsWith('mzdz') && self.titles.includes(item.title)) {
                                    continue;
                                }
                                self.datas[item.vid] = {
                                    title: item.title,
                                    url: item.video_url,
                                    cover: item.preview_url,
                                    preview: item.preview_video_url,
                                }
                                self.titles.push(item.title)
                                h += self.getItemHtml(item.vid, item);
                            }
                            for (let el of $('#video_list ul').append(h).find('li')) self.io.observe(el)
                        }
                    })
                }
            })
        }
    },

    getItemHtml: function(vid, item){
        return `
            <li data-action="item_click" data-vid="${vid}">
                <div class="am-gallery-item">
                    <video preload="None" poster="${item.preview_url || item.cover}" src="${item.preview_video_url || item.preview}" class="w-full" loop></video>
                    <h3 class="am-gallery-title">${item.title}</h3>
                    ${item.duration ? `<div class="am-gallery-desc">${getTime(parseInt(item.duration))} ${item.keyword}</div>` : ''}
                </div>
            </li>
        `
    }
}

g_app.init();