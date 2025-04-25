


// 在线匹配对战

// 匹配中
const matchingState = {
	type:1,
	state:1,
	tip:'一大波儿对手正在赶来...',
	waittip:'已等待中:',
	rival:{
		"_id":"",
		"nickname":"",
		"avatar":""
	},
	btnState:0,
	nextState(){
		return matchrResolveState
	}
}

// 已经匹配到对手
const matchrResolveState = {
	type:1,
	state:2,
	tip:'匹配成功，对手未就绪...',
	waittip:'倒计时:',
	btnState:2,
	nextState(){
		return false
	}
}

// 对手已经准备
const matchrReadyState = {
	type:1,
	state:3,
	tip:'对手已就绪',
	waittip:'倒计时:',
	isrival:true,
	btnState:2,
	nextState(){
		return false
	}
}

// 自己已经准备
const selfReadyState = {
	type:1,
	state:3,
	tip:'等待对手就绪',
	waittip:'倒计时:',
	isrival:false,
	btnState:2,
	nextState(){
		return false
	}
}

// 微信好友对战

// 等待好友
const waitFirendsState = {
	type:2,
	state:1,
	tip:'等待好友加入',
	rival:{
		"_id":"",
		"nickname":"",
		"avatar":""
	},
	btnState:0,
	nextState(){
		return waitFirendsResolveState
	}
}
// 好友已加入
const waitFirendsResolveState = {
	type:2,
	state:2,
	tip:'好友已加入',
	rival:{
		"_id":"",
		"nickname":"",
		"avatar":""
	},
	btnState:1,
	nextState(){
		return false
	}
}

// 对手已经准备
const ShareFirendsReadyState = {
	type:2,
	state:3,
	tip:'好友已就绪',
	isrival:true,
	btnState:2,
	nextState(){
		return false
	}
}

// 自己已经准备
const ShareSelfReadyState = {
	type:2,
	state:3,
	tip:'等待好友就绪',
	isrival:false,
	btnState:2,
	nextState(){
		return false
	}
}

class State{
	static currentState = null;
	static nextState = null;
	static handle = null
	static changeState(update?){
		if( State.nextState ){
			State.currentState = State.nextState
		}
		if(State.currentState){
			State.handle({ ...State.currentState, ...update })
			const next = State.currentState.nextState()
			State.nextState = next ? next : null
		}
	}
}

class PkWaitTImer {
	// 游戏中的计时器ID
	public timer = null;
	public time = 20;

	// 重置
	public  restTimeout(view){
		clearTimeout(this.timer);
		this.time = 20;
		view.text = this.time + '秒';
	}

	// 倒计时
	public startTimeOut(view,emit){
		this.timer = setTimeout(()=>{
			if( this.time !== 0){
				view.text = (--this.time) + '秒';
				if( this.time === 0 ){
						emit && emit();
						return;
				}
				this.startTimeOut(view,emit)
			}
		},1000)
	}
	// 停止计时
	public stopTimeOut(){
		clearTimeout(this.timer);
	}
}

const pkWaitTimer = new PkWaitTImer()

// 双方comfion 按钮确认问题
// 超时后是否又重新发起 bettel事件 ok

class PkWaitMessageBox extends MessageBox {
	// 测试
	state_timer
	// 匹配时间计时器
	private count_timer
	// 匹配等待时间
	private wait_time:number = 0
	// 匹配等待时间文本
	private wait_time_tip:eui.Label
	private wait_time_text:eui.Label
	// 匹配提示
	private match_tip:eui.Group
	// 邀请好友提示
	private join_tip:eui.Group

	// 分享引导
	private share_guide:eui.Image
	// 分享提示文字
	private share_tip:eui.Label

	// 弹窗按钮
	// public close_btn:eui.Group
	public game_btn:eui.Group

	private user_name:eui.Label
	private user_avatar_board:eui.Rect
	private user_avatar:eui.Image
	// 准备就绪蒙层
	private ready_mask:eui.Group
	// 对手昵称
	private rival_name:eui.Label
	private rival_avatar_board:eui.Rect
	private rival_avatar:eui.Image
	
	public constructor() {
		super();
	}
	private static shared:PkWaitMessageBox;
	public static getInstance(){
		if( !PkWaitMessageBox.shared){
			PkWaitMessageBox.shared = new PkWaitMessageBox();
		}
		return PkWaitMessageBox.shared;
	}
	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}
	protected childrenCreated():void
	{
		super.childrenCreated();
		this.user_name.text = Store.getInstance().user.nickname
		this.game_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.startGame,this);
		State.handle = this.changeState.bind(this)

		Utils.ImageLoader(Store.getInstance().user.avatar).then((res)=>{
			this.user_avatar.source = res
		})

		this.setBackGround(
			this.user_avatar_board,
			[0x72F6C6,0x16D1D3],
			20
		)

		this.setBackGround(
			this.rival_avatar_board,
			[0xF61737,0x3481F3],
			20
		)
	}
	public setBackGround(el:eui.Rect,colors,round?){
        
        const width = el.width;
		const height = el.height;
		const gradient = new egret.Shape();
        var matrix = new egret.Matrix();
        matrix.createGradientBox(width, height, Math.PI * 0.5, 0, 0);
        gradient.graphics.beginGradientFill(egret.GradientType.LINEAR, colors, [1, 1], [0, 255], matrix);
        if( round ){
            gradient.graphics.drawRoundRect(0, 0, width, height,round)
        }else{
            gradient.graphics.drawRect(0, 0, width, height);
        }
        gradient.graphics.endFill();
        el.addChild(gradient)
	}
	public changeState(state){
		
		const {
			tip,
			rival,
			waittip,
			btnState,
			type,
			isrival
		} = state

		// 等待提示
		if( waittip ){
			this.wait_time_tip.text = waittip
		}

		const tipLable = this.querySelector( type === 1 ? this.match_tip : this.join_tip, 'tip')		
		tipLable.text = tip;
		
		// 设置匹配对手昵称
		if( rival ){
			this.rival_name.text = rival.nickname
			if( rival.avatar ){
				Utils.ImageLoader(rival.avatar).then(res=>{
					this.rival_avatar.source = res
				})
			}else{
				RES.getResAsync('who_png').then(res=>{
					this.rival_avatar.source = res
				})
			}
			Store.getInstance().rival = rival
		}

		// const btnBg = this.querySelector( this.game_btn , 'bg')
		if( type === 1 ){
			if( state.state === 1 ){
				this.startCountMatchTime();
			}
			// 准备就绪蒙层
			if( state.state === 2 ){
				this.ready_mask.visible = true
				// btnBg.source = RES.getRes('btn_bg6_png')
				clearInterval(this.count_timer)
				this.wait_time_text.text = 20 + '秒'
				pkWaitTimer.startTimeOut(this.wait_time_text,this.waitTimeout.bind(this))
			}
			else if( state.state === 3 ){
				// 双方准备开始阶段 isrival 是否对手 
				// 为对手 则把准备蒙层隐藏
				this.ready_mask.visible = isrival ? false : true
			}	
			else{
				this.ready_mask.visible = false
				// btnBg.source = RES.getRes('btn_bg5_png')
			}
		}

		if( type === 2 ){

			if( state.state === 2 ){
				this.ready_mask.visible = true
			}else if( state.state === 3 ){
				this.ready_mask.visible = isrival ? false : true
			}else{
				this.ready_mask.visible = false
			}
		}

		// 按钮文案
		this.close_btn.visible = btnState === 0 ? true : false;
		this.game_btn.visible = btnState === 0 ? false : true;
		
	}
	public waitTimeout(){
		pkWaitTimer.stopTimeOut()
		pkWaitTimer.restTimeout(this.wait_time_text);
		Store.getInstance().battle.roomid  = ''
		
		State.currentState = matchingState
		State.changeState()
		const socket = SocketIO.getInstance().socket;
		socket.emit('battle',{
			"type":"create",
			"user_id":Store.getInstance().user._id
		})
		this.changeBtnState(false)
	}
	// 设置展示类型
	public async setType(type:number){
		this.match_tip.visible = type === 1 ? true : false;
		this.join_tip.visible = type === 1 ? false : true;

		this.once('onShow',async ()=>{
			State.currentState = type === 1 ? 
				matchingState : 
				waitFirendsState

			State.changeState()
			
			// PK 对战
			if( type === 1 ){
				Loading.getInstance().show();
				await SocketIO.getInstance().init();
				Loading.getInstance().hide();

				const socket = SocketIO.getInstance().socket
				const store = Store.getInstance()

				socket.emit('battle',{
					"user_id":Store.getInstance().user._id,
					"type":"create"
				})

				socket.on('battle',(res)=>{
					console.log( res , '==== res ====' )

					// 最开始两种状态 
					// state 1 用户自己进入房间
					// state 2 匹配到对手进入房间
					// state 3 匹配到的对手进入准备状态 
					// 有两种情况 
					// 一种对方已经准备好 玩家自己还未准备 这时点击开始游戏立即进入游戏
					// 一种玩家准备好 对方还未准备好 这时点击开始游戏按钮变灰并等待对方开始游戏
					
					// 这两种状态为它们设置PK等待框的展示头像和昵称
					if( res.type === "online" ){
						store.battle.roomid = res.target

						console.log( res.user._id !== Store.getInstance().user._id ,
							res.user._id,
							Store.getInstance().user._id,
							'===='
						)

						if( res.user._id !== Store.getInstance().user._id  ){
							State.changeState( { rival:res.user } )
						}
					}
					
					// 等待双方确认开始游戏
					if( res.type === "confirm" ){
						store.battle.roomid = res.target
						State.nextState = res.user._id !== Store.getInstance().user._id ?
							ShareFirendsReadyState : ShareSelfReadyState
						State.changeState()
					}

					// 双方确认后 进入房间
					if( res.type === "room_created" ){
						const loading = Loading.getInstance()
						this.closeMessage()
						loading.show()
						const { question,total_question,target }  = res;
						store.battle.current_question = question 
						store.battle.totle = total_question
						// 等待Message关闭
						setTimeout(()=>{
							SceneManager.getInstance().pushScene(PkGameScene.getInstance())
							PkGameScene.getInstance().startGame()
							loading.hide()
						},300)
					}

				})
			}

			// 邀请好友对战
			if( type === 2 ){
				
				Loading.getInstance().show();
				await SocketIO.getInstance().init();
				Loading.getInstance().hide();

				const socket = SocketIO.getInstance().socket
				const store = Store.getInstance()

				const wxsdk = WxSDK.getInstance()

				// 不是分享进来 却打开分享好友 出现分享引导图片
				if( !store.share ){
					this.share_guide.visible = true
					this.share_tip.visible = true
				}

				socket.emit('battle',{ ...{
					"user_id":Store.getInstance().user._id,
					"targetType": "friend",
					"type":"create"
				}, ...( store.share ? { "target":store.share } : {})  })
								
				socket.on('battle',(res)=>{

					if( res.type === "online" ){
						store.battle.roomid = res.target
						// type online 带有 roomUsers 说明双方玩家到齐 
						// 设置房间内玩家双方信息
						if( res.roomUsers.length === 2 ){
							const rivalInfo = res.roomUsers.find(item=> item._id !== Store.getInstance().user._id )
							State.changeState( { rival:rivalInfo } )
						}
					}

					if( res.type === 'share' ){
						const { link } = res
						console.log( link , 'link' )
						wxsdk.wxShare({ url:link,title:'好友邀请您进行精神卫生答题小游戏' })
					}

					if( res.type === "confirm" ){
						store.battle.roomid = res.target
						State.nextState = res.user._id !== Store.getInstance().user._id ?
							matchrReadyState : selfReadyState
						State.changeState()
					}

					if( res.type === "room_created" ){
						const loading = Loading.getInstance()
						this.closeMessage()
						loading.show()
						const { question,total_question,target }  = res;
						store.battle.current_question = question 
						store.battle.totle = total_question
						// 等待Message关闭
						setTimeout(()=>{
							SceneManager.getInstance().pushScene(PkGameScene.getInstance())
							PkGameScene.getInstance().startGame()
							loading.hide()
						},300)
					}
				})
			}
		})
		
		this.once('onClose',()=>{
			clearInterval(this.count_timer)
			clearInterval(this.state_timer)
			pkWaitTimer.stopTimeOut()
			pkWaitTimer.restTimeout(this.wait_time_text);
			State.currentState = null;
			State.nextState = null;
			this.changeBtnState(false)
			const store = Store.getInstance()

			// 清空上次好友分享房间
			store.share = ''
			// 每次都隐藏分享引导 
			this.share_guide.visible = false
			this.share_tip.visible = false
			const socket = SocketIO.getInstance().socket
			socket.off('battle')
			
		})
	}
	// 开始计算匹配等待时间
	public startCountMatchTime(){
		this.wait_time_text.text = `${this.wait_time = 0}秒`;
		this.count_timer = setInterval(()=>{
			this.wait_time_text.text = `${++this.wait_time}秒`;
		},1000)
	}
	public querySelector(element,name,all = false){
		const ret = [];
		const elements = element.$children
		// console.log( elements,'elements', element ,'element', element.$children )
		if( !elements.length ) return all ? [] : undefined;
		for( let i = 0, len = elements.length; i<len; i++ ){
			if( elements[i].name === name ){	
				if(all){
					 ret.push(elements[i])
				}else{
					return elements[i]
				}
			}
			if( elements[i].$children && elements[i].$children.length ){
				  const match = this.querySelector(elements[i],name,all)
                  if(all){
					if(match.length) ret.push(...match);
				  }else{
					if( match ) return match;
				  }
			}else{
				continue;
			}
		}
		
		if( all ){
			return ret;
		}
	}
	private disableReady:boolean = false
	public changeBtnState(disable){
		const btnBg = this.querySelector( this.game_btn , 'bg')
		if(disable){	
			btnBg.source = RES.getRes('btn_bg6_png')
			this.disableReady = true
		}else{
			btnBg.source = RES.getRes('btn_bg5_png')
			this.disableReady = false
		}
	}
	public startGame(){

		if(this.disableReady){
			return;
		}

		if( State.currentState ){
			// const { type ,state } = State.currentState;
			// if(type === 1 && state === 2){
			// 	return
			// }
			State.currentState = null;
		}

		const socket = SocketIO.getInstance().socket;	
		socket.emit('battle',{
			"type":"confirm",
			"user_id":Store.getInstance().user._id,
			"target": Store.getInstance().battle.roomid
		})

		this.changeBtnState(true)
	}
}