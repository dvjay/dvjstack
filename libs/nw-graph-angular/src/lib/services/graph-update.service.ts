import { Injectable } from '@angular/core'; 
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { INwData } from '../models/nw-data';
import { GraphEngineService } from './graph-engine.service';
import { State as GraphState, STORE_GRAPH_SLICE_NAME } from '../store/state';
import * as graphSelectors from '../store/selectors'; 
import { CollapseAllNodes, ExcludeNodeTypes, ExpandAllNodes } from '../store/actions';


@Injectable()
export class GraphUpdateService {
    selectDirectLinkedFilterByNodeType$: any;

    constructor(private store$: Store<GraphState>, public graphEngineService: GraphEngineService) {
        this.selectDirectLinkedFilterByNodeType$ = this.store$.select(graphSelectors.selectDirectLinkedFilterByNodeType);
    }

    renderGraphFromStore() {
        this.selectDirectLinkedFilterByNodeType$.pipe(take(1)).subscribe((graphData: INwData) => {
            this.renderGraph(graphData);
        });
    }

    renderGraph(graphData: INwData) {
        this.store$.pipe(take(1)).subscribe((val: any) => {
        let graphState = val[STORE_GRAPH_SLICE_NAME] as GraphState;
            if (graphState.rootNodeId) {
                this.graphEngineService.updateGraph(
                graphData,
                graphState.rootNodeId,
                graphState.nodeTypes,
                graphState.activeLayout,
                true
                );
            }
        });
    }

    expandAllNodes() {
        this.store$.dispatch(new ExpandAllNodes());
        this.renderGraphFromStore();
    }   
    collapseAllNodes() {
        this.store$.dispatch(new CollapseAllNodes());
        this.renderGraphFromStore();
    }

    filterExcludeNodeTypes(nodeTypes: string[]) {
        this.store$.dispatch(new ExcludeNodeTypes(nodeTypes));
        this.renderGraphFromStore();
    }
}