import { Injectable } from '@angular/core'; 
import { Subject, Observable } from 'rxjs'; 
import { INode, IEdge } from '../models/nw-data';

@Injectable() export class NodeRelationService {
    private notificationMoveOverSource = new Subject<CurrentMouseOverNodeOrEdge>(); 
    private notificationMoveOutsource = new Subject<CurrentMouseOverNodeOrEdge>();
    
    notificationMoveOver$: Observable<CurrentMouseOverNodeOrEdge> = this.notificationMoveOverSource.asObservable(); 
    notificationMoveOut$: Observable<CurrentMouseOverNodeOrEdge> = this.notificationMoveOutsource.asObservable();
    // currentMoveOverNode: node = null; 
    // currentMoveOverEdge: link = null;
    
    notificationMouseOver(message: CurrentMouseOverNodeOrEdge) {
        this.notificationMoveOverSource.next(message);
    }
    
    notificationMouseOut(message: CurrentMouseOverNodeOrEdge) {
        this.notificationMoveOutsource.next(message);
    }
}

export interface CurrentMouseOverNodeOrEdge {
    node?: INode; 
    edge?: IEdge; 
    potentialSelectedNodes?: INode[]
}
