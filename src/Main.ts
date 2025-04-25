//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////


// Egret WebSocket API 
// http://developer.egret.com/cn/apidoc/index/name/egret.WebSocket


// {
//     "keys": "description_json,btn_bg1_png,btn_bg2_png,vs_png,who_png,match_top_png,jb_png,ax_png,logo_png,loading_fill_png,loading_bg_png,yb_select1_png,yb_select10_png,yb_select9_png,yb_select8_png,yb_select7_png,yb_select6_png,yb_select5_png,yb_select4_png,yb_select3_png,yb_select2_png,yb_select13_png,yb_select12_png,yb_select11_png,yb_detail_top_png,yb_detail_bottom1_png,yb_detail_bottom2_png,levelup_png,login_png,start_top_png,rank_btn_png,spc_btn_png,push_png,key_png,pk_btn_png,bottom_nav3_png,bottom_nav1_png,bottom_nav2_png,bottom_nav4_png,yb_btn_png,shopping_top_png,tab_btn_png,tab_btn_active_png,shopping_key_png,back_png,buy_png,buy_bg_png,buy_top_png,message_bg_png,rank1_png,rank3_png,rank2_png,rank_top_png,jp_png,nopass_png,pass_png,6b_mask_png,6b_png,ranking_top_png,ranking_item_bg_png,game_bg1_png,game_bg2_png,question_box_png,game_time_png,reward_png,arrow_png,btn_bg3_png,btn_bg4_png,btn_bg5_png,right_tip_png,error_tip_png,nokey_top_png,answer_right_png,answer_error_png,ranking_s_png,btn_bg6_png,logo_ax_png,service_top_png,service_qr_png,about_logo_png,about_top_png",
//     "name": "preload"
// },


class Main extends eui.UILayer {

    
    protected createChildren(): void {
        super.createChildren();

        // // 初始化 wxsdk
		const wxsdk = WxSDK.getInstance()
		wxsdk.init()

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin
        })

        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }

        //inject the custom material parser
        //注入自定义的素材解析器
        let assetAdapter = new AssetAdapter();
        egret.registerImplementation("eui.IAssetAdapter", assetAdapter);
        egret.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());

        this.runGame().catch(e => {
            console.log(e);
        })
    }

    private async runGame() {
        await this.loadResource()
        this.createGameScene();
        const result = await RES.getResAsync("description_json")
        await platform.login();
        const userInfo = await platform.getUserInfo();
        console.log(userInfo);
    }

    private async loadResource() {
        try {
            await RES.loadConfig("resource/default.res.json", "resource/");
            await this.loadTheme();
            const loadingView = new LoadingUI();
            this.addChild(loadingView);
            await RES.loadGroup("preload", 0, loadingView);
            this.removeChild(loadingView);
        }
        catch (e) {
            console.error(e);
        }
    }

    private loadTheme() {
        return new Promise((resolve, reject) => {
            // load skin theme configuration file, you can manually modify the file. And replace the default skin.
            //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
            let theme = new eui.Theme("resource/default.thm.json", this.stage);
            theme.addEventListener(eui.UIEvent.COMPLETE, () => {
                resolve();
            }, this);
        })
    }

    /**
     * 创建场景界面
     * Create scene interface
     */
    protected async createGameScene(): Promise<any> {
        SceneManager.getInstance().rootLayer = this;
        // BeginScene.getInstance() 游戏开始界面
        // StartScene.getInstance() 游戏菜单场景
        // RankScene.getInstance()  游戏排行榜场景
        // RankingListScene.getInstance() 排位赛列表场景
        // GameScene.getInstance() 游戏场景
        // RankingResultScene.getInstance() 排位赛结果
        // PkScene.getInstance() PK匹配场景
        // ShoppingMallScene.getInstance() 商城场景 
        // StartScene
        
        // RankingListScene.getInstance()
        // PkGameScene.getInstance()
        // SocketIO.getInstance().init();
        SceneManager.getInstance().changeScene( BeginScene.getInstance() );
    }
}
