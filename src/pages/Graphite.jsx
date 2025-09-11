//当route的path为"/graphite/:id"时，这个组件会被渲染

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'
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

import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import HomeIcon from '@mui/icons-material/Home';
import DataObjectIcon from '@mui/icons-material/DataObject';
//https://github.com/magjac/d3-graphviz
import * as d3 from 'd3'
import * as d3Graphviz from 'd3-graphviz';

import { parse } from "jsonc-parser";/* to support jsonc */

console.log("######### Graphite.js ######### ");





function Graphite(props) {
  console.log("graph " + window.location.href)

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
  const { id } = useParams();
  // Pick config source:
  const app = id;
  const appRef = useRef();
  const tableRef = useRef();
  const mouseOverRef = useRef();
  //    const svgRef = useRef([]);
  const [openEditor, setOpenEditor] = useState(false);
  const [jsonc, setJsonc] = useState();
  const graphIndexRef = useRef(0)
  const [stack] = useState([])
  const [firstGraph, setFirstGraph] = useState(true)
  const [lastGraph, setLastGraph] = useState(true)

  // Detect system theme
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  // Create theme dynamically
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode]
  );

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




  const loadApp = async (app) => {
    if (app) {
      appRef.current = app;
      //extract json nodes to database->table-column
      //group relation to table level
      const way = 3;
      if (way === 1) {//load from remote
        //const jsonString = await fetchApp(app)

        globalGraphData = JSON.parse(jsonString);
        setJsonc(json);
      } else if (way === 2) {//import from json
        // const jsonModule = await import("./apps/" + id + ".json");
        // globalGraphData = jsonModule.default;
        // const json = JSON.stringify(globalGraphData, null, 2);
        // setJsonc(json);
      } else if (way === 3) {//load from json
        const response = await fetch("/apps/" + app + ".json");
        globalGraphData = await response.json();
        const json = JSON.stringify(globalGraphData, null, 2);
        setJsonc(json);
      } else {//load from jsonc
        const response = await fetch("/apps/" + app + ".jsonc");
        const json = await response.text();
        globalGraphData = parse(json);
        setJsonc(json);
      }

    } else if (props.jsonString) {//from prop
      globalGraphData = parse(props.jsonString);
      setJsonc(props.jsonString);
    } else {//from local storage or default
      let json = localStorage.getItem("graphite.json");
      if (!json) { //default
        json = `
        {
        "type": "er",
        "nodes": [
          {"id":"ACCOUNTS.User.id","name":"id","type":"ID","value":"ACCOUNTS"},
          {"id":"ACCOUNTS.User.name","name":"name","type":"String","value":"ACCOUNTS"},
          {"id":"ACCOUNTS.User.reviews","name":"reviews","type":"[Review]","value":"REVIEWS"},
          {"id":"ACCOUNTS.User.username","name":"username","type":"String","value":"ACCOUNTS"},
          {"id":"PRODUCTS.Product.inStock","name":"inStock","type":"Boolean","value":"INVENTORY"},
          {"id":"PRODUCTS.Product.name","name":"name","type":"String","value":"PRODUCTS"},
          {"id":"PRODUCTS.Product.price","name":"price","type":"Int","value":"PRODUCTS"},
          {"id":"PRODUCTS.Product.reviews","name":"reviews","type":"[Review]","value":"REVIEWS"},
          {"id":"PRODUCTS.Product.shippingEstimate","name":"shippingEstimate","type":"Int","value":"INVENTORY"},
          {"id":"PRODUCTS.Product.upc","name":"upc","type":"String","value":"PRODUCTS"},
          {"id":"PRODUCTS.Product.label","name":"label","type":"Int","value":"PRODUCTS"},
          {"id":"QUERY.Query.me","name":"me","type":"User","value":"ACCOUNTS"},
          {"id":"QUERY.Query.topProducts","name":"topProducts","type":"[Product]","value":"PRODUCTS"},
          {"id":"REVIEWS.Review.author","name":"author","type":"User","value":"REVIEWS"},
          {"id":"REVIEWS.Review.body","name":"body","type":"String","value":"REVIEWS"},
          {"id":"REVIEWS.Review.id","name":"id","type":"ID","value":"REVIEWS"},
          {"id":"REVIEWS.Review.product","name":"product","type":"Product","value":"REVIEWS"}
        ],
        "edges": [
          { "source": "ACCOUNTS.User.reviews", "target": "REVIEWS.Review.id", "label": "User.reviews" },
          { "source": "PRODUCTS.Product.reviews", "target": "REVIEWS.Review.id", "label": "Product.reviews" },
          { "source": "QUERY.Query.me", "target": "ACCOUNTS.User.id", "label": "Query.me" },
          { "source": "QUERY.Query.topProducts", "target": "PRODUCTS.Product.upc", "label": "Query.topProducts" },
          { "source": "REVIEWS.Review.author", "target": "ACCOUNTS.User.id", "label": "Review.author" },
          { "source": "REVIEWS.Review.product", "target": "PRODUCTS.Product.upc", "label": "Review.product" }
        ]
      }
        `.trim();
      }

      try {
        JSON.parse(json);//validate json
        globalGraphData = parse(json);
        localStorage.setItem("graphite.json", json);
        setJsonc(json);
      } catch (err) {
        localStorage.removeItem("graphite.json");
        return;
      }
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
    const allDetailFlag = globalGraphData.metadata ? globalGraphData.metadata.showDetails : null;
    let dot = null;
    if (nodeShape) {//new shape
      dot = shapeDetail(globalGraphData);
    } else if (allDetailFlag) {
      dot = allDetail(globalGraphData);
    } else {
      dot = oneDetail(globalGraphData, tableRef.current);
    }
    renderGraph(dot);
  }
  // --- Common util ---
  function getCategoryEntity(id) {
    const parts = id.split('.');
    return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : null;
  }

  //all details
  function allDetail(graphData) {
    const directon = graphData.direction === "vertical" ? "TD" : "LR";

    const edgeTemplate = (source, target, label) =>
      `"${source}" -> "${target}" [label="${label}" tooltip="" ] [class="graph_label"]`;

    let dot = `digraph "tt" {
  node [shape=plaintext margin=0]
  edge[arrowhead="open"]
  tooltip=""
  rankdir=${directon}
`;

    const nodes = {};
    graphData.nodes.forEach((node) => {
      const categoryEntity = getCategoryEntity(node.id);
      if (!nodes[categoryEntity]) {
        nodes[categoryEntity] = [];
      }
      nodes[categoryEntity].push({
        id: node.id.split('.').pop(),
        type: node.type,
        value: node.value,
      });

    });
    graphData.edges.forEach((edge) => {
      const source = getCategoryEntity(edge.source);
      const target = getCategoryEntity(edge.target);
      if (source && target) {
        // Ensure nodes exist
        if (!nodes[source]) nodes[source]=[{ id: source,
        type: "node.type",
        value: "node.value", }];
        if (!nodes[target]) nodes[target]=[{ id: target,
        type: "node.type",
        value: "node.value", }];
      }
    });

    // Render nodes
    Object.entries(nodes).forEach(([nodeId, fields]) => {
      const [category, entity] = nodeId.split('.');
      const nodeLabel = createTableFields(category, entity, fields);
      dot += `  "${nodeId}" [label=<${nodeLabel}>] [class="graph_node_table_with_fields"]\n`;
    });


    // Render edges
    graphData.edges.forEach((edge) => {
      const sourceNode = getCategoryEntity(edge.source);
      const targetNode = getCategoryEntity(edge.target);
      dot += `  ${edgeTemplate(sourceNode, targetNode, edge.label)}\n`;
    });

    dot += `}`;
    return dot;
  }


  function oneDetail(graphData, highlightEntity) {


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
    const allHighlights = new Set();
    if (highlightEntity) {
      const upstream = bfs(highlightEntity, adjBackward);
      const downstream = bfs(highlightEntity, adjForward);
      [highlightEntity, ...upstream, ...downstream].forEach(item => allHighlights.add(item));
    }

    // Build edge labels
    const edgeLabels = [];
    graphData.edges.forEach((edge) => {
      const source = getCategoryEntity(edge.source);
      const target = getCategoryEntity(edge.target);
      if (source && target && source !== target) {
        const relationship = edge.label || "";
        edgeLabels.push({ source, target, label: relationship });
      }
    });

    const directon = graphData.direction === "vertical" ? "TD" : "LR";

    // Gather detailed fields for the main highlightEntity only
    const detailedFields = graphData.nodes
      .filter(({ id }) => id.startsWith(`${highlightEntity}.`))
      .map(({ id, name, type, value }) => {
        const field = id.split('.').pop();
        const fk = graphData.edges.find((edge) => edge.source === id)?.target || "Unknown";
        const tp = fk === "Unknown" ? type : type + "|" + fk;
        return { id: field, name: name, type: tp, value };
      });

    // Build DOT
    let dot = `digraph "tt" {\n`;
    dot += `  node [shape=plaintext margin=0]\n\n`;
    dot += `  edge[arrowhead="open"]\n  tooltip=""\n  rankdir=${directon} \n overlap = scale \n splines = true \n`;

    // Render nodes
    Object.values(nodes).forEach(({ id: nodeId }) => {
      const [category, entity] = nodeId.split('.');
      const nodeClass = `graph_node_table ${allHighlights.has(nodeId) ? "highlight " : ""}${nodeId.replace(/\W/g, '_')}`;

      if (nodeId === highlightEntity) {
        // Main highlight → detailed fields
        const label = createTableFields(category, entity, detailedFields);
        dot += `  "${nodeId}" [label=<${label}> class="graph_node_table_with_fields highlight ${nodeId.replace(/\W/g, '_')}" ]\n`;
      } else if (category.startsWith('[') && category.endsWith(']')) {
        dot += `  "${nodeId}" [label="+" shape="circle" class="${nodeClass}" ]\n`;
      } else {
        // Upstream/downstream highlights
        const label = createTableHeader(category, entity);
        dot += `  "${nodeId}" [label=<${label}> class="${nodeClass}" ]\n`;
      }
    });

    // Render edges
    edgeLabels.forEach(({ source, target, label }) => {
      const highlight = allHighlights.has(source) ? "highlight" : "";
      dot += `  "${source}" -> "${target}" [label="${label}" class="graph_label ${source.replace(/\W/g, '_')}_to_${target.replace(/\W/g, '_')} ${highlight}"]\n`;
    });

    dot += `}`;
    return dot;
  }

  function getDownstream(graphData, startNodeId) {
    // --- Helper to get category entity ---
    function getCategoryEntity(id) {
      const parts = id.split('.');
      return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : null;
    }

    // Build forward adjacency list
    const adjForward = {};
    graphData.edges.forEach((edge) => {
      const source = getCategoryEntity(edge.source);
      const target = getCategoryEntity(edge.target);
      if (source && target) {
        if (!adjForward[source]) adjForward[source] = [];
        adjForward[source].push(target);
      }
    });

    // BFS to collect downstream nodes
    const visitedNodes = new Set();
    const queue = [startNodeId];

    while (queue.length) {
      const node = queue.shift();
      if (!visitedNodes.has(node)) {
        visitedNodes.add(node);
        (adjForward[node] || []).forEach((next) => {
          if (!visitedNodes.has(next)) queue.push(next);
        });
      }
    }

    // Filter nodes and edges
    const downstreamNodes = graphData.nodes
      .map(n => getCategoryEntity(n.id))
      .filter(n => n && visitedNodes.has(n));

    const downstreamEdges = graphData.edges
      .map(e => ({
        source: getCategoryEntity(e.source),
        target: getCategoryEntity(e.target),
        label: e.label
      }))
      .filter(e => visitedNodes.has(e.source) && visitedNodes.has(e.target));

    return {
      nodes: new Set(downstreamNodes),
      edges: new Set(downstreamEdges)
    };
  }

  /**
   * Toggle the "collapsed" class for all downstream nodes and edges.
   * @param {Object} downstream - Object with `nodes` and `edges` arrays from getDownstream.
   */
  function toggleCollapsed(downstream) {
    // Reset all nodes and edges first
    document.querySelectorAll(`.node`).forEach(el => el.classList.remove('collapsed'));
    document.querySelectorAll(`.edge`).forEach(el => el.classList.remove('collapsed'));

    const { nodes, edges } = downstream;
    // Toggle nodes
    nodes.forEach((nodeId) => {
      const nodeElements = document.querySelectorAll(`.${nodeId.replace(/\W/g, '_')}`);
      nodeElements.forEach(el => el.classList.add('collapsed'));
    });

    // Toggle edges
    edges.forEach(({ source, target }) => {
      // Assuming edges have class names in the format "source_target"
      const edgeElements = document.querySelectorAll(`.${source.replace(/\W/g, '_')}_to_${target.replace(/\W/g, '_')}`);
      edgeElements.forEach(el => el.classList.add('collapsed'));
    });
  }


  function createTableHeader(category, entity) {
    return `<table border="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4"><tr><td width="100">${category}</td></tr><tr><td>${entity}</td></tr></table>`;
  }

  function createTableFields(category, entity, fields) {
    const tableHeader = `<tr><td ><FONT >${category}</FONT></td></tr><tr><td ><FONT >${entity}</FONT></td></tr>`;

    if (fields.length === 0) {
      fields.push({ id: 'Id', name: "Name", type: 'String', value: 'Value' });
    }
    const fieldRows = fields
      .map(
        ({ id, name, type, value }) => {
          let tgt = type;
          let tt = type;
          if (type.includes('|')) {
            const t = type.split('|');
            tt = t[0];
            const target = t[1].split(".");
            tgt = target[0] + "." + target[1];
          }
          return `<tr>
            <td  PORT="${id}" ><FONT >${name || id} </FONT></td>
            <td  ${type.includes('|') ? `TITLE="${type}" TARGET="${tgt}"` : ''}>
              ${type.includes('|') ? `<FONT >${tt}</FONT>` : `<FONT >${tt}</FONT>`}
            </td>
            <td  ${type.includes('|') ? `TITLE="${type}" TARGET="${tgt}"` : ''}>
               ${type.includes('|') ? `<FONT >${value}</FONT>` : `<FONT >${value}</FONT>`}
            </td>
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
  function shapeDetail(graphData) {


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




  const fetchTable = async (table) => {
    const dot = oneDetail(globalGraphData, table);
    return dot;
  }

  const showNode = async (node) => {
  }
  const showTable = async (table) => {
    tableRef.current = table;
    const parts = table.split(".");
    if (parts.length === 2) {
      const data = await fetchTable(table)
      renderGraph(data);
    }
  }

  const showRelation = async (relation) => {
    console.log("showRelation: " + relation);
    // const parts = relation.split('->')[1];
    // const downstream = getDownstream(globalGraphData, parts);
    // toggleCollapsed(downstream);
  }


  const renderGraph = (dotSrc, skipPush) => {

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
          // showDoc('graph rendering started');
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

            removeTrackedListeners(node);
            trackEventListener(node, "pointerup", function (event) {
              console.log("pointerup graph_node_table: " + event.currentTarget.__data__.key);
              showTable(event.currentTarget.__data__.key);
            });

            // trackEventListener(node, "mouseenter", function (event) {
            //   console.log("mouseenter graph_node_table: " + event.currentTarget.__data__.key);
            //   highlightTable(event.currentTarget.__data__.key);
            // });
            // trackEventListener(node, "mouseleave", function (event) {
            //   console.log("mouseleave graph_node_table: " + event.currentTarget.__data__.key);
            //   highlightTable(event.currentTarget.__data__.key);
            // });
          });


          const table_nodes = document.querySelectorAll(".graphCanvas svg .graph_node_table_with_fields")
          table_nodes.forEach(node => {
            const ga = node.querySelectorAll("g a")
            ga.forEach(a => {
              removeTrackedListeners(a);

              trackEventListener(a, "pointerup", function (event) {
                console.log("pointerup graph_node_table_with_field: " + event.currentTarget.target.baseVal);
                showTable(event.currentTarget.target.baseVal);
              });

            });
          });

          const labels = document.querySelectorAll(".graphCanvas svg .graph_label")
          labels.forEach(label => {
            removeTrackedListeners(label);
            trackEventListener(label, "pointerup", function (event) {
              showRelation(event.currentTarget.__data__.key);
            });
          });

          // showDoc('graph rendering ended');
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

    // showDoc("previous graph " + graphIndexRef.current + ", " + stack.length);

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
    // showDoc("next graph " + graphIndexRef.current + ", " + stack.length);

    renderGraph(stack[graphIndexRef.current], true)
  }
  const resetGraph = () => {

    graphIndexRef.current = 0;
    // showDoc("reset graph " + graphIndexRef.current + ", " + stack.length);
    // showDoc(stack[graphIndexRef.current])
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
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <ThemeProvider theme={theme}>
        <div className={"graphCanvas"} ></div>
        <Stack id="graphDownload"
          className='graphToolbar'
          direction="row">
          {/*
                 <IconButton color="primary" aria-label="add to shopping cart" onClick={fullScreen} >
                    {fullScreenState ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
*/}
          <IconButton onClick={resetGraph}><HomeIcon /></IconButton>
          <IconButton onClick={prevGraph} disabled={firstGraph}><UndoIcon /></IconButton>
          <IconButton onClick={nextGraph} disabled={lastGraph}><RedoIcon /></IconButton>
          {/* <IconButton onClick={downloadGraph}><DownloadIcon /></IconButton> */}
          <IconButton onClick={() => setOpenEditor(true)}><DataObjectIcon /></IconButton>

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
          <DialogTitle><DataObjectIcon /></DialogTitle>
          <DialogContent style={{ height: "100vh" }} sx={{ p: 2 }}>
            <Editor
              height="100%"
              defaultLanguage="jsonc"
              value={jsonc}
              onMount={handleEditorMount} // capture editor instance
              theme={prefersDarkMode ? "vs-dark" : "light"}
              options={{
                scrollbar: {
                  vertical: "auto",      // "auto" | "visible" | "hidden"
                  horizontal: "auto",
                  verticalScrollbarSize: 4, // <-- width of vertical scrollbar (px)
                  horizontalScrollbarSize: 4, // <-- height of horizontal scrollbar (px)
                  arrowSize: 12,             // optional, size of arrows
                },
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
}


export default memo(Graphite);

