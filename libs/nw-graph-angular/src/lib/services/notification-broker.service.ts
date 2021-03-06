import { Injectable } from '@angular/core'; 
import { Subject, Observable } from 'rxjs';

@Injectable() 
export class NotificationBrokerService {
    private notificationMoveOverSource = new Subject<NotificationMessage>(); 
    private notificationMoveOutsource = new Subject<NotificationMessage>();
    private notificationLayoutChange = new Subject<LayoutChangeMessage>();
    private notificationDisplayedNodesChange = new Subject<void>();
    
    notificationMoveOver$: Observable<NotificationMessage> = this.notificationMoveOverSource.asObservable(); 
    notificationMoveOut$: Observable<NotificationMessage> = this.notificationMoveOutsource.asObservable();
    notificationLayoutChange$: Observable<LayoutChangeMessage> = this.notificationLayoutChange.asObservable();
    notificationDisplayedNodesChange$: Observable<void> = this.notificationDisplayedNodesChange.asObservable();

    notificationMouseover(message: NotificationMessage) {
        this.notificationMoveOverSource.next(message);
    }
    notificationMouseout(message: NotificationMessage) {
        this.notificationMoveOutsource.next(message);
    }
    OnLayoutChange(message: LayoutChangeMessage) {
        this.notificationLayoutChange.next(message);
    }
    OnDisplayedNodesChange() {
        this.notificationDisplayedNodesChange.next();
    }
}

export interface NotificationMessage {
    entityId?: string; 
    nodeIds?: string[];
}

export interface LayoutChangeMessage {
    currentLayout: number;
    previousLayout: number;
}