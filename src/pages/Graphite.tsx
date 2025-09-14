// pages/Graphite.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import './Graphite.css';
import { useParams } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";

import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import HomeIcon from '@mui/icons-material/Home';
import DataObjectIcon from '@mui/icons-material/DataObject';

import * as d3 from 'd3';
import "d3-graphviz";
import { parse } from "jsonc-parser";

console.log("######### Graphite.tsx ");

// ------------------ Types ------------------

interface GraphNode {
    id: string;
    name: string;
    type: string;
    value: string;
}

interface GraphEdge {
    source: string;
    target: string;
    label?: string;
}

interface GraphData {
    type?: string;
    direction?: "vertical" | "horizontal";
    graph?: { rankdir: string; title?: string };
    node?: { shape: string };
    metadata?: { showDetails?: boolean };
    nodes: GraphNode[];
    edges: GraphEdge[];
}
export interface GraphiteProps {
    jsonString?: string;
}

// Event listener tracking
interface TrackedListener {
    type: keyof GlobalEventHandlersEventMap;
    listener: EventListenerOrEventListenerObject;
    options?: boolean | AddEventListenerOptions;
}

// ------------------ Component ------------------

export const Graphite: React.FC<GraphiteProps> = (props) => {
    console.log("--------- Graphite render ");
    const { id } = useParams<{ id: string }>();
    const app = id;

    // Event listener tracking
    const eventListenersMap = useRef(new WeakMap<Element, TrackedListener[]>()).current;
    const elements = useRef<Element[]>([]).current;

    const trackEventListener = (
        element: Element,
        type: keyof GlobalEventHandlersEventMap,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
    ) => {
        if (!eventListenersMap.has(element)) eventListenersMap.set(element, []);
        eventListenersMap.get(element)!.push({ type, listener, options });
        element.addEventListener(type, listener, options);
        elements.push(element);
    };

    const removeTrackedListeners = (element: Element) => {
        const listeners = eventListenersMap.get(element) || [];
        for (const { type, listener, options } of listeners) {
            element.removeEventListener(type, listener, options);
        }
        eventListenersMap.delete(element);
    };

    const removeAllTrackedListeners = () => {
        elements.forEach(el => removeTrackedListeners(el));
        elements.length = 0;
    };

    // ------------------ Refs & State ------------------
    const appRef = useRef<string>("");
    const tableRef = useRef<string>("");
    const panZoomRef = useRef<any>(null); // refine if you use svg-pan-zoom
    const editorRef = useRef<any>(null);
    const graphIndexRef = useRef<number>(0);
    const graphDataRef = useRef<any>({ nodes: [], edges: [] });
    //if you want to keep the value, without rerendering, use ref.
    //  useRef → value persists across renders, and you can mutate/replace freely without triggering a re-render.
    //if you want to change the value, and rerender, use state
    //  change the state, it will not immidiately change, after rerender, it uses the new value
    //  useRef → value persists across renders, but is replaced when you call setGraphData. Re-render happens.
    //if using let xx=.. it will be re-created everytime
    //  let graphData: GraphData = { nodes: [], edges: [] };// for click events Ahh, exactly 👍 You’ve run into a React render cycle behavior:
    //  let → value is re-created every render, always resets.
    const [graphJson, setGraphJson] = useState<string>();
    const [graphJsonHistory] = useState<string[]>([]);
    const [firstGraph, setFirstGraph] = useState(true);
    const [lastGraph, setLastGraph] = useState(true);
    const [openEditor, setOpenEditor] = useState(false);

    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

    const theme = useMemo(
        () => createTheme({ palette: { mode: prefersDarkMode ? "dark" : "light" } }),
        [prefersDarkMode]
    );

    // ------------------ Helpers ------------------
    const setGraphData = (gd: GraphData) => {
        graphDataRef.current = gd;
    }
    const getCategoryEntity = (id: string): string | null => {
        const parts = id.split('.');
        return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : null;
    }

    const createTableHeader = (category: string, entity: string) => {
        return `<table border="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4"><tr><td width="100">${category}</td></tr><tr><td>${entity}</td></tr></table>`;
    }

    const createTableFields = (
        category: string,
        entity: string,
        fields: GraphNode[]
    ) => {
        const tableHeader = `<tr><td ><FONT >${category}</FONT></td></tr><tr><td ><FONT >${entity}</FONT></td></tr>`;
        if (fields.length === 0) fields.push({ id: 'Id', name: "Name", type: 'String', value: 'Value' });

        const fieldRows = fields
            .map(({ id, name, type, value }) => {
                let tgt = type, tt = type;
                if (type.includes('|')) {
                    const t = type.split('|');
                    tt = t[0];
                    const target = t[1].split(".");
                    tgt = target[0] + "." + target[1];
                }
                return `<tr>
            <td ALIGN="LEFT" PORT="IN_${category}.${entity}.${id}" ><FONT >${name || id} </FONT></td>
            <td ALIGN="LEFT">
              ${tt}
            </td>
            <td ALIGN="LEFT" PORT="OUT_${category}.${entity}.${id}" ${type.includes('|') ? `TITLE="${type}" TARGET="${tgt}"` : ''}>
               ${type.includes('|') ? `<FONT >${value}</FONT>` : `<FONT >${value}</FONT>`}
            </td>
          </tr>`;
            }).join('');

        return `<table bgcolor="aliceblue" color="coral" border="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="0">
              ${tableHeader}
              <tr><td>
                <table border="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="4" >
                  ${fieldRows}
                </table>
              </td></tr>
            </table>`;
    };

    // ------------------ Graph Load ------------------

    const loadApp = async (app?: string) => {
        // let gd: GraphData = { nodes: [], edges: [] };
        if (app) {
            appRef.current = app;
        //     const response = await fetch(`/apps/${app}.json`);
        //     const jsonString = await response.text();
        //     setGraphData(JSON.parse(jsonString));
        //     setGraphJson(jsonString);
        // } else if (props.jsonString) {
        //     gd = parse(props.jsonString);
        //     setGraphData(gd);
        //     setGraphJson(props.jsonString);
        // } else {
        //     let jsonString = localStorage.getItem("graphite.json") || `{ "type": "er", "nodes": [], "edges": [] }`;
        //     try {
        //         setGraphData(parse(jsonString));
        //         localStorage.setItem("graphite.json", jsonString);
        //         setGraphJson(jsonString);
        //     } catch {
        //         localStorage.removeItem("graphite.json");
        //     }
        }
        // showApp(gd);
    };

    // ------------------ DOT Builders ------------------

    const allDetail = (gd: GraphData) => {
        const direction = gd.direction === "vertical" ? "TD" : "LR";
        let dot = `digraph "tt" {\n node [shape=plaintext margin=0]\n edge[arrowhead="open"]\n tooltip=""\n rankdir=${direction}\n`;

        const nodes: Record<string, GraphNode[]> = {};

        gd.nodes.forEach(node => {
            const cat = getCategoryEntity(node.id);
            if (!cat) return;
            if (!nodes[cat]) nodes[cat] = [];
            nodes[cat].push({ id: node.id.split('.').pop()!, name: "a", type: node.type || "", value: node.value || "" });
        });

        gd.edges.forEach(edge => {
            const source = getCategoryEntity(edge.source);
            const target = getCategoryEntity(edge.target);
            if (!source || !target) return;
            if (!nodes[source]) nodes[source] = [{ id: source, name: "a", type: "node.type", value: "node.value" }];
            if (!nodes[target]) nodes[target] = [{ id: target, name: "a", type: "node.type", value: "node.value" }];
        });

        Object.entries(nodes).forEach(([nodeId, fields]) => {
            const [category, entity] = nodeId.split('.');
            const label = createTableFields(category, entity, fields);
            dot += `  "${nodeId}" [label=<${label}>] [class="graph_node_table_with_fields"]\n`;
        });

        gd.edges.forEach(edge => {
            const src = getCategoryEntity(edge.source);
            const tgt = getCategoryEntity(edge.target);
            if (!src || !tgt) return;
            dot += `  "${src}" -> "${tgt}" [label="${edge.label}" tooltip="" ] [class="graph_label"]\n`;
        });

        dot += `}`;
        return dot;
    };

    function oneDetail(gd: GraphData, highlightEntity?: string): string {
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
        const allHighlights = new Set<string>();
        if (highlightEntity) {
            const upstream = bfs(highlightEntity, adjBackward);
            const downstream = bfs(highlightEntity, adjForward);
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

        const direction = gd.direction === "vertical" ? "TD" : "LR";

        // ---------------- Gather detailed fields ----------------
        const detailedFields =
            highlightEntity
                ? gd.nodes
                    .filter(({ id }) => id.startsWith(`${highlightEntity}.`))
                    .map(({ id, name, type, value }) => {
                        const field = id.split(".").pop()!;
                        console.log("check fk for "+id);
                        const fk = gd.edges.find((e) => e.source === id)?.target || "Unknown";
                        const tp = fk === "Unknown" ? type : `${type}|${fk}`;
                        return { id: field, name, type: tp, value };
                    })
                : [];

        // ---------------- Build DOT ----------------
        let dot = `digraph {\n`;
        dot += `  node [shape=plaintext margin=0]\n\n`;
        dot += `  edge[arrowhead="open"]\n  tooltip=""\n  rankdir=${direction} \n overlap = scale \n splines = true \n`;

        // ---------------- Render nodes ----------------
        Object.values(nodes).forEach(({ id: nodeId }) => {
            const [category, entity] = nodeId.split(".");
            const nodeClass = `graph_node_table ${allHighlights.has(nodeId) ? "highlight " : ""}${nodeId.replace(
                /\W/g,
                "_"
            )}`;

            if (nodeId === highlightEntity) {
                const label = createTableFields(category, entity, detailedFields);
                dot += `  "${nodeId}" [label=<${label}> class="graph_node_table_with_fields highlight ${nodeId.replace(
                    /\W/g,
                    "_"
                )}" ]\n`;
            } else if (category.startsWith("[") && category.endsWith("]")) {
                dot += `  "${nodeId}" [label="+" shape="circle" class="${nodeClass}" ]\n`;
            } else {
                const label = createTableHeader(category, entity);
                dot += `  "${nodeId}" [label=<${label}> class="${nodeClass}" ]\n`;
            }
        });

        // ---------------- Render edges ----------------
        edgeLabels.forEach(({ source, target, label }) => {
            const highlight = allHighlights.has(source) ? "highlight" : "";
            dot += `  "${source}" -> "${target}" [label="${label}" class="graph_label ${source.replace(
                /\W/g,
                "_"
            )}_to_${target.replace(/\W/g, "_")} ${highlight}"]\n`;
        });

        dot += `}`;
        return dot;
    }


    const shapeDetail = (gd: GraphData) => {
        // Full original shapeDetail logic
        let dot = `digraph "tt" {\n graph [rankdir=${gd.graph?.rankdir} label=${gd.graph?.title} labelloc=t]\n node [shape=${gd.node?.shape} width=0.2 height=0.2 margin=0 fontsize=8]\n edge[arrowhead="open" fontsize=6]\n`;
        gd.nodes.forEach(({ id, name }) => {
            dot += `  "${id}" [xlabel=<${name || id}> label="" class="graph_node"]\n`;
        });
        gd.edges.forEach(({ source, target, label }) => {
            dot += `  "${source}" -> "${target}" [xlabel="${label}"]\n`;
        });
        dot += `}`;
        return dot;
    };


    const fetchTable = async (table: string) => {
        //lazy load table data
        const dot = oneDetail(graphDataRef.current, table);
        return dot;
    }

    const showNode = async (node: string) => {
        console.log(node)
    }
    const showTable = async (table: string) => {
        tableRef.current = table;
        const parts = table.split(".");
        if (parts.length === 2) {
            const data = await fetchTable(table)
            renderGraph(data);
        }
    }

    const showRelation = async (relation: string) => {
        console.log("showRelation: " + relation);
        // const parts = relation.split('->')[1];
        // const downstream = getDownstream(globalGraphData, parts);
        // toggleCollapsed(downstream);
    }
    const showApp = (gd: GraphData) => {
        if (!gd) return;
        let dot = '';
        if (gd.node?.shape) {
            dot = shapeDetail(gd);
        } else if (gd.metadata?.showDetails) {
            dot = allDetail(gd);
        } else {
            dot = oneDetail(gd, tableRef.current);
        }
        renderGraph(dot);
    };

    // ------------------ Graph Rendering ------------------

    const renderGraph = (dotSrc: string, skipPush?: boolean) => {
        console.log("Rendering graph...");

        removeAllTrackedListeners();
        if (!skipPush) {
            graphJsonHistory.push(dotSrc);
            graphIndexRef.current = graphJsonHistory.length - 1;
            setFirstGraph(graphIndexRef.current === 0);
        }

        const graphCanvas = document.querySelector(".graphCanvas");
        if (!graphCanvas) return;


        (d3.select(".graphCanvas") as any)
            .graphviz({ useWorker: false, engine: 'dot' })
            .transition(function () {
                return d3.transition()
                    .duration(300);
            })
            .fit(true)
            .zoom(true)//disable d3 graphviz zoom, to make svgPanZoom work
            .dot(dotSrc)
            .render()
            .on("end", function () {
                // showDoc('graph rendering started');
                //const svgElement = document.querySelector(".graphCanvas svg");

                //panZoomRef.current = svgPanZoom(".graphCanvas svg", {controlIconsEnabled: true, customEventsHandler: eventsHandler})

                const nodes = document.querySelectorAll(".graphCanvas svg .graph_node")
                nodes.forEach(node => {

                    removeTrackedListeners(node);
                    trackEventListener(node, "pointerup", function (event) {
                        // console.log("graph_node: " + event.currentTarget.__data__!.key);
                        if (event.currentTarget && "__data__" in event.currentTarget) {
                            const data = (event.currentTarget as any).__data__;
                            console.log("pointerup graph_node: " + data.key);
                            showNode(data.key);
                        }

                    });
                });

                const graph_node_tables = document.querySelectorAll(".graphCanvas svg .graph_node_table")
                graph_node_tables.forEach(node => {

                    removeTrackedListeners(node);
                    trackEventListener(node, "pointerup", function (event) {
                        // console.log("pointerup graph_node_table: " + event.currentTarget.__data__.key);
                        // showTable(event.currentTarget.__data__.key);

                        if (event.currentTarget && "__data__" in event.currentTarget) {
                            const data = (event.currentTarget as any).__data__;
                            console.log("pointerup graph_node_table: " + data.key);
                            showTable(data.key);
                        }
                    });
                });


                const table_nodes = document.querySelectorAll(".graphCanvas svg .graph_node_table_with_fields")
                table_nodes.forEach(node => {
                    const ga = node.querySelectorAll("g a")
                    ga.forEach(a => {
                        removeTrackedListeners(a);

                        trackEventListener(a, "pointerup", function (event) {
                            // console.log("pointerup graph_node_table_with_field: " + event.currentTarget.target.baseVal);
                            // showTable(event.currentTarget.target.baseVal);

                            if (event.currentTarget && "target" in event.currentTarget) {
                                const data = (event.currentTarget as any).target;
                                console.log("pointerup graph_node_table_with_field: " + data.baseVal);
                                showTable(data.baseVal);
                            }
                        });

                    });
                });

                const labels = document.querySelectorAll(".graphCanvas svg .graph_label")
                labels.forEach(label => {
                    removeTrackedListeners(label);
                    trackEventListener(label, "pointerup", function (event) {
                        // showRelation(event.currentTarget.__data__.key);

                        if (event.currentTarget && "__data__" in event.currentTarget) {
                            const data = (event.currentTarget as any).__data__;
                            console.log("pointerup graph_label: " + data.key);
                            showRelation(data.key);
                        }
                    });
                });

                // showDoc('graph rendering ended');
                console.log("Graph rendered.");
            });
    };

    const prevGraph = () => {
        if (graphIndexRef.current > 0) {
            graphIndexRef.current--;
        }
        setFirstGraph(graphIndexRef.current === 0);
        setLastGraph(graphIndexRef.current === graphJsonHistory.length - 1);
        //        firstGraph = graphIndexRef.current==0;
        //        lastGraph = graphIndexRef.current==stack.length-1;

        // showDoc("previous graph " + graphIndexRef.current + ", " + stack.length);

        renderGraph(graphJsonHistory[graphIndexRef.current], true)
    }
    const nextGraph = () => {
        if (graphIndexRef.current < graphJsonHistory.length - 1) {
            graphIndexRef.current++;
        }
        setFirstGraph(graphIndexRef.current === 0);
        setLastGraph(graphIndexRef.current === graphJsonHistory.length - 1);
        //        firstGraph = graphIndexRef.current==0;
        //        lastGraph = graphIndexRef.current==stack.length-1;
        // showDoc("next graph " + graphIndexRef.current + ", " + stack.length);

        renderGraph(graphJsonHistory[graphIndexRef.current], true)
    }
    const resetGraph = () => {

        graphIndexRef.current = 0;
        // showDoc("reset graph " + graphIndexRef.current + ", " + stack.length);
        // showDoc(stack[graphIndexRef.current])
        renderGraph(graphJsonHistory[graphIndexRef.current], true)
    }

    const cleanGraph = () => {
        graphJsonHistory.length = 0;
        setFirstGraph(true);
        setLastGraph(true);
        graphIndexRef.current = 0;
    }
    const handleResize = () => {
        if (panZoomRef.current) {
            const div = document.querySelector(".graphCanvas");
            if (div) panZoomRef.current.resize();
        }
    };

    const handleEditorMount: OnMount = (editor) => {
        editorRef.current = editor;
    };

    const handleSave = () => {
        try {
            const json = editorRef.current?.getValue() || graphJson;
            const gd = parse(json);
            localStorage.setItem("graphite.json", json);
            setOpenEditor(false);
            setGraphData(gd);
            setGraphJson(json);
            showApp(gd);
            cleanGraph();
        } catch (err: any) {
            alert("Invalid JSON: " + err.message);
        }
    };
    // ------------------ Effects ------------------
    useEffect(() => {

        if (props.jsonString) {
            setGraphJson(props.jsonString); // update internal state
            const gd = parse(props.jsonString);
            setGraphData(gd); //Got it 👍 — this is the classic async state update problem in React. React doesn’t update graph Data immediately. It marks it as “stale” and re-renders later.
            showApp(gd); // call renderGraph indirectly So the very next line still sees the old graph Data value.
        }
    }, [props.jsonString]);

    // ------------------ Effects ------------------
    useEffect(() => {
        loadApp(app);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    // ------------------ Render ------------------

    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <ThemeProvider theme={theme}>
                <div className="graphCanvas"></div>
                <Stack id="graphDownload" className="graphToolbar" direction="row">
                    <div style={{ padding: '2px' }}>
                        <IconButton onClick={resetGraph}><HomeIcon /></IconButton>
                        <IconButton onClick={prevGraph} disabled={firstGraph}><UndoIcon /></IconButton>
                        <IconButton onClick={nextGraph} disabled={lastGraph}><RedoIcon /></IconButton>
                        {/* <IconButton onClick={downloadGraph}><DownloadIcon /></IconButton> */}
                        <IconButton onClick={() => setOpenEditor(true)}><DataObjectIcon /></IconButton>
                    </div>
                </Stack>
                <Dialog
                    open={openEditor}
                    onClose={() => setOpenEditor(false)}
                    fullWidth
                    maxWidth="lg"
                    sx={{ "& .MuiPaper-root": { border: "1px solid #ccc", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" } }}
                >
                    <DialogTitle><DataObjectIcon /></DialogTitle>
                    <DialogContent style={{ height: "100vh" }} sx={{ p: 2 }}>
                        <Editor
                            height="100%"
                            defaultLanguage="json"
                            value={graphJson}
                            onMount={handleEditorMount}
                            theme={prefersDarkMode ? "vs-dark" : "light"}
                            options={{
                                scrollbar: {
                                    vertical: "auto",      // "auto" | "visible" | "hidden"
                                    horizontal: "auto",
                                    verticalScrollbarSize: 4, // <-- width of vertical scrollbar (px)
                                    horizontalScrollbarSize: 4, // <-- height of horizontal scrollbar (px)
                                    arrowSize: 12,             // optional, size of arrows
                                }
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenEditor(false)}>Cancel</Button>
                        <Button onClick={handleSave} variant="contained">Apply</Button>
                    </DialogActions>
                </Dialog>
            </ThemeProvider>
        </div>
    );
};
