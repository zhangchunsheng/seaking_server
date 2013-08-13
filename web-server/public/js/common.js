(function(window,$,undefined){
    var returnFalse=function(){
        return false;
    }
    window.dp={
        validForm:function(items,form){
            var cfg,os,valid,type;
            form=Duopao(form||document);
            for(var i=0,j=items.length;i<j;i++){
                /* {
                 'field':'uname',
                 'valid':{
                 'noempty':'用户名不能为空！'
                 }
                 }
                 */
                cfg=items[i];
                os=Duopao('[name='+cfg['field']+']',form);
                valid=cfg['valid'];
                if(os.length && valid){
                    for(type in valid){
                        switch(type){
                            case 'noempty':
                                var tn=os.nodeName(),
                                    tp=os.attr('type')||'';
                                if(tn=='input'||tn=='textarea'){
                                    if(tp=='checkbox'||tp=='radio'){
                                        if(!os.filter(':checked').length){
                                            alert(valid[type]);
                                            return false;
                                        }
                                    }else if(os.val()==''){
                                        alert(valid[type]);
                                        os.focus();
                                        return false;
                                    }
                                }else if(tn=='select'){
                                    if(os[0].options[0].value==os.val()){
                                        alert(valid[type]);
                                        os.focus();
                                        return false;
                                    }
                                }
                                break;
                            case 'sameto':
                                var pr=Duopao('[name='+valid[type][0]+']',form);
                                if(os.val()!==pr.val()){
                                    alert(valid[type][1]);
                                    os.focus();
                                    return false;
                                }
                                break;
                            case 'isemail':
                                if(!Duopao.isEmail(os.val())){
                                    alert(valid[type]);
                                    os.focus();
                                    return false;
                                }
                                break;
                            case 'minlength':
                                if(os.val().length<parseInt(valid[type][0])){
                                    alert(valid[type][1]+'(已输入'+os.val().length+'个字符)');
                                    os.focus();
                                    return false;
                                }
                                break;
                            case 'maxlength':
                                if(os.val().length>parseInt(valid[type][0])){
                                    alert(valid[type][1]+'(已输入'+os.val().length+'个字符)');
                                    os.focus();
                                    return false;
                                }
                                break;
                            case 'singlechar':
                                if(!/^[a-z][0-9a-zA-Z_\-]*$/gi.test(os.val())){
                                    alert(valid[type]);
                                    os.focus();
                                    return false;
                                }
                                break;
                            case 'isnumber':
                                if(!/^[0-9\.]+$/gi.test(os.val())){
                                    alert(valid[type]);
                                    os.focus();
                                    return false;
                                }
                                break;
                            case 'minNum':
                                if(parseFloat(os.val())<parseFloat(valid[type][0])){
                                    alert(valid[type][1]);
                                    os.focus();
                                    return false;
                                }
                                break;
                            case 'maxNum':
                                if(parseFloat(os.val())>parseFloat(valid[type][0])){
                                    alert(valid[type][1]);
                                    os.focus();
                                    return false;
                                }
                                break;
                            default:break;
                        }/* switch end */
                    }/* for(type in valid) end */
                }
            }
            return true;
        },
        /** 遮罩组件
         * by qiqiboy 2012/11/8
         *
         * @param object cfg {color:#fff,opacity:0.8}
         * var mycover=dp.cover(cfg);
         * 隐藏 mycover.hide();
         * 显示 mycover.show();
         * 隐藏并删除 mycover.remove();
         * 重置尺寸位置 mycover.resize();
         */
        cover:function(cfg){
            if(!(this instanceof dp.cover)){
                return new dp.cover(cfg);
            }
            cfg=cfg||{};
            this.color=cfg.color||'white';
            this.zIndex=cfg.zIndex||dp.cover.prototype.zIndex++;
            this.opacity=Duopao.isNumeric(cfg.opacity)?parseFloat(cfg.opacity):0.8;
            this.board=Duopao('<div>',{'class':'dpcover'}).css({zIndex:this.zIndex,position:'absolute',top:0,left:0,opacity:this.opacity,backgroundColor:this.color,display:'none'}).appendTo('body').touchmove(returnFalse);
            this.show();
            this.resize();
            var _this=this;
            this.resizeHandle=function(){_this.resize();}
            Duopao(window)[Duopao.resizeEvent](this.resizeHandle);
        },
        /** loading组件
         * by qiqiboy 2012/11/8
         *
         * @param string text 显示的文字
         * var myloading=dp.loading(text);
         * 隐藏 myloading.hide();
         * 显示 myloading.show();
         * 隐藏并删除 myloading.remove();
         * 重置尺寸位置 myloading.resize();
         */
        loading:function(text){
            if(!(this instanceof dp.loading)){
                return new dp.loading(text);
            }
            this.text=text||'';
            var css={backgroundColor:'black',position:'fixed',zIndex:dp.loading.prototype.zIndex++,textAlign:'center',paddingTop:'85px',lineHeight:'20px',fontSize:'12px',color:'#fff',width:'120px',height:'35px',display:'none'};
            css['border-radius']='10px';
            this.board=Duopao('<div>',{'class':'dploading'}).css(css).appendTo('body').html(this.text).touchmove(returnFalse);
            this.show();
            this.resize();
            var _this=this;
            this.resizeHandle=function(){_this.resize();}
            Duopao(window)[Duopao.resizeEvent](this.resizeHandle);
        }
    }
    dp.cover.prototype={
        zIndex:8000,
        show:function(){
            var op=this.opacity;
            this.board.stop().fadeIn(400,function(){
                Duopao(this).css('opacity',op);
            });
        },
        hide:function(){
            this.board.stop().fadeOut();
        },
        remove:function(){
            var _this=this;
            this.board.fadeOut(400,function(){
                _this.board.remove();
                Duopao(window).unbind([Duopao.resizeEvent],_this.resizeHandle);
            });
        },
        resize:function(){
            this.board.css({width:'100%',height:'100%'}).width(Duopao(document).scrollWidth()).height(Duopao(document).scrollHeight());
        }
    }

    dp.loading.prototype={
        zIndex:9000,
        show:function(){
            this.board.stop().fadeIn(400);
        },
        hide:function(){
            this.board.stop().fadeOut();
        },
        remove:dp.cover.prototype.remove,
        resize:function(){
            this.board.css({left:(Duopao(document).clientWidth()-120)/2+'px', top:(Duopao(document).clientHeight()-120)/2+'px'});
        }
    }
    $(document).ready(function(){
        //幻灯
        if(window.TouchSlider && $('#slider').length>0){
            var slider=new TouchSlider({
                id:'sliderlist',
                before:function(index){
                    $('#slidernavi span:nth-child('+(start+1)+')').removeClass('active');
                    $('#slidernavi span:nth-child('+(index+1)+')').addClass('active');
                    start=index;
                }
            }), start=0;
            $('#slidernavi span').click(function(){
                slider.slide($(this).index());
                return false;
            }).eq(start).addClass('active');
        }
        //tab切换
        $('.tabs').each(function(){
            var btn=$(this).find('.btn>a'),
                cts=$(this).find('.cts>div'),
                current=0;
            btn.click(function(){
                btn.eq(current).removeClass('active');
                cts.eq(current).hide();
                current=$(this).index();
                btn.eq(current).addClass('active');
                cts.eq(current).fadeIn();
                return false;
            });
        });
        var ranloading,ranktemp={},
            getRank=function(obj){
                var str='<div class="ct">';
                $.each(obj,function(i){
                    str+='<div><span>'+obj[i].level+'</span>'+obj[i].name+'</div>';
                });
                str+='</div>';
                return str;
            }
        $('#select>select').change(function(){
            var server=parseInt(this.value);
            if(!ranktemp[server])ranktemp[server]={};
            else{console.log(ranktemp[server])
                $('#phtab>.cts>div').eq(0).html(getRank(ranktemp[server].levelrank));
                $('#phtab>.cts>div').eq(1).html(getRank(ranktemp[server].scorerank));
                return false;
            }
            $.ajax(this.parentNode.getAttribute('action')||'',{
                method:'get',
                send:{server:server},
                dataType:'json',
                before:function(){
                    if(!ranloading)ranloading=dp.loading('请稍等...');
                    else ranloading.show();
                },
                error:function(str){
                    alert(str);
                },
                success:function(data){
                    if(data.levelrank){
                        ranktemp[server].levelrank=data.levelrank;
                        $('#phtab>.cts>div').eq(0).html(getRank(data.levelrank));
                    }
                    if(data.scorerank){
                        ranktemp[server].scorerank=data.scorerank;
                        $('#phtab>.cts>div').eq(1).html(getRank(data.scorerank));
                    }
                },
                after:function(){
                    ranloading.hide();
                }
            });
            return false;
        });

        //顶部切换
        if(window.TouchSlider && $('#sliderlist1').length>0){
            var slider1=new TouchSlider({
                id:'sliderlist1',
                auto:-1,
                before:function(index){
                    $('#th .navi a:nth-child('+(start1+1)+')').removeClass('active');
                    $('#th .navi a:nth-child('+(index+1)+')').addClass('active');
                    start1=index;
                }
            }), start1=0;
            $('#th .navi a').click(function(){
                slider1.slide($(this).index());
                return false;
            }).eq(start1).addClass('active');
        }

        //火球效果
        $('#play').each(function(){
            var elem=$(this).find('span'),
                timer,current=0,up=true,
                run=function(){
                    elem.css('background-position',-current*250+'px 0px');
                    up?current++:current--;
                    if(current==9){
                        up=false;
                    }else if(current==0){
                        up=true;
                    }
                    timer=setTimeout(run,200);
                }
            run();
        });

        //登录注册
        var proxy=$('<iframe>',{id:'loginproxy',style:'display:none;',src:_CONFIG.blank}).appendTo('body').load(function(){
            proxy.win=proxy[0].contentWindow;
            proxy.doc=proxy[0].contentDocument||proxy[0].contentWindow.document;
            proxy.loadready=true;
        }),cover,loading;
        $('#login form,#sign form').submit(function(evt){
            if(!proxy.loadready){
                alert('页面异常，请刷新页面重试！');
                return false;
            }
            var valid=$(this).attr('valid'),
                send={};
            if(valid && window[valid]){
                if(!dp.validForm(window[valid])){
                    return false;
                }
            }
            for(var i=0;i<this.length;i++){
                if(this[i].name)
                    send[this[i].name]=this[i].value;
            }
            console.log(this.getAttribute('action'))
            proxy.win.Duopao.ajax(this.getAttribute('action')||'',{
                method:'post',
                send:send,
                dataType:'json',
                before:function(){
                    if(!cover)cover=dp.cover({color:'#000',opacity:0.5});
                    else cover.show();
                    if(!loading)loading=dp.loading('请稍等...');
                    else loading.show();
                },
                error:function(str){
                    alert(str);
                },
                success:function(data){
                    if(data.flag && data.flag=='f0'){
                        data.url?window.location.href=data.url:window.location.reload();
                    }else{
                        alert(data.msg||'登录失败！');
                    }
                },
                after:function(){
                    loading.hide();cover.hide();
                }
            });
            return false;
        });

    });
})(window,Duopao);