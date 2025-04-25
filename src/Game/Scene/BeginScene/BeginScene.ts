class BeginScene extends eui.Component implements  eui.UIComponent {
	private start_btn:eui.Button;
	private nologin_btn:eui.Button;
	private music_btn:eui.Label;

	public constructor() {
		super();
	}
	private static shared:BeginScene;
	public static getInstance(){
		if( !BeginScene.shared){
			BeginScene.shared = new BeginScene();
		}
		return BeginScene.shared;
	}
	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}

	private updateWxShare(){
		const wxsdk = WxSDK.getInstance()
		// window.history.pushState({status: 0},'?data=0')
		wxsdk.wxShare({ url:window.location.href.split('?')[0],title:'好友邀请您进行精神卫生答题小游戏' })
	}

	protected childrenCreated():void
	{
		super.childrenCreated();
		this.left = 0;
        this.right = 0;
        this.top = 0;
        this.bottom = 0;

		this.start_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,
			this.toStartScence.bind(this,false),
			this)

		this.nologin_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,
			this.toStartScence.bind(this,true),
			this)

		// 第一次进入游戏 设置
		if( Utils.Cookie.getCookie('first') ){
			Utils.Cookie.setCookie('music_play','1',365)
			Utils.Cookie.setCookie('first',1,365)
		}
		// 构造函数 加载所有音频
		const sounds = SoundManager.getInstance()

		// 判断是否分享进入
		const share = this.checkIsFriendPK()
		if(this.checkIsFriendPK()) return
		
		// 授权后 url会有token  直接进入开始界面
		const token = Utils.getQueryVariable('token')
		if( token ){
			Store.getInstance().user.token = token;
			Store.getInstance().user.role = 1
			Utils.Cookie.setCookie('token',token, 365)
			this.updateWxShare()
			SceneManager.getInstance().changeScene( StartScene.getInstance() )
		}
	}

	// nologin 判断游客进入游戏还是用户正常登陆进入游戏
	private async toStartScence(nologin = false){
		const sounds = SoundManager.getInstance()
		const store = Store.getInstance();

		const type = Utils.getQueryVariable('type')
		const target = Utils.getQueryVariable('target')
		const state = Utils.getQueryVariable('state')

		// 分享进来的用户 
		if( type === 'invite' ){
			store.share = target
		}

		// 游客登陆
		if( nologin ){
			sounds.playBgSound()
			Store.getInstance().user.role = 2
			await this.tourist()
			return
		}

		const token = Utils.getQueryVariable('token') || Utils.Cookie.getCookie('token')
		
		// 判断是否登陆了
		if( token ){
			sounds.playBgSound()
			Store.getInstance().user.role = 1
			Store.getInstance().user.token = token;
			Utils.Cookie.setCookie('token',token, 365)
			this.updateWxShare()
			SceneManager.getInstance().changeScene( StartScene.getInstance() )
			return
		}

		const loading = Loading.getInstance()
		// 获取授权地址
		loading.show()
		const res = await Http.PostRequest<{
			errcode:number,
			errmsg:string,
			url:string,
			state
		}>('/login/wechat')
		if( res.errcode === 0 ){
			window.location.href = res.url
			loading.hide()
		}else{
			alert(res.errmsg)
		}
	}
	// 游客登陆
	private async tourist(){

		const isNext = window.confirm('以游客身份登陆,游戏结束后获得的积分、金币将会清零，且不会保存游戏进度，请确认是否要选择游客模式登陆')

		if( isNext ){
			const loading = Loading.getInstance()
			loading.show()
			const res = await Http.PostRequest<{
				errcode:number,
				errmsg:string,
				token:string
			}>('/login/guest')
			loading.hide()
			if( res.errcode === 0 ){
				Store.getInstance().user.token = res.token;
				Utils.Cookie.setCookie('tpl',res.token, 1)
				SceneManager.getInstance().changeScene( StartScene.getInstance() )
			}else{
				alert(res.errmsg)
			}
		}
	}
	// 检查是不是分享过来滴
	private checkIsFriendPK(){
		const loading = Loading.getInstance();
		const store = Store.getInstance();
		const type = Utils.getQueryVariable('type')
		if( type === 'battle' ){
			const token = Utils.getQueryVariable('token')
			const target = Utils.getQueryVariable('target')
			if( token && target ){
				store.user.token = token;
				store.share = target
				Utils.Cookie.setCookie('token',token, 365)
				SceneManager.getInstance().changeScene( StartScene.getInstance() )
				return true
			}
		}
		return false
	}
}