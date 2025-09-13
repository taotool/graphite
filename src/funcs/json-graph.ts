
interface GraphNode {
  id: string;
  name: string;
  type: string;
  value: string;
}

interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

interface Graph {
  metadata: Record<string, any>;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function convertJsonToGraph(jsonObj: Record<string, any>, separateNodeForArray = true, linkedFields=[""]): Graph {
  const result: Graph = { metadata: {}, nodes: [], edges: [] };

  function makeNode(entity: string, entityId: string, id: string, type: string, value: string) {
    result.nodes.push({
      id: `${entity}.${entityId}.${id}`,
      name: id + "-n",
      type,
      value
    });
  }

  function processEntity(entity: string, entityId: string, obj: Record<string, any>, root = false) {

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;

      if (typeof value !== "object" || (Array.isArray(value) === false && typeof value !== "object")) {
        // primitive field
        makeNode(entity, entityId, key, typeof value, String(value));
      } else if (Array.isArray(value)) {
        // array of objects
        const tp = key[0].toUpperCase() + key.slice(1);
        if (!root) {// for root level, no node
          makeNode(entity, entityId, tp, `[${tp}]`, "[{...}]");
        }
        if (separateNodeForArray) {
          // create an edge from parent entity to the array field
          let linkedToArray = false;
          value.forEach((item, idx) => {
            const childEntity = key.toUpperCase(); // e.g. addresses -> ADDRESS
            const childId = item.id || `${childEntity}[${idx}]`;
            if (!root) {// for root level, no edge from outside
              makeNode(`[${childEntity}]`, entityId, childId, `[${childId}]`, "[{...}]");//array item node
            }
            // PARENT -> ARRAY
            if (!linkedToArray) {
              if (!root) {// for root level, no edge from outside
                result.edges.push({
                  source: `${entity}.${entityId}.${tp}`,
                  target: `[${childEntity}].${entityId}.${childId}`,
                  label: "has"
                });
              }
              linkedToArray = true;
            }
          });
        }

        // each item in the array is a separate entity
        value.forEach((item, idx) => {
          const childEntity = key.toUpperCase(); // e.g. addresses -> ADDRESS
          const childId = item.id || `${childEntity}[${idx}]`;

          if (separateNodeForArray) {
            if (!root) {// for root level, no edge from outside
              // ARRAY -> ITEM
              result.edges.push({
                source: `[${childEntity}].${entityId}.${childId}`,
                target: `${childEntity}.${childId}.id`,
                label: "contains"
              });
            }
            processEntity(childEntity, childId, item);

          } else {
            if (!root) {// for root level, no edge from outside
              result.edges.push({
                source: `${entity}.${entityId}.${key}`,
                target: `${childEntity}.${childId}.id`,
                label: "has"
              });
            }
            processEntity(childEntity, childId, item);
          }
        });
      } else if (typeof value === "object") {
        // nested object
        const tp = key[0].toUpperCase() + key.slice(1);
        if (!root) {
          makeNode(entity, entityId, key, tp, "{...}");
        }
        const childEntity = key.toUpperCase();
        const childId = value.id || `${tp}Id`;//  if no id
        if (!root) {// for root level, no edge from outside
          result.edges.push({
            source: `${entity}.${entityId}.${key}`,//parent
            target: `${childEntity}.${childId}.id`,//child - current
            label: "has"
          });
        }
        processEntity(childEntity, childId, value);
      } else {
        // unknown type, skip
        console.warn("Unknown type for key:", key, value);
        alert("Unknown type for key: " + key);
      }
    }
  }
  /**
   * Connect nodes with the same value, restricted to certain field names.
   * @param graph Input graph
   * @param fieldsToCheck Array of field names to check (e.g., ["orderId", "productId"])
   * @returns A new graph with edges added for duplicates
   */
  function connectNodesWithSameValue(
    graph: Graph,
    fieldsToCheck: string[]
  ): Graph {
    const { nodes, edges } = graph;

    // Map from value -> array of node ids (only for selected fields)
    const valueMap = new Map<string, string[]>();

    for (const node of nodes) {
      if (!node.value) continue;

      // Only check if node.name (or id) matches one of the fields
      if (fieldsToCheck.includes(node.name.replace("-n", ""))) {
        if (!valueMap.has(node.value)) {
          valueMap.set(node.value, []);
        }
        valueMap.get(node.value)!.push(node.id);
      }
    }

    // Create new edges for nodes that share the same value
    const newEdges: GraphEdge[] = [];
    for (const [value, ids] of valueMap.entries()) {
      if (ids.length > 1) {
        const [first, ...rest] = ids;
        for (const other of rest) {
          newEdges.push({
            source: first,
            target: other,
            label: `Link: ${value}`
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
  for (const [rootKey, rootVal] of Object.entries(jsonObj)) {
    const entity = rootKey.toUpperCase();
    if (Array.isArray(rootVal)) {
      rootVal.forEach((item, idx) => {
        const entityId = item.id || `${entity}${idx + 1}`;
        processEntity(entity, entityId, item);
      });
    } else if (typeof rootVal === "object") {
      const entityId = rootVal.id || `${entity}`;
      processEntity(entity, entityId, rootVal, true);
    }
  }

  //
  const updatedGraph = connectNodesWithSameValue(result, linkedFields);
  return updatedGraph;
}