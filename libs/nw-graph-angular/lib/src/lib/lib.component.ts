import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-lib',
  template: `
    <p>
      lib works!
    </p>
  `,
  styles: [
  ]
})
export class MyLibComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
