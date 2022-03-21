import { Component, OnDestroy, OnInit } from "@angular/core";
import { Store } from '@ngrx/store';
import { State as GraphState, STORE_GRAPH_SLICE_NAME } from './../../../store/state';
import { Subscription } from "rxjs";
import { NwNodeType } from "../../../models/nw-config";
import { ConfigParserService } from "../../../services/config-parser.service";
import * as graphSelectors from '../../../store/selectors';
import { take } from "rxjs/operators";
import { GraphUpdateService } from "../../../services/graph-update.service";
import { ExcludeNodeTypes } from "../../../store/actions";

export interface Task {
    type: null | NwNodeType; 
    included: boolean; 
    subtasks?: Task[];
}

@Component({
    selector: 'sidebar-filter', 
    templateUrl: './filter.component.html', 
    styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit, OnDestroy { 
    task: Task = {
        type: null, 
        included: true, 
        subtasks: []
    };
    
    allComplete: boolean = true; 
    excludedNodeTypes: string[] = []; 
    notificationUpdatedSub: Subscription | undefined; 
    graphDataSub: Subscription | undefined; 
    disableFilters = true;
    
    constructor(private store$: Store<GraphState>, private configParserService: ConfigParserService, private graphUpdateService: GraphUpdateService) {
    }
    
    ngOnInit() { 
        this.store$.select(graphSelectors.selectExcludedNodeTypes).pipe(take(1)).subscribe((nTypes) => {
            this.excludedNodeTypes = nTypes;
            this.loadNodeTypes(this.excludedNodeTypes); 
        }); 
        this.graphDataSub = this.store$.select(graphSelectors.selectGraphData).subscribe((graphData) => {
            this.disableFilters = graphData && graphData.nodes.size > 0? false : true;
        }); 
        this.notificationUpdatedSub = this.configParserService.notificationUpdated$.subscribe(() => {
            this.loadNodeTypes(this.excludedNodeTypes);
        })
    }
    
    ngOnDestroy() {
        if(this.notificationUpdatedSub) {
            this.notificationUpdatedSub.unsubscribe();
        }
        if(this.graphDataSub) {
            this.graphDataSub.unsubscribe();
        }
    }

    loadNodeTypes(excludedNodeTypes: string[]) {
        const newSubTasks: Task [] = []; 
        this.configParserService.nwNodeTypes.forEach((value, key) => {
            newSubTasks.push({ type: value, included: excludedNodeTypes.indexOf(key) === -1 ? true : false });
        }); 
        this.task.subtasks = newSubTasks;
    }
    
    updateAllComplete() {
        this.allComplete = this.task.subtasks != null && this.task.subtasks.every(t => t.included); 
        if(this.allComplete) {
            this.store$.dispatch(new ExcludeNodeTypes([]));
         } else { 
            const nTypes: string[] = []; 
            if(Array.isArray(this.task.subtasks)) {
                this.task.subtasks.forEach(x => {
                    if(!x.included && x.type) { 
                        nTypes.push(x.type.name);
                    }
                }); 
            }
            this.store$.dispatch(new ExcludeNodeTypes(nTypes));
        }
    }
    someComplete() : boolean {
        if(this.task.subtasks == null) { 
            return false; 
        } 
        return this.task.subtasks.filter(t => t.included).length > 0 && !this.allComplete;
    }
    
    get allPossibleNodeTypes(): string[] { 
        const nTypes: string[] = []; 
        if(Array.isArray(this.task.subtasks)) {
            this.task.subtasks.forEach(x => {
                if(x.type) {
                    nTypes.push(x.type.name); 
                }
            }); 
        }
        return nTypes;
    }
    
    setAll(included: boolean) {
        this.allComplete = included; 
        if(this.task.subtasks == null) { 
            return; 
        } 
        this.task.subtasks.forEach(t => t.included = included); 
        if(this.allComplete) {
            this.store$.dispatch(new ExcludeNodeTypes([]));
        } else {
            this.store$.dispatch(new ExcludeNodeTypes(this.allPossibleNodeTypes));
        }
    }
}
        
