class ExchangeItem extends eui.ItemRenderer {
	// 兑换按钮
	private exchange_btn:eui.Group;
	// 礼物图标
	private gift_img:eui.Image;
	// 礼物名称
	private gift_name:eui.Label;
	//价格
	private price:eui.Label
	
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
		this.exchange_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,
			this.exchange,this)
		
		this.gift_img.addEventListener(egret.TouchEvent.TOUCH_TAP,
			this.showGiftInfo,this)
	}

	public dataChanged(){
		this.price.text = Utils.formatNum(this.data.price)
		this.gift_name.text = this.data.name
		if(this.data.icon){
			Utils.ImageLoader(this.data.icon).then(res=>{
				this.gift_img.source = res
			})
		}
	}

	private showExchangeMessage(info){
		const message = ExchangeSuccesMessage.getInstance()
		message.showMessage()
		message.setInfo(info)
	}

	private showGiftInfo(){
		const message = GiftMessage.getInstance()
		message.showMessage()
		message.setGifInfo(this.data)
	}
	
	private async exchange(){

		const loading = Loading.getInstance();
		const user_info = Store.getInstance().user

		loading.show()
		const res = await Http.PostRequest<{
			errcode:number,
			errmsg:string,
			gift:any,
		}>('/gift/buy',{
			id:this.data._id,
			amount:1
		})
		loading.hide()

		if( res.errcode === 0 ){
			ShoppingMallScene.getInstance().dispatchEvent(new egret.Event('updateUserInfo'))
			this.showExchangeMessage(res.gift)
		}else{
			alert(res.errmsg)
		}
	}
	
}