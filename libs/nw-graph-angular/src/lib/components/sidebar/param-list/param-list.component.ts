import { ILayout } from './../../../models/nw-data';
import { LayoutChangeMessage } from './../../../services/notification-broker.service';
import { Component, OnInit, OnDestroy } from '@angular/core'; 
import { Store } from '@ngrx/store'; 
import { Observable, Subscription } from 'rxjs'; 
import { State as GraphState } from '../../../store/state'; 
import * as graphSelectors from '../../../store/selectors'; 
import { ConfigParserService } from '../../../services/config-parser.service'; 
import { INwData } from '../../../models/nw-data';
import { NotificationBrokerService } from '../../../services/notification-broker.service';
import { GraphUpdateService } from '../../../services/graph-update.service';
import { CollapseAllNodes, ExpandAllNodes } from '../../../store/actions';
import { take } from 'rxjs/operators';

@Component({
    selector: 'param-list', 
    templateUrl: './param-list.component.html', 
    styleUrls: ['./param-list.component.css']
})
export class ParamListComponent implements OnInit, OnDestroy {
    btn = "Expand All";
    numHops: string = "2"; 
    graphData$: Observable<INwData> | undefined;
    selectedLayout: number = -1;
    activeLayoutSub: Subscription | undefined;
    loadedLayouts: Set<number>;
    layouts: ILayout[] = [];

    constructor(private store$: Store<GraphState>, 
                private configParserService: ConfigParserService, 
                public notificationBrokerService: NotificationBrokerService,
                public graphUpdateService: GraphUpdateService) {
        this.loadedLayouts = new Set<number>([]);
    }

    stripText(event: KeyboardEvent) {
        const seperator = '^([0-9])';
        const maskSeperator = new RegExp(seperator , 'g');
        let result = maskSeperator.test(event.key);
        return result;   
    }

    onLayoutChange(layoutId: number) {
        this.notificationBrokerService.OnLayoutChange({previousLayout: this.selectedLayout, currentLayout: layoutId, enableRender: this.loadedLayouts.has(layoutId)} as LayoutChangeMessage);
    }

    OnClickAllExpand() {
        this.store$.dispatch(new ExpandAllNodes());
    }
    OnClickAllCollapse() {
        this.store$.dispatch(new CollapseAllNodes());
    }
    
    ngOnInit() {
        this.store$.select(graphSelectors.selectLayouts).pipe(take(1)).subscribe((layouts) => {
            this.layouts = layouts;
        });
        this.activeLayoutSub = this.store$.select(graphSelectors.selectActiveLayout).subscribe((layoutId) => {
            this.numHops = this.configParserService.nwConfig.numHops.toString();
            this.selectedLayout = layoutId;
            this.loadedLayouts.add(layoutId);
        });
    }

    ngOnDestroy() {
        if(this.activeLayoutSub) {
            this.activeLayoutSub.unsubscribe();
        }
    }
    
    numHopsChanged() {
        this.configParserService.notififyNumHopsChange(parseInt(this.numHops));
    }
}
