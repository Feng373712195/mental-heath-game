class MessageBox extends eui.Component implements eui.UIComponent{
    public close_btn:eui.Button;
	public messagebox:eui.Group;
	private bg:eui.Rect;
	public set_bg = true
	public center_type = 1


	public event = {};

	public constructor() {
		super();
	}

	protected childrenCreated():void
	{	
		// 拉伸至全屏
		this.left = 0;
        this.right = 0;
        this.top = 0;
        this.bottom = 0;

		// 设置初始化状态
		this.messagebox.alpha = 0;
		this.messagebox.scaleX = 0;
		this.messagebox.scaleY = 0;
		// 设置弹窗位置	
		// this.messagebox.y = this.stage.height * 0.5;
		// this.messagebox.x = this.stage.width * 0.5;
		// this.messagebox.y = document.body.clientHeight;
		// this.messagebox.x = document.body.clientWidth;
		// this.messagebox.anchorOffsetX = (this.messagebox.width * 0.5);
		// this.messagebox.anchorOffsetY = (this.messagebox.height * 0.5)

		super.childrenCreated();
		this.set_bg && this.setBackground();
		this.close_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,
			this.closeMessage,this);
	}

	private gradient:egret.Shape;

	public setBackground():void{
		const { width,height } = this.messagebox;
		
		const img = new eui.Image();
		img.width = width + 20;
		img.height = height + 20;
		img.x = -10;
		img.y = -10;
		img.source = 'message_bg_png'
		this.bg.addChild(img);
	}

	showMessage(){	
		SceneManager.getInstance().pushScene(this);
		this.setCenter(this.center_type)
		return new Promise(resolve=>{
			const tw = egret.Tween.get(this.messagebox);
			tw.to({
				alpha:1,
				scaleX:1,
				scaleY:1,
			},200,
			egret.Ease.quartIn)
			.call(()=>this.emit('onShow'))
			.call(resolve)
		})
	}

	closeMessage(){
		return new Promise(resolve=>{
			const tw = egret.Tween.get(this.messagebox);
			tw.to({
				alpha:0,
				scaleX:0,
				scaleY:0,
			},200,
			egret.Ease.quartOut)
			.call(()=>this.emit('onClose'))
			.call(()=>SceneManager.getInstance().popScene())
			.call(resolve)
		})
	}

	on(eventname,fn){
		if( !this.event[eventname] ){
			this.event[eventname] = []
		}
		this.event[eventname].push(fn)
	}

	once(eventname,fn){
		if( !this.event[eventname] ){
			this.event[eventname] = []
		}
		const call = ()=>{
			fn();
			this.off(eventname,call)
		}
		this.event[eventname].push(call)
	}

	emit(eventname){
		if(this.event[eventname] ){
			this.event[eventname].forEach(fn=>fn())
		}
	}

	off(eventname,fn){
		if(this.event[eventname]){
			const index = this.event[eventname].indexOf(fn);
			this.event[eventname].splice(index,1);
		}
	}

	// 设置弹窗居中方式
	public setCenter(type){
		//	默认第一种
		// if( type === 1){
		// 	this.messagebox.y = this.stage.height * 0.5;
		// 	this.messagebox.x = this.stage.width * 0.5;
		// }

		// if( type === 2 ){
		// 	this.messagebox.y = document.body.clientHeight;
		// 	this.messagebox.x = document.body.clientWidth;
		// }
	}
}