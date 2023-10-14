const express = require('express');
const path = require('path');

const app = express();
const port = 8888;
// require in out database functionality
const mongo = require('./db/index');

// require in the exported router from poker.js
const history = require('./routes/history.js');
app.use('/history', history);

// require in the exported router from results.js
const search = require('./routes/search.js');
app.use('/search', search);

app.listen(port, async () => {
    console.log(`Server is listening on port ${port}`);
    await mongo.connect();
});
