//当route的path为"/graphite/:id"时，这个组件会被渲染

import { useState, useEffect, useRef, useCallback, memo } from 'react'

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

import DownloadIcon from '@mui/icons-material/Download';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import HomeIcon from '@mui/icons-material/Home';
import CodeIcon from "@mui/icons-material/Code";
//https://github.com/magjac/d3-graphviz
import * as d3 from 'd3'
import * as d3Graphviz from 'd3-graphviz';
//https://github.com/johnwalley/allotment?tab=readme-ov-file


import { parse } from "jsonc-parser";/* to support jsonc */

console.log("######### Graphite.js ######### ");








// Common utility: extract category.entity
function getCategoryEntity(id) {
  const parts = id.split('.');
  return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : null;
}

// Common utility: process edges and collect edge labels + ensure nodes exist
function processEdges(graphData, nodes) {
  const edges = new Set();
  const edgeLabels = [];

  graphData.edges.forEach((edge) => {
    const source = getCategoryEntity(edge.source);
    const target = getCategoryEntity(edge.target);

    [source, target].forEach((id) => {
      if (id && !nodes[id]) {
        nodes[id] = { id };
      }
    });

    if (source && target && source !== target) {
      const relationship = edge.weight || "";
      edges.add(`"${source}" -> "${target}"`);
      edgeLabels.push({ source, target, label: relationship });
    }
  });

  return { edges, edgeLabels };
}

// Common utility: build DOT graph skeleton
function buildDot({ directon, nodes, edgeLabels, renderNode }) {
  let dot = `digraph "tt" {\n`;
  dot += `  node [shape=plaintext margin=0]\n\n`;
  dot += `  edge[arrowhead="open"]\n  tooltip=""\n  rankdir=${directon} \n overlap = scale \n splines = true \n`;

  // Add nodes (delegate to renderer)
  Object.values(nodes).forEach(({ id }) => {
    dot += renderNode(id);
  });

  // Add edges
  edgeLabels.forEach(({ source, target, label }) => {
    dot += `  "${source}" -> "${target}" [label="${label}" class="graph_label"]\n`;
  });

  dot += `}`;
  return dot;
}

// -----------------------------
// noDetail (simplified)
// -----------------------------
export function noDetail(graphData) {
  const nodes = {};
  const directon = graphData.direction === "vertical" ? "TD" : "LR";

  // Process nodes from graphData.nodes
  graphData.nodes.forEach((node) => {
    const categoryEntity = getCategoryEntity(node.id);
    if (categoryEntity && !nodes[categoryEntity]) {
      nodes[categoryEntity] = { id: categoryEntity };
    }
  });

  // Process edges (also adds missing nodes)
  const { edgeLabels } = processEdges(graphData, nodes);

  // Render nodes (simple header only)
  const renderNode = (nodeId) => {
    const [category, entity] = nodeId.split('.');
    const label = createTableHeader(category, entity);
    return `  "${nodeId}" [label=<${label}> class="graph_node_table"]\n`;
  };

  return buildDot({ directon, nodes, edgeLabels, renderNode });
}

// -----------------------------
// oneDetail (highlighted entity)
// -----------------------------
export function oneDetail(graphData, highlightEntity) {
  // --- Common util ---
  function getCategoryEntity(id) {
    const parts = id.split('.');
    return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : null;
  }

  // Build nodes dictionary from edges + nodes
  const nodes = {};
  graphData.nodes.forEach((node) => {
    const categoryEntity = getCategoryEntity(node.id);
    if (categoryEntity && !nodes[categoryEntity]) {
      nodes[categoryEntity] = { id: categoryEntity };
    }
  });

  // Build adjacency lists
  const adjForward = {};
  const adjBackward = {};
  graphData.edges.forEach((edge) => {
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

  // BFS helper
  function bfs(start, adj) {
    const visited = new Set();
    const queue = [start];
    while (queue.length) {
      const node = queue.shift();
      if (!visited.has(node)) {
        visited.add(node);
        (adj[node] || []).forEach((next) => {
          if (!visited.has(next)) queue.push(next);
        });
      }
    }
    return visited;
  }

  // Collect upstream + downstream entities
  const upstream = bfs(highlightEntity, adjBackward);
  const downstream = bfs(highlightEntity, adjForward);
  const allHighlights = new Set([highlightEntity, ...upstream, ...downstream]);

  // Build edge labels
  const edgeLabels = [];
  graphData.edges.forEach((edge) => {
    const source = getCategoryEntity(edge.source);
    const target = getCategoryEntity(edge.target);
    if (source && target && source !== target) {
      const relationship = edge.weight || "";
      edgeLabels.push({ source, target, label: relationship });
    }
  });

  const directon = graphData.direction === "vertical" ? "TD" : "LR";

  // Gather detailed fields for the main highlightEntity only
  const detailedFields = graphData.nodes
    .filter(({ id }) => id.startsWith(`${highlightEntity}.`))
    .map(({ id, type, description }) => {
      const field = id.split('.').pop();

      // set fk if the id is being referenced by another node in edges
      // const fk =
      //   graphData.edges.find((edge) => edge.source === id || edge.target === id)
      //     ?.target || "Unknown";
      const fk =
        graphData.edges.find((edge) => edge.source === id)
          ?.target || "Unknown";
      const tp = fk === "Unknown" ? type : type + "|" + fk;
      return { id: field, type: tp, description };
    });

  // Build DOT
  let dot = `digraph "tt" {\n`;
  dot += `  node [shape=plaintext margin=0]\n\n`;
  dot += `  edge[arrowhead="open"]\n  tooltip=""\n  rankdir=${directon} \n overlap = scale \n splines = true \n`;

  // Render nodes
  Object.values(nodes).forEach(({ id: nodeId }) => {
    const [category, entity] = nodeId.split('.');

    if (nodeId === highlightEntity) {
      // Main highlight → detailed fields
      const label = createTableFields(category, entity, detailedFields);
      dot += `  "${nodeId}" [label=<${label}> class="graph_node_table_with_fields highlight" ]\n`;
    } else if (allHighlights.has(nodeId)) {
      // Upstream/downstream highlights
      const label = createTableHeader(category, entity);
      dot += `  "${nodeId}" [label=<${label}> class="graph_node_table highlight" ]\n`;
    } else {
      // Normal nodes
      const label = createTableHeader(category, entity);
      dot += `  "${nodeId}" [label=<${label}> class="graph_node_table"]\n`;
    }
  });

  // Render edges
  edgeLabels.forEach(({ source, target, label }) => {
    dot += `  "${source}" -> "${target}" [label="${label}" class="graph_label"]\n`;
  });

  dot += `}`;
  return dot;
}


//all details
export function allDetail(graphData) {
  const directon = graphData.direction === "vertical" ? "TD" : "LR";

  const edgeTemplate = (source, target, weight) =>
    `"${source}" -> "${target}" [label="${weight}" tooltip="" ] [class="graph_label"]`;

  let dot = `digraph "tt" {
  node [shape=plaintext margin=0]
  edge[arrowhead="open"]
  tooltip=""
  rankdir=${directon}
`;

  const groupedNodes = {};
  graphData.nodes.forEach((node) => {
    const [category, entity, field] = node.id.split('.');
    if (!groupedNodes[`${category}.${entity}`]) {
      groupedNodes[`${category}.${entity}`] = [];
    }
    groupedNodes[`${category}.${entity}`].push({
      id: field,
      type: node.type,
      description: node.description,
    });
  });

  Object.entries(groupedNodes).forEach(([nodeId, fields]) => {
    const [category, entity] = nodeId.split('.');
    const nodeLabel = createTableFields(category, entity, fields);
    dot += `  "${nodeId}" [label=<${nodeLabel}>] [class="graph_node_table_with_fields"]\n`;
  });

  const getNodePrefix = (id) => {
    const parts = id.split('.');
    return `${parts[0]}.${parts[1]}`; // Extract the `category.entity` prefix.
  };

  graphData.edges.forEach((edge) => {
    const sourceNode = getNodePrefix(edge.source);
    const targetNode = getNodePrefix(edge.target);
    dot += `  ${edgeTemplate(sourceNode, targetNode, edge.weight)}\n`;
  });

  dot += `}`;
  return dot;
}

function createTableHeader(category, entity) {
  return `<table border="0" CELLBORDER="1" CELLSPACING="1" CELLPADDING="4"><tr><td>${category}</td></tr><tr><td>${entity}</td></tr></table>`;
}

function createTableFields(category, entity, fields) {
  const tableHeader = `<tr><td ><FONT >${category}</FONT></td></tr><tr><td ><FONT >${entity}</FONT></td></tr>`;

  if (fields.length === 0) {
    fields.push({ id: 'id', type: 'String', description: 'default' });
  }
  const fieldRows = fields
    .map(
      ({ id, type, description }) => {
        let tgt = type;
        let tt = type;
        if (type.includes('|')) {
          const t = type.split('|');
          tt = t[0];
          const target = t[1].split(".");
          tgt = target[0] + "." + target[1];
        }
        return `<tr>
            <td width="50" PORT="${id}" ><FONT >${id}</FONT></td>
            <td width="50" TITLE="${type}" 
              ${type.includes('|') ? `TARGET="${tgt}"` : ''}>
              ${type.includes('|')
            ? `<U><FONT >${tt}</FONT></U>`
            : `<FONT >${tt}</FONT>`
          }
            </td>
            <td width="50"><FONT >${description}</FONT></td>
          </tr>`
      }
    )
    .join('');
  return `<table bgcolor="aliceblue" color="coral" border="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="0">
              ${tableHeader}
              <tr><td>
                <table border="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="4" >
                  ${fieldRows}
                </table>
              </td></tr>
            </table>`;
}



//new shape
export function shapeDetail(graphData) {


  // Start building the DOT representation ranksep=0.3
  let dot = `digraph "tt" {\n`;
  dot += `  graph [rankdir=${graphData.graph.rankdir} label=${graphData.graph.title} labelloc=t]\n\n`;
  dot += `  node [shape=${graphData.node.shape} width=0.2 height=0.2 margin=0 fontsize=8]\n\n`;
  dot += `  edge[arrowhead="open"  fontsize=6]\n  tooltip=""\n   \n`;

  // Add nodes
  graphData.nodes.forEach(({ id, label }) => {
    dot += `  "${id}" [xlabel=<${label ? label : id}> label="" class="graph_node"] \n`;
  });

  // Add edges with labels
  graphData.edges.forEach(({ source, target, label }) => {
    dot += `  "${source}" -> "${target}" [xlabel="${label}" ]\n`;
  });

  dot += `}`;
  return dot;
}



//////////////////////////////////////////////////////////////////////////////////////////
const eventListenersMap = new WeakMap();
let elements = [];

function trackEventListener(element, type, listener, options) {
  if (!eventListenersMap.has(element)) {
    eventListenersMap.set(element, []);
  }
  eventListenersMap.get(element).push({ type, listener, options });
  element.addEventListener(type, listener, options);

  elements.push(element)
}


function removeAllTrackedListeners() {
  for (const obj of elements) {
    removeTrackedListeners(obj);
  }
  elements = [];
}

function removeTrackedListeners(element) {
  const listeners = eventListenersMap.get(element) || [];
  for (const { type, listener, options } of listeners) {
    element.removeEventListener(type, listener, options);
  }
  eventListenersMap.delete(element); // Completely remove the element's entry in the map

}

// Example Usage
let globalGraphData = null;



function Graphite({ configUrl }) {
  console.log("graph " + window.location.href)
  const { id } = useParams();
  // Pick config source:
  const app = configUrl || id;
  const appRef = useRef();
  const tableRef = useRef();
  //    const svgRef = useRef([]);
  const [openEditor, setOpenEditor] = useState(false);
  const [jsonc, setJsonc] = useState();
  const graphIndexRef = useRef(0)
  const [stack] = useState([])
  const [firstGraph, setFirstGraph] = useState(true)
  const [lastGraph, setLastGraph] = useState(true)



  const panZoomRef = useRef();
  //每次都会渲染Graphite

  //要想避免渲染就得实现类似CodeOverlay或ControlPanel的功能
  // let doc = [];
  // const setDoc = (d) => {
  //     doc = d;
  // }
  // let dot = [];
  // const setDot = (d) => {
  //     dot = d;
  // }


  const showDoc = (docSrc) => {
    //console.log('show doc: [' + docSrc + ']');
    // setDoc(docSrc);
  }

  const showDot = (dot) => {
    // console.log('show dot: [' + dot + ']');
    // setDot(dot);
  }

  const loadApp = async (app) => {
    if (app) {
      appRef.current = app;
      //extract json nodes to database->table-column
      //group relation to table level

      //const data = await fetchApp(app)
      //renderGraph(data.graph);
      // option 1
      // const jsonModule = await import("./apps/" + id + ".json");
      // globalGraphData = jsonModule.default;

      // option 2
      const response = await fetch("./apps/" + app + ".jsonc");
      // globalGraphData = await response.json();
      const text = await response.text();
      globalGraphData = parse(text);
      setJsonc(text);
    } else {
      let json = localStorage.getItem("graphite.json");
      if (!json) {
        json = "{\"nodes\": [{\"id\":\"ACCOUNTS.User.id\",\"type\":\"ID\",\"description\":\"ACCOUNTS\"}], \"edges\": []}";

      }

      globalGraphData = parse(json);
      localStorage.setItem("graphite.json", json);
      setJsonc(json);
    }
    showApp();

  }

  //when the parent component (Graph.js) re renders everything gets recreated
  //including searchField - and the change to searchField causes the child (LeftPane.js) to re-render
  //even though LeftPane is already a memo. it is because of #2 as below
  /*
  1. state changes
  2. props changes
  3. Re render of Parent Component.
  */
  //since the dependency array is empty [], searchField is only created once.
  // const memoizedSearchField = useCallback(searchField, []);




  const showApp = async () => {

    const nodeShape = globalGraphData.node ? globalGraphData.node.shape : null;
    let dot = null;
    if (nodeShape) {//new shape
      dot = shapeDetail(globalGraphData);
    } else {
      console.log("tableRef.current", tableRef.current)
      if (tableRef.current) {
        dot = oneDetail(globalGraphData, tableRef.current);
      } else {
        //default to first table
        if (globalGraphData.nodes.length > 0) { }
        dot = noDetail(globalGraphData);//globalGraphData.edges.length < 3 ? allDetail(globalGraphData) : noDetail(globalGraphData);
      }
    }
    renderGraph(dot);
  }

  const fetchTable = async (table) => {
    showDoc('table loading ' + table);
    const dot = oneDetail(globalGraphData, table);
    return dot;
  }

  const showNode = async (node) => {
    showDoc('clicked node: [' + node + ']')

  }

  const showTable = async (table) => {
    showDoc('clicked table: [' + table + ']')
    tableRef.current = table;
    const parts = table.split(".");

    if (parts.length === 2) {
      const data = await fetchTable(table)
      //        renderGraph(data.graph);
      renderGraph(data);
    }
  }

  const showRelation = async (relation) => {
    showDoc('clicked relation: [' + relation + ']')
  }

  const renderGraph = (dotSrc, skipPush) => {
    showDot(dotSrc);
    removeAllTrackedListeners();
    if (skipPush) {

    } else {
      push(dotSrc);
      graphIndexRef.current = stack.length - 1;
      setFirstGraph(graphIndexRef.current === 0);
    }

    const graphCanvas = document.querySelector(".graphCanvas");
    if (graphCanvas != null) {
      ///d3.select(".graphCanvas").selectAll('*').remove();

      d3.select(".graphCanvas")
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
          showDoc('graph rendering started');
          //const svgElement = document.querySelector(".graphCanvas svg");

          //panZoomRef.current = svgPanZoom(".graphCanvas svg", {controlIconsEnabled: true, customEventsHandler: eventsHandler})

          const nodes = document.querySelectorAll(".graphCanvas svg .graph_node")
          nodes.forEach(node => {

            removeTrackedListeners(node);
            trackEventListener(node, "pointerup", function (event) {
              console.log("graph_node: " + event.currentTarget.__data__.key);
              showNode(event.currentTarget.__data__.key);
            });
          });

          const graph_node_tables = document.querySelectorAll(".graphCanvas svg .graph_node_table")
          graph_node_tables.forEach(node => {
            //                    node.addEventListener('pointerup', function (event) {showTable(event.currentTarget.__data__.key);} );

            removeTrackedListeners(node);
            trackEventListener(node, "pointerup", function (event) {
              console.log("graph_node_table: " + event.currentTarget.__data__.key);
              showTable(event.currentTarget.__data__.key);
            });
          });


          const table_nodes = document.querySelectorAll(".graphCanvas svg .graph_node_table_with_fields")
          table_nodes.forEach(node => {
            const ga = node.querySelectorAll("g a")
            ga.forEach(a => {
              removeTrackedListeners(a);

              trackEventListener(a, "pointerup", function (event) {
                console.log("graph_node_table_with_field: " + event.currentTarget.target.baseVal);
                showTable(event.currentTarget.target.baseVal);
              });

            });
          });

          const labels = document.querySelectorAll(".graphCanvas svg .graph_label")
          labels.forEach(label => {
            removeTrackedListeners(label);
            trackEventListener(label, "pointerup", function (event) { showRelation(event.currentTarget.__data__.key); });
          });

          showDoc('graph rendering ended');
        });

    }
  }


  const push = (dotSrc) => {
    stack.push(dotSrc)
  }

  const prevGraph = () => {
    if (graphIndexRef.current > 0) {
      graphIndexRef.current--;
    }
    setFirstGraph(graphIndexRef.current === 0);
    setLastGraph(graphIndexRef.current === stack.length - 1);
    //        firstGraph = graphIndexRef.current==0;
    //        lastGraph = graphIndexRef.current==stack.length-1;

    showDoc("previous graph " + graphIndexRef.current + ", " + stack.length);

    renderGraph(stack[graphIndexRef.current], true)
  }
  const nextGraph = () => {
    if (graphIndexRef.current < stack.length - 1) {
      graphIndexRef.current++;
    }
    setFirstGraph(graphIndexRef.current === 0);
    setLastGraph(graphIndexRef.current === stack.length - 1);
    //        firstGraph = graphIndexRef.current==0;
    //        lastGraph = graphIndexRef.current==stack.length-1;
    showDoc("next graph " + graphIndexRef.current + ", " + stack.length);

    renderGraph(stack[graphIndexRef.current], true)
  }
  const resetGraph = () => {

    graphIndexRef.current = 0;
    showDoc("reset graph " + graphIndexRef.current + ", " + stack.length);
    showDoc(stack[graphIndexRef.current])
    renderGraph(stack[graphIndexRef.current], true)
  }

  const cleanGraph = () => {
    stack.length = 0;
    setFirstGraph(true);
    setLastGraph(true);
    graphIndexRef.current = 0;
  }

  const handleResize = () => {
    //console.log('resized to: ', window.innerWidth, 'x', window.innerHeight +": "+panZoomRef)
    if (panZoomRef.current != null) {
      const divElement = document.querySelector(".graphCanvas")
      if (divElement) {
        panZoomRef.current.resize();
        //                panZoomRef.current.fit();
        //panZoomRef.current.center();
      }
    }

  }
  const handleSave = () => {
    try {
      // strip comments: monaco has a parser but simplest is using JSON.parse after stripping comments
      const json = editorRef.current?.getValue() || jsonc;
      const parsed = parse(json);
      setJsonc(json); // format and remove comments
      localStorage.setItem("graphite.json", json);
      setOpenEditor(false);
      globalGraphData = parsed;
      cleanGraph();
      showApp();

    } catch (err) {
      alert("Invalid JSON: " + err.message);
    }
  };
  const editorRef = useRef(null);
  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
  };
  useEffect(() => {
    console.log("loaded Home")
    loadApp(app)
    window.addEventListener('resize', handleResize);


  }, [])//render only once

  //https://medium.com/@akashshukla_1715/preventing-unnecessary-rerendering-of-child-components-in-react-using-usecallback-and-react-memo-34f1423fe263
  return (
    <>

      <div className={"graphCanvas"} ></div>
      <Stack id="graphDownload"
        direction="row"
        style={{
          padding: '15px',
          position: 'absolute',
          left: 0,
          top: 0,
          border: '0px solid red',
          display: 'flex',
          displayDirection: 'column',
          backgroundColor: "rgba(200,200,200, 0)"
        }}>
        {/*
                 <IconButton color="primary" aria-label="add to shopping cart" onClick={fullScreen} >
                    {fullScreenState ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
*/}
        <IconButton onClick={resetGraph}><HomeIcon /></IconButton>
        <IconButton onClick={prevGraph} disabled={firstGraph}><UndoIcon /></IconButton>
        <IconButton onClick={nextGraph} disabled={lastGraph}><RedoIcon /></IconButton>
        {/* <IconButton onClick={downloadGraph}><DownloadIcon /></IconButton> */}
        <IconButton onClick={() => setOpenEditor(true)}>
          <CodeIcon />
        </IconButton>

      </Stack>
      <Dialog
        open={openEditor}
        onClose={() => setOpenEditor(false)}
        fullWidth
        maxWidth="lg"
        sx={{
          "& .MuiPaper-root": {
            border: "1px solid #ccc",     // thinner border
            borderRadius: "12px",         // slightly rounded corners
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)", // soft shadow
          },
        }}
      >
        <DialogTitle>Graph</DialogTitle>
        <DialogContent style={{ height: "70vh" }}>
          <Editor
            height="100%"
            defaultLanguage="jsonc"
            value={jsonc}
            onMount={handleEditorMount} // capture editor instance
            theme="vs-light"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditor(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}


export default memo(Graphite);

