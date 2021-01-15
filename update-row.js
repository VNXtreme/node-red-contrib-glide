module.exports = function (RED) {
  "use strict";
  const { google } = require("googleapis");

  function updateRow(n) {
    RED.nodes.createNode(this, n);

    this.glide = RED.nodes.getNode(n.glide);

    if (!this.glide.credentials.token) {
      this.status({ fill: "red", shape: "ring", text: "error.no-access-token" });
      return;
    }

    let node = this;

    node.on("input", async function (msg) {
      let sheetId = msg.sheetId || n.sheetId,
        sheetName = msg.sheetName || n.sheetName,
        sheetData = msg.sheetData || n.sheetData;
      let credentials = node.glide.credentials;

      // Check if we have previously stored a token.
      if (!credentials.token) {
        this.status({ fill: "red", shape: "ring", text: "error.no-access-token" });
        return;
      }

      const { client_secret, client_id, redirect_uri } = credentials;
      const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
      oAuth2Client.setCredentials(credentials.token);

      try {
        let payload = await update(oAuth2Client, sheetName, sheetId, sheetData);

        msg.payload = payload;
        node.send(msg);
        node.status({ fill: "green", shape: "ring", text: "success.update" });
      } catch (error) {
        node.error('Error:', error.response.data)
        node.status({ fill: "red", shape: "dot", text: "error.update" });
        return;
      }
    });
  }

  async function update(auth, sheetName, spreadsheetId, sheetData) {
    try {
      let rows = await read(auth, sheetName, spreadsheetId); //get rows
      let range = `${sheetName}!A${rows.length + 2}:Z`;
      let body = { values: sheetData };

      const sheets = google.sheets({ version: "v4", auth });
      let { data } = await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: "USER_ENTERED",
        resource: body,
      });

      return data;
    } catch (err) {
      console.log("The API returned an error: " + err);
    }
  }

  async function read(auth, sheetName, spreadsheetId) {
    const sheets = google.sheets({ version: 'v4', auth });
    let { data } = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: `${sheetName}!A2:X`,
    });

    return data.values;
  }
  RED.nodes.registerType("update-row", updateRow);
};
