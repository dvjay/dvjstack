import { Injectable } from '@angular/core'; 
import { Subject } from 'rxjs'; 
import { LoadNodesPayload } from '../models/load-nodes-payload';

@Injectable() export class DispatchNodeLoadService {
    private nodeLoadSource;
    public dispatchNodeLoad$;
    constructor() {
        this.nodeLoadSource = new Subject<string[]>(); 
        this.dispatchNodeLoad$ = this.nodeLoadSource.asObservable();
    }
    
    dispatchNodeLoad(payload: LoadNodesPayload) { 
        if(payload && Array.isArray(payload.nodesToLoad)) {
            this.nodeLoadSource.next(payload.nodesToLoad.map((x: any) => x.nodeId));
        }
    }
}
