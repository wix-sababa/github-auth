const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const fetch = require('node-fetch')

const app = express();

app.locals.GH_CLIENT_ID = process.env.GH_CLIENT_ID;
app.locals.GH_CLIENT_SECRET = process.env.GH_CLIENT_SECRET;

app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/gh-auth-callback', async (req, res) => {
    try {
      const body = {
        code: req.query.code,
        client_id: process.env.GH_CLIENT_ID,
        client_secret: process.env.GH_CLIENT_SECRET
      };

      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        body:    JSON.stringify(body),
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      });

      const tokenData = await response.json();

      // https://stackoverflow.com/questions/35373995/github-user-email-is-null-despite-useremail-scope
      const userResponse = await fetch('https://api.github.com/user/emails', {
        headers: { 'Authorization': `${tokenData.token_type} ${tokenData.access_token}`, 'Accept': 'application/json' },
      });

      const userData = await userResponse.json();

      res.status(200).json(userData);
    } catch(ex) {
      res.status(500).send(`${ex.message}\n${ex.stack}`);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
