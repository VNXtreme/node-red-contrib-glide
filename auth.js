module.exports = function (RED) {
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
