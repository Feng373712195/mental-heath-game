class PkScene extends CommonScene{
	
	private bg:eui.Rect;
	// 在线匹配对战
	private pk_btn:eui.Group;
	// 微信好友对战
	private share_btn:eui.Group;

	private user_name:eui.Label
	private user_avatar:eui.Image
	private user_avatar_board:eui.Rect

	private rival_avatar_board:eui.Rect

	public constructor() {
		super();
	}

	private static shared:PkScene;
	private static pk_btn:eui.Group;
	public static getInstance(){
		if( !PkScene.shared){
			PkScene.shared = new PkScene();
		}
		return PkScene.shared;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}

	protected childrenCreated():void
	{	
		super.childrenCreated();
		this.setBackBtn();
		this.setBackground()
		this.user_name.text = Store.getInstance().user.nickname
		this.pk_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.showPkWait.bind(this,1),this);
		this.share_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.showPkWait.bind(this,2),this);
	
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

	public showPkWait(type){
		// type 1 在线匹配对战
		// type 2 微信好友对战
		const message = PkWaitMessageBox.getInstance()
		message.showMessage();
		message.setType(type)
	}


}