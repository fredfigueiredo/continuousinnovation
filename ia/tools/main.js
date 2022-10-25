window.app = {
    config : {
        pageSize : 4 //sets the number of tools to fetch at a time
    },

    data : {
        toolshs : {},
        tools : [],
        end : false,
        pageNumber : 0 //inter
    },

    paginate : function(array, page_number) {
        // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
        return array.slice((page_number - 1) * this.config.pageSize, page_number * this.config.pageSize);
    },
      
    load : function(){
        if(this.data.end) return;
        this.loadData().then(function(r){
            app.data.end = r.tools.length == 0;

            //load all tools
            $.each(r.tools, function(i, o){
                let x = o.tags.split(',');
                for(var i = 0; i < x.length; i++){
                    let tag = x[i].trim();
                    if(typeof(app.data.toolshs[tag]) != 'undefined') continue;

                    app.data.toolshs[tag] = true;
                    app.data.tools.push(tag);
                }
            });

            //render menu
            $.each(app.data.tools, function(i, o){
                if($('[data-tool="' + o + '"]').length) return;
                let btTpl = $('#tool-bt-template').html();
                btTpl = btTpl.replace('{{value}}', o);
                btTpl = btTpl.replace('{{value}}', o);
                let bt = $(btTpl).click(function(e){
                    app.events.toolSelected(o, $(this));
                });
                $('.sg-tools').append(bt);
            });

            r.tools = app.paginate(r.tools, ++app.data.pageNumber);
            $.each(r.tools, function(i, o){
                o.status = o.status || ' '; 
                let tpl = $('#tool-template').html();
                tpl = tpl.replace(/\{\{([^}]+)\}\}/g, function(all, key) {
                    return o[key] || all;
                });

                let el = $(tpl);
                el.find('.sg-openmodal').click(function(e){
                    app.events.openTool(o, el);
                });
                $('.tools-container').append(el);
            });
        });
    },

    init : function(){
        this.load();

        $(document).scroll(function () {
            if (!app.data.end && window.app.isScrolledToBottom($('#sg-content'))) {
                app.load();
            }
        });
    },

    isScrolledToBottom() {
        if( (window.scrollY + window.innerHeight) >= 350-(document.documentElement.scrollHeight - $('.footer').height()) ){
            return true;
        }
        return false;
    },

    loadData: function(){
        return new Promise((resolve, reject) => {
            fetch('./data.json')
            .then((data) => {
                data.json()
                    .then((response) => {

                        resolve(response);
                    })
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            })
        })
    },

    events: {
        tools : {},
        toolSelected : function(o,el){
            if(el.hasClass('active')){
                delete this.tools[o];
                el.removeClass('active');
                if(Object.keys(this.tools).length == 0){
                    $('.sg-tool').fadeIn('fast');
                    $('.sg-tool').show();
                    return;
                }
            }else{
                this.tools[o] = o;
                el.addClass('active');
            }

            $('.sg-tool').hide();

            let that = this;
            $('.sg-tool').each(function(j, o){
                var tags = $(o).data('category').split(',')
                for(var i = 0; i < tags.length; i++){
                    let tag = tags[i].trim();
                    if(typeof(that.tools[tag]) != "undefined") {
                        $(o).fadeIn('fast');
                    }
                }
            });
        },
        openTool : function(o,el){
            let tpl = $('#tool-detail-template').html();
            tpl = tpl.replace(/\{\{([^}]+)\}\}/g, function(all, key) {
                return o[key] || all;
            });
            let obj = $(tpl);
            let vtpl = '';
            if(o.imageUrl.indexOf('youtube.com')!=-1){
                vtpl = $('#tool-video-template').html().replace('{{value}}', o.imageUrl);
            } else {
                vtpl = $('#tool-img-template').html().replace('{{value}}', o.imageUrl);
            }
            obj.find('.sg-tool-media').append($(vtpl));
            $('.modal-body').empty().append(obj);
            $('#modal').modal('show');
        }
    }
}

$(document).ready(function(){
    app.init();
});
