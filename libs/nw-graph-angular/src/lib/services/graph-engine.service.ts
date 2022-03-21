import { DEFAULT_GRAPH_OPTIONS, GraphOptions } from '../models/graph-adapter';
import { EventEmitter, Injectable } from '@angular/core'; 
import { forceSimulation, forceManyBody, forceCollide, forceLink } from 'd3-force';
import { INode, IEdge, INwData } from '../models/nw-data'; 
import { GraphAdapter } from '../models/graph-adapter';
//import d3ForceAdapter from '../graph-adapters/d3-force.adapter'; 
import WebcolaAdapter from '../graph-adapters/webcola/webcola.adapter';

@Injectable() 
export class GraphEngineService {
    // public simulation: d3.Simulation<any, any>; 
    public simulation: any; 
    private adapter: GraphAdapter | undefined;
    //public data: INwData = {nodes: new Map<string, node>(), edges: new Map<string, link>() }; 
    public filteredData: INwData = { nodes: new Map<string, INode>(), edges: new Map<string, IEdge>() }; 
    // public dataSource: Event Emitter<INwData> = new EventEmitter(); 
    public ticker: EventEmitter<any> = new EventEmitter(); 
    public options: GraphOptions = DEFAULT_GRAPH_OPTIONS; 
    public nodes: INode[] | undefined; 
    public links: IEdge[] | undefined;
    
    constructor() {
        //this.adapter = new d3ForceAdapter(this.options.width, this.options.height, this.nodeRadius); 
        this.adapter = new WebcolaAdapter(this.options); 
        this.initSimulation();
    }
    
    private initSimulation() { 
        if (!this.simulation) { 
            this.simulation = forceSimulation([])
                .force("charge", forceManyBody().strength(-2000))
                .force('collide', forceCollide().radius(this.options.nodeRadius)) 
                .force("link", forceLink([]).id(function (d: any) { return d.id; })) 
                .stop();

            this.simulation.on('tick', () => {
                this.ticker.emit({nodes: this.nodes, links: this.links });
            });
            this.simulation.on('end', function () {
                // console.log("Simulation ended");
            });
        }
    }

    updateGraph(data: INwData) {
        this.nodes = []; 
        this.links = []; 
        this.ticker.emit({nodes: this.nodes, links: this.links }); 
        if(!data || !data.nodes || !data.nodes.size) {
            return;
        }
        this.renderGraph(data);
    }

    renderGraph(data: INwData) {
        this.nodes = Array.from(data.nodes.values()); 
        this.links = Array.from(data.edges.values()); 
        this.simulation.stop().nodes(this.nodes); 
        let forceLinks = this.simulation.force("link") as any; 
        forceLinks.links(this.links); 
        this.simulation.alpha(0).restart();
    }
}