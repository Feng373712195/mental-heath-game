class RankingListScene extends CommonScene{
	
	private ranking_view:eui.Scroller;
	private bg:eui.Rect;
	
	public constructor() {
		super();
	}

	private static shared:RankingListScene;
	public static getInstance(){
		if( !RankingListScene.shared){
			RankingListScene.shared = new RankingListScene();
		}
		return RankingListScene.shared;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();

		this.setBackground();
		this.setBackBtn();
	}

	public onShow(){
		this.loadRankingListView();
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

	// 获取排行数据
	private getRankingData():Promise<Array<Object>>{
		return new Promise(async resolve=>{
			Loading.getInstance().show();

			const res = await Http.GetRequest<{
				errcode:number,
				errmsg:string,
				levels:any[]
			}>('/levels')

			Loading.getInstance().hide();
			if( res.errcode === 0 ){
				resolve(res.levels)
			}else{
				alert(res.errmsg)
				resolve([])
			}
		})
	}
	
	// 创建数据集合
	private async loadRankingListView(){
		const rankingView = this['ranking_view'];
		const rankingData = await this.getRankingData();
		// 用ArrayCollection包装
		var myCollection:eui.ArrayCollection = new eui.ArrayCollection(rankingData);
		// 创建DataGroup,并设置数据源
		var dataGroup:eui.DataGroup = new eui.DataGroup();
		
		var vLayout:eui.VerticalLayout = new eui.VerticalLayout();
		vLayout.gap = -10;
		// vLayout.paddingTop = 0;
		// vLayout.paddingBottom = 0;
		// vLayout.paddingLeft = 0;
		// vLayout.paddingRight = 0;
		dataGroup.layout = vLayout;
		dataGroup.dataProvider = myCollection;
		dataGroup.percentWidth = 100;
		dataGroup.percentHeight = 100;
		dataGroup.itemRenderer = RankingItem;
		dataGroup.useVirtualLayout = false;
		rankingView.viewport = dataGroup;
	}
	
}