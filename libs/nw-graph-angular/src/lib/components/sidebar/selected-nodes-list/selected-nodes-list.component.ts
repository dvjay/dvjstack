import { INwData } from './../../../models/nw-data';
import { Component, OnInit } from "@angular/core";
import { INode } from "../../../models/nw-data";
import { Store } from '@ngrx/store';
import { State as GraphState } from '../../../store/state';
import * as graphSelectors from '../../../store/selectors';
import { combineLatest, Observable, Subscription } from 'rxjs';

@Component({
    selector: 'selected-nodes-list',
    templateUrl: './selected-nodes-list.component.html',
    styleUrls: ['./selected-nodes-list.component.css']
})
export class SelectedNodesListComponent implements OnInit {
    selectedNodes: (INode | undefined)[] = [];
    selectGraphData$: Observable<INwData | null> | undefined;
    selectSelectedNodeIds$: Observable<string[]> | undefined;
    combinedGraphDataSub: Subscription | undefined;
    
    constructor (private store$: Store<GraphState>) {
    }
    
    // onMouseover(sNode: INode) { 
    //     if(sNode) {
    //         this.notificationBrokerService.notificationMouseover({ nodeIds: [sNode.nodeId]});
    //     }
    // }
    
    // onMouseout(sNode: INode) {
    //     if(sNode) {
    //         this.notificationBrokerservice.notificationMouseout({nodeIds: [sNode.nodeId]});
    //     }
    // }
    
    ngOnInit() {
        this.selectGraphData$ = this.store$.select(graphSelectors.selectGraphData);
        this.selectSelectedNodeIds$ = this.store$.select(graphSelectors.selectSelectedNodeIds);
        const combinedGraphData$ = combineLatest([this.selectGraphData$, this.selectSelectedNodeIds$]);

        this.combinedGraphDataSub = combinedGraphData$.subscribe(([graphData, selectedNodeIds]) => {
            if(graphData) {
                this.selectedNodes = selectedNodeIds.map((id) => {
                    return graphData.nodes.get(id);
                });
            } else {
                this.selectedNodes = [];
            }
        });
    }

    ngOnDestroy() {
        if(this.combinedGraphDataSub) {
            this.combinedGraphDataSub.unsubscribe();
        }
    }
}