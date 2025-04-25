
// 排行榜数量
const RANKLIST_NUM = 2;

interface RankList {
	// 是否正在加载中
	// loading:Boolean,
	// 排行榜列表
	list:Array<Object>,
	// 排行榜数据
	data:eui.ArrayCollection
	// 是否已经加载过了
	load:Boolean
}

interface CurrentShowRank {
	view:eui.Scroller,
	data:eui.ArrayCollection,
	index:Number
}

class RankList implements RankList {
	// public loading:Boolean = false;
	public list:Array<Object> = [];
	public data:eui.ArrayCollection = null;
	public load:Boolean = false;
}


class RankScene extends CommonScene {
	
	private rank1_view:eui.Scroller;
	private rank2_view:eui.Scroller;
	private self_rank:eui.Group;
	private tab_group:eui.Group;
	private tab1_btn:eui.Group;
	private tab2_btn:eui.Group;
	private loading:eui.Label;
	// 当前显示的排行榜列表
	private current_show_rank:CurrentShowRank = null;
	// 排行列表数据
	private rank1_list = new RankList();
	private rank2_list = new RankList();
	// 是否正在加载中
	private isloading = false;

	private self_rank1:eui.Group;
	private self_rank1_group:eui.Group;
	private self_rank2:eui.Group;
	private self_rank2_group:eui.Group;


	public constructor() {
		super();
	}

	private static shared:RankScene;
	public static getInstance(){
		if( !RankScene.shared){
			RankScene.shared = new RankScene();
		}
		return RankScene.shared;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}

	protected  async childrenCreated():Promise<any>
	{
		super.childrenCreated();
		this.setBackBtn()
		// 监听一些事件
		for( let i = 1; i <= RANKLIST_NUM; i++ ){
			this[`tab${i}_btn`].addEventListener(
				egret.TouchEvent.TOUCH_TAP,
				this.selectBtn.bind(this,i),
				this)

			// this[`rank${i}_view`].addEventListener(
			// 	eui.UIEvent.CHANGE_END,
			// 	this.pullDownLoad.bind(this,i),
			// 	this
			// )
		}
		// 默认进入场景加载第一个排行列表
		this.loadRankListView(1);
	}

	// 获取排行数据
	private getRankData(num,index):Promise<Array<Object>>{
		console.log( 'getRankData' , index );
		return new Promise(resolve=>{
			let sourceArr:any[] = [];
			for( var i:number = 1; i <= num; i++){
				sourceArr.push({ rank:i, name: index ? index : '测试用户',score:1000 })
			}
			setTimeout(()=>{
				resolve(sourceArr)
			},0)
		})
	}	

	// 创建数据集合
	private async loadRankListView(index:number){
		const rankView = this[`rank${index}_view`];
		const rankList = this[`rank${index}_list`];
		if( rankList.load ){
			this.setShowRankView(rankView,rankList.data,rankList.list,index)
			return;
		}
		this.showLoading(true);
		const rankData = await [
			,
			this.get7DayData,
			this.getTop50Data
		][index].bind(this)()

		rankList.load = true;
		// 用ArrayCollection包装
		var myCollection:eui.ArrayCollection = new eui.ArrayCollection(rankData);
		rankList.data = myCollection;
		// 创建DataGroup,并设置数据源
		var dataGroup:eui.DataGroup = new eui.DataGroup();
		dataGroup.dataProvider = myCollection;
		dataGroup.percentWidth = 100;
		dataGroup.percentHeight = 100;
		dataGroup.itemRenderer = RankItem;
		dataGroup.useVirtualLayout = false;
		rankList.list = dataGroup;
		this.showLoading(false);
		this.setShowRankView(rankView,myCollection,dataGroup,index)
	}

	private setShowRankView(rankView,rankData,setView,index){

		if( this.current_show_rank ){
			this.current_show_rank.view.visible = false;
		}
		this.current_show_rank = {
			view:rankView,
			data:rankData,
			index
		}
		
		this.current_show_rank.view.visible = true;
		rankView.viewport = setView;

		this.setSelfRank(null,index)
	}

	private selectBtn(index){
		// 加载中不可切换
		if( this.isloading ) return;
		
		const lastIndex = this.current_show_rank.index;
		this[`tab${lastIndex}_btn`].getChildAt(0).fillColor = TAB_BTN_COLORS[1]
		this[`tab${index}_btn`].getChildAt(0).fillColor = TAB_BTN_COLORS[0]

		this.loadRankListView(index)
	}

	private showLoading(visble){
		if( this.current_show_rank ){
			this.current_show_rank.view.visible = false;
		}
		this.isloading = visble;
		this.loading.visible = visble;
	}


	// 近7天数据
	private async get7DayData(){
		const res = await Http.GetRequest<{
			errcode:number,
			errmsg:string,
			top:any[],
			my:Object
		}>('/top/7d')

		if( res.errcode === 0 ){
			this.setSelfRank([res.my],1)
			return res.top ? res.top
			.map( (item,index)=> {
				item.rank = index+1 ;
				return item
			}) : []
		}else{
			alert(res.errmsg)
		}
		return []
	}

	// 近50天数据
	private async getTop50Data(){
		const res = await Http.GetRequest<{
			errcode:number,
			errmsg:string,
			top:any[],
			my:{
				rank_name:string
			}
		}>('/top/50')

		if( res.errcode === 0 ){
			this.setSelfRank([res.my],2)
			// .map( (item,index)=> item.rank = index+1 )
			return res.top ? res.top			
			.map( (item,index)=> {
				const { rank } = item
				item.rank_name = rank.name
				item.rank = index+1 ;
				return item
			}) : []
		}else{
			alert(res.errmsg)
		}
		return []
	}
	
	// 设置自己的排位
	private async setSelfRank(user,index){
		if(user){
			var myCollection:eui.ArrayCollection = new eui.ArrayCollection(user);
			var dataGroup:eui.DataGroup = new eui.DataGroup();
			dataGroup.dataProvider = myCollection;
			dataGroup.percentWidth = 100;
			dataGroup.percentWidth = 100;
			dataGroup.itemRenderer = RankItem;
			this[`self_rank${index}`].addChild(dataGroup)
		}
		this[`self_rank${index === 1 ? 1 : 2}_group`].visible = true
		this[`self_rank${index === 1 ? 2 : 1}_group`].visible = false
	}

	private pullDownLoad(index){
		const rankView = this[`rank${index}_view`];
		// scrollV 可视区域水平方向起始点
		// height 滚动视图高度
		// contentHeight 视域的内容宽度
		const { scrollV,contentHeight,height } = rankView.viewport;
		if( scrollV + height === contentHeight ){
			console.log( 'scroll bottom' )
			const loading = new eui.Label();
			loading.text = '加载中';
			this.current_show_rank.data.addItem({
				isloading:true
			})
		}
		console.log( '=== scroll end ===' );
	}
	
}