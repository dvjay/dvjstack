import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { ActionTypes, CollapseNode, CollapseNodeContext, ExcludeNodeTypes, ExcludeNodeTypesContext, ExpandNode, ExpandNodeContext } from './actions';
import { map, tap } from 'rxjs/operators';
import { GraphUpdateService } from '../services/graph-update.service';
import { NotificationBrokerService } from '../services/notification-broker.service';

@Injectable()
export class NetworkGraphEffects {
    constructor(private actions$: Actions, private graphUpdateService: GraphUpdateService, private notificationBrokerService: NotificationBrokerService) {
    }

    @Effect({dispatch: false})
    PositionAllNodes$: Observable<Action> = this.actions$.pipe(
        ofType(ActionTypes.RESET_VISIBLE_NODES_POSITIONS, 
                ActionTypes.CHANGE_ACTIVE_LAYOUT),
        tap(() => {
            this.graphUpdateService.positionVisibleNodes();
        }));
    @Effect({dispatch: false})
    CollapseAllNodes$: Observable<Action> = this.actions$.pipe(
        ofType(ActionTypes.COLLAPSE_ALL_NODES),
        tap(() => {
            this.graphUpdateService.positionVisibleNodes();
            this.notificationBrokerService.OnDisplayedNodesChange();
        }));

    @Effect({dispatch: false})
    tickVisibleNodes$: Observable<Action> = this.actions$.pipe(
        ofType( ActionTypes.EXPAND_ALL_NODES,
                ActionTypes.CHANGE_NUM_HOP,
                ActionTypes.LOAD_EXTERNAL_DELTA_DATA),
        tap(() => {
            this.graphUpdateService.tickGraph();
            this.notificationBrokerService.OnDisplayedNodesChange();
        }));
    
    @Effect({dispatch: false})
    loadOriginalRootNode$: Observable<Action> = this.actions$.pipe(
        ofType(ActionTypes.LOAD_EXTERNAL_DATA),
        tap(() => {
            this.graphUpdateService.positionVisibleNodes();
            this.notificationBrokerService.OnDisplayedNodesChange();
        }));

    @Effect({dispatch: false})
    tickVisibleNodesAfterFilter$: Observable<ExcludeNodeTypesContext> = this.actions$.pipe(
        ofType( ActionTypes.EXCLUDE_NODE_TYPES),
        map((action: ExcludeNodeTypes) => action.payload),
        tap((payload) => {
            if(payload.currentLayout && payload.currentLayout.isPositioningCrucial) {
                this.graphUpdateService.positionVisibleNodes();
            } else {
                this.graphUpdateService.tickGraphAfterFilter();
            }
            this.notificationBrokerService.OnDisplayedNodesChange();
        }));

    @Effect({dispatch: false})
    loadDeltaRootNode$: Observable<ExpandNodeContext> = this.actions$.pipe(
        ofType(ActionTypes.EXPAND_NODE),
        map((action: ExpandNode) => action.payload),
        tap((payload) => {
            this.graphUpdateService.positionNeighborNodes(payload.rootNodeId, payload.currentVisibleNodes);
            this.notificationBrokerService.OnDisplayedNodesChange();
        }));
    @Effect({dispatch: false})
    tickVisibleNodesForCollapse$: Observable<CollapseNodeContext> = this.actions$.pipe(
        ofType(ActionTypes.COLLAPSE_NODE),
        map((action: CollapseNode) => action.payload),
        tap((payload) => {
            this.graphUpdateService.tickGraph(payload.nodeId);
            this.notificationBrokerService.OnDisplayedNodesChange();
        }));
    
}