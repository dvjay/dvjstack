import { Component, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Notification } from '../../models/notification';

@Component({
    selector: 'network-fadein-notify',
    templateUrl: 'fadein-notification.component.html',
    styleUrls: ['./fadein-notification.component.css'],
    animations: [
        trigger('simpleFadeAnimation', [
            state('in', style({ opacity: 1})),
            transition(':enter', [
                style({ opacity: 0 }),
                animate(600),
            ]),
            transition(
                ':leave',
                animate(600, style({ opacity: 0 }))
            ),
        ]),
    ],
})
export class FadeinNotificationComponent {
    @Input() notifications: Notification[] = [];
}
