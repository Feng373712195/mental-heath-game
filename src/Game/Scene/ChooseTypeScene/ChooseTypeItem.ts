class ChooseTypeItem extends eui.ItemRenderer{
	private bg:eui.Rect
	private text:eui.Label
	private icon:eui.Image
	
	public constructor() {
		super();
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();

		this.addEventListener(egret.TouchEvent.TOUCH_TAP,this.toChooseTypeDetail,this)

		this.setBackGround(
			this.bg,
			[0x35B2ED,0x44EFE3],
			20
		)

	}

	public setBackGround(el:eui.Rect,colors,round?){
        
        const width = el.width;
		const height = el.height;
		const gradient = new egret.Shape();
        var matrix = new egret.Matrix();
        matrix.createGradientBox(width, height, Math.PI * 2,  0, 0);
        gradient.graphics.beginGradientFill(egret.GradientType.LINEAR, colors, [1, 1], [0, 255], matrix);
        if( round ){
            gradient.graphics.drawRoundRect(0, 0, width, height,round)
        }else{
            gradient.graphics.drawRect(0, 0, width, height);
        }
        gradient.graphics.endFill();
        el.addChild(gradient)
	}
	
	public dataChanged(){
		this.text.text = this.data.name
		if( this.data.icon ){
			Utils.ImageLoader(this.data.icon).then(res=>{
				this.icon.source = res
			})
		}
	}


	async toChooseTypeDetail(){

		const loading = Loading.getInstance()
		loading.show();
		
		// 先使用 排位赛的方法进入 后面出了接口再做修改
		const res = await Http.PostRequest<{
			errcode:number
			errmsg:string,
			contest:{
				questions:any[],
				round:string,
				_id:string,
			}
		}>('/medinfo/practice',{
			medinfo:this.data._id
		})
		
		if( res.errcode === 0 ){
			Store.getInstance().medinfo =  { 
				id:this.data._id,
				scores:[],
				record:res.contest._id,
				...res.contest,
			}
			await SocketIO.getInstance().init();
			loading.hide()
			SceneManager.getInstance().pushScene( GameScene.getInstance() );
			// 暂停轮播图
			ChooseTypeScene.getInstance().dispatchEvent(new egret.Event('stopLoopSlider'))
			GameScene.getInstance().startGame('medinfo');
		}else{
			alert(res.errmsg)
		}

		// SceneManager.getInstance().pushScene( ChooseTypeDetailScenen.getInstance() )
	}
}