// TypeScript file
class WxSDK {
    private static shared:WxSDK;
    private shareAppMessageBody = new BodyMenuShareAppMessage()
    private shareTimelineBody = new BodyMenuShareTimeline();

	public static getInstance(){
		if( !WxSDK.shared){
			WxSDK.shared = new WxSDK();
		}
		return WxSDK.shared;
	}
    constructor(){

    }
    public async init(){
        const config = await this.getWxConfig()
        var bodyConfig: BodyConfig = new BodyConfig();
        bodyConfig.appId = config.appId;
        bodyConfig.timestamp = config.timestamp;
        bodyConfig.nonceStr = config.nonceStr;
        bodyConfig.signature = config.signature;
        bodyConfig.debug = false;
        bodyConfig.jsApiList = ['checkJsApi',
        'hideMenuItems',
        'onMenuShareAppMessage',
        'onMenuShareTimeline',
        'updateAppMessageShareData',
        'updateTimelineShareData'];
        if( wx ){
            wx.previewImage
            wx.config(bodyConfig);
            wx.ready(() => {
                // 分享到朋友圈
                wx.onMenuShareAppMessage(this.shareAppMessageBody);
                //分享给朋友圈
                wx.onMenuShareTimeline(this.shareTimelineBody);

                // 隐藏菜单按钮
                wx.hideMenuItems({
                    "menuList":[
                        "menuItem:share:qq",
                        "menuItem:share:QZone",
                        "menuItem:favorite",
                        "menuItem:share:facebook",
                        "menuItem:share:QZone",
                        "menuItem:jsDebug",
                        "menuItem:copyUrl",
                        "menuItem:originPage",
                        "menuItem:openWithQQBrowser",
                        "menuItem:openWithSafari",
                        "menuItem:share:email",]
                })
            })
            wx.error(() => {
                console.log('wxsdk 失败')
            })
        }
    }
    public async getWxConfig(){
         const res = await Http.PostRequest<{
            errcode:number
            errmsg:string,
            jssdk:any
         }>('/battle/share',{
             "url": encodeURIComponent(window.location.href)
            //  "http://mhg-h5.yeezhan.com"
         })
        if( res.errcode === 0 ){
            return res.jssdk
        }else{
            alert(res.errmsg)
        }
    }
    public async wxShare({ title = '',desc = '',url = '' }){
        const shera_img = 'http://mhg-h5.yeezhan.com/resource/assets/images/share/share_img.jpg'

        this.shareAppMessageBody.title = title;
        this.shareAppMessageBody.desc = desc;
        this.shareAppMessageBody.link = url
        this.shareAppMessageBody.imgUrl = shera_img

        this.shareTimelineBody.title = title;
        this.shareTimelineBody.link = url
        this.shareTimelineBody.imgUrl = shera_img
        
        // encodeURIComponent(url);
        // wx.ready(()=>{
            // wx.updateAppMessageShareData(this.shareAppMessageBody);
            // wx.updateTimelineShareData(this.shareTimelineBody);
            // wx.onMenuShareAppMessage(this.shareAppMessageBody);
            //分享给朋友圈
            // wx.onMenuShareTimeline(this.shareTimelineBody);
        // })
    }
}