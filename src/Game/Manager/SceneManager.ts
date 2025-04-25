class SceneManager extends eui.Component {
    public rootLayer:eui.UILayer; // 起始场景
    public scenes = [] // 场景栈

    private static shared:SceneManager;
	public static getInstance(){
		if( !SceneManager.shared){
			SceneManager.shared = new SceneManager();
		}
		return SceneManager.shared;
	}

    // 切换场景
    public changeScene(s:eui.Component){
        if( this.scenes.length ){
            // this.popScene();
            const pop_s = this.scenes.pop();
            this.rootLayer.removeChild(pop_s);
            this.pushScene(s);
        }else{
            this.pushScene(s);
        }
    }

    // 弹出场景层
    public pushScene(s:eui.Component){

        this.scenes.push(s);
        this.rootLayer.addChild(s);

        if( (<any>s).onShow ) (<any>s).onShow()
    }

    // 关闭场景层
    public popScene(){
        const s = this.scenes.pop();
        this.rootLayer.removeChild(s);

        // 如果是在用 changeScene 等下次事件循环changeScene完成后再执行onshow
        const timer = setTimeout(()=>{
            const curretScene = <any>this.scenes[this.scenes.length-1]
            if( curretScene && curretScene.onShow ) {
                curretScene.onShow()
            }
            clearTimeout(timer)
        },16.7)
    }
}
