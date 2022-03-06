import { NetworkGraphEffects } from './store/effects';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { STORE_GRAPH_SLICE_NAME } from './store/state';
import { graphReducer } from './store/reducer';

@NgModule({
    imports:[
        CommonModule,
        StoreModule.forFeature(STORE_GRAPH_SLICE_NAME, graphReducer),
        EffectsModule.forFeature([NetworkGraphEffects])
    ],
    providers: []
})
export class NetworkGraphStateModule {}