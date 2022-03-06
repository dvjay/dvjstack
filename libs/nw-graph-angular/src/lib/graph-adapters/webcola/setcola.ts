export const setcola: any = {};
var _sets: any;

function computeSets(elements: any, definition: any, sets: any, index?: any) {
    _sets = sets;
    var set: any = [];
    if (!definition) {
        set = [elements];
    } else if (definition.partition) {
        set = partitionSet(elements, definition);
    } else if (definition.collect) {
        set = collectSet(elements, definition);
    } else if (definition.expr) {
        set = exprSet(elements, definition, index);
        if (definition.name) set._setName = definition.name;
    } else if (typeof(definition) === 'string') {
        set = existingSet(elements, definition);
        set._setName = definition;
    } else {
        definition.forEach(function(subdef: any, index: any) {
            set.push(computeSets(elements, subdef, _sets, index));
        });
    }
    return set;
}
function contains(list: any, value: any) {
    return list.indexOf(value) !== -1;
}
function partitionSet(elements: any, definition: any) {
    var partitionSets: any = {};
    // Split the elements into sets based on their partition property.
    elements.forEach(function(element: any) {
        var partitionValue = element[definition.partition];
        if (definition.partition === 'parent' && partitionValue) {
            partitionValue = partitionValue._id;
        }
        if (definition.exclude && contains(definition.exclude, partitionValue)) return;
        if (definition.include && !contains(definition.include, partitionValue)) return;
        if (!partitionSets[partitionValue]) partitionSets[partitionValue] = [];
        partitionSets[partitionValue].push(element);
    });
    // Lift the partition property to a property of the set.
    Object.keys(partitionSets).forEach(function(setName) {
        partitionSets[setName][definition.partition] = partitionSets[setName][0][definition.partition];
    });
    return Object.keys(partitionSets).map(function(setName) {
        partitionSets[setName]._setName = setName;
        return partitionSets[setName];
    });
}
function collectSet(elements: any, definition: any) {
    var collectSets: any = {};
    elements.forEach(function(element: any) {
        var set: any = [];
        definition.collect.forEach(function(expr: any) {
            switch (expr) {
                case 'node':
                    set.push(element);
                    break;
                case 'node.firstchild':
                    if (element.firstchild) set = set.concat(element.firstchild);
                    break;
                case 'node.sources':
                    set = set.concat(element.getSources());
                    break;
                case 'node.targets':
                    set = set.concat(element.getTargets());
                    break;
                case 'node.neighbors':
                    set = set.concat(element.getNeighbors());
                    break;
                default:
                    if (expr.indexOf('sort') !== -1) {
                        var children = element.getTargets();
                        var map = children.map(function(el: any) {
                            return el.value;
                        });
                        var sorted = map.sort();
                        var first = children.filter(function(el: any) {
                            return el.value === sorted[0];
                        });
                        if (first[0]) set = set.concat(first[0]);
                    } else if (expr.indexOf('min') !== -1) {
                        var source = expr.split(/\(|,|\)/g)[2];
                        var property = expr.split(/\(|,|\)/g)[1].replace(/'/g, '');
                        var node;
                        switch (source) {
                            case 'node.children':
                                var children = element.getTargets();
                                var minimum = Math.min.apply(null, children.map(function(n: any) {
                                    return n[property];
                                }));
                                node = children.filter(function(n: any) {
                                    return n[property] === minimum;
                                })[0];
                                if (!element[property]) {
                                }
                                else if (node && node[property] < element[property]) {
                                    node = null;
                                }
                                break;
                            case 'node.neighbors':
                                break;
                            case 'node.parents':
                                break;
                            default:
                                // Do nothing
                        }
                        if (node) {
                            set = set.concat(node);
                        }
                    } else {
                        console.error('Unknown collection parameter \'' + expr + '\'');
                    }
            }
        });
        if (set.length > 1) collectSets[element._id] = set;
    });
    return Object.keys(collectSets).map(function(setName) {
        return collectSets[setName];
    });
}
function exprSet(elements: any, definition: any, index: any) {
    var set: any = [];
    elements.forEach(function(element: any) {
        var matches = definition.expr.match(/node\.[a-zA-Z.0-9]+/g);
        var expr = definition.expr;
        matches.forEach(function(match: any) {
            var props = match.replace('node.', '').split('.');
            var result;
            for (var i = 0; i < props.length; i++) {
                result = element[props[i]];
            }
            expr = expr.replace(match, JSON.stringify(result));
        });
        if (eval(expr)) set.push(element);
    });
    set._exprIndex = index;
    return set;
}
function existingSet(elements: any, definition: any) {
    return _sets[definition];
}
var _graphNodes: any, _graphLinks: any, _groups: any, _gap: any;
function computeConstraints(elements: any, definition: any, cid: any, gap: any, graphNodes: any, graphLinks: any, graphGroups: any) {
    _graphNodes = graphNodes;
    _graphLinks = graphLinks;
    _groups = graphGroups;
    _gap = gap;
    var results: any = [];
    var ID = cid + '_' + definition.constraint;
    switch (definition.constraint) {
        case 'align':
            results = results.concat(alignment(elements, definition, ID));
            break;
        case 'order':
            results = results.concat(orderElements(elements, definition, ID));
            break;
        case 'position':
            results = results.concat(position(elements, definition, ID));
            break;
        case 'circle':
            circle(elements, definition, ID);
            break;
        case 'hull':
            hull(elements, definition, ID);
            break;
        case 'cluster':
            cluster(elements, definition, ID);
            break;
        case 'padding':
            padding(elements, definition, ID);
            break;
        default:
            console.error('Unknown constraint type \'' + definition.type + '\'');
    }
    return results;
}
/******************** Alignment Constraints ********************/
function alignment(elements: any, definition: any, cid: any) {
    var nodes = elements;
    // Compute the alignment offset
    var offsets: any = {};
    nodes.forEach(function(node: any) {
        switch (definition.orientation) {
            case 'top':
                offsets[node._id] = node.height / 2;
                break;
            case 'bottom':
                offsets[node._id] = -node.height / 2;
                break;
            case 'left':
                offsets[node._id] = node.width / 2;
                break;
            case 'right':
                offsets[node._id] = -node.width / 2;
                break;
            default:
                offsets[node._id] = 0;
        }
    });
    // Generate the CoLa constraints
    var results: any = [];
    results = results.concat(CoLaAlignment(nodes, definition.axis, offsets, cid));
    return results;
}
/********************** Order Constraints **********************/
function generateOrderFunc(definition: any) {
    var order;
    if (definition.hasOwnProperty('order')) {
        if (definition.hasOwnProperty('reverse') && definition.reverse) definition.order.reverse();
        order = function(n1: any, n2: any) {
            return definition.order.indexOf(n1[definition.by]) - definition.order.indexOf(n2[definition.by]);
        };
    } else if (definition.hasOwnProperty('reverse') && definition.reverse) {
        order = function(n1: any, n2: any) {
            return n1[definition.by] - n2[definition.by];
        };
    } else {
        order = function(n1: any, n2: any) {
            return n2[definition.by] - n1[definition.by];
        };
    }
    return order;
}
function orderElements(elements: any, definition: any, cid: any) {
    if (elements[0] instanceof Array) {
        return orderSets(elements, definition, cid);
    } else {
        return orderNodes(elements, definition, cid);
    }
}
function orderNodes(nodes: any, definition: any, cid: any) {
    // Sort the nodes into groups
    var order = generateOrderFunc(definition);
    nodes = nodes.sort(order);
    // Generate the CoLa constraints
    var results = [];
    var axis = definition.axis;
    var gap = definition.gap ? definition.gap : _gap;
    for (var i = 0; i < nodes.length - 1; i++) {
        var left = nodes[i + 1];
        var right = nodes[i];
        results.push(CoLaPosition(left, right, axis, cid, gap));
    }
    return results;
}
function orderSets(elements: any, definition: any, cid: any) {
    // Sort the elements into groups
    var order = generateOrderFunc(definition);
    elements = elements.sort(order);
    // Compute the band for the nodes
    var upperbound: any, offset: any, leftOffset: any, rightOffset: any, fixed: any;
    if (definition.band) {
        upperbound = elements.length;
        offset = definition.band;
        leftOffset = 0;
        rightOffset = 1;
        fixed = true;
    } else {
        upperbound = elements.length - 2;
        offset = _gap;
        leftOffset = -1;
        rightOffset = 0;
        fixed = true;
    }
    // Create a new node at the barrier of each band
    var barriers: any = [];
    var nodeSize = 1;
    var prev = 0;
    for (var i = 0; i <= upperbound; i++) {
        var node: any = {
            '_cid': cid,
            '_temp': true,
            'fixed': fixed,
            'width': nodeSize,
            'height': nodeSize,
            'padding': 0
        };
        node.name = cid + '_boundary_' + i;
        var tempOffset = _graphNodes().filter(function(node: any) {
            return node._temp;
        }).length;
        var other = definition.axis == 'x' ? 'y' : 'x';
        node.boundary = definition.axis;
        if (definition.band) {
            node[definition.axis] = i * offset;
        } else {
            var offsetTest = (Math.sqrt(elements[i + 1].length) + 2) * elements[i + 1][0].size + prev;
            node[definition.axis] = i * offset;
        }
        node[other] = tempOffset * nodeSize * 10;
        barriers.push(node);
        _graphNodes(_graphNodes().concat([node]));
    }
    // Compute the constraints to order the nodes
    var results: any = [];
    elements.forEach(function(set: any, index: any) {
        var left = barriers[index + leftOffset];
        var right = barriers[index + rightOffset];
        var gap = definition.gap ? definition.gap : _gap;
        // Flatten the sets to get to the base nodes.
        var nodes = [].concat.apply([], set);
        nodes.forEach(function(node) {
            if (definition.hasOwnProperty('band') || index != 0) {
                results.push(CoLaPosition(left, node, definition.axis, cid, gap));
            }
            if (definition.hasOwnProperty('band') || index != elements.length - 1) {
                results.push(CoLaPosition(node, right, definition.axis, cid, gap));
            }
        });
    });
    return results;
}
/********************* Position Constraints ********************/
function position(elements: any, definition: any, cid: any) {
    var nodes;
    if (elements[0] instanceof Array) {
        nodes = [].concat.apply([], elements);
    } else {
        nodes = elements;
    }
    // Get the guide the elements are positioned relative to.
    var guide = _graphNodes().filter(function(node: any) {
        return node.name === definition.of && node._guide;
    })[0];
    // Create the position constraints relative to the temp node
    var results = [];
    var gap = definition.gap || _gap;
    for (var i = 0; i < nodes.length; i++) {
        switch (definition.position) {
            case 'left':
                results.push(CoLaPosition(nodes[i], guide, 'x', cid, gap));
                break;
            case 'right':
                results.push(CoLaPosition(guide, nodes[i], 'x', cid, gap));
                break;
            case 'above':
                results.push(CoLaPosition(nodes[i], guide, 'y', cid, gap));
                break;
            case 'below':
                results.push(CoLaPosition(guide, nodes[i], 'y', cid, gap));
                break;
            default:
                console.error('Unknown position: \'' + definition.position + '\'');
        }
    }
    return results;
}
/********************** Circle Constraints *********************/
function circle(elements: any, definition: any, cid: any) {
    var nodes = elements;
    // Constants for computing edge length
    var gap = definition.gap || _gap;
    var angle = 360 / nodes.length;
    var edge = Math.sqrt(2 * (gap ** 2) - 2 * (gap ** 2) * Math.cos(angle / 180 * Math.PI));
    // Label links that have at least one node in the circle layout
    _graphLinks().forEach(function(link: any) {
        var source = _graphNodes()[link.source];
        var target = _graphNodes()[link.target];
        if (nodes.indexOf(source) != -1 || nodes.indexOf(target) != -1) {
            link.circle = true;
        }
    });
    // Create links for every node in the circle
    var links = [];
    for (var i = 0; i < nodes.length; i++) {
        var index = i == 0 ? nodes.length - 1 : i - 1;
        var node = _graphNodes().indexOf(nodes[index]);
        var next = _graphNodes().indexOf(nodes[i]);
        links.push({
            'source': node,
            'target': next,
            'length': edge,
            '_temp': true
        });
    }
    // Create or extract the center point.
    var center: any;
    switch (definition.around) {
        case 'center':
            center = {
                'name': cid + '_center',
                '_temp': true,
                '_cid': cid
            };
            _graphNodes(_graphNodes().concat([center]));
            break;
        default:
            console.error('Missing or unknown center point for the circle constraint.');
    }
    // Create a new link from the center to all nodes in the circle
    nodes.forEach(function(node: any) {
        links.push({
            'source': center._id,
            'target': node._id,
            'length': gap,
            '_temp': true
        });
    });
    _graphLinks(_graphLinks().concat(links));
}
/*********************** Hull Constraints **********************/
function hull(elements: any, definition: any, cid: any) {
    var nodes = elements;
    var ids = nodes.map(function(node: any) {
        return node._id;
    });
    var group: any = {
        'leaves': ids,
        '_cid': cid
    };
    if (definition.style) group.style = definition.style;
    _groups(_groups().concat([group]));
}
/********************* Cluster Constraints *********************/
function cluster(elements: any, definition: any, cid: any) {
    var nodes = elements;
    nodes.forEach(function(node: any, index: any) {
        for (var i = index + 1; i < nodes.length; i++) {
            _graphLinks(_graphLinks().concat([{
                'source': node._id,
                'target': nodes[i]._id,
                'length': 1,
                '_temp': true,
                '_cid': cid
            }]));
        }
    });
}
/********************* Padding Constraints *********************/
function padding(elements: any, definition: any, cid: any) {
    var nodes = elements;
    nodes.forEach(function(node: any) {
        node.pad = definition.amount;
        node.cid = definition.cid;
        node.spacing = true;
    });
}
/****************** Generate CoLa Constraints ******************/
function CoLaAlignment(nodes: any, axis: any, offsets: any, cid: any) {
    var constraint: any = {
        'type': 'alignment',
        'axis': (axis == 'x') ? 'y' : 'x',
        'offsets': [],
        '_type': cid
    };
    nodes.forEach(function(node: any) {
        constraint.offsets.push({
            'node': node._id,
            'offset': offsets[node._id]
        });
    });
    return constraint;
}
function CoLaPosition(left: any, right: any, axis: any, cid: any, gap: any) {
    var constraint: any = {
        'axis': axis,
        'left': left._id,
        'right': right._id,
        'gap': gap,
        '_type': cid
    };
    return constraint;
}
var _nodes: any, _links: any, _sets$1: any, _gap$1: any, _guides: any, _groups$1: any, _constraintDefs: any;
var INDEX: any;
function constraints(constraints?: any) {
    if (constraints === undefined) {
        return _constraintDefs;
    } else {
        _constraintDefs = constraints;
        /* @ts-ignore */
        return this;
    }
}
function gap(gap: any) {
    if (gap === undefined) {
        return _gap$1;
    } else {
        _gap$1 = gap;
        /* @ts-ignore */
        return this;
    }
}
function groups(groups?: any) {
    if (groups === undefined) {
        return _groups$1;
    } else {
        _groups$1 = groups;
        /* @ts-ignore */
        return this;
    }
}
function guides(guides?: any) {
    if (guides === undefined) {
        return _guides;
    } else {
        _guides = guides;
        _nodes = _nodes.filter(function(node: any) {
            return !node._guide;
        }); // Remove previous guides.
        guides.map(generateGuides);
        /* @ts-ignore */
        return this;
    }
}
function links(links?: any) {
    if (links === undefined) {
        return _links;
    } else {
        _links = links;
        _links.map(setLinkID);
        /* @ts-ignore */
        return this;
    }
}
function nodes(nodes?: any) {
    if (nodes === undefined) {
        return _nodes;
    } else {
        _nodes = nodes;
        _nodes.map(setID);
        /* @ts-ignore */
        return this;
    }
}
function sets() {
    return _sets$1;
}
function layout() {
    INDEX = -1;
    if (!_nodes) console.error('No graph nodes defined.');
    if (!_links) links([]);
    if (!_groups$1) groups([]);
    if (!_guides) guides([]);
    if (!_constraintDefs) constraints([]);
    if (!_gap$1) gap(20);
    // Remove previously added internal properties.
    _nodes = _nodes.filter(function(node: any) {
        return !node._cid;
    });
    _links = _links.filter(function(link: any) {
        return !link._cid;
    });
    _groups$1 = _groups$1.filter(function(group: any) {
        return !group._cid;
    });
    // Compute additional graph properties as needed
    computeBuiltInProperties(_constraintDefs);
    // Generate the SetCoLa sets
    _sets$1 = {};
    for (var i = 0; i < _constraintDefs.length; i++) {
        var result = generateSets(_constraintDefs[i]);
        _sets$1[result.name] = result.sets;
    }
    // Generate the WebCoLa constraints
    _constraintDefs.forEach(function() {
    });
    var webcolaConstraints = [].concat.apply([], _constraintDefs.map(generateConstraints));
    // Produce the output spec
    return {
        nodes: nodes(),
        links: links(),
        groups: groups(),
        guides: guides(),
        constraints: webcolaConstraints,
        constraintDefs: constraints()
    };
}
function generateGuides(guide: any) {
    var node: any = {
        '_guide': true,
        '_temp': true,
        'fixed': true,
        'width': 1,
        'height': 1,
        'padding': 0,
        'x': Math.random() * 100,
        'y': Math.random() * 100,
        'boundary': ''
    };
    // Save the position information from the guide.
    var complete = false;
    if (guide.hasOwnProperty('x')) {
        node.x = guide.x;
        node.boundary += 'x';
        complete = true;
    }
    if (guide.hasOwnProperty('y')) {
        node.y = guide.y;
        node.boundary += 'y';
        complete = true;
    }
    if (!complete) {
        console.error('Guide must have an x and/or y position: ', guide);
    }
    // Save the name from the guide.
    if (guide.hasOwnProperty('name')) {
        var found = _nodes.filter(function(node: any) {
            return node.name === guide.name;
        });
        if (found.length > 0) {
            console.error('A node with the name \'' + guide.name + '\' already exists.');
        } else {
            node.name = guide.name;
        }
    } else {
        console.error('Guide must have a name: ', guide);
    }
    // Save the guide and get it's index.
    _nodes.push(node);
    node._id = _nodes.indexOf(node);
    return node;
}
function generateSets(constraintDef: any) {
    var source = _nodes.filter(function(node: any) {
        return !node._temp;
    });
    if (constraintDef.from && typeof constraintDef.from === 'string') {
        source = _sets$1[constraintDef.from];
    } else if (constraintDef.from) {
        source = computeSets(_nodes, constraintDef.from, _sets$1);
    }
    if (!constraintDef.name) constraintDef.name = '_set' + ++INDEX;
    return {
        'name': constraintDef.name,
        'sets': computeSets(source, constraintDef.sets, _sets$1)
    }
}
function generateConstraints(constraintDef: any) {
    var results: any = [];
    (constraintDef.forEach || []).forEach(function(constraint: any) {
        (_sets$1[constraintDef.name] || []).forEach(function(elements: any) {
            results = results.concat(computeConstraints(elements, constraint, constraintDef.name, _gap$1, nodes, links, groups));
        });
    });
    return results;
}
/**********************************************************************/
/************************** Graph Properties **************************/
/**********************************************************************/
function computeBuiltInProperties(constraints: any) {
    _nodes.forEach(setID);
    _links.forEach(setLinkID);
    // Compute numeric properties for the nodes
    var hasProperty = function(c: any, p: any) {
        return JSON.stringify(c).indexOf(p) != -1;
    };
    if (hasProperty(constraints, 'depth')) {
        calculateDepths();
        _nodes.forEach(function(node: any) {
            delete node.visited;
        });
    }
    if (hasProperty(constraints, 'degree')) calculateDegree();
    // Add accessors to get properties returning graph nodes/edges
    _nodes.forEach(function(node: any) {
        node.getSources = function() {
            return getSources(this);
        };
        node.getTargets = function() {
            return getTargets(this);
        };
        node.getNeighbors = function() {
            return getNeighbors(this);
        };
        node.getIncoming = function() {
            return getIncoming(this);
        };
        node.getOutgoing = function() {
            return getOutgoing(this);
        };
        node.getEdges = function() {
            return getEdges(this);
        };
        node.getFirstChild = function() {
            return getFirstChild(this);
        };
    });
}
function setID(node: any) {
    node._id = node._id || _nodes.indexOf(node);
}
function setLinkID(link: any) {
    link._linkid = link._linkid || _links.indexOf(link);
}
function graphSources() {
    return _nodes.filter(function(node: any) {
        if (node.hasOwnProperty('_isSource')) return node._isSource;
        var incoming = getIncoming(node).filter(function(n: any) {
            return n.source !== n.target;
        });
        return incoming.length === 0;
    });
}
function calculateDepths() {
    var roots = graphSources();
    if (roots.length === 0 && _nodes.length !== 0) {
        console.error('No roots exist, so cannot compute node depth. Please assign a \'_isSource\' property to the root and try again.');
    }
    _nodes.forEach(getDepth);
}
function calculateDegree() {
    _nodes.forEach(function(node: any) {
        node.degree = node.degree || getDegree(node);
    });
}
// The list of nodes that have edges for which the input is the target 
// (e.g., the node's parents).
function getSources(node: any) {
    var incoming = getIncoming(node);
    var sources = incoming.map(function(link: any) {
        return (typeof link.source === 'object') ? link.source : _nodes[link.source];
    });
    return sources;
}
// The list of nodes that have edges for which the input is the source 
// (e.g., the node's children).
function getTargets(node: any) {
    var outgoing = getOutgoing(node);
    var targets = outgoing.map(function(link: any) {
        return (typeof link.target == 'object') ? link.target : _nodes[link.target];
    });
    return targets;
}
// The list of nodes that have edges connected to the input (e.g., the 
// node's neighbors).
function getNeighbors(node: any) {
    var sources = node.sources || getSources(node);
    var targets = node.targets || getTargets(node);
    return sources.concat(targets);
}
// The list of edges that have the input as the target (e.g., edges 
// connecting the node to its parents).
function getIncoming(node: any) {
    var index = node._id;
    var incoming = _links.filter(function(link: any) {
        var source = (typeof link.source === 'object') ? link.source._id : link.source;
        var target = (typeof link.target === 'object') ? link.target._id : link.target;
        return target == index && source !== index;
    });
    return incoming;
}
// The list of edges that have the input as the source (e.g., edges 
// connecting the node to its children).
function getOutgoing(node: any) {
    var index = node._id;
    var outgoing = _links.filter(function(link: any) {
        var source = (typeof link.source === 'object') ? link.source._id : link.source;
        var target = (typeof link.target === 'object') ? link.target._id : link.target;
        return source == index && target !== index;
    });
    return outgoing;
}
// The list of edges that contain the input (e.g., edges connecting the 
// node to its neighbors).
function getEdges(node: any) {
    var incoming = node.incoming || getIncoming(node);
    var outgoing = node.outgoing || getOutgoing(node);
    return incoming.concat(outgoing);
}
// The number of neighbors for the current node.
function getDegree(node: any) {
    var incoming = node.incoming || getIncoming(node);
    var outgoing = node.outgoing || getOutgoing(node);
    return incoming.length + outgoing.length;
}
function getDepth(node: any) {
    if (node.hasOwnProperty('depth')) return node.depth;
    if (node.visited) console.error('Cannot compute the depth for a graph with cycles.');
    node.visited = true;
    node.depth = Math.max(0, Math.max(...getSources(node).map(getDepth)) + 1);
    return node.depth;
}
function getFirstChild(node: any) {
    var outgoing = node.outgoing || getOutgoing(node);
    outgoing = outgoing.sort(function(a: any, b: any) {
        return a._id - b._id;
    });
    outgoing = outgoing.filter(function(n: any) {
        return n.target !== n.source;
    });
    if (outgoing.length == 0) return null;
    return _nodes[outgoing[0].target];
}
setcola.constraints = constraints;
setcola.gap = gap;
setcola.groups = groups;
setcola.guides = guides;
setcola.links = links;
setcola.nodes = nodes;
setcola.sets = sets;
setcola.layout = layout;