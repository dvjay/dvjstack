import { Component, Input, ViewChildren, QueryList, OnInit, OnDestroy } from '@angular/core'; 
import { Store } from '@ngrx/store'; 
import { State as GraphState, STORE_GRAPH_SLICE_NAME } from '../../store/state'; 
import * as graphSelectors from '../../store/selectors'; 
import { GraphLog, GraphLogType } from '../../models/graph-log'; 
import { INode } from '../../models/nw-data'; 

@Component({
    selector: 'nw-sidebar', 
    templateUrl: './sidebar.component.html', 
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
    @Input('nodes') nodes: INode[] | undefined; 
    sidebarState = 'open'; 
    selectedTool = 'filter';

    logs$: any;
    logs: GraphLog[] = [];
    errorLogs: GraphLog[] = [];
    alertLogs: GraphLog[] = [];

    filterHover = false;
    alertsHover = false;
    logsHover = false;
    settingsHover = false;
    selectedNodesHover = false;
    
    constructor(private store$: Store<GraphState>) {
    }
    
    ngOnInit() { 
        this.logs$ = this.store$.select(graphSelectors.selectLogs).subscribe(logs => {
            this.logs = logs; 
            if(Array.isArray(logs) && logs[0] && (logs[0].logType === GraphLogType.Error || logs[0].logType === GraphLogType. RetryableError)) { 
                this.errorLogs = [logs[0], ...this.errorLogs];
            }
        });
    }
    
    ngOnDestroy() {
        this.logs$.unsubscribe();
    }
    
    openSidebar(e: any) {
        e.stopPropagation(); 
        this.sidebarState = this.sidebarState === 'open'? 'close': 'open';
    }
    
    selectTool(tool: string) {
        this.selectedTool = tool; 
    }
}
