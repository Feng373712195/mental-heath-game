
const SHOPPING_TAB_NUM = 3;
const TAB_BTN_COLORS = [0x9250F0,0xB88DF8]

interface DataList {
	// 是否正在加载中
	// loading:Boolean,
	// 排行榜列表
	list:Array<Object>,
	// 排行榜数据
	data:eui.ArrayCollection
	// 是否已经加载过了
	load:Boolean
}

interface CurrentShowTab {
	view:eui.Scroller,
	data:eui.ArrayCollection,
	index:number
}

class DataList implements DataList {
	// public loading:Boolean = false;
	public list:Array<Object> = [];
	public data:eui.ArrayCollection = null;
	public load:Boolean = false;
	public page:number = 1;
	public total_page = 0;
}

class ShoppingMallScene extends CommonScene {

	// tab按钮
	private tab1_btn:eui.Group;
	private tab2_btn:eui.Group;
	// 加载提示
	private loading:eui.Label;
	// 无数据提示
	private no_data:eui.Label;
	// 当前显示的排行榜列表
	private current_show_tab:CurrentShowTab = null;
	// 排行列表数据
	private shopping1_list = new DataList();
	private shopping2_list = new DataList();
	private shopping3_list = new DataList();
	// 滚动容器
	private shopping1_view:eui.Scroller;
	private shopping2_view:eui.Scroller;
	private shopping3_view:eui.Scroller;
	// 是否正在加载中
	private isloading = false;
	// 背景色
	private bg:eui.Rect;

	// 是否需要下拉刷新
	private needUp:boolean

	private user_momey:eui.Label
	private user_name:eui.Label
	private user_avatar:eui.Image
	
	
	public constructor() {
		super();
	}
	
	private static shared:ShoppingMallScene;
	public static getInstance(){
		if( !ShoppingMallScene.shared){
			ShoppingMallScene.shared = new ShoppingMallScene();
		}
		return ShoppingMallScene.shared;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}

	protected childrenCreated():void
	{	
		super.childrenCreated();
		this.setBackBtn();
		// 设置背景
		this.setBackground();
		// 监听一些事件
		for( let i = 1; i <= SHOPPING_TAB_NUM; i++ ){
			this[`tab${i}_btn`].addEventListener(
				egret.TouchEvent.TOUCH_TAP,
				this.selectBtn.bind(this,i),
				this)
		}
		// 默认进入场景加载第一个排行列表
		this.loadShoppingListView(1);
		// 监听刷新用户信息
		this.addEventListener('updateUserInfo',async (evt)=>{
			const res = await Http.GetRequest<{
				errcode:number,
				errmsg:string,
				user:{ [key in string]:any }
			}>('/home')
			if( res.errcode === 0 ){
				Store.getInstance().user =   { ...Store.getInstance().user, ...res.user }
				this.setUserInfo(res.user)
			}else{
				alert(res.errmsg)
			}
		},this)
		
		// 对我的礼品进行上拉加载
		this[`shopping3_view`].addEventListener(eui.UIEvent.CHANGE, this.moveHandler, this);
		this[`shopping3_view`].addEventListener(eui.UIEvent.CHANGE_END, this.outHandler, this);
	}

	
	private moveHandler(evt){
		const scrollview = evt.target as eui.Scroller
		const { scrollV,contentHeight,height } = scrollview.viewport
		if( scrollV > ( contentHeight - height) ){
			this.needUp = true;
		}
	}
	private outHandler(){
		if(this.needUp){
			this.needUp = false;
			this.pullDownUpdate();
		}
	}

	private async pullDownUpdate(){

		// 正在加载中 不进行更新
		if( this.isloading ) return
		
		const { 
			index,
			data
		} = this.current_show_tab;
		const {
			page,
			total_page
		} = this[`shopping${index}_list`]
		
		// 已经是最后一页不进行更新
		if( total_page === 0 || page === total_page ) return

		this.isloading = true	
		Utils.showToast('加载中...',1000)

		const shoppingData = await [
			,
			this.getKeyList,
			this.getGiftsList,
			this.getMyGift
		][index].bind(this)(++this[`shopping${index}_list`].page)

		this.isloading = false;

		shoppingData.forEach((item)=>{
			data.addItem(item)
		})
	}

	// 获取排行数据
	private getShoppingListData(num,index):Promise<Array<Object>>{
		return new Promise(resolve=>{
			let sourceArr:any[] = [];
			for( var i:number = 1; i < num; i++){

				sourceArr.push({ 
					amount: 1,
					created_at: "2020-10-03T17:17:20.079Z",
					gift: {name: "钥匙", new_user: 11, daily_limit: 200, valid_days: 90, price: 50 },
					gift_key: "key",
					price: 50,
					status: "available",
					total: 50,
					used_amount: 0,
					valid_until: "2021-01-02T05:25:45.795Z",
				 })
			}
			setTimeout(()=>{
				resolve(sourceArr)
			},0)
		})
	}	

	private async getKeyList(page = 1){
		const res = await Http.GetRequest<{
			errcode:number,
			gift:any,
			errmsg:string,
			user:Object
			page
		}>('/gift/key')

		if( res.errcode === 0 ){
			this.setUserInfo(res.user);
			return res.gift ? [1,1,1,1,1]
			.map(( item,index )=> ({ 
				...res.gift,
				...{ amount:index+1, price:res.gift.price * (index + 1) } 
			}) ) : []
		}else{
			alert(res.errmsg)
		}
		return []
	}
	private async getGiftsList(page = 1){

		const res = await Http.GetRequest<{
			errcode:number,
			gifts:any[],
			errmsg:string,
			user:Object
		}>('/gifts')

		if( res.errcode === 0 ){
			this.setUserInfo(res.user);
			return res.gifts ? res.gifts : []
		}else{
			alert(res.errmsg)
		}
		return []
	}
	private async getMyGift(page = 1){

		const res = await Http.GetRequest<{
			errcode:number,
			errmsg:string,
			list:any[],
			page: number,
			total: number,
			total_page: number,
		}>(`/my_gift?page=${page}`)

		if( res.errcode === 0 ){
			this.shopping3_list.page = res.page;
			this.shopping3_list.total_page = res.total_page
			return res.list ? res.list : []	
		}else{
			alert(res.errmsg)
		}
		return []
	}
	private setUserInfo(user){
		const { money,nickname,avatar } = user;
		this.user_momey.text = Utils.formatNum(money)
		this.user_name.text = nickname;
		Utils.ImageLoader(avatar).then(res=>{
			this.user_avatar.source = res
		})	
	}
	// 创建数据集合
	private async loadShoppingListView(index:number){

		this.no_data.visible = false

		const tabView = this[`shopping${index}_view`];
		const tabList = this[`shopping${index}_list`];
		
		// 我的礼物列表 每次进入都重新获取
		if( index !== 3 ){
			if( tabList.load ){
				this.setShowTabView(tabView,tabList.data,tabList.list,index)
				return;
			}
		}

		const ItemRenders = [
			ShoppingItem,
			ExchangeItem,
			MyGiftItem
		]

		this.showLoading(true);
		const shoppingData = await [
			,
			this.getKeyList,
			this.getGiftsList,
			this.getMyGift
		][index].bind(this)()


		this.no_data.visible = shoppingData.length === 0 ? true : false
		
		tabList.load = true;
		// 用ArrayCollection包装
		var myCollection:eui.ArrayCollection = new eui.ArrayCollection(shoppingData);
		tabList.data = myCollection;
		// 创建DataGroup,并设置数据源
		var dataGroup:eui.DataGroup = new eui.DataGroup();
		dataGroup.dataProvider = myCollection;
		dataGroup.percentWidth = 100;
		dataGroup.percentHeight = 100;
		dataGroup.itemRenderer = ItemRenders[index-1];
		dataGroup.useVirtualLayout = true;
		tabList.list = dataGroup;
		this.showLoading(false);
		this.setShowTabView(tabView,myCollection,dataGroup,index)
	}
	private setShowTabView(tabView,tabData,setTab,index){
		if( this.current_show_tab ){
			this.current_show_tab.view.visible = false;
		}
		this.current_show_tab = {
			view:tabView,
			data:tabData,
			index
		}

		this.no_data.visible = this.current_show_tab.data.length === 0 ? true : false
		
		this.current_show_tab.view.visible = true;
		tabView.viewport = setTab;
	}

	private selectBtn(index){
		// 加载中不可切换
		if( this.isloading ) return;
		
		const lastIndex = this.current_show_tab.index;

		console.log( 
			this[`tab${lastIndex}_btn`].getChildAt(0),
			this[`tab${index}_btn`].getChildAt(0)
		)

		this[`tab${lastIndex}_btn`].getChildAt(0).fillColor = TAB_BTN_COLORS[1]
		this[`tab${index}_btn`].getChildAt(0).fillColor = TAB_BTN_COLORS[0]

		this.loadShoppingListView(index)
	}

	private showLoading(visble){
		if( this.current_show_tab ){
			this.current_show_tab.view.visible = false;
		}
		this.isloading = visble;
		this.loading.visible = visble;
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
	
}