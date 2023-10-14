const express = require('express');
const router = express.Router();
const mongo = require('../db/index');

// GET /history endpoint
router.get('/', async (req, res) => {
  try {
    const searchTerm = req.query.keyword;
    // Check if there is a query parameter for searchTerm
      // Find history by searchTerm
      const history = await mongo.find('History',  searchTerm );
      if (!history) {
        return res.status(404).json({ error: 'No history found for the provided search term' });
      }
      res.json(history);

  } catch (error) {
    res.status(500).json({ error: 'Error occurred during history retrieval' });
  }
});

module.exports = router;