class RankingItem extends eui.ItemRenderer{
	private item_mask:eui.Group;
	private pass:eui.Image;
	private money:eui.Label
	private nopass:eui.Image;
	private percent:eui.Rect;
	
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
		this.addEventListener(egret.TouchEvent.TOUCH_TAP,
		this.toGameScene,this);
	}

	protected dataChanged(...arg):void{

			if( this.data.status === 'pass' ){
				this.item_mask.visible = true;
				this.pass.visible = true;
			}

			if( this.data.status === 'available' ){
				this.item_mask.visible = false;
				this.pass.visible = false;
				this.nopass.visible = false;
			}

			if( this.data.status === 'disabled' ){
				this.item_mask.visible = true;
				this.nopass.visible = true;
			}

			this.money.text = `${this.data.money}/次`
			this.percent.percentWidth = this.data.percent
    }
	
	private async  toGameScene(){
		if( this.data.level !== 1  && this.data.status === 'disabled' ) return
		const loading = Loading.getInstance()
		loading.show();

		const res = await Http.PostRequest<{
			errcode:number
			errmsg:string,
			contest:{
				questions:any[],
				round:string
			}
		}>('/level/contest',{
			level:this.data._id
		})
		
		if( res.errcode === 0 ){
			Store.getInstance().ranking =  { 
				id:this.data._id,
				scores:[],
				...res.contest,
			}
			await SocketIO.getInstance().init();
			loading.hide()
			SceneManager.getInstance().pushScene( GameScene.getInstance() );
			GameScene.getInstance().startGame('ranking');
		}else{
			alert(res.errmsg)
		}
	}
	

}