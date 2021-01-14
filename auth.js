module.exports = function (RED) {
  var axios = require("axios").default;
  const fs = require("fs");
  const readline = require("readline");
  const { google } = require("googleapis");

  // If modifying these scopes, delete token.json.
  const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

  function GgAuthNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on("input", function (msg) {
      if (!node.credentials || !node.credentials.token) {
        node.status({ fill: "red", shape: "dot", text: "error.no-access-token" });
        return;
      }
      console.log("node", node);

      authorize(JSON.parse(content), updateRows);
    });
  }

  RED.httpAdmin.get("/google/auth", async function (req, res) {
    let client_id = req.query.clientId,
      client_secret = req.query.clientSecret,
      id = req.query.id,
      redirect_uri = req.query.callback;

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);

    try {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
      });

      let credentials = {
        client_id,
        client_secret,
        redirect_uri,
      };
      RED.nodes.addCredentials(id, credentials);
      res.redirect(authUrl);
    } catch (error) {
      res.send(RED._("error.authorize", { err: error.response.statusText }));
    }
  });

  RED.httpAdmin.get("/google/auth_callback", async function (req, res) {
    let id = req.query.id,
      code = req.query.code;
    let credentials = RED.nodes.getCredentials(id);

    const { client_secret, client_id, redirect_uri } = credentials;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);

    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.log("error", err);
        res.send(RED._("error.get-token"));
        return;
      }
      oAuth2Client.setCredentials(token);

      // Store the token to disk for later program executions
      credentials = { ...credentials, token };
      RED.nodes.addCredentials(id, credentials);

      res.send(RED._("message.authorized"));
    });
  });

  // /**
  //  * Create an OAuth2 client with the given credentials, and then execute the
  //  * given callback function.
  //  * @param {Object} credentials The authorization client credentials.
  //  * @param {function} callback The callback to call with the authorized client.
  //  */
  function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uri, token } = credentials;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);

    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  }

  async function updateRows(auth) {
    try {
      let rows = await readRows(auth); //get rows

      let sheet = "Expenses";
      let range = `${sheet}!A${rows.length + 2}:Z`;
      let values = [
        [
          "xtreme1",
          "https://bstatic.com/xdata/images/xphoto/1182x887/82877075.jpg?k=db9e00135b7b8f038aad88a7676235667ca249a5eed997a499677812fa332833&o=?size=S",
          "999.1",
          "Fun",
          "me",
          "today",
        ],
      ];
      let body = {
        values: values,
      };

      const sheets = google.sheets({ version: "v4", auth });
      sheets.spreadsheets.values
        .update({
          spreadsheetId: "1e7qLKRZFQ7kxYq8vo6AAvsDfrlf-zMTUMJKUM2eEdKM",
          range: range,
          valueInputOption: "USER_ENTERED",
          resource: body,
        })
        .then((response) => {
          var result = response.data;
          console.log(`Cells updated.`, result);
        })
        .catch((err) => {
          console.log("err", err.errors);
        });
    } catch (err) {
      console.log("The API returned an error: " + err);
    }
  }

  RED.nodes.registerType("gg-auth", GgAuthNode, {
    credentials: {
      client_id: { type: "password", required: true },
      client_secret: { type: "password", required: true },
      redirect_uri: { type: "text" },
      token: {
        access_token: { type: "text" },
        refresh_token: { type: "text" },
        scope: { type: "text" },
        token_type: { type: "text" },
        expiry_date: { type: "number" },
      },
    },
  });
};
