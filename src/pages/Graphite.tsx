// pages/Graphite.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import './Graphite.css';
// import { useParams } from 'react-router-dom';
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
import {oneDetaiBasedOnField} from "./functions"
import type { GraphData } from "./interfaces";
console.log("######### Graphite.tsx ");

// ------------------ Types ------------------



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
    console.log("--------- Graphite render start ---------");
    // const { id } = useParams<{ id: string }>();

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
    const setGraphData = (gd: GraphData) => {
        graphDataRef.current = gd;
    }

    
    const showApp = (fieldGraph: GraphData) => {
        if (!fieldGraph) return;
        // let dot = '';
        // if (gd.node?.shape) {
        //     dot = shapeDetail(gd);
        // } else if (gd.metadata?.showDetails) {
        //     dot = allDetail(gd);
        // } else {
        //     dot = oneDetail(gd, tableRef.current);
        // }
        // const entityGraph = toEntityGraph(fieldGraph);
        // const dot = oneDetail(entityGraph, tableRef.current);

        const dot = oneDetaiBasedOnField(graphDataRef.current, tableRef.current);
        renderGraph(dot);
    }


    const showNode = async (node: string) => {
        console.log(node)
    }
    const showTable = async (table: string) => {
        tableRef.current = table;
        const parts = table.split(".");
        if (parts.length === 2) {
            // const entityGraph = toEntityGraph(graphDataRef.current);
            // const dot = oneDetail(entityGraph, table);
            const dot = oneDetaiBasedOnField(graphDataRef.current, tableRef.current);
            renderGraph(dot);
        }
    }

    const showRelation = async (relation: string) => {
        console.log("showRelation: " + relation);
        // const parts = relation.split('->')[1];
        // const downstream = getDownstream(globalGraphData, parts);
        // toggleCollapsed(downstream);
    }

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
                    .duration(200);
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
    }

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
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ------------------ Render ------------------
    console.log("--------- Graphite render end ---------");

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
