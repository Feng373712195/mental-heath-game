class StartScene extends CommonScene{
	// 游戏活动提示
	private activity_tip:eui.Group;
	private get_credit:eui.Label;
	private user_count:eui.Label;

	private init = false;

	private push_key_btn:eui.Image;
	private bottom_nav:eui.Group;
	private menu_warp:eui.Scroller;
	private menu:eui.Group;
	private menu_item_1:eui.Group;
	private menu_item_2:eui.Group;
	private menu_item_3:eui.Group;
	private menu_item_4:eui.Group;
	private menu_item_5:eui.Group;

	// 底部导航按钮
	private bottom_nav_1:eui.Group
	private bottom_nav_2:eui.Group
	private bottom_nav_3:eui.Group
	private bottom_nav_4:eui.Group

	// 用户信息
	private user_avatar:eui.Image
	private user_avatar_border:eui.Rect
	private user_level:eui.Label
	private user_name:eui.Label
	private user_key:eui.Label
	private progree_color:eui.Rect;
	private money:eui.Label
	private credit:eui.Label

	// 音乐控制开关
	private music_btn:eui.Image;

	public constructor() {
		super();
	}

	private static shared:StartScene;
	public static getInstance(){
		if( !StartScene.shared){
			StartScene.shared = new StartScene();
		}
		return StartScene.shared;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
		RES.getResAsync("start")
	}
	
	protected childrenCreated():void
	{
		
		// 游客状态
		if( Store.getInstance().user.role === 2 ){
			this.menu_item_4.visible = false;
			this.menu_item_5.visible = false;
			this.menu_warp.scrollPolicyV = 'off';
			// this.activity_tip.visible = false
		}
		

		super.childrenCreated();

		 var search = document.getElementById('search')
		window.addEventListener('readyQuestion',(event: Event & { question:any })=>{
			const gameScene = GameScene.getInstance()
			SceneManager.getInstance().pushScene(gameScene)
			console.log( event , event.question )
			gameScene.readyQuestion(event.question)
			const timer = setTimeout(()=>{
				search.style.zIndex = '-999';
				clearTimeout(timer)
			},16.7)
		})
		
		this.setBackGround(
			this.user_avatar_border,
			[0x72F6C6,0x16D1D3],
			20
		)
		
		// LevelUpMessageBox.getInstance().showMessage();
		
		let hLayout:eui.HorizontalLayout = new eui.HorizontalLayout();
		hLayout.horizontalAlign = egret.HorizontalAlign.JUSTIFY;
		this.bottom_nav.layout = hLayout;

		this.music_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.ctrlMusic,this)
		RES.getResAsync(SoundManager.isMusic ? 'music_open_png': 'music_close_png').then(res=>{
			 this.music_btn.source = res
		})

		this.user_level.addEventListener(egret.TouchEvent.TOUCH_TAP,
			this.toAboutLevel,this)

		this.menu_item_1.addEventListener(egret.TouchEvent.TOUCH_TAP,
			this.toRankingList,this);

		this.menu_item_2.addEventListener(egret.TouchEvent.TOUCH_TAP,
			this.toPK,this);

		this.menu_item_3.addEventListener(egret.TouchEvent.TOUCH_TAP,
			this.toYB,this);
		
		this.menu_item_5.addEventListener(egret.TouchEvent.TOUCH_TAP,
			this.toSearch,this)
		
		this.push_key_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,
			this.toShoppingMail,this)
		
		this.bottom_nav_1.addEventListener(egret.TouchEvent.TOUCH_TAP,
			this.toRank,this);

		this.bottom_nav_2.addEventListener(egret.TouchEvent.TOUCH_TAP,
			this.toShoppingMail,this);
		
		this.bottom_nav_3.addEventListener(egret.TouchEvent.TOUCH_TAP,
			this.toService,this);

		this.bottom_nav_4.addEventListener(egret.TouchEvent.TOUCH_TAP,
			this.toAbout,this);

		this.activity_tip.addEventListener(egret.TouchEvent.TOUCH_TAP,()=>{
			const webview = this.webview(`http://192.168.8.145:8081/activity/01/`);
			// http://mhg-h5.yeezhan.com/activity/01/index.html 
			// http://192.168.8.145:8081/activity/01/ 
			// http://mhg-h5.yeezhan.com/activity/01/index.html
			webview.onload = () => {
				// console.log('onload~~~')
				webview.contentWindow.postMessage({ methods:'sendToken',
					width:document.body.clientWidth,
					height:document.body.clientHeight,
					token:Store.getInstance().user.token 
				},`*`)
			}
		},this)	
	}

	public async onShow(){
		const store = Store.getInstance()
		// Loading.getInstance().show()

		Http.GetRequest<{
			errcode:number,
			errmsg:string,
			invite:any
		}>('/prize/index')
		.then(res=>{
			if( res.errcode === 0 ){
				let { invite } = res
				this.user_count.text = `邀请好友${invite.userCount}人` 
				this.get_credit.text = `获得积分${invite.credit}人`
			}
		})

		const res = await Http.GetRequest<{
			errcode:number,
			errmsg:string,
			message:{ before:any,after:any },
			modules,
			// 是否展示奖励
			signinBonus,	
			signinCredit,
			user:{ [key in string]:any }
		}>('/home')
		if( res.errcode === 0 ){

			store.user =  { 
				...store.user ,
				...res.user,
			}

			// 游客状态
			if( Store.getInstance().user.role === 2 ){
				this.menu_item_4.visible = false;
				this.menu_item_5.visible = false;
				this.menu_warp.scrollPolicyV = 'off';
			}

			// 前往PK页
			if( store.share ){
				// Loading.getInstance().hide()
				const s = PkScene.getInstance();
				SceneManager.getInstance().pushScene(s)
				// 延时打开PK等待弹窗 反正偏移
				const timer = setTimeout(()=>{
					s.showPkWait(2)
					clearTimeout(timer)
				},600)
				return;
			}

			const {
				// 是否展示一些模块
				modules,
				// 是否展示奖励
				signinBonus,	
				signinCredit,
				user:{
					money,
					credit,
					nickname,
					avatar,
					key_count,
					rank,
					total_key_count,
					message,
				}
			} = res

			this.menu_item_4.visible = modules.indexOf('special') !== -1 ? true : false;
			if(  modules.indexOf('search') !== -1 ){
				this.menu_item_5.visible = true
				if( modules.length === 1 ) this.menu_item_4.height = 0
			}
			else{
				this.menu_item_5.visible = false
				if( modules.length === 1 ) this.menu_item_4.height = 145
			}
			this.menu_warp.scrollPolicyV = modules.length > 0 ? 'on' : 'off';
			

			if( !this.init ){
				Utils.ImageLoader(avatar).then(res=>{
					this.user_avatar.source = res
				})
				if( signinBonus ){
					const messagebox = LoginInMessageBox.getInstance();
					messagebox.showMessage();
					messagebox.setCredit(signinCredit)
				}
			}

			// 升级提示弹窗
			if( res.message ){
				const messagebox = LevelUpMessageBox.getInstance();
				messagebox.showMessage();
				messagebox.setUpLevel(res.message.before.name , res.message.after.name)
			}

			this.user_name.text = nickname
			if( rank ){
				this.user_level.text = rank.name
				const progress = credit/rank.credit
				this.progree_color.width = 	179 * (progress > 1 ? 1 : progress)	
			}
			this.user_key.text = `${key_count}/${total_key_count}`

			this.money.text = Utils.formatNum(money)
			this.credit.text = Utils.formatNum(credit)
			this.init = true
		}else{
			alert(res.errmsg)
		}
		
		// Loading.getInstance().hide()
	}

	private webview(url){
		const webview = document.getElementById('webview');
		const iframe = document.createElement('iframe') as HTMLIFrameElement
		iframe.src = url
		iframe.id = "webview-iframe"
		iframe.scrolling = 'yes'
		webview.appendChild(iframe)
		webview.style.display = 'block'
		return iframe
	}
	// 音乐控制
	ctrlMusic(){
		SoundManager.isMusic = !SoundManager.isMusic;
		const sounds = SoundManager.getInstance() 
		if(SoundManager.isMusic){
			sounds.playBgSound()
		}else{
			sounds.stopBgSound()
		}
		 RES.getResAsync(SoundManager.isMusic ? 'music_open_png': 'music_close_png').then(res=>{
			 this.music_btn.source = res
		 })
	}
	private toRankingList(){
		SceneManager.getInstance().pushScene( RankingListScene.getInstance() );
	}

	private toYB(){
		SceneManager.getInstance().pushScene( ChooseTypeScene.getInstance() );
	}

	private toPK(){
		SceneManager.getInstance().pushScene( PkScene.getInstance() );
	}
	
	private toShoppingMail(){
		SceneManager.getInstance().pushScene( ShoppingMallScene.getInstance() )
	}

	private toRank(){
		SceneManager.getInstance().pushScene( RankScene.getInstance() )
	}

	private toAbout(){
		SceneManager.getInstance().pushScene( AboutScene.getInstance() )
	}

	private toService(){
		SceneManager.getInstance().pushScene( ServiceScene.getInstance() )
	}

	private toAboutLevel(){
		SceneManager.getInstance().pushScene( AboutLevelScene.getInstance() )
	}

	private toSearch(){
		var search = document.getElementById('search')
		search.style.display = "block"
		// console.log( 'toSearch'  )
		// SceneManager.getInstance().pushScene( SearchScene.getInstance() )
	}
}