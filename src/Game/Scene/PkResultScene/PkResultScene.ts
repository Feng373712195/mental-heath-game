class PkResultScene extends CommonScene {
	private bg:eui.Rect;

	private back_btn:eui.Group
	private play_btn:eui.Group

	private left_user:eui.Group;
	private right_user:eui.Group;

	private credit:eui.Label
	private money:eui.Label

	private user_score:eui.Label
	private other_score:eui.Label

	private result_top:eui.Image;

	private user_avatar:eui.Image;
	private user_avatar_board:eui.Rect;
	private user_name:eui.Label;
	private user_result_bg:eui.Image;
	private user_result_status:eui.Image

	private rival_avatar:eui.Image;
	private rival_avatar_board:eui.Rect;
	private rival_name:eui.Label;
	private rival_result_bg:eui.Image;
	private rival_result_status:eui.Image

	private btns:eui.Group

	private userBlockDefaultY = 0

	public constructor() {
		super();
	}

	private static shared:PkResultScene;
	public static getInstance(){
		if( !PkResultScene.shared){
			PkResultScene.shared = new PkResultScene();
		}
		return PkResultScene.shared;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}

	protected childrenCreated():void
	{
		super.childrenCreated();
		this.setBackground();

		if( this.stage.stageHeight > 1000 ){
			this.btns.bottom = ''
			this.btns.top = 1000
		}

		console.log( this.stage.stageHeight )

		this.back_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,()=>{
			SceneManager.getInstance().changeScene( StartScene.getInstance() )
		},this)
		this.play_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,()=>{
			SceneManager.getInstance().changeScene( PkScene.getInstance() )
			PkGameScene.getInstance().startGame();
		},this)

	}

	private setBackground(){
		const width = this.stage.stageWidth;
		const height = this.stage.stageHeight;
		const gradient = new egret.Shape();
        var matrix = new egret.Matrix();
        matrix.createGradientBox(width, height, Math.PI * 0.5, 0, 0);
        gradient.graphics.beginGradientFill(egret.GradientType.LINEAR, [0x16D1D3,0x72F6C6], [1, 1], [0, 255], matrix);
        gradient.graphics.drawRect(0, 0, width, height);
        gradient.graphics.endFill();
        this.bg.addChild(gradient)
	}

	public setScore(){
		const store = Store.getInstance()
		const result = store.battle.result

		let user_result = null
		let rival_result = null

		result.result.forEach(item => {
			if( item.user._id === store.user._id ){
				user_result = item
			}else{
				rival_result = item
			}
		});

		this.user_name.text = user_result.user.nickname
		Utils.ImageLoader(user_result.user.avatar).then(res=>{
			this.user_avatar.source = res
		})
		this.rival_name.text = rival_result.user.nickname
		Utils.ImageLoader(rival_result.user.avatar).then(res=>{
			this.rival_avatar.source = res
		})

		const stuatus = {
			// 胜利
			win:{
				result_top:'pk_result2_png',
				user_result_bg:'pk_user_bg2_left_png',
				user_result_status:'pk_status2_left_png',
				rival_result_bg:'pk_user_bg2_right_png',
				rival_result_status:'pk_status3_right_png',
			},
			// 失败
			lost:{
				result_top:'pk_result3_png',
				user_result_bg:'pk_user_bg3_left_png',
				user_result_status:'pk_status3_left_png',
				rival_result_bg:'pk_user_bg3_right_png',
				rival_result_status:'pk_status2_right_png',
			},
			// 平局
			tie:{
				result_top:'pk_result1_png',
				user_result_bg:'pk_user_bg1_left_png',
				user_result_status:'pk_status1_left_png',
				rival_result_bg:'pk_user_bg1_right_png',
				rival_result_status:'pk_status1_right_png',
			}
		}


		const stuatuColors = [0xF61737,0x3481F3,0xFFFFFF]
		
		let currentStuatus = null
		if(user_result.credit > rival_result.credit){
			currentStuatus = stuatus.win
			this.user_avatar_board.fillColor = stuatuColors[1]
			this.rival_avatar_board.fillColor = stuatuColors[0]

		}else if(user_result.credit < rival_result.credit){
			currentStuatus = stuatus.lost

			this.user_avatar_board.fillColor = stuatuColors[0]
			this.rival_avatar_board.fillColor = stuatuColors[1]
		}else if(user_result.credit === rival_result.credit){
			currentStuatus = stuatus.tie
			this.user_avatar_board
			this.rival_avatar_board

			this.user_avatar_board.fillColor = stuatuColors[2]
			this.rival_avatar_board.fillColor = stuatuColors[2]
		}

		Object.keys(currentStuatus).forEach((key)=>{
			RES.getResAsync(`${currentStuatus[key]}`).then(res=>{
				this[key].source = res
			})
		})

		// 玩家成绩
		this.credit.text = `积分 +${  Utils.formatNum(user_result.credit) }`
		this.money.text = `金币 +${ Utils.formatNum(user_result.money) }`
		this.user_score.text = user_result.credit + '积分'
		// 对手成绩
		this.other_score.text = rival_result.credit + '积分'
	}
}