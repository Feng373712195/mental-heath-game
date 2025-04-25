class AboutLevelScene extends CommonGameScene {
	private tip:eui.Label
	private level_list:eui.Scroller

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
		this.setBackBtn()
		this.setText()
	}

	private static shared:AboutLevelScene;
	public static getInstance(){
		if( !AboutLevelScene.shared){
			AboutLevelScene.shared = new AboutLevelScene();
		}
		return AboutLevelScene.shared;
	}
	
	private async setText(){
		const loading = Loading.getInstance()

		loading.show()

		const res = await Http.GetRequest<{
			errcode:number,
			errmsg:string,
			text:string,
			ranks:any[],
		}>('/rank/help')

		loading.hide()

		if( res.errcode === 0 ){
			this.tip.text = res.text;
			
			var myCollection:eui.ArrayCollection = new eui.ArrayCollection(res.ranks);
			// 创建DataGroup,并设置数据源
			var dataGroup:eui.DataGroup = new eui.DataGroup();
			dataGroup.dataProvider = myCollection;
			dataGroup.percentWidth = 100;
			dataGroup.percentHeight = 100;
			dataGroup.itemRenderer = AboutLevelItem;
			dataGroup.useVirtualLayout = true;
			this.level_list.viewport = dataGroup
		}else{
			alert(res.errmsg)
		}
	}
}