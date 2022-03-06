import { Injectable } from '@angular/core';
import { Notification } from '../models/notification';

const ALL_NOTIFICATION_MESSAGES = [
    { name: 'max_nodes_exceeded', message: "Max Nodes Exceeded. It might affect the performance." }
 ].map((anm) => new Notification(anm.name, anm.message));
 
 @Injectable() export class FadeinNotificationService {
    notifications: Notification[] = [];
    
    canAdd() {
        return this.notifications.length < ALL_NOTIFICATION_MESSAGES.length;
    }
    
    canRemove() {
        return this.notifications.length > 0;
    }
    
    add(active = true) {
        let note = ALL_NOTIFICATION_MESSAGES[this.notifications.length]; 
        this.notifications.push(note); 
        setTimeout(() => {
            this.remove(); 
        }, 30000);
    }
    
    remove() {
        this.notifications. length -= 1;
    }
 }