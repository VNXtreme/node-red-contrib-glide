module.exports = function (RED) {
  "use strict";
  const axios = require('axios');

  function updateRow(n) {
    RED.nodes.createNode(this, n);

    this.glide = RED.nodes.getNode(n.glide);
    
    if (!this.glide.credentials.accessToken) {
      this.status({ fill: "red", shape: "ring", text: "error.no-access-token" });
      return;
    }

    let node = this;

    node.on("input", async function (msg) {
      let searchKey = msg.search || n.search,
        useTag = msg.tag || n.tag,
        sort = msg.sort || n.sort,
        detailType = msg.detailType || n.detailType,
        state = msg.state || n.state || "unread";

      let params = {
        consumer_key: this.glide.credentials.consumerKey,
        access_token: this.glide.credentials.accessToken,
        sort,
        detailType,
        state
      }

      if (useTag) {
        params = { ...params, tag: searchKey }
      } else {
        params = { ...params, search: searchKey }
      }

      try {
        let data = await getList(params);

        msg.payload = data;
        node.send(msg);
        node.status({ fill: "green", shape: "ring", text: "success.get-list" });
      } catch (error) {
        node.error('Error:', error.response.data)
        node.status({ fill: "red", shape: "dot", text: "error.get-list" });
        return;
      }
    });
  }
  RED.nodes.registerType("update-row", updateRow);
};
