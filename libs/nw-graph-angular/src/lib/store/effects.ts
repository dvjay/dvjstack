import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { State as GraphState, STORE_GRAPH_SLICE_NAME} from './state';
import { ActionTypes } from './actions';
import { tap } from 'rxjs/operators';
import { GraphUpdateService } from '../services/graph-update.service';

@Injectable()
export class NetworkGraphEffects {
    constructor(private actions$: Actions, 
                private store$: Store<GraphState>,
                public graphUpdateService: GraphUpdateService) {
    }

    @Effect({dispatch: false})
    PositionAllNodes$: Observable<Action> = this.actions$.pipe(
        ofType(ActionTypes.RESET_VISIBLE_NODES_POSITIONS, 
                ActionTypes.CHANGE_ACTIVE_LAYOUT,
                ActionTypes.EXPAND_ALL_NODES, 
                ActionTypes.EXCLUDE_NODE_TYPES,
                ActionTypes.EXPAND_NODE),
        tap(() => {
            console.log("positionVisibleNodes effectss");
            this.graphUpdateService.positionVisibleNodes();
        }));

    @Effect({dispatch: false})
    tickVisibleNodes$: Observable<Action> = this.actions$.pipe(
        ofType(ActionTypes.COLLAPSE_NODE,
                ActionTypes.COLLAPSE_ALL_NODES),
        tap(() => {
            this.graphUpdateService.tickGraph();
        }));
    
}