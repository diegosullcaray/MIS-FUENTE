import { Component, OnDestroy, OnInit } from "@angular/core";
import { StgAppLoaderService } from "app/shared/components/stg-app-loader/stg-app-loader.service";
import { ClientSummaryService } from "app/shared/services/client-summary.service";
import { printLog } from 'app/core/helpers/debug.util';

@Component({
  selector: 'client-summary',
  templateUrl: './client-summary.component.html',
  styleUrls: ['./client-summary.component.scss']
})
export class ClientSummaryComponent implements OnInit, OnDestroy {
  config: any;
  activeTab: number = 0;
  geo_options: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    //mapId: "DEMO_MAP_ID"
  };
  geo_zoom = 15;

  constructor(
    private cliSum: ClientSummaryService,
    private loader: StgAppLoaderService
  ) {

  }

  ngOnInit(): void {
    this.config = this.cliSum.config;
    printLog(this.config);
    this.cliSum.loadData();
  }

  ngOnDestroy(): void {
    this.cliSum.clean();
  }



  setActiveTab(tabNumber: number) {
    this.activeTab = tabNumber;
  }
}