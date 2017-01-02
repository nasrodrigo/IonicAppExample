import { Component, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { FormControl } from '@angular/forms';
import { NavController, LoadingController, ActionSheetController, Content } from 'ionic-angular';
import { InAppBrowser } from 'ionic-native';
import { RedditService } from '../../providers/reddit-service';
import 'rxjs/add/operator/map';
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild(Content) content: Content;

  public feeds: Array<any>;

  public noFilter : Array<any>;

  public hasFilter: boolean = false;

  public searchTerm: string = '';

  public searchItem: string = '';

  public searchTermControl: FormControl;

  private url: string = "https://www.reddit.com/new.json";

  private olderPosts: string = "https://www.reddit.com/new.json?after=";

  private newerPosts: string = "https://www.reddit.com/new.json?before=";

  constructor(public navCtrl: NavController, public http: Http, public loadingCtrl: LoadingController, 
    public actionSheetCtrl: ActionSheetController, public redditService: RedditService) {

    this.fetchContent();

    //Search action
    this.searchTermControl = new FormControl();
  
    this.searchTermControl.valueChanges.debounceTime(1000).distinctUntilChanged().subscribe(search => {
      if (search !== '' && search) {
        this.filterItems();
      }
    })

  }

  //Fetch feeds
  fetchContent():void{
    let loading = this.loadingCtrl.create({
      content: "Fetching content..."
    });

    loading.present();

    this.redditService.fetchData(this.url).then(data => {

      this.feeds = data;

      this.noFilter = this.feeds;

      loading.dismiss();

    })

  }

  //Opens the URL in the browser
  itemSelected (url: string):void {
    let browser = new InAppBrowser(url, '_system');
  }

  //Add new feeds in the top of the list
  doRefresh(refresher){

    let paramsUrl = this.feeds[0].data.name;
      
      
    this.redditService.fetchData(this.newerPosts + paramsUrl).then(data => {
    
        this.feeds = data.concat(this.feeds);
        
        this.noFilter = this.feeds;
      
        this.hasFilter = false;
        
        refresher.complete();
        
    })

  }

  //Add in the finish of the list older feeds
  doInfinite(infiniteScroll){

    let paramsUrl = (this.feeds.length > 0) ? this.feeds[this.feeds.length - 1].data.name : "";

    this.redditService.fetchData(this.olderPosts + paramsUrl).then(data => {
    
        this.feeds = this.feeds.concat(data);
        
        this.noFilter = this.feeds;
      
        this.hasFilter = false;
        
        infiniteScroll.complete();
        
    })

  }

  //Filter action
  filterItems(){

    this.hasFilter = false;

    this.feeds = this.noFilter.filter((item) => {
      return item.data.title.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1;
    });

  }

  //Build ActionSheet filter
  showFilters() :void {

    this.content.scrollToTop();

    let actionSheet = this.actionSheetCtrl.create({

      title: 'Filter options:',

      buttons: [
      {
        text: 'Music',
        handler: () => {
          this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "music");
          this.hasFilter = true;
        }
      },
      {
        text: 'Movies',
        handler: () => {
          this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "movies");
          this.hasFilter = true;
        }
      },        
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          this.feeds = this.noFilter;
          this.hasFilter = false;
        }
      }
      ]
    });

    actionSheet.present();

  } 

}
