function showModal(opts) {
    return new Promise(function(reslove, reject) {
        hideModal();
        let btns = [{
            text: '取消',
            props: 'data-am-modal-cancel'
        }, {
            text: '确定',
            props: 'data-am-modal-confirm'
        }];
        if (typeof(opts.btns) == 'function') {
            btns = opts.btns(btns);
            delete opts.btns;
        }
        opts = Object.assign({
            title: '',
            msg: '',
            btns: btns,
        }, opts)
        console.log(opts);
        if (opts.type == 'prompt') {
            opts.msg += opts.textarea != '' ? `
                <textarea class="am-modal-prompt-input">${opts.textarea || ''}</textarea>
            ` : `<input type="text" class="am-modal-prompt-input">`;
        }
        $(`
            <div class="am-modal am-modal-confirm" tabindex="-1" id="my-confirm">
                <div class="am-modal-dialog">
                    <div class="am-modal-hd">${opts.title}</div>
                    <div class="am-modal-bd" style="max-height: calc(100vh - 200px) !important;overflow-y: auto;">${opts.msg}</div>
                    <div class="am-modal-footer">
                        ` + (() => {
            let r = '';
            for (let btn of opts.btns) {
                r += `<span class="am-modal-btn" ${btn.props || ''}>${btn.text}</span>`;
            }
            return r;
        })() + `
                    </div>
                </div>
            </div>
        `).appendTo('body').modal({
            relatedTarget: this,
            onConfirm: function(options) {
                reslove(opts.type == 'prompt' ? this.$dialog.find('.am-modal-prompt-input').val() : undefined);
            },
            onCancel: function() {
                reject();
            }
        })
    })

}

function hideModal() {
    let modal = $('.am-modal-active');
   modal.modal('close');
   return modal.length;
}

// showModal({
//  type: 'prompt',
//     title: 'test',
//     textarea: true,
// }).then((s) => {
//  console.log(s)
// }, () => {
//  console.log('取消');
// })

// showModal({
//     title: 'test',
//     msg: 'hello',
// }).then(() => {
//  console.log('确定')
// }, () => {
//  console.log('取消');
// })

// showModal({
//     title: 'test',
//     msg: 'hello',
//     btns: btns => {
//         btns[0] = {
//             text: '新建',
//             props: 'data-action="test"'
//         }
//         btns[1].text = '保存';
//     }
// }).then(() => {
    
// })
