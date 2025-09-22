import type { GraphNode, GraphEdge, GraphData } from "./interfaces";

import type { Node, Edge } from "reactflow";
import { Position } from "reactflow";

// import ElkPort from 'elkjs/lib/elk.bundled.js';
import ELK from 'elkjs/lib/elk.bundled.js';
import * as yaml from 'js-yaml';


// import {
//     buildSchema,
//     GraphQLSchema,
//     GraphQLObjectType,
//     GraphQLList,
//     isListType,
//     isNonNullType,
//     isScalarType,
//     isObjectType,
//     isInterfaceType,
//     isEnumType,
// } from 'graphql';
// import type { GraphQLNamedType, GraphQLType } from 'graphql';


import {
    buildSchema,
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLEnumType,
    isListType,
    isNonNullType,
    isScalarType,
    isObjectType,
    isInterfaceType,
    isEnumType,
    isUnionType,
    isInputObjectType,
} from "graphql";
import type { GraphQLNamedType, GraphQLType } from "graphql";



export function graphqlToFieldGraph(schemaString: string): GraphData {
    const TARGET_FAKE_ID = "_id"; // Use a constant fake ID for target nodes
    const BUILT_IN_SCALARS = new Set(["String", "Int", "Float", "ID", "Boolean"]);

    let graphQLSchema: GraphQLSchema;
    try {
        graphQLSchema = buildSchema(schemaString);
    } catch (error) {
        console.error("Failed to parse schema:", error);
        throw error;
    }

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const processedNodeIds = new Set<string>();

    // --- Helpers ---
    const getBaseType = (type: any): GraphQLNamedType => {
        if (isListType(type) || isNonNullType(type)) {
            return getBaseType(type.ofType);
        }
        return type;
    };

    const getFieldTypeName = (type: GraphQLType): string => {
        if (isListType(type)) {
            return `[${getFieldTypeName(type.ofType)}]`;
        }
        if (isNonNullType(type)) {
            return `${getFieldTypeName(type.ofType)}!`;
        }
        return (type as any).name;
    };

    // --- Shared processor for root types ---
    const processRootType = (rootType: GraphQLObjectType | null, kind: string) => {
        if (!rootType) return;

        const rootFields = rootType.getFields();
        for (const fieldName in rootFields) {
            const field = rootFields[fieldName];
            const fieldType = getBaseType(field.type);
            const fieldTypeName = getFieldTypeName(field.type);

            const fieldNodeId = `${kind}.${rootType.name}.${fieldName}`;
            const argsStr = field.args.map(a => `${a.name}: ${getFieldTypeName(a.type)}`).join(", ");


            nodes.push({
                id: fieldNodeId,
                name: `${fieldName}(${argsStr})`,
                type: fieldTypeName, // query_field / mutation_field / subscription_field
                value: fieldTypeName,
            });
            processedNodeIds.add(fieldNodeId);

            // --- Return type edge ---
            if (isObjectType(fieldType) || isInterfaceType(fieldType)) {
                edges.push({
                    source: fieldNodeId,
                    target: `TYPE.${fieldType.name}.${TARGET_FAKE_ID}`,
                    label: `returns: ${fieldType.name}`,
                });
            } else if (isEnumType(fieldType)) {
                edges.push({
                    source: fieldNodeId,
                    target: `ENUM.${fieldType.name}.${TARGET_FAKE_ID}`,
                    label: `returns: ${fieldType.name}`,
                });
            } else if (isUnionType(fieldType)) {
                edges.push({
                    source: fieldNodeId,
                    target: `UNION.${fieldType.name}.${TARGET_FAKE_ID}`,
                    label: `returns: ${fieldType.name}`,
                });
            } else if (isScalarType(fieldType) && !BUILT_IN_SCALARS.has(fieldType.name)) {
                edges.push({
                    source: fieldNodeId,
                    target: `SCALAR.${fieldType.name}.${TARGET_FAKE_ID}`,
                    label: `returns: ${fieldType.name}`,
                });


            }

            // --- Arguments (applies to Query, Mutation, Subscription) ---
            const args = field.args;
            for (const arg of args) {
                const argBaseType = getBaseType(arg.type);

                if (isInputObjectType(argBaseType)) {
                    const inputTypeNodeId = `INPUT.${argBaseType.name}.${TARGET_FAKE_ID}`;



                    edges.push({
                        source: fieldNodeId,
                        target: inputTypeNodeId,
                        label: `arg: ${arg.name}`,
                    });
                } else if (isEnumType(argBaseType)) {
                    edges.push({
                        source: fieldNodeId,
                        target: `ENUM.${argBaseType.name}.${TARGET_FAKE_ID}`,
                        label: `arg: ${arg.name}`,
                    });
                } else if (isScalarType(argBaseType)) {
                    if (!BUILT_IN_SCALARS.has(argBaseType.name)) {
                        const scalarNodeId = `SCALAR.${argBaseType.name}.${TARGET_FAKE_ID}`;

                        edges.push({
                            source: fieldNodeId,
                            target: scalarNodeId,
                            label: `arg: ${arg.name}`,
                        });
                    }
                    // Built-in scalars (String, Int, etc.) don’t get nodes
                }
            }//args

        }
    };


    // --- Queries, Mutations, Subscriptions ---
    processRootType(graphQLSchema.getQueryType() || null, "QUERY");
    processRootType(graphQLSchema.getMutationType() || null, "MUTATION");
    processRootType(graphQLSchema.getSubscriptionType() || null, "SUBSCRIPTION");

    // --- Process all types ---
    const typeMap = graphQLSchema.getTypeMap();
    for (const typeName in typeMap) {
        const type = typeMap[typeName];

        if (
            typeName.startsWith("__") ||
            typeName === "Query" ||
            typeName === "Mutation" ||
            typeName === "Subscription" ||
            (isScalarType(type) && BUILT_IN_SCALARS.has(typeName))
        ) {
            continue;
        }

        if (isEnumType(type)) {
            const typeNodeId = `ENUM.${typeName}.${TARGET_FAKE_ID}`;
            if (!processedNodeIds.has(typeNodeId)) {
                nodes.push({
                    id: typeNodeId,
                    name: typeName,
                    type: "enum",
                    value: (type as GraphQLEnumType).getValues().map((v) => v.name).join(", "),
                });
                processedNodeIds.add(typeNodeId);
            }
        } else if (isScalarType(type)) {
            const typeNodeId = `SCALAR.${typeName}.${TARGET_FAKE_ID}`;
            if (!processedNodeIds.has(typeNodeId)) {
                nodes.push({
                    id: typeNodeId,
                    name: typeName,
                    type: "scalar",
                    value: type.description || " ",
                });
                processedNodeIds.add(typeNodeId);
            }
        } else if (isUnionType(type)) {
            const typeNodeId = `UNION.${typeName}.${TARGET_FAKE_ID}`;

            if (!processedNodeIds.has(typeNodeId)) {
                type.getTypes().forEach((t) => {
                    nodes.push({
                        id: `UNION.${typeName}.${t}`,
                        name: typeName,
                        type: `${t}`,
                        value: `${t}`,
                    });
                })

                processedNodeIds.add(typeNodeId);
            }

            for (const member of type.getTypes()) {
                edges.push({
                    source: `UNION.${typeName}.${member}`,
                    target: `TYPE.${member.name}.${TARGET_FAKE_ID}`,
                    label: `member: ${member.name}`,
                });
            }
        } else if (isInterfaceType(type)) {
            const typeNodeId = `INTERFACE.${typeName}.${TARGET_FAKE_ID}`;
            if (!processedNodeIds.has(typeNodeId)) {
                nodes.push({
                    id: typeNodeId,
                    name: typeName,
                    type: "interface",
                    value: "interface",
                });
                processedNodeIds.add(typeNodeId);
            }

            const typeFields = type.getFields();
            for (const fieldName in typeFields) {
                const field = typeFields[fieldName];
                const fieldType = getBaseType(field.type);
                const fieldTypeName = getFieldTypeName(field.type);

                const fieldNodeId = `INTERFACE.${typeName}.${fieldName}`;
                nodes.push({
                    id: fieldNodeId,
                    name: fieldName,
                    type: fieldTypeName,
                    value: BUILT_IN_SCALARS.has(fieldType.name) ? " " : "{...}",
                });

                if (isObjectType(fieldType) || isInterfaceType(fieldType)) {
                    edges.push({
                        source: fieldNodeId,
                        target: `TYPE.${fieldType.name}.${TARGET_FAKE_ID}`,
                        label: `returns: ${fieldType.name}`,
                    });
                }
            }
        } else if (isInputObjectType(type)) {
            const typeNodeId = `INPUT.${typeName}.${TARGET_FAKE_ID}`;
            // if (!processedNodeIds.has(typeNodeId)) {
            //     nodes.push({
            //         id: typeNodeId,
            //         name: TARGET_FAKE_ID,
            //         type: "input",
            //         value: "input object",
            //     });
            //     processedNodeIds.add(typeNodeId);
            // }

            const inputFields = type.getFields();
            for (const fieldName in inputFields) {
                const field = inputFields[fieldName];
                const fieldType = getBaseType(field.type);
                const fieldTypeName = getFieldTypeName(field.type);

                const fieldNodeId = `INPUT.${typeName}.${fieldName}`;
                nodes.push({
                    id: fieldNodeId,
                    name: fieldName,
                    type: fieldTypeName,
                    value: "arg",
                });

                edges.push({
                    source: typeNodeId,
                    target: fieldNodeId,
                    label: `input field: ${fieldName}`,
                });

                if (isObjectType(fieldType) || isInterfaceType(fieldType)) {
                    edges.push({
                        source: fieldNodeId,
                        target: `TYPE.${fieldType.name}.${TARGET_FAKE_ID}`,
                        label: `uses: ${fieldType.name}`,
                    });
                } else if (isEnumType(fieldType)) {
                    edges.push({
                        source: fieldNodeId,
                        target: `ENUM.${fieldType.name}.${TARGET_FAKE_ID}`,
                        label: `uses: ${fieldType.name}`,
                    });
                }
            }
        } else if (isObjectType(type)) {
            const typeFields = type.getFields();

            // --- NEW: Handle implements interfaces ---
            const interfaces = type.getInterfaces?.() || [];
            for (const iface of interfaces) {
                edges.push({
                    source: `TYPE.${type.name}.${TARGET_FAKE_ID}`,
                    target: `INTERFACE.${iface.name}.${TARGET_FAKE_ID}`,
                    label: `implements ${iface.name}`,
                });
            }

            // --- existing field processing ---
            for (const fieldName in typeFields) {
                const field = typeFields[fieldName];
                const fieldType = getBaseType(field.type);
                const fieldTypeName = getFieldTypeName(field.type);

                const fieldNodeId = `TYPE.${typeName}.${fieldName}`;
                nodes.push({
                    id: fieldNodeId,
                    name: fieldName,
                    type: fieldTypeName,
                    value: BUILT_IN_SCALARS.has(fieldType.name) ? " " : "{...}",
                });
                processedNodeIds.add(fieldNodeId);

                if (isObjectType(fieldType) || isInterfaceType(fieldType)) {
                    edges.push({
                        source: fieldNodeId,
                        target: `TYPE.${fieldType.name}.${TARGET_FAKE_ID}`,
                        label: `returns: ${fieldType.name}`,
                    });
                } else if (isEnumType(fieldType)) {
                    edges.push({
                        source: fieldNodeId,
                        target: `ENUM.${fieldType.name}.${TARGET_FAKE_ID}`,
                        label: `returns: ${fieldType.name}`,
                    });
                } else if (isScalarType(fieldType) && !BUILT_IN_SCALARS.has(fieldType.name)) {
                    edges.push({
                        source: fieldNodeId,
                        target: `SCALAR.${fieldType.name}.${TARGET_FAKE_ID}`,
                        label: `returns: ${fieldType.name}`,
                    });
                }
            }
        }
    }

    return { nodes, edges };
}

export function jsonToFieldGraph(jsonObj: Record<string, any>, separateNodeForArray = true, linkedFields = [[""]]): GraphData {
    const result: GraphData = { nodes: [], edges: [] };

    function makeNode(entity: string, entityId: string, id: string, type: string, value: string) {
        result.nodes.push({
            id: `${entity}.${entityId}.${id}`,
            name: id,
            type,
            value
        });
    }

    function processEntity(entity: string, entityId: string, obj: Record<string, any>) {
        // ✅ early exit if obj is not a plain object
        if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
            makeNode(entity, entityId, "obj", typeof obj, String(obj));
            return; // do nothing or handle differently
        }
        for (const [key, value] of Object.entries(obj)) {
            if (value === null || value === undefined) continue;

            if (typeof value !== "object" || (Array.isArray(value) === false && typeof value !== "object")) {
                // primitive field
                makeNode(entity, entityId, key, typeof value, String(value));
            } else if (Array.isArray(value)) {
                // array of objects
                const tp = key;

                //current node with type array USER.USRabc.addresses
                // makeNode(entity, entityId, tp, `[${tp}]`, "[...]");//USER, USRabc, addresses, [addresses], [...]
                makeNode(entity, entityId, tp, typeof value, "[...]");//USER, USRabc, addresses, [addresses], [...]

                //child nodes, USER.USRabc.addresses -> 
                if (separateNodeForArray) {
                    // create an edge from parent entity to the array field
                    let linkedToArray = false;
                    value.forEach((item, idx) => {
                        const childEntity = key.toUpperCase();
                        const childId = item.id || `${childEntity}[${idx}]`;
                        let v = "";
                        if (typeof item !== "object" || (Array.isArray(item) === false && typeof item !== "object")) {
                            v = String(item);
                        } else if (Array.isArray(item)) {
                            v = "[...]";
                        } else if (typeof item === "object") {
                            v = "{...}";
                        } else {
                            v = "???";
                        }
                        makeNode(`[${childEntity}]`, entityId, childId, typeof item, v);//array item node

                        // PARENT -> ARRAY
                        if (!linkedToArray) {

                            result.edges.push({
                                source: `${entity}.${entityId}.${tp}`,
                                target: `[${childEntity}].${entityId}.${childId}`,
                                label: `${key}[]`
                            });

                            linkedToArray = true;
                        }
                    });
                }

                // each item in the array is a separate entity
                value.forEach((item, idx) => {
                    const childEntity = key.toUpperCase(); // e.g. addresses -> ADDRESS
                    const childId = item.id || `${childEntity}[${idx}]`;

                    if (separateNodeForArray) {

                        // ARRAY -> ITEM
                        result.edges.push({
                            source: `[${childEntity}].${entityId}.${childId}`,
                            target: `${childEntity}.${childId}.id`,
                            label: childId
                        });


                    } else {

                        result.edges.push({
                            source: `${entity}.${entityId}.${key}`,
                            target: `${childEntity}.${childId}.id`,
                            label: childId
                        });


                    }
                    processEntity(childEntity, childId, item);
                });
            } else if (typeof value === "object") {
                // nested object
                const tp = key;

                makeNode(entity, entityId, key, tp, "{...}");

                const childEntity = key.toUpperCase();
                const childId = value.id || `${tp}Id`;//  if no id

                result.edges.push({
                    source: `${entity}.${entityId}.${key}`,//parent
                    target: `${childEntity}.${childId}.id`,//child - current
                    label: key
                });

                processEntity(childEntity, childId, value);
            } else {
                // unknown type, skip
                console.warn("Unknown type for key:", key, value);
                alert("Unknown type for key: " + key);
            }
        }
    }
    /**
     * Connect nodes with the same value, restricted to certain field groups.
     * Field groups allow treating multiple field names as equivalent (e.g., ["orderId", "order_id"]).
     *
     * @param graph Input graph
     * @param fieldGroups Array of field groups, each being a list of equivalent field names
     * @returns A new graph with edges added for duplicates
     */
    function connectNodesWithSameValue(
        graph: GraphData,
        fieldGroups: string[][]
    ): GraphData {
        const { nodes, edges } = graph;

        // Normalize groups into a lookup: fieldName -> groupId
        const fieldToGroup = new Map<string, number>();
        fieldGroups.forEach((group, idx) => {
            for (const field of group) {
                fieldToGroup.set(field, idx);
            }
        });

        // Map: groupId + value -> node ids
        const valueMap = new Map<string, string[]>();

        for (const node of nodes) {
            if (!node.value) continue;

            const fieldName = node.id.split(".")[2];
            const groupId = fieldToGroup.get(fieldName);

            if (groupId !== undefined) {
                const key = `${groupId}::${node.value}`;
                if (!valueMap.has(key)) {
                    valueMap.set(key, []);
                }
                valueMap.get(key)!.push(node.id);
            }
        }

        // Create new edges for nodes that share the same value in the same field group
        const newEdges: GraphEdge[] = [];
        for (const [key, ids] of valueMap.entries()) {
            if (ids.length > 1) {
                const [first, ...rest] = ids;
                const value = key.split("::")[1];
                for (const other of rest) {

                    newEdges.push({
                        source: first,
                        target: other,
                        label: `L:${value}`,
                    });
                }
            }
        }

        return {
            ...graph,
            edges: [...edges, ...newEdges],
        };
    }




    // entry point: assume root objects are entities
    const rootId = "root";
    makeNode("ROOT", rootId, "id", "root", "{...}");

    for (const [rootKey, rootVal] of Object.entries(jsonObj)) {
        const entity = rootKey.toUpperCase();

        if (Array.isArray(rootVal)) {
            rootVal.forEach((item, idx) => {
                const entityId = item.id || `${entity}${idx + 1}`;

                // connect ROOT -> entity
                result.edges.push({
                    source: `ROOT.${rootId}.id`,
                    target: `${entity}.${entityId}.id`,
                    label: rootKey
                });

                processEntity(entity, entityId, item);
            });
        } else {
            const entityId = rootVal?.id || `${entity}`;

            // connect ROOT -> entity
            // result.edges.push({
            //     source: `ROOT.${rootId}.id`,
            //     target: `${entity}.${entityId}.id`,
            //     label: rootKey
            // });

            processEntity(entity, entityId, rootVal);
        }
    }


    //
    const updatedGraph = connectNodesWithSameValue(result, linkedFields);
    return updatedGraph;
}
export function yamlToFieldGraph(yamlString: string, separateNodeForArray = true, linkedFields: [string, string][] = []): GraphData {
    let yamlObj: Record<string, any>;

    try {
        yamlObj = yaml.load(yamlString) as Record<string, any>;
    } catch (error) {
        console.error('Failed to parse YAML:', error);
        throw error;
    }

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const processedNodeIds = new Set<string>();

    const traverse = (data: any, parentId: string, path: string): void => {
        if (data === null || typeof data !== 'object') {
            return;
        }

        Object.keys(data).forEach((key) => {
            const value = data[key];
            const currentPath = path ? `${path}.${key}` : key;
            const currentId = `${parentId}.${key}`;

            const addNode = (nodeId: string, nodeName: string, nodeType: string, nodeValue: string) => {
                if (!processedNodeIds.has(nodeId)) {
                    nodes.push({
                        id: nodeId,
                        name: nodeName,
                        type: nodeType,
                        value: nodeValue,
                    });
                    processedNodeIds.add(nodeId);
                }
            };

            const addEdge = (source: string, target: string, label: string) => {
                edges.push({ source, target, label });
            };

            if (Array.isArray(value)) {
                if (separateNodeForArray) {
                    addNode(currentId, key, 'array_field', '[]');
                    addEdge(parentId, currentId, key);

                    value.forEach((item: any, i) => {
                        const itemPath = `${currentPath}[${i}]`;
                        const itemId = `${currentId}.${i}`;
                        const itemType = typeof item === 'object' ? 'object' : typeof item;

                        addNode(itemId, `${key}[${i}]`, itemType, JSON.stringify(item));
                        addEdge(currentId, itemId, `${i}`);

                        if (typeof item === 'object') {
                            traverse(item, itemId, itemPath);
                        }
                    });
                } else {
                    traverse(value, parentId, currentPath);
                }
            } else if (typeof value === 'object') {
                addNode(currentId, key, 'object_field', '{...}');
                addEdge(parentId, currentId, key);
                traverse(value, currentId, currentPath);
            } else {
                addNode(currentId, key, 'field', JSON.stringify(value));
                addEdge(parentId, currentId, key);

                // Handle linked fields
                linkedFields.forEach(([sourceField, targetField]) => {
                    if (key === sourceField) {
                        const targetId = `TYPE.${targetField}`;
                        if (processedNodeIds.has(targetId)) {
                            addEdge(currentId, targetId, `links to ${targetField}`);
                        }
                    }
                });
            }
        });
    };

    // Start traversal from the root object
    const rootId = 'ROOT.json';
    nodes.push({
        id: rootId,
        name: 'root',
        type: 'root_object',
        value: '{...}',
    });
    processedNodeIds.add(rootId);
    traverse(yamlObj, rootId, '');

    return { nodes, edges };
}
export function openapiToFieldGraph(jsonObj: Record<string, any>, separateNodeForArray = true, linkedFields = [[""]]): GraphData {
    return jsonToFieldGraph(jsonObj, separateNodeForArray, linkedFields);
}


const getCategoryEntity = (id: string): string | null => {
    const parts = id.split('.');
    return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : null;
}

export function toEntityGraph(gd: GraphData): GraphData {
    const entityNodes: Record<string, GraphNode> = {};
    const edgeMap = new Map<string, { source: string; target: string; labels: Set<string> }>();

    // collect nodes with fields
    gd.nodes.forEach((node) => {
        const entityId = getCategoryEntity(node.id);
        if (entityId) {
            if (!entityNodes[entityId]) {
                const [category, entity] = entityId.split(".");
                entityNodes[entityId] = { id: entityId, name: entity, type: category, fields: [] };
            }
            const field = node.id.split(".").pop()!;
            entityNodes[entityId].fields!.push({
                id: node.id,
                name: node.name || field,
                type: node.type || "",
                value: node.value || "",
            });
        }
    });

    // collect edges, merging labels
    gd.edges.forEach((edge) => {
        const source = getCategoryEntity(edge.source);
        const target = getCategoryEntity(edge.target);
        if (source && target && source !== target) {
            const key = `${source}|${target}`;
            if (!edgeMap.has(key)) {
                edgeMap.set(key, { source, target, labels: new Set() });
            }
            if (edge.label) edgeMap.get(key)!.labels.add(edge.label);

            // ensure nodes exist even if they had no fields
            if (!entityNodes[source]) {
                const [category, entity] = source.split(".");
                entityNodes[source] = { id: source, name: entity, type: category, fields: [] };
            }
            if (!entityNodes[target]) {
                const [category, entity] = target.split(".");
                entityNodes[target] = { id: target, name: entity, type: category, fields: [] };
            }
        }
    });

    const mergedEdges = Array.from(edgeMap.values()).map(({ source, target, labels }) => ({
        source,
        target,
        label: Array.from(labels).join(", "),
    }));

    return {
        ...gd,
        nodes: Object.values(entityNodes),
        edges: mergedEdges,
    };
}


export function oneDetaiBasedOnField(gd: GraphData, highlightEntity?: string): string {
    // ---------------- Build nodes dictionary ----------------
    const nodes: Record<string, { id: string }> = {};
    gd.nodes.forEach((node) => {
        const categoryEntity = getCategoryEntity(node.id);
        if (categoryEntity && !nodes[categoryEntity]) {
            nodes[categoryEntity] = { id: categoryEntity };
        }
    });

    // ---------------- Build adjacency lists ----------------
    const adjForward: Record<string, string[]> = {};
    const adjBackward: Record<string, string[]> = {};
    gd.edges.forEach((edge) => {
        const source = getCategoryEntity(edge.source);
        const target = getCategoryEntity(edge.target);
        if (source && target) {
            if (!adjForward[source]) adjForward[source] = [];
            if (!adjBackward[target]) adjBackward[target] = [];
            adjForward[source].push(target);
            adjBackward[target].push(source);

            // Ensure nodes exist
            if (!nodes[source]) nodes[source] = { id: source };
            if (!nodes[target]) nodes[target] = { id: target };
        }
    });

    // ---------------- BFS helper ----------------
    function bfs(start: string, adj: Record<string, string[]>): Set<string> {
        const visited = new Set<string>();
        const queue: string[] = [start];
        while (queue.length) {
            const node = queue.shift()!;
            if (!visited.has(node)) {
                visited.add(node);
                (adj[node] || []).forEach((next) => {
                    if (!visited.has(next)) queue.push(next);
                });
            }
        }
        return visited;
    }

    // ---------------- Collect highlights ----------------
    let upstream = new Set<string>();
    let downstream = new Set<string>();
    const allHighlights = new Set<string>();
    if (highlightEntity) {
        upstream = bfs(highlightEntity, adjBackward);
        downstream = bfs(highlightEntity, adjForward);
        [highlightEntity, ...upstream, ...downstream].forEach((item) =>
            allHighlights.add(item)
        );
    }

    // ---------------- Build edge labels ----------------
    const edgeLabels: GraphEdge[] = [];
    gd.edges.forEach((edge) => {
        const source = getCategoryEntity(edge.source);
        const target = getCategoryEntity(edge.target);
        if (source && target && source !== target) {
            edgeLabels.push({ source, target, label: edge.label || "" });
        }
    });

    // ---------------- Build merged edge labels ----------------
    // const edgeMap = new Map<string, { source: string; target: string; labels: Set<string> }>();

    // gd.edges.forEach((edge) => {
    //     const source = getCategoryEntity(edge.source);
    //     const target = getCategoryEntity(edge.target);
    //     if (source && target && source !== target) {
    //         const key = `${source}|${target}`;
    //         if (!edgeMap.has(key)) {
    //             edgeMap.set(key, { source, target, labels: new Set() });
    //         }
    //         if (edge.label) {
    //             edgeMap.get(key)!.labels.add(edge.label);
    //         }
    //     }
    // });
    //
    // const edgeLabels = Array.from(edgeMap.values()).map(({ source, target, labels }) => ({
    //     source,
    //     target,
    //     label: Array.from(labels).join(", "),
    // }));

    const direction = gd.direction === "vertical" ? "TD" : "LR";

    // ---------------- Gather detailed fields ----------------
    const detailedFields: GraphNode[] =
        highlightEntity
            ? gd.nodes
                .filter(({ id }) => id.startsWith(`${highlightEntity}.`))
                .map(({ id, name, type, value }) => {
                    const field = id.split(".").pop()!;
                    // console.log("check fk for " + id);
                    const children: string[] = gd.edges
                        .filter((e) => e.source === id)   // keep only edges from this node
                        .map((e) => e.target);            // extract the target values

                    const parents: string[] = gd.edges
                        .filter((e) => e.target === id)   // keep only edges from this node
                        .map((e) => e.source);            // extract the target values

                    // const tp = child === "Unknown" ? type : `${type}|${child}`;
                    return { id: field, name, type: type, value, from: parents, to: children } as GraphNode;
                })
            : [];

    // ---------------- Build DOT ----------------
    let dot = `digraph {\n`;
    dot += `  node [shape=Record style=rounded]\n\n`;
    dot += `  edge[arrowhead="open"]\n  tooltip=""\n  rankdir=${direction} \n overlap = scale \n splines = true \n`;

    // ---------------- Render nodes ----------------
    Object.values(nodes).forEach(({ id: nodeId }) => {
        const [category, entity] = nodeId.split(".");
        const nodeClass = `graph_node_table ${allHighlights.has(nodeId) ? "highlight " : ""}`;

        if (nodeId === highlightEntity) {
            const label = createTableFields(category, entity, detailedFields);
            dot += `  "${nodeId}" [label=<${label}> class="graph_node_table_with_fields highlight" ]\n`;
        } else if (category.startsWith("[") && category.endsWith("]")) {
            dot += `  "${nodeId}" [label="+" shape="circle" class="${nodeClass}" ]\n`;
        } else {
            const label = createTableHeader(category, entity);
            dot += `  "${nodeId}" [label=<${label}> class="${nodeClass}" ]\n`;

        }
    });

    // ---------------- Render edges ----------------
    edgeLabels.forEach(({ source, target, label }) => {
        const highlight = allHighlights.has(source) && allHighlights.has(target) ? "highlight" : "";
        dot += `  "${source}" -> "${target}" [label="${label}" class="graph_label ${highlight}"]\n`;
    });

    // edgeLabels.forEach(({ source, target, label }) => {
    //     let edgeClass = "";

    //     if (upstream.has(source) && upstream.has(target)) {
    //         edgeClass = "highlight-upstream";   // e.g. red
    //     } else if (downstream.has(source) && downstream.has(target)) {
    //         edgeClass = "highlight-downstream"; // e.g. green
    //     } else if (allHighlights.has(source) && allHighlights.has(target)) {
    //         edgeClass = "highlight";            // e.g. yellow
    //     }

    //     dot += `  "${source}" -> "${target}" [label="${label}" class="graph_label ${edgeClass}"]\n`;
    // });

    dot += `}`;
    return dot;
}

export function oneDetailEntity(
    entityGraph: GraphData,
    highlightEntity?: string
): string {
    // ---------------- BFS highlighting ----------------
    const adjForward: Record<string, string[]> = {};
    const adjBackward: Record<string, string[]> = {};
    entityGraph.edges.forEach((edge) => {
        if (!adjForward[edge.source]) adjForward[edge.source] = [];
        if (!adjBackward[edge.target]) adjBackward[edge.target] = [];
        adjForward[edge.source].push(edge.target);
        adjBackward[edge.target].push(edge.source);
    });

    function bfs(start: string, adj: Record<string, string[]>): Set<string> {
        const visited = new Set<string>();
        const queue: string[] = [start];
        while (queue.length) {
            const node = queue.shift()!;
            if (!visited.has(node)) {
                visited.add(node);
                (adj[node] || []).forEach((next) => {
                    if (!visited.has(next)) queue.push(next);
                });
            }
        }
        return visited;
    }

    const allHighlights = new Set<string>();
    if (highlightEntity) {
        const upstream = bfs(highlightEntity, adjBackward);
        const downstream = bfs(highlightEntity, adjForward);
        [highlightEntity, ...upstream, ...downstream].forEach((item) => allHighlights.add(item));
    }

    // ---------------- Build DOT ----------------
    let dot = `digraph {\n`;
    dot += `  node [shape=plaintext margin=0]\n\n`;
    dot += `  edge[arrowhead="open"]\n  tooltip=""\n  rankdir=${entityGraph.direction === "vertical" ? "TD" : "LR"} \n overlap = scale \n splines = true \n`;

    // nodes
    entityGraph.nodes.forEach((node) => {
        const [category, entity] = node.id.split(".");
        const nodeClass = `graph_node_table ${allHighlights.has(node.id) ? "highlight " : ""}`;

        if (node.id === highlightEntity && node.fields && node.fields.length > 0) {
            const label = createTableFields(category, entity, node.fields);
            dot += `  "${node.id}" [label=<${label}> class="graph_node_table_with_fields highlight" ]\n`;
        } else if (category.startsWith("[") && category.endsWith("]")) {
            dot += `  "${node.id}" [label="+" shape="circle" class="${nodeClass}" ]\n`;
        } else {
            const label = createTableHeader(category, entity);
            dot += `  "${node.id}" [label=<${label}> class="${nodeClass}" ]\n`;
        }
    });

    // edges
    entityGraph.edges.forEach(({ source, target, label }) => {
        const highlight = allHighlights.has(source) ? "highlight" : "";
        dot += `  "${source}" -> "${target}" [label="${label}" class="graph_label ${highlight}"]\n`;
    });

    dot += `}`;
    return dot;
}


// const createTableHeader = (category: string, entity: string) => {
//     return `&nbsp;&nbsp;${category}&nbsp;&nbsp;| <f1>  ${entity}  `;
// }
const createTableHeader = (category: string, entity: string) => {
    return `<table border="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="4"><tr><td width="100"><B>${category}</B></td></tr><tr><td>${entity}</td></tr></table>`;
}
const createTableFields = (
    category: string,
    entity: string,
    fields: GraphNode[]
) => {
    const tableHeader = `<tr><td width="100"><FONT ><B>${category}</B></FONT></td></tr><tr><td ><FONT >${entity}</FONT><BR/><BR/></td></tr>`;
    if (fields.length === 0) fields.push({ id: 'Id', name: "Name", type: 'String', value: 'Value' });

    const fieldRows = fields
        .map(({ id, name, type,  from, to }) => {
            let tgt = type;
            // , tt = type;
            // if (type.includes('|')) {
            //     const t = type.split('|');
            //     tt = t[0];
            //     const target = t[1].split(".");
            //     tgt = target[0] + "." + target[1];
            // }

            if (to && to.length > 0) {
                const target = to[0].split(".");
                tgt = target[0] + "." + target[1];
            }
            let froms = "";
            if (from && from.length > 0) {
                froms += "<table border='1' CELLBORDER='0' CELLSPACING='0' CELLPADDING='0'>";
                // for (const f of from) {
                //     froms += `<tr><td>aaa</td></tr>`;
                // }
                froms += "</table>";
            }
            let tos = "";
            if (to && to.length > 0) {
                // tos += "<table border='1' CELLBORDER='0' CELLSPACING='0' CELLPADDING='0'>";
                // tos += "<tr><td>x</td></tr>";
                // // for (const f of to) {
                // //     const t = f.split(".");
                // //     tos += `<tr><td>← ${t[1]}</td></tr>`;
                // // }
                // tos += "</table>";
                tos += to[0].split(".")[1];
            }
            // let froms = "";
            // if (from && from.length > 0) {
            //     for (const f of from) {
            //         const t = f.split(".");
            //         froms += t[1] + " ";
            //     }

            // }
            // if(from && from.length > 0 && to && to.length > 0) {
            //     froms += `|`;
            // }

            // let tos = "";
            // if (to && to.length > 0) {
            //     for (const f of to) {
            //         const t = f.split(".");
            //         tos += t[1] + " ";
            //     }
            // }
            // let cell = ""
            // if(froms && froms.length > 0 ) {
            //     cell = `
            //     <td ALIGN="LEFT" ${to && to.length > 0 ? `TITLE="${tgt}" TARGET="${tgt}"` : ''}>

            //         ${froms}

            //         </td>
            //     `;
            // }
            // if(tos && tos.length > 0 ) {
            //     cell += `

            //     <td ALIGN="LEFT" ${to && to.length > 0 ? `TITLE="${tgt}" TARGET="${tgt}"` : ''}>

            //         ${tos}
            //         </td>
            //     `;
            // }

            // if(cell && cell.length == 0 ) {
            //     cell = `<td>→</td>`;
            // }
            return `<tr>
            <td ALIGN="LEFT" width="10" PORT="IN_${category}.${entity}.${id}" ><FONT >${name || id} </FONT></td>
            <td ALIGN="LEFT" width="10">
              ${type}
            </td>
            <td BALIGN="LEFT" PORT="OUT_${category}.${entity}.${id}" ${(to && to.length > 0) ? `TITLE="${type}" TARGET="${tgt}"` : ''}>

              ${tos}
            </td>
            
          </tr>`;
        }).join('');

    return `<table border="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="0">
              ${tableHeader}
              <tr><td>
                <table border="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4" >
                  ${fieldRows}
                </table>
              </td></tr>
            </table>`;
}

// ------------------ DOT Builders ------------------

// const allDetail = (gd: GraphData) => {
//     const direction = gd.direction === "vertical" ? "TD" : "LR";
//     let dot = `digraph "tt" {\n node [shape=plaintext margin=0]\n edge[arrowhead="open"]\n tooltip=""\n rankdir=${direction}\n`;

//     const nodes: Record<string, GraphNode[]> = {};

//     gd.nodes.forEach(node => {
//         const cat = getCategoryEntity(node.id);
//         if (!cat) return;
//         if (!nodes[cat]) nodes[cat] = [];
//         nodes[cat].push({ id: node.id.split('.').pop()!, name: "a", type: node.type || "", value: node.value || "" });
//     });

//     gd.edges.forEach(edge => {
//         const source = getCategoryEntity(edge.source);
//         const target = getCategoryEntity(edge.target);
//         if (!source || !target) return;
//         if (!nodes[source]) nodes[source] = [{ id: source, name: "a", type: "node.type", value: "node.value" }];
//         if (!nodes[target]) nodes[target] = [{ id: target, name: "a", type: "node.type", value: "node.value" }];
//     });

//     Object.entries(nodes).forEach(([nodeId, fields]) => {
//         const [category, entity] = nodeId.split('.');
//         const label = createTableFields(category, entity, fields);
//         dot += `  "${nodeId}" [label=<${label}>] [class="graph_node_table_with_fields"]\n`;
//     });

//     gd.edges.forEach(edge => {
//         const src = getCategoryEntity(edge.source);
//         const tgt = getCategoryEntity(edge.target);
//         if (!src || !tgt) return;
//         dot += `  "${src}" -> "${tgt}" [label="${edge.label}" tooltip="" ] [class="graph_label"]\n`;
//     });

//     dot += `}`;
//     return dot;
// };

// const shapeDetail = (gd: GraphData) => {
//     // Full original shapeDetail logic
//     let dot = `digraph "tt" {\n graph [rankdir=${gd.graph?.rankdir} label=${gd.graph?.title} labelloc=t]\n node [shape=${gd.node?.shape} width=0.2 height=0.2 margin=0 fontsize=8]\n edge[arrowhead="open" fontsize=6]\n`;
//     gd.nodes.forEach(({ id, name }) => {
//         dot += `  "${id}" [xlabel=<${name || id}> label="" class="graph_node"]\n`;
//     });
//     gd.edges.forEach(({ source, target, label }) => {
//         dot += `  "${source}" -> "${target}" [xlabel="${label}"]\n`;
//     });
//     dot += `}`;
//     return dot;
// };





export function toEntityGraphFlow2(
    entityGraph: GraphData,
    highlightEntity?: string,
    rankdir: "TB" | "LR" = "TB"
): { nodes: Node[]; edges: Edge[] } {
    // function bfs(start: string, adj: Record<string, string[]>): Set<string> {
    //     const visited = new Set<string>();
    //     const queue: string[] = [start];
    //     while (queue.length) {
    //         const node = queue.shift()!;
    //         if (!visited.has(node)) {
    //             visited.add(node);
    //             (adj[node] || []).forEach((next) => {
    //                 if (!visited.has(next)) queue.push(next);
    //             });
    //         }
    //     }
    //     return visited;
    // }

    // const adjForward: Record<string, string[]> = {};
    // const adjBackward: Record<string, string[]> = {};
    // entityGraph.edges.forEach(({ source, target }) => {
    //     if (!adjForward[source]) adjForward[source] = [];
    //     if (!adjBackward[target]) adjBackward[target] = [];
    //     adjForward[source].push(target);
    //     adjBackward[target].push(source);
    // });

    // const allHighlights = new Set<string>();
    // if (highlightEntity) {
    //     const upstream = bfs(highlightEntity, adjBackward);
    //     const downstream = bfs(highlightEntity, adjForward);
    //     [highlightEntity, ...upstream, ...downstream].forEach((id) =>
    //         allHighlights.add(id)
    //     );
    // }

    // const sourcePosition = rankdir === "LR" ? Position.Right : Position.Bottom;
    // const targetPosition = rankdir === "LR" ? Position.Left : Position.Top;

    // const defaultWidth = 180;
    // const defaultHeight = 80;

    // const nodes: Node[] = entityGraph.nodes.map((n) => {
    //     const [category, entity] = n.id.split(".");
    //     const isHighlighted = allHighlights.has(n.id);
    //     const isDetailNode = n.id === highlightEntity && n.fields?.length;

    //     // Only increase size for the highlighted node
    //     const nodeWidth = defaultWidth;
    //     const nodeHeight = isDetailNode
    //         ? Math.min(10, defaultHeight + n.fields!.length * 25)
    //         : defaultHeight;

    //     let label: React.ReactNode;
    //     if (isDetailNode) {
    //         label = (
    //             <div className="text-xs">
    //                 <div className="font-semibold mb-1">{entity} ({category})</div>
    //                 <table className="border-collapse border border-gray-300">
    //                     <thead>
    //                         <tr className="bg-gray-100">
    //                             <th className="border border-gray-300 px-1">Field</th>
    //                             <th className="border border-gray-300 px-1">Type</th>
    //                             <th className="border border-gray-300 px-1">Value</th>
    //                         </tr>
    //                     </thead>
    //                     <tbody>
    //                         {n.fields!.map((f) => (
    //                             <tr key={f.id}>
    //                                 <td className="border border-gray-300 px-1">{f.name}</td>
    //                                 <td className="border border-gray-300 px-1">{f.type}</td>
    //                                 <td className="border border-gray-300 px-1">{f.value}</td>
    //                             </tr>
    //                         ))}
    //                     </tbody>
    //                 </table>
    //             </div>
    //         );
    //     } else {
    //         label = (
    //             <div className="font-medium">
    //                 {entity} <span className="text-gray-500">({category})</span>
    //             </div>
    //         );
    //     }

    //     return {
    //         id: n.id,
    //         data: { label },
    //         position: { x: 0, y: 0 },
    //         style: {
    //             border: isHighlighted ? "2px solid #1976d2" : "1px solid #888",
    //             borderRadius: "12px",
    //             padding: "8px",
    //             background: isHighlighted ? "#E3F2FD" : "#FFF",
    //             minWidth: nodeWidth,
    //             minHeight: nodeHeight,
    //         },
    //         sourcePosition,
    //         targetPosition,
    //         __width: nodeWidth,
    //         __height: nodeHeight,
    //     };
    // });

    // // Merge edges
    // const edgeMap = new Map<string, { source: string; target: string; labels: Set<string> }>();
    // entityGraph.edges.forEach((e) => {
    //     const key = `${e.source}|${e.target}`;
    //     if (!edgeMap.has(key))
    //         edgeMap.set(key, { source: e.source, target: e.target, labels: new Set() });
    //     if (e.label) edgeMap.get(key)!.labels.add(e.label);
    // });
    // const edges: Edge[] = Array.from(edgeMap.values()).map(({ source, target, labels }, i) => ({
    //     id: `edge-${i}`,
    //     source,
    //     target,
    //     label: Array.from(labels).join(", "),
    //     animated: true,
    //     style: { stroke: allHighlights.has(source) ? "#1976d2" : "#555" },
    // }));

    // // Dagre layout
    // const dagreGraph = new dagre.graphlib.Graph();
    // dagreGraph.setDefaultEdgeLabel(() => ({}));
    // dagreGraph.setGraph({ rankdir, nodesep: 50, ranksep: 80 });

    // nodes.forEach((node) => {
    //     dagreGraph.setNode(node.id, { width: node.__width, height: node.__height });
    // });
    // edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

    // dagre.layout(dagreGraph);

    // nodes.forEach((node) => {
    //     const nodeWithPosition = dagreGraph.node(node.id);
    //     node.position = {
    //         x: nodeWithPosition.x - node.__width / 2,
    //         y: nodeWithPosition.y - node.__height / 2,
    //     };
    // });
    console.log(entityGraph);
    console.log(highlightEntity);
    console.log(rankdir);
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    return { nodes, edges };
}



export async function toEntityGraphFlow(
    entityGraph: GraphData,
    highlightEntity?: string,
    rankdir: 'TB' | 'LR' = 'LR'
): Promise<{ nodes: Node[]; edges: Edge[] }> {
    // ---------- BFS helper for highlighting ----------
    function bfs(start: string, adj: Record<string, string[]>): Set<string> {
        const visited = new Set<string>();
        const queue: string[] = [start];
        while (queue.length) {
            const node = queue.shift()!;
            if (!visited.has(node)) {
                visited.add(node);
                (adj[node] || []).forEach((next) => {
                    if (!visited.has(next)) queue.push(next);
                });
            }
        }
        return visited;
    }

    // ---------- adjacency ----------
    const adjForward: Record<string, string[]> = {};
    const adjBackward: Record<string, string[]> = {};
    entityGraph.edges.forEach(({ source, target }) => {
        if (!adjForward[source]) adjForward[source] = [];
        if (!adjBackward[target]) adjBackward[target] = [];
        adjForward[source].push(target);
        adjBackward[target].push(source);
    });

    const allHighlights = new Set<string>();
    if (highlightEntity) {
        const upstream = bfs(highlightEntity, adjBackward);
        const downstream = bfs(highlightEntity, adjForward);
        [highlightEntity, ...upstream, ...downstream].forEach(id =>
            allHighlights.add(id)
        );
    }

    const defaultWidth = 80;
    const defaultHeight = 10;

    // ---------- build nodes ----------
    const nodes: Node[] = entityGraph.nodes.map(n => {
        const [category, entity] = n.id.split('.');
        const isHighlighted = allHighlights.has(n.id);
        const isDetailNode = n.id === highlightEntity && n.fields?.length;

        const width = isDetailNode ? defaultWidth + 125 : defaultWidth;
        const height = isDetailNode ? defaultHeight + n.fields!.length * 25 : defaultHeight;

        let label: React.ReactNode;
        if (isDetailNode) {
            label = (
                <div className="graph_node_table_with_fields font-medium " >
                    <div className="font-semibold mb-1">{category}</div>
                    <div className="font-semibold mb-1">{entity}</div>
                    <br />
                    <table width={"100%"} className="border-collapse border border-gray-300">

                        <tbody>
                            {n.fields!.map(f => (
                                <tr key={f.id}>
                                    <td align="left" className="border border-gray-300 px-1">{f.name}</td>
                                    <td align="left" className="border border-gray-300 px-1">{f.type}</td>
                                    <td align="right" className="border border-gray-300 px-1">{f.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        } else if (category.startsWith('[') && category.endsWith(']')) {
            label = (
                <div className="graph_node_table font-medium ">
                    <div className="font-semibold mb-1">{category}</div>
                    <div className="font-semibold mb-1">{entity}</div>
                </div>
            );
            // label = (
            //  <div
            //     style={{
            //         width: 80,
            //         height: 80,
            //         borderRadius: '50%',        // makes it circular
            //         border: '2px solid #4f46e5', // example border color
            //         display: 'flex',
            //         alignItems: 'center',
            //         justifyContent: 'center',
            //         textAlign: 'center',
            //         cursor: 'pointer',
            //     }}
            //     onClick={() => console.log('Clicked circle node:', entity)}
            //     >
            //     <div className="font-medium">{category}</div>
            //     </div>
            // );
        } else {
            label = (
                <div className="font-medium graph_node_table">
                    <div className="font-semibold mb-1">{category}</div>
                    <div className="font-semibold mb-1">{entity}</div>
                </div>
            );
        }

        return {
            id: n.id,
            data: { label },
            style: {
                border: isHighlighted ? '2px solid #1976d2' : '2px solid #000',
                borderRadius: '8px',
                padding: '0px',
                background: isHighlighted ? '#E3F2FD' : '#FFF',
                minWidth: width,
                minHeight: height,
            },
            width,
            height,
            sourcePosition: rankdir === 'LR' ? Position.Right : Position.Bottom,
            targetPosition: rankdir === 'LR' ? Position.Left : Position.Top,
            position: { x: 0, y: 0 }, // Add default position as required by Node type
        };
    });

    // ---------- merge edges ----------
    const edgeMap = new Map<string, { source: string; target: string; labels: Set<string> }>();
    entityGraph.edges.forEach(e => {
        const key = `${e.source}|${e.target}`;
        if (!edgeMap.has(key)) edgeMap.set(key, { source: e.source, target: e.target, labels: new Set() });
        if (e.label) edgeMap.get(key)!.labels.add(e.label);
    });
    const edges: Edge[] = Array.from(edgeMap.values()).map(({ source, target, labels }, i) => ({
        id: `edge-${i}`,
        source,
        target,
        label: Array.from(labels).join(', '),
        animated: true,
        style: { stroke: allHighlights.has(source) ? '#1976d2' : '#000' },
    }));

    // ---------- build ELK graph ----------

    const elkGraph = {
        id: 'root',
        layoutOptions: {
            'elk.algorithm': 'layered',
            'elk.direction': rankdir === 'LR' ? 'RIGHT' : 'DOWN',
            'elk.spacing.nodeNode': '50',
            'elk.layered.spacing.nodeNodeBetweenLayers': '160', // more explicit for layered layout

            'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED'

        },
        children: nodes.map(n => ({
            id: n.id,
            width: n.width ?? 100,
            height: n.height ?? 50,
        })),
        edges: edges.map(e => ({ id: e.id, sources: [e.source], targets: [e.target] })),
    };
    const elk = new ELK();
    const layout = await elk.layout(elkGraph);

    // ---------- assign positions ----------
    const nodePositions = new Map<string, { x: number; y: number }>();
    layout.children?.forEach(n => {
        if (!n.x || !n.y) return;
        nodePositions.set(n.id, { x: n.x, y: n.y });
    });

    const positionedNodes = nodes.map(n => ({
        ...n,
        position: nodePositions.get(n.id) || { x: 0, y: 0 },
    }));

    return { nodes: positionedNodes, edges };
}

