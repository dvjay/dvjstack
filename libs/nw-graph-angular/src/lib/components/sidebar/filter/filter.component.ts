import { ILayout } from './../../../models/nw-data';
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Store } from '@ngrx/store';
import { State as GraphState } from './../../../store/state';
import { Subscription } from "rxjs";
import { NwNodeType } from "../../../models/nw-config";
import { ConfigParserService } from "../../../services/config-parser.service";
import * as graphSelectors from '../../../store/selectors';
import { take } from "rxjs/operators";
import { ExcludeNodeTypes } from "../../../store/actions";

export interface INwNodeTypes {
    type: null | NwNodeType; 
    included: boolean; 
    valid: boolean;
}

@Component({
    selector: 'sidebar-filter', 
    templateUrl: './filter.component.html', 
    styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit, OnDestroy {
    nwNodeTypes: INwNodeTypes[] = [];
    
    allComplete: boolean = true; 
    excludedNodeTypes: string[] = []; 
    notificationUpdatedSub: Subscription | undefined; 
    graphActiveLayoutSub: Subscription | undefined;
    rootNodeTypeSub: Subscription | undefined;
    rootNodeType: string | undefined;
    currentLayout: ILayout | null = null;
    
    constructor(private store$: Store<GraphState>, private configParserService: ConfigParserService) {
    }
    
    ngOnInit() { 
        this.store$.select(graphSelectors.selectExcludedNodeTypes).pipe(take(1)).subscribe((nTypes) => {
            this.excludedNodeTypes = nTypes;
            this.loadNodeTypes(this.excludedNodeTypes); 
        });
        this.notificationUpdatedSub = this.configParserService.notificationUpdated$.subscribe(() => {
            this.loadNodeTypes(this.excludedNodeTypes);
        });
        this.graphActiveLayoutSub = this.store$.select(graphSelectors.selectGraphLayout).subscribe((activeLayout) => {
            this.currentLayout = activeLayout;
        });
        this.rootNodeTypeSub = this.store$.select(graphSelectors.selectRootNodeType).subscribe((nodeType) => {
            this.rootNodeType = nodeType;
            this.nwNodeTypes.forEach(x => {
                if(x.type && x.type.name === this.rootNodeType) { 
                    x.valid = false;
                }
            });
            this.setAllComplete();
        });
    }
    
    ngOnDestroy() {
        if(this.notificationUpdatedSub) {
            this.notificationUpdatedSub.unsubscribe();
        }
        if(this.graphActiveLayoutSub) {
            this.graphActiveLayoutSub.unsubscribe();
        }
        if(this.rootNodeTypeSub) {
            this.rootNodeTypeSub.unsubscribe();
        }
    }

    loadNodeTypes(excludedNodeTypes: string[]) {
        const newSubTasks: INwNodeTypes [] = []; 

        this.configParserService.nwNodeTypes.forEach((value, key) => {
            newSubTasks.push({ type: value, included: excludedNodeTypes.indexOf(key) === -1 ? true : false, valid: key !== this.rootNodeType});
        }); 
        this.nwNodeTypes = newSubTasks;
    }

    setAllComplete() {
        this.allComplete = this.nwNodeTypes != null && this.nwNodeTypes.filter(x=> x.valid).every(t => t.included); 
    }
    
    updateAllComplete() {
        this.setAllComplete();
        if(this.allComplete) {
            this.store$.dispatch(new ExcludeNodeTypes({excudeNodeTypes: [], currentLayout: this.currentLayout}));
         } else { 
            const nTypes: string[] = []; 
            if(Array.isArray(this.nwNodeTypes)) {
                this.nwNodeTypes.forEach(x => {
                    if(!x.included && x.type) { 
                        nTypes.push(x.type.name);
                    }
                }); 
            }
            this.store$.dispatch(new ExcludeNodeTypes({excudeNodeTypes: nTypes, currentLayout: this.currentLayout}));
        }
    }
    someComplete() : boolean {
        if(this.nwNodeTypes == null) { 
            return false; 
        } 
        return this.nwNodeTypes.filter(t => t.included && t.valid).length > 0 && !this.allComplete;
    }
    
    get allPossibleNodeTypes(): string[] { 
        const nTypes: string[] = []; 
        if(Array.isArray(this.nwNodeTypes)) {
            this.nwNodeTypes.forEach(x => {
                if(x.type && x.valid) {
                    nTypes.push(x.type.name); 
                }
            }); 
        }
        return nTypes;
    }
    
    setAll(included: boolean) {
        this.allComplete = included; 
        if(this.nwNodeTypes == null) { 
            return; 
        } 
        this.nwNodeTypes.forEach(t => t.included = included); 
        if(this.allComplete) {
            this.store$.dispatch(new ExcludeNodeTypes({excudeNodeTypes: [], currentLayout: this.currentLayout}));
        } else {
            this.store$.dispatch(new ExcludeNodeTypes({excudeNodeTypes: this.allPossibleNodeTypes, currentLayout: this.currentLayout}));
        }
    }
}
        
