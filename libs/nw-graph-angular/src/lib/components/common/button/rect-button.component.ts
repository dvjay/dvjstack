import { EMPTY_STRING } from '../../../utils';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
const DEFAULT_BTN_HEIGHT = 120;

@Component({
  selector: 'nw-rect-button',
  templateUrl: 'rect-button.component.html',
  styleUrls: ['button.component.css']
})
export class RectButtonComponent implements OnChanges {
  @Input("text") text: string = EMPTY_STRING;
  @Input("height") height: number = DEFAULT_BTN_HEIGHT;
  @Output("OnClick") OnClick = new EventEmitter();
  btnHeight: number = DEFAULT_BTN_HEIGHT;

  btnOnClick() {
    this.OnClick.emit();
  }

  ngOnChanges(changes: SimpleChanges) {
    const { height } = changes;
    if(!height) {
      return;
    }

    const parsed = parseInt(this.height as any);
    if(isNaN(parsed)) {
      this.btnHeight = DEFAULT_BTN_HEIGHT;
    } else {
      this.btnHeight = parsed;
    }
  }
}