import { Component, OnInit } from "@angular/core";
import { INode } from "../../../models/nw-data";
import { Store } from '@ngrx/store';
import { State as GraphState, STORE_GRAPH_SLICE_NAME } from '../../../store/state';
import { take, debounceTime } from 'rxjs/operators';
import * as graphSelectors from '../../../store/selectors';

@Component({
    selector: 'selected-nodes-list',
    templateUrl: './selected-nodes-list.component.html',
    styleUrls: ['./selected-nodes-list.component.css']
})
export class SelectedNodesListComponent implements OnInit {
    selectedNodes: (INode | undefined)[] = [];
    
    // constructor (private store$: Store<Graphstate>, private notificationBrokerservice: NotificationBrokerservice) {
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
        this.store$.select(graphSelectors.selectDirectLinkedFilterByNodeType).pipe(debounceTime(1000)).subscribe(
            () => {
                this.getCurrentSelectedNodeFromStore();
            });
        this.store$.select(graphSelectors.selectSelectedNodeIds).subscribe(
            () => {
                this.getCurrentSelectedNodeFromStore(); 
        });
    }
    
    getCurrentSelectedNodeFromStore() {
        this.store$.pipe(take(1)).subscribe((val: {[key: string]: any}) => {
            let graphState = val[STORE_GRAPH_SLICE_NAME] as GraphState;
            const selectedNodeIds = graphState.selectedNodeIds;
            if(graphState && graphState.data) {
                const nodes = graphState.data.nodes;
                this.selectedNodes = selectedNodeIds.map((id) => {
                    return nodes.get(id);
                });
            } else {
                this.selectedNodes = [];
            }
        });
    }
}