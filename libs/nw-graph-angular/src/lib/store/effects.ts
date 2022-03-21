import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { State as GraphState, STORE_GRAPH_SLICE_NAME} from './state';
import { ActionTypes, ExpandNode, ExpandNodeContext, ExternalDataPayload, LoadExternalDeltaData } from './actions';
import { map, tap } from 'rxjs/operators';
import { GraphUpdateService } from '../services/graph-update.service';

@Injectable()
export class NetworkGraphEffects {
    constructor(private actions$: Actions, private graphUpdateService: GraphUpdateService) {
    }

    @Effect({dispatch: false})
    PositionAllNodes$: Observable<Action> = this.actions$.pipe(
        ofType(ActionTypes.RESET_VISIBLE_NODES_POSITIONS, 
                ActionTypes.CHANGE_ACTIVE_LAYOUT),
        tap(() => {
            this.graphUpdateService.positionVisibleNodes();
        }));

    @Effect({dispatch: false})
    tickVisibleNodes$: Observable<Action> = this.actions$.pipe(
        ofType(ActionTypes.COLLAPSE_NODE,
                ActionTypes.COLLAPSE_ALL_NODES,
                ActionTypes.EXCLUDE_NODE_TYPES,
                ActionTypes.EXPAND_ALL_NODES,
                ActionTypes.LOAD_EXTERNAL_DELTA_DATA),
        tap(() => {
            this.graphUpdateService.tickGraph();
        }));

    @Effect({dispatch: false})
    loadOriginalRootNode$: Observable<Action> = this.actions$.pipe(
        ofType(ActionTypes.LOAD_EXTERNAL_DATA),
        tap(() => {
            this.graphUpdateService.positionAllNodes();
        }));

    @Effect({dispatch: false})
    loadDeltaRootNode$: Observable<ExpandNodeContext> = this.actions$.pipe(
        ofType(ActionTypes.EXPAND_NODE),
        map((action: ExpandNode) => action.payload),
        tap((payload) => {
            this.graphUpdateService.positionNeighborNodes(payload.rootNodeId, payload.currentVisibleNodes);
        }));
    
}