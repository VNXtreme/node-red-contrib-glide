module.exports = function (RED) {
  var axios = require("axios").default;
  const fs = require('fs');
  const readline = require('readline');
  const { google } = require('googleapis');

  // If modifying these scopes, delete token.json.
  const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
  // The file token.json stores the user's access and refresh tokens, and is
  // created automatically when the authorization flow completes for the first
  // time.
  const TOKEN_PATH = 'token.json';

  function AuthNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on("input", function (msg) {
      if (!node.credentials || !node.credentials.client_id) {
        node.status({ fill: "red", shape: "dot", text: "error.no-access-token" });
        return;
      }
      console.log('node', node);
      return;
      authorize(JSON.parse(content), updateRows);
    });
  }

  RED.nodes.registerType("gg-auth", AuthNode, {
    credentials: {
      client_id: { type: "password", required: true },
      client_secret: { type: "password" },
      redirect_uri: { type: "text" },
      token: {
        access_token: { type: 'text' },
        refresh_token: { type: 'text' },
        scope: { type: 'text' },
        token_type: { type: 'text' },
        expiry_date: { type: 'text' },
      }
    },
  });

  // /**
  //  * Create an OAuth2 client with the given credentials, and then execute the
  //  * given callback function.
  //  * @param {Object} credentials The authorization client credentials.
  //  * @param {function} callback The callback to call with the authorized client.
  //  */
  // function authorize(credentials, callback) {
  //   const { client_secret, client_id, redirect_uri, token } = credentials;
  //   const oAuth2Client = new google.auth.OAuth2(
  //     client_id, client_secret, redirect_uri);

  //   if (!token) return getNewToken(oAuth2Client, callback)

  //   oAuth2Client.setCredentials(JSON.parse(token));
  //   callback(oAuth2Client);
  // }

  // function getNewTokenURL(oAuth2Client) {
  //   return oAuth2Client.generateAuthUrl({
  //     access_type: 'offline',
  //     scope: SCOPES,
  //   });
  // }

  // /**
  //  * Get and store new token after prompting for user authorization, and then
  //  * execute the given callback with the authorized OAuth2 client.
  //  * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
  //  * @param {getEventsCallback} callback The callback for the authorized client.
  //  */
  // function getNewToken(oAuth2Client, callback) {
  //   const authUrl = getNewTokenURL(oAuth2Client)
  //   console.log('Authorize this app by visiting this url:', authUrl);

  //   oAuth2Client.getToken(code, (err, token) => {
  //     if (err) return console.error('Error while trying to retrieve access token', err);
  //     oAuth2Client.setCredentials(token);
  //     // Store the token to disk for later program executions
  //     fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
  //       if (err) return console.error(err);
  //       console.log('Token stored to', TOKEN_PATH);
  //     });
  //     callback(oAuth2Client);
  //   });

  // }
  // RED.httpAdmin.get("/pocket/auth", async function (req, res) {
  //   try {
  //     const authUrl = oAuth2Client.generateAuthUrl({
  //       access_type: 'offline',
  //       scope: SCOPES,
  //     });
  //     console.log('Authorize this app by visiting this url:', authUrl);
  //     res.redirect(authUrl);
  //     let credentials = {
  //       consumerKey,
  //       requestToken: requestToken.code,
  //     };
  //     RED.nodes.addCredentials(id, credentials);

  //     res.redirect(`https://getpocket.com/auth/authorize?request_token=${requestToken.code}&redirect_uri=${callback}`);
  //   } catch (error) {
  //     res.send(RED._("error.authorize", { 'err': error.response.statusText }));
  //   }
  // });

  // RED.httpAdmin.get("  ", async function (req, res) {
  //   let credentials = RED.nodes.getCredentials(id);

  //   try {

  //     // RED.nodes.addCredentials(id, credentials);

  //     res.send(RED._("message.authorized"));
  //   } catch (error) {
  //     res.send(RED._("error.authorize"));
  //   }
  // });
};
