import "./App.css"
import "./pages/Graphite.css"
import {Graphite} from "./pages/Graphite";




const graphJsonString = `
{
  "metadata": {},
  "nodes": [
    {
      "id": "USER.USRabc.id",
      "name": "id",
      "type": "string",
      "value": "USRabc"
    },
    {
      "id": "USER.USRabc.addresses",
      "name": "addresses",
      "type": "[addresses]",
      "value": "[...]"
    },
    {
      "id": "[ADDRESSES].USRabc.ADDRESSES[0]",
      "name": "ADDRESSES[0]",
      "type": "[ADDRESSES[0]]",
      "value": "[...]"
    },
    {
      "id": "[ADDRESSES].USRabc.ADDRESSES[1]",
      "name": "ADDRESSES[1]",
      "type": "[ADDRESSES[1]]",
      "value": "[...]"
    },
    {
      "id": "ADDRESSES.ADDRESSES[0].type",
      "name": "type",
      "type": "string",
      "value": "home"
    },
    {
      "id": "ADDRESSES.ADDRESSES[0].street",
      "name": "street",
      "type": "string",
      "value": "123 Main St"
    },
    {
      "id": "ADDRESSES.ADDRESSES[0].city",
      "name": "city",
      "type": "string",
      "value": "Anytown"
    },
    {
      "id": "ADDRESSES.ADDRESSES[0].zipCode",
      "name": "zipCode",
      "type": "string",
      "value": "12345"
    },
    {
      "id": "ADDRESSES.ADDRESSES[1].type",
      "name": "type",
      "type": "string",
      "value": "work"
    },
    {
      "id": "ADDRESSES.ADDRESSES[1].street",
      "name": "street",
      "type": "string",
      "value": "456 Business Ave"
    },
    {
      "id": "ADDRESSES.ADDRESSES[1].city",
      "name": "city",
      "type": "string",
      "value": "Metropolis"
    },
    {
      "id": "ADDRESSES.ADDRESSES[1].zipCode",
      "name": "zipCode",
      "type": "string",
      "value": "67890"
    },
    {
      "id": "USER.USRabc.preferences",
      "name": "preferences",
      "type": "preferences",
      "value": "{...}"
    },
    {
      "id": "PREFERENCES.preferencesId.newsletter",
      "name": "newsletter",
      "type": "boolean",
      "value": "true"
    },
    {
      "id": "PREFERENCES.preferencesId.notifications",
      "name": "notifications",
      "type": "notifications",
      "value": "{...}"
    },
    {
      "id": "NOTIFICATIONS.notificationsId.email",
      "name": "email",
      "type": "boolean",
      "value": "true"
    },
    {
      "id": "NOTIFICATIONS.notificationsId.sms",
      "name": "sms",
      "type": "boolean",
      "value": "false"
    },
    {
      "id": "USER.USRabc.orderHistory",
      "name": "orderHistory",
      "type": "[orderHistory]",
      "value": "[...]"
    },
    {
      "id": "[ORDERHISTORY].USRabc.ORDERHISTORY[0]",
      "name": "ORDERHISTORY[0]",
      "type": "[ORDERHISTORY[0]]",
      "value": "[...]"
    },
    {
      "id": "[ORDERHISTORY].USRabc.ORDERHISTORY[1]",
      "name": "ORDERHISTORY[1]",
      "type": "[ORDERHISTORY[1]]",
      "value": "[...]"
    },
    {
      "id": "ORDERHISTORY.ORDERHISTORY[0].orderId",
      "name": "orderId",
      "type": "string",
      "value": "ORD001"
    },
    {
      "id": "ORDERHISTORY.ORDERHISTORY[1].orderId",
      "name": "orderId",
      "type": "string",
      "value": "ORD002"
    },
    {
      "id": "ORDERS.ORDERS[0].orderId",
      "name": "orderId",
      "type": "string",
      "value": "ORD001"
    },
    {
      "id": "ORDERS.ORDERS[0].date",
      "name": "date",
      "type": "string",
      "value": "2025-08-15"
    },
    {
      "id": "ORDERS.ORDERS[0].items",
      "name": "items",
      "type": "[items]",
      "value": "[...]"
    },
    {
      "id": "[ITEMS].ORDERS[0].ITEM001",
      "name": "ITEM001",
      "type": "[ITEM001]",
      "value": "[...]"
    },
    {
      "id": "[ITEMS].ORDERS[0].ITEM002",
      "name": "ITEM002",
      "type": "[ITEM002]",
      "value": "[...]"
    },
    {
      "id": "ITEMS.ITEM001.id",
      "name": "id",
      "type": "string",
      "value": "ITEM001"
    },
    {
      "id": "ITEMS.ITEM001.productId",
      "name": "productId",
      "type": "string",
      "value": "PROD001"
    },
    {
      "id": "ITEMS.ITEM001.name",
      "name": "name",
      "type": "string",
      "value": "Laptop"
    },
    {
      "id": "ITEMS.ITEM001.quantity",
      "name": "quantity",
      "type": "number",
      "value": "1"
    },
    {
      "id": "ITEMS.ITEM001.price",
      "name": "price",
      "type": "number",
      "value": "1200"
    },
    {
      "id": "ITEMS.ITEM002.id",
      "name": "id",
      "type": "string",
      "value": "ITEM002"
    },
    {
      "id": "ITEMS.ITEM002.productId",
      "name": "productId",
      "type": "string",
      "value": "PROD003"
    },
    {
      "id": "ITEMS.ITEM002.name",
      "name": "name",
      "type": "string",
      "value": "Mouse"
    },
    {
      "id": "ITEMS.ITEM002.quantity",
      "name": "quantity",
      "type": "number",
      "value": "2"
    },
    {
      "id": "ITEMS.ITEM002.price",
      "name": "price",
      "type": "number",
      "value": "25"
    },
    {
      "id": "ORDERS.ORDERS[0].totalAmount",
      "name": "totalAmount",
      "type": "number",
      "value": "1250"
    },
    {
      "id": "ORDERS.ORDERS[1].orderId",
      "name": "orderId",
      "type": "string",
      "value": "ORD002"
    },
    {
      "id": "ORDERS.ORDERS[1].date",
      "name": "date",
      "type": "string",
      "value": "2025-09-01"
    },
    {
      "id": "ORDERS.ORDERS[1].items",
      "name": "items",
      "type": "[items]",
      "value": "[...]"
    },
    {
      "id": "[ITEMS].ORDERS[1].ITEM003",
      "name": "ITEM003",
      "type": "[ITEM003]",
      "value": "[...]"
    },
    {
      "id": "ITEMS.ITEM003.id",
      "name": "id",
      "type": "string",
      "value": "ITEM003"
    },
    {
      "id": "ITEMS.ITEM003.productId",
      "name": "productId",
      "type": "string",
      "value": "PROD005"
    },
    {
      "id": "ITEMS.ITEM003.name",
      "name": "name",
      "type": "string",
      "value": "Keyboard"
    },
    {
      "id": "ITEMS.ITEM003.quantity",
      "name": "quantity",
      "type": "number",
      "value": "1"
    },
    {
      "id": "ITEMS.ITEM003.price",
      "name": "price",
      "type": "number",
      "value": "75"
    },
    {
      "id": "ORDERS.ORDERS[1].totalAmount",
      "name": "totalAmount",
      "type": "number",
      "value": "75"
    }
  ],
  "edges": [
    {
      "source": "USER.USRabc.addresses",
      "target": "[ADDRESSES].USRabc.ADDRESSES[0]",
      "label": "has"
    },
    {
      "source": "[ADDRESSES].USRabc.ADDRESSES[0]",
      "target": "ADDRESSES.ADDRESSES[0].id",
      "label": "contains"
    },
    {
      "source": "[ADDRESSES].USRabc.ADDRESSES[1]",
      "target": "ADDRESSES.ADDRESSES[1].id",
      "label": "contains"
    },
    {
      "source": "USER.USRabc.preferences",
      "target": "PREFERENCES.preferencesId.id",
      "label": "has"
    },
    {
      "source": "PREFERENCES.preferencesId.notifications",
      "target": "NOTIFICATIONS.notificationsId.id",
      "label": "has"
    },
    {
      "source": "USER.USRabc.orderHistory",
      "target": "[ORDERHISTORY].USRabc.ORDERHISTORY[0]",
      "label": "has"
    },
    {
      "source": "[ORDERHISTORY].USRabc.ORDERHISTORY[0]",
      "target": "ORDERHISTORY.ORDERHISTORY[0].id",
      "label": "contains"
    },
    {
      "source": "[ORDERHISTORY].USRabc.ORDERHISTORY[1]",
      "target": "ORDERHISTORY.ORDERHISTORY[1].id",
      "label": "contains"
    },
    {
      "source": "ORDERS.ORDERS[0].items",
      "target": "[ITEMS].ORDERS[0].ITEM001",
      "label": "has"
    },
    {
      "source": "[ITEMS].ORDERS[0].ITEM001",
      "target": "ITEMS.ITEM001.id",
      "label": "contains"
    },
    {
      "source": "[ITEMS].ORDERS[0].ITEM002",
      "target": "ITEMS.ITEM002.id",
      "label": "contains"
    },
    {
      "source": "ORDERS.ORDERS[1].items",
      "target": "[ITEMS].ORDERS[1].ITEM003",
      "label": "has"
    },
    {
      "source": "[ITEMS].ORDERS[1].ITEM003",
      "target": "ITEMS.ITEM003.id",
      "label": "contains"
    },
    {
      "source": "ORDERHISTORY.ORDERHISTORY[0].orderId",
      "target": "ORDERS.ORDERS[0].orderId",
      "label": "L:ORD001"
    },
    {
      "source": "ORDERHISTORY.ORDERHISTORY[1].orderId",
      "target": "ORDERS.ORDERS[1].orderId",
      "label": "L:ORD002"
    }
  ]
}
`.trim();
function App() {
  return (
    <div style={{ display: "flex", height: "90vh", width: "96vw" }} >
      {/* <JsonGraphite
        jsonString={jsonString}
        options={{
          "arr": true,
          "keys": [["seller_id"], ["item_id"], ["order_id", "orderId"], ["buyerId", "buyer_id"]]
        }} /> */}
        {/* <OpenApiGraph yamls={[yaml1, yaml2]} /> */}
        {/* <JsonGraph jsonstr={jsonString} /> */}
        {/* <OpenApiGraphite yamls={[yaml1, yaml2]} />  */}
        <Graphite jsonString={graphJsonString} /> 
    </div>
  );
}

export default App;
