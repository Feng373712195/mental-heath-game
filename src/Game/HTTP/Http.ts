const BASE_URL = '//mental.api.linkyee.com'

const mork_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNWVmY2EyYjg1YjRkNDkxMjBkZWNhMjgxIiwibmlja25hbWUiOiLkvY7osIPlk6UiLCJhdmF0YXIiOiJodHRwOi8vdGhpcmR3eC5xbG9nby5jbi9tbW9wZW4vdmlfMzIvbmd6ZjJ4b0taWHVJcmg4VFlGZkxGWDZqcGlhTTE1RVY1R3lqYWE1Wjk5dHRBNUJzNGVZVWZ4WWpmT2ljWEZpY0xEaGdrSzFpYWZvdHlCZE15UDZvSzlqUDJBLzEzMiIsInVzZXJuYW1lIjoib2tKM0p3Sm85LW1aMTVVQ2w4RFBRVEo3bVZFYyIsImlhdCI6MTU5NDU2Mjg5NH0.RpHfndDhYsyWdHqwpxJ7FaF-QVnTT-5fzAO7-YoEWiY"

module Http {
        // 数据处理
    function querify(object = {}){
        const keys = Object.keys(object);
        const result = keys.reduce((prev,current)=>{
            prev += `&${ current }=${ object[current] }`;
            return prev;   
        },'').slice(1)
        return result;
    }
    export function PostRequest<T>(uri,params:Object = {}){
        return new Promise<T>((resolve,reject)=>{
            var request = new egret.HttpRequest();
            request.responseType = egret.HttpResponseType.TEXT;
            // 设置为POST请求
            request.open(BASE_URL + uri , egret.HttpMethod.POST);
            request.setRequestHeader("Accept","application/json");
            request.setRequestHeader("Content-Type","application/json");
            // request.setRequestHeader("Authorization","Bearer " + mork_token);
            const token = Store.getInstance().user.token
            if(token){
                request.setRequestHeader("Authorization","Bearer " + Store.getInstance().user.token);
            }
            let keys = Object.keys(params);
            // if( needToken ){
            //     params["token"] = egret.localStorage.getItem("token");
            // }

            // 调用querify处理并绑定传送到服务区的数据
            // let str = querify(params);

            request.send(JSON.stringify(params));
            
            request.addEventListener(egret.Event.COMPLETE,(event:egret.Event)=>{
                var request = <egret.HttpRequest>event.currentTarget;
                const res = JSON.parse(request.response)
                if( res.errcode === -1 && (res.errmsg === '未登录' || res.errmsg === 'jwt malformed')   ){
                    Utils.Cookie.setCookie('token','',1)
                    SceneManager.getInstance().changeScene(BeginScene.getInstance())
                }
                 resolve(res)
            },this);
            
            request.addEventListener(egret.IOErrorEvent.IO_ERROR,(event:egret.Event)=>{
                const res = JSON.parse(request.response)
                // 关闭全局加载
                Loading.getInstance().hide()
                alert(res.errmsg)
                reject(res)
            },this);

            // request.addEventListener(egret.ProgressEvent.PROGRESS,this.onGetProgress,this);
        })
    }
    export function GetRequest<T>(uri){
        return new Promise<T>((resolve,reject)=>{
            var request = new egret.HttpRequest();
            request.responseType = egret.HttpResponseType.TEXT;
            // request.setRequestHeader("Authorization","Bearer " + mork_token);
            const token = Store.getInstance().user.token
            if(token){
                request.setRequestHeader("Authorization","Bearer " + Store.getInstance().user.token);
            }
            request.open(BASE_URL + uri , egret.HttpMethod.GET);
            request.send();

            request.addEventListener(egret.Event.COMPLETE,(event:egret.Event)=>{
                var request = <egret.HttpRequest>event.currentTarget;
                const res = JSON.parse(request.response)
                if( res.errcode === -1 && res.errmsg === '未登录' || res.errmsg === 'jwt malformed'){
                    Utils.Cookie.setCookie('token','',1)
                    SceneManager.getInstance().changeScene(BeginScene.getInstance())
                }
                resolve(res)
            },this);

            request.addEventListener(egret.IOErrorEvent.IO_ERROR,(event:egret.Event)=>{
                const res = JSON.parse(request.response)
                // 关闭全局加载
                Loading.getInstance().hide()
                alert(res.errmsg)
                reject(event)
            },this);
        })
    }
}