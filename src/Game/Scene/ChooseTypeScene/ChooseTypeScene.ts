class ChooseTypeScene extends CommonScene {
	
	private touch = {
		currentX:0,
		sliderX:0,
		moveX:0
	}

	private init = false
	private sliderItme_num:number
	private list:eui.Scroller;
	private loopTimer;

	private slider:eui.Group;

	private slider_item0:eui.Image
	private slider_item1:eui.Image
	private slider_item2:eui.Image
	private slider_item3:eui.Image
	private slider_item4:eui.Image
	private slider_item5:eui.Image

	private slider_btn_box:eui.Group
	private slider_btns:eui.Rect[] = []
	// private slider_btn0:eui.Rect;
	// private slider_btn1:eui.Rect;
	// private slider_btn2:eui.Rect;
	// private slider_btn3:eui.Rect;

	private banners:{link:string}[];

	public constructor() {
		super();
	}


	private static shared:ChooseTypeScene;
	public static getInstance(){
		if( !ChooseTypeScene.shared){
			ChooseTypeScene.shared = new ChooseTypeScene();
		}
		return ChooseTypeScene.shared;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}
	
	onShow(){
		if( !this.init ){
			this.init = true
			return
		}
		this.loopSlider();
	}

	protected childrenCreated():void
	{
		super.childrenCreated();
		this.setBackBtn(()=>{
			this.stopLoopSlider()
		});

		this.addEventListener('stopLoopSlider',this.stopLoopSlider,this)
		this.loadTypeList()

		this.slider.addEventListener(egret.TouchEvent.TOUCH_BEGIN,(event)=>{
			// 如果轮播图数量小于两张 不给予滑动
			if( this.banners.length < 2 ) return

			console.log('touch begin')
			clearTimeout(this.loopTimer)
			egret.Tween.removeTweens(this.slider);
			
			if( this.sliderIndex === this.sliderItme_num - 1 ){
				this.slider.x = 0
			}else{
				this.slider.x = -(this.sliderIndex * 690)	
			}
			this.touch.currentX = event.stageX
			event.preventDefault()
		},this)

		this.slider.addEventListener(egret.TouchEvent.TOUCH_MOVE,(event)=>{
			// 如果轮播图数量小于两张 不给予滑动
			if( this.banners.length < 2 ) return
			
			console.log('touch move')
			const currentSilderIndex = (this.sliderIndex)
			const currentSliderX = -(currentSilderIndex * 690) 
			this.touch.moveX = event.stageX - this.touch.currentX
			this.touch.sliderX = this.slider.x = currentSliderX + this.touch.moveX
			
			event.preventDefault()
		},this)

		this.slider.addEventListener(egret.TouchEvent.TOUCH_END,async (event)=>{
			// 如果轮播图数量小于两张 不给予滑动
			
			
			console.log('touch end')
			// 无拖拽过轮播图
			console.log( this.touch.moveX )
			if( this.touch.moveX === 0  ){
				console.log(' touch end return ')
				this.webview(this.banners[this.sliderIndex].link)
				// 此处可以跳转
				this.loopSlider()
				return;
			}
			if( this.banners.length < 2 ) return
			const currentSilderIndex = (this.sliderIndex)
			const currentSliderX = -(currentSilderIndex * 690) 
			// 下一张的索引
			let index = -1
			if( this.touch.sliderX < currentSliderX ){
				// 右滑
				index = currentSilderIndex === this.sliderItme_num ? 4 : currentSilderIndex + 1 
			}else{
				// 左滑
				index = currentSilderIndex === 0 ? -1 : currentSilderIndex - 1 
			}
			// 设置轮播图索引
			// this[`slider_btn${this.sliderIndex}`].fillColor = 0x000000
			this.slider_btns[this.sliderIndex].fillColor = 0x000000
			this.sliderIndex = index === -1 ? 3 : index === 4 ? 0 : index
			// this[`slider_btn${this.sliderIndex}`].fillColor = 0xffffff
			this.slider_btns[this.sliderIndex].fillColor =  0xffffff
			this.touch = { currentX:0, moveX:0 , sliderX:0 }

			// 过渡到滑动轮播
			if( this.sliderIndex === 4 ){
				await this.translateSlider(this.sliderItme_num)
				this.translateSlider(0,false)
			}else if( this.sliderIndex === -1){
				await this.translateSlider(index)
				this.translateSlider(3,false)
			}else{
				this.translateSlider(index)
			}

			this.loopSlider()
			event.preventDefault()
		},this)
	}

	public async loadTypeList(){
		const loading = Loading.getInstance()
		loading.show()
		const listData = await this.getTypeist()
		var myCollection:eui.ArrayCollection = new eui.ArrayCollection(listData);
		var dataGroup:eui.DataGroup = new eui.DataGroup();
		dataGroup.dataProvider = myCollection;
		dataGroup.percentWidth = 100;
		dataGroup.percentHeight = 100;
		
		var tLayout:eui.TileLayout = new eui.TileLayout();
		tLayout.columnAlign = eui.ColumnAlign.JUSTIFY_USING_WIDTH;
		// tLayout.rowAlign = eui.RowAlign.JUSTIFY_USING_;
		tLayout.horizontalGap = 10;
		tLayout.verticalGap = 20;
		dataGroup.layout = tLayout
		dataGroup.itemRenderer = ChooseTypeItem;
		dataGroup.useVirtualLayout = true;
		
		this.list.viewport = dataGroup;
		loading.hide()
	}

	private async getTypeist(){

		const res = await Http.GetRequest<{
			errcode:number,
			list:any[],
			banners:any[],
			errmsg:string,
		}>('/medinfo')

		if( res.errcode === 0 ){
			this.setSilder(res.banners.slice(0,4))
			return res.list ?  res.list : []
		}else{
			alert(res.errmsg)
		}
		return []
	}

	sliderIndex = 0;
	async loopSlider(){
		if( this.banners.length < 2 ) return

		if( this.sliderIndex === 4 ){
			await this.translateSlider(4);
			this.sliderIndex = 0;
			// egret.Tween.removeTweens(this.slider);
			this.translateSlider(0,false)
			this.loopSlider()
		}else{
			 this.loopTimer = setTimeout(async ()=>{
				// this[`slider_btn${this.sliderIndex}`].fillColor = 0x000000
				this.slider_btns[this.sliderIndex].fillColor = 0x000000
				++this.sliderIndex;
				// this[`slider_btn${this.sliderIndex === this.sliderItme_num ? 0 : this.sliderIndex }`].fillColor = 0xffffff
				this.slider_btns[this.sliderIndex === this.sliderItme_num ? 0 : this.sliderIndex].fillColor = 0xffffff
				await this.translateSlider(this.sliderIndex);
				this.loopSlider();
			},2500);
		}
	}

	translateSlider(index,anim = true){
		if( anim ){
			return new Promise(r=>{
				const tw = egret.Tween.get(this.slider);
				tw.to({
					x: -(index * 690)
				},500)
				.call(r)
			})
		}else{
			this.slider.x = -(index * 690)
		}
	}
	private resetSliderBtn(){
		// 重置
		this.slider_btn_box.removeChildren()
		this.slider_btns = []
	}
	private createSliderBtn(index:number){
			const btn = new eui.Rect()
			btn.width = 10
			btn.height = 10
			btn.ellipseWidth = 20;
			btn.ellipseHeight = 20;
			
			// 设置颜色
			if(index === 0) btn.fillColor = 0xffffff
			// 0xffffff
			// testColor 0xFFEFD5
			else btn.fillColor = 0x000000
			return btn
	}
	// 设置轮播提示
	setSliderBtn(index:number){
		const btn = this.createSliderBtn(index)
		this.slider_btns.push(btn)
		this.slider_btn_box.addChild(btn)	
	}
	// 停止 恢复到初始值
	stopLoopSlider(){
		console.log( 'stopLoopSlider' , this.sliderIndex)
		clearTimeout(this.loopTimer)
		// this[`slider_btn${this.sliderIndex}`].fillColor = 0x000000
		this.slider_btns[this.sliderIndex].fillColor = 0x000000
		this.sliderIndex = 0
		// this[`slider_btn0`].fillColor = 0xffffff
		this.slider_btns[0].fillColor = 0xffffff
		this.translateSlider(this.sliderIndex)
	}

	setSilder(banners){
		// 重置按钮
		this.resetSliderBtn()
		const handle = (url) => window.location.href = url
		const addEvent = (el:eui.Image,handle) => el.addEventListener(egret.TouchEvent.TOUCH_TAP,handle,this)

		this.sliderItme_num = banners.length
		this.banners = banners;

		banners.forEach((item,index) =>{
			Utils.ImageLoader(item.image).then( (res:any)=>{
				if( index === 0 ){
					this.slider_item5.source = res
					// addEvent( this.slider_item5, handle.bind(this,item.link) )
				}
				if( index === banners.length - 1 ){
					this.slider_item0.source = res
					// addEvent( this.slider_item0, handle.bind(this,item.link) )
				}
				this[`slider_item${index+1}`].source = res
				// addEvent( this[`slider_item${index+1}`], handle.bind(this,item.link) )
				
				// 设置轮播图按钮 
			})
			this.setSliderBtn(index)
		})


		this.loopSlider();
		
	}	
	
	private webview(url){
		// const webview = document.getElementById('webview');
		// const iframe = document.createElement('iframe') as HTMLIFrameElement
		// iframe.src = url
		// iframe.id = "webview-iframe"
		// webview.appendChild(iframe)
		// webview.style.display = 'block'
		
		if( url ){
			window.location.href = url
		}
	}
}