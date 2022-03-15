import { NgModule } from '@angular/core';
import { GraphComponent } from './components/graph/graph.component';
import { RootStateModule } from "./root-state.module";
import { ZoomableDirective } from "./directives/zoomable.directive";
import { DraggableDirective } from './directives/draggable.directive';
import { TooltipDirective } from './directives/tooltip.directive';
import { D3Service } from "./services/d3.service";
import { GraphEngineService } from "./services/graph-engine.service";
import { FadeinNotificationService } from "./services/fadein-notification.service";
import { DispatchNodeLoadService } from "./services/dispatch-node-load.service";
import { NodeRelationService } from "./services/node-relation.service";
import { NotificationBrokerService } from "./services/notification-broker.service";
import { ConfigParserService } from "./services/config-parser.service";
import { DataBuilderService } from "./services/data-builder.service";
import { LinkComponent } from './components/link/link.component';
import { NodeComponent } from './components/node/node.component';
import { NodeLabelComponent } from './components/node-label/node-label.component';
import { LegendComponent } from './components/legend/legend.component';
import { FadeinNotificationComponent } from './components/fadein-notification/fadein-notification.component';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { A11yModule } from '@angular/cdk/a11y';
import { MatButtonModule, MatCardModule, 
          MatCheckboxModule, 
          MatDividerModule, 
          MatFormFieldModule,
          MatIconModule, 
          MatInputModule,
          MatListModule, 
          MatMenuModule, 
          MatProgressSpinnerModule, 
          MatSelectModule, 
          MatSlideToggleModule, 
          MatSnackBarModule, 
          MatToolbarModule, 
          MatTooltipModule } from '@angular/material'
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FilterComponent } from './components/sidebar/filter/filter.component';
import { ParamListComponent } from './components/sidebar/param-list/param-list.component';
import { RectButtonComponent } from './components/common/button/rect-button.component';
import { DebounceClickDirective } from './directives/debounce-click.directive';
import { SelectedNodesListComponent } from './components/sidebar/selected-nodes-list/selected-nodes-list.component';
import { GraphUpdateService } from './services/graph-update.service';

@NgModule({
  declarations: [GraphComponent,
                  LinkComponent,
                  NodeComponent,
                  NodeLabelComponent,
                  LegendComponent,
                  FadeinNotificationComponent,
                  SidebarComponent,
                  FilterComponent,
                  ParamListComponent,
                  ZoomableDirective,
                  DraggableDirective,
                  TooltipDirective,
                  DebounceClickDirective,
                  RectButtonComponent,
                  SelectedNodesListComponent],
  imports: [
    CommonModule, 
    BrowserAnimationsModule,
    FormsModule, 
    OverlayModule, 
    A11yModule,
    RootStateModule,
    MatListModule, 
    MatCardModule, 
    MatCheckboxModule, 
    MatToolbarModule, 
    MatSelectModule, 
    MatProgressSpinnerModule, 
    MatIconModule, 
    MatSlideToggleModule, 
    MatMenuModule, 
    MatSnackBarModule, 
    MatDividerModule, 
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  providers: [
    D3Service, 
    GraphEngineService,
    GraphUpdateService,
    NotificationBrokerService, 
    NodeRelationService, 
    DispatchNodeLoadService, 
    ConfigParserService, 
    DataBuilderService, 
    FadeinNotificationService
  ],
  exports: [GraphComponent]
})
export class NetworkGraphModule { }
