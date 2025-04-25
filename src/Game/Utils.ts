class Utils{
    // 加载网络图片
    static ImageLoader(url){
        return new Promise<egret.Texture>((res,rej)=>{
            let imgLoader = new egret.ImageLoader();
            imgLoader.crossOrigin = "anonymous";// 跨域请求
            imgLoader.load(url);// 去除链接中的转义字符        
            imgLoader.once(egret.Event.COMPLETE, (evt: egret.Event) => {
                if (evt.currentTarget.data) {
                    // egret.log("加载图片成功: " + evt.currentTarget.data);
                    let texture = new egret.Texture();
                    texture.bitmapData = evt.currentTarget.data;
                    // 示例
                    // img.source = texture;
                    res(texture)
                }
            }, this);  
            imgLoader.once(	egret.IOErrorEvent.IO_ERROR,()=>{
                rej()
            },this)
        })
    }

    // 获取网页参数
    static getQueryVariable(variable: string) {
        const query = window.location.search.substring(1)
        const vars = query.split('&')
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0;i<vars.length;i++) {
            const pair = vars[i].split('=')
            if (pair[0] === variable){return pair[1]}
        }
        return undefined
    }

    // 数字转中文
    static noToChinese(num) {
        if (!/^\d*(\.\d*)?$/.test(num)) {
            alert("Number is wrong!");
            return "Number is wrong!";
        }
        let AA = new Array("零", "一", "二", "三", "四", "五", "六", "七", "八", "九");
        let BB = new Array("", "十", "百", "千", "万", "亿", "点", "");
        let a = ("" + num).replace(/(^0*)/g, "").split("."),
            k = 0,
            re = "";
        for (let i = a[0].length - 1; i >= 0; i--) {
            switch (k) {
                case 0:
                    re = BB[7] + re;
                    break;
                case 4:
                    if (!new RegExp("0{4}\\d{" + (a[0].length - i - 1) + "}$").test(a[0]))
                        re = BB[4] + re;
                    break;
                case 8:
                    re = BB[5] + re;
                    BB[7] = BB[5];
                    k = 0;
                    break;
            }
            if (k % 4 == 2 &&  (a[0].charAt(i + 2) as any) != 0 && (a[0].charAt(i + 1) as any) == 0) re = AA[0] + re;
            if ( (a[0].charAt(i) as any ) !== 0) re = AA[a[0].charAt(i)] + BB[k % 4] + re;
            k++;
        }
        if (a.length > 1) //加上小数部分(如果有小数部分) 
        {
            re += BB[6];
            for (var i = 0; i < a[1].length; i++) re += AA[a[1].charAt(i)];
        }
        return re;
    };

    static showToast(msg,duration){  
        duration=isNaN(duration)?3000:duration;  
        var m = document.createElement('div');  
        m.innerHTML = msg;  
        m.style.cssText="width:60%; min-width:180px; background:#000; opacity:0.6; height:auto;min-height: 30px; color:#fff; line-height:30px; text-align:center; border-radius:4px; position:fixed; top:60%; left:20%; z-index:999999;";  
        document.body.appendChild(m);  
        setTimeout(function() {  
            var d = 0.5;  
            m.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in';  
            m.style.opacity = '0';  
            setTimeout(function() { document.body.removeChild(m) }, d * 1000);  
        }, duration);  
    }  

    // 文字省略号
    getChar(_str: string,_len: number): string {
        var _ba: egret.ByteArray = new egret.ByteArray;
        _ba.writeUTFBytes(_str);
        if(_ba.length < _len) return _str;
        _ba.position = 0;
        return _ba.readUTFBytes(_len) + "...";
    }
    
    // 千位分割
   static formatNum (num:number) {
        var reg=/\d{1,3}(?=(\d{3})+$)/g; 
        return (num + '').replace(reg, '$&,');
    }

    // Cookie
    static Cookie = {
       setCookie: function (c_name,value,expiredays){
            var exdate=new Date()
            exdate.setDate(exdate.getDate()+expiredays)
            document.cookie=c_name+ "=" + encodeURI(value)+
            ((expiredays==null) ? "" : ";expires="+ (exdate as any).toGMTString())
        },    
        //取回cookie
        getCookie: function (c_name){
            if (document.cookie.length>0){
                let c_start=document.cookie.indexOf(c_name + "=")
                if (c_start!=-1){ 
                    c_start=c_start + c_name.length+1 
                    let c_end=document.cookie.indexOf(";",c_start)
                    if (c_end==-1) c_end=document.cookie.length
                    return decodeURI(document.cookie.substring(c_start,c_end))
                } 
            }
            return ""
        }
    }

}