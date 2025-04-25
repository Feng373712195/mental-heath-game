class LevelUpMessageBox extends MessageBox implements  eui.UIComponent {
	
	private before_level:eui.Label
	private after_level:eui.Label

	public constructor() {
		super();
	}

	private static shared:LevelUpMessageBox;
	public static getInstance(){
		if( !LevelUpMessageBox.shared){
			LevelUpMessageBox.shared = new LevelUpMessageBox();
		}
		return LevelUpMessageBox.shared;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}

	protected childrenCreated():void
	{
		super.childrenCreated();
		this.left = 0;
        this.right = 0;
        this.top = 0;
        this.bottom = 0;
	}

	public setUpLevel(before,after){
		this.before_level.text = before
		this.after_level.text = after
	}
	
}