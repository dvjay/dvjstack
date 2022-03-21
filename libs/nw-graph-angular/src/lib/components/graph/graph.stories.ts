import { GraphUpdateService } from '../../services/graph-update.service';
import {
    moduleMetadata,
    Story,
    Meta,
    componentWrapperDecorator,
    action,
    boolean,
    number,
    text,
    withKnobs,
    object
} from 'storybook-storykit';

import { CommonModule } from '@angular/common';
import { GraphComponent } from './graph.component';
import { RootStateModule } from "../../root-state.module";
import { ZoomableDirective } from "../../directives/zoomable.directive";
import { DraggableDirective } from '../../directives/draggable.directive';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { D3Service } from "../../services/d3.service";
import { GraphEngineService } from "../../services/graph-engine.service";
import { FadeinNotificationService } from "../../services/fadein-notification.service";
import { NodeRelationService } from "../../services/node-relation.service";
import { NotificationBrokerService } from "../../services/notification-broker.service";
import { ConfigParserService } from "../../services/config-parser.service";
import { DataBuilderService } from "../../services/data-builder.service";
import { LinkComponent } from '../../components/link/link.component';
import { NodeComponent } from '../../components/node/node.component';
import { NodeLabelComponent } from '../../components/node-label/node-label.component';
import { LegendComponent } from '../../components/legend/legend.component';
import { FadeinNotificationComponent } from '../../components/fadein-notification/fadein-notification.component';
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
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { FilterComponent } from '../../components/sidebar/filter/filter.component';
import { ParamListComponent } from '../../components/sidebar/param-list/param-list.component';

import { rootNodeId as nwRootNodeId, dataLoading as nwDataLoading, config as nwConfig, data as nwData, onNumHopChange as onNwNumHopChange } from './graph.data';
import { RectButtonComponent } from '../common/button/rect-button.component';
import { DebounceClickDirective } from '../../directives/debounce-click.directive';
import { SelectedNodesListComponent } from '../sidebar/selected-nodes-list/selected-nodes-list.component';
// import * as TaskStories from './task.stories';

export default {
    title: 'Network Graph',
    component: GraphComponent,
    decorators: [withKnobs,
        moduleMetadata({
            //👇 Imports both components to allow component composition with Storybook
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
            imports: [CommonModule,
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
                            MatButtonModule],
            providers: [D3Service, 
                            GraphEngineService, 
                            GraphUpdateService,
                            NotificationBrokerService, 
                            NodeRelationService,
                            ConfigParserService, 
                            DataBuilderService, 
                            FadeinNotificationService],
    }),
    //👇 Wraps our stories with a decorator
    // componentWrapperDecorator(
    //     (story) => `<div style="margin: 3em">${story}</div>`
    // ),
  ],
  // argTypes: {
  //   variant: {
  //     options: ['primary', 'secondary'],
  //     control: { type: 'radio' },
  //   },
  // },
} as Meta;

export const actionsData = {
  numHopChanged: action('numHopChanged'),
  dataUpdated: action('dataUpdated'),
  nodeDoubleClicked: action('nodeDoubleClicked')
};

export const Primary = () => ({
  comsponent: GraphComponent,
  props: {
    rootNodeId: text('rootNodeId', nwRootNodeId),
    dataLoading: nwDataLoading,
    config: nwConfig,
    // data: object('data', {}),
    data: object('data', {...nwData}),
    nodeCount: 0,
    numHopChanged: actionsData.numHopChanged,
    dataUpdated: actionsData.dataUpdated,
    nodeDoubleClicked: actionsData.nodeDoubleClicked
  },
});
