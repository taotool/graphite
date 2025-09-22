import "./App.css"
import "./pages/Graphite.css"
import { DataO } from "./pages/DataO";
import {graphql} from "./pages/samples";
function App() {
  return (
    <div style={{ display: "flex", height: "90vh", width: "96vw" }} >
      {/* <JsonGraphite jsonString={jsonString} options={{"arr": true, "keys": [["seller_id"], ["item_id"], ["order_id", "orderId"], ["buyerId", "buyer_id"]]}} /> */}
      <DataO data={graphql} options={{ type: 'graphql', engine:"graphite"}} />
      {/* <JsonFlowite jsonString={jsonString} options={{"arr": true, "keys": [["seller_id"], ["item_id"], ["order_id", "orderId"], ["buyerId", "buyer_id"]]}} /> */}
      {/* <OpenApiGraph yamls={[yaml1, yaml2]} /> */}
      {/* <JsonGraph jsonstr={jsonString} /> */}
      {/* <OpenApiGraphite yamls={[yaml1, yaml2]} />  */}
      {/* <Graphite jsonString={graphJsonString} />  */}

      {/* <Flowite jsonstr={jsonString} /> */}
    </div>
  );
}

export default App;
