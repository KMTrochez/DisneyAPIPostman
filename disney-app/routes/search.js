const express = require('express');
const router = express.Router();
const { searchByKeyword, getDetailsById } = require('disney-module');
const mongo = require('../db/index');

// GET /search endpoint
router.get('/', async (req, res) => {
  try {
    const searchTerm = req.query.keyword;

    // Search by keyword using your custom module
    const searchResults = await searchByKeyword(searchTerm);

    // Check if the search term exists in the history collection
    const existingSearch = await mongo.find('History',  searchTerm );

    // Update or create a new document in the history collection
    if (existingSearch) {
      // Increase searchCount by 1 and update lastSearched date
      await mongo.update(
        'History',
        { searchTerm },
        { $inc: { searchCount: 1 }, $set: { lastSearched: new Date() } }
      );
    } else {
      // Insert a new document with searchCount as 1 and current date as lastSearched
      await mongo.save('History', {
        searchTerm,
        searchCount: 1,
        lastSearched: new Date()
      });
    }

    // Prepare the response JSON
    const response = {
      searchTerm,
      results: searchResults.map(result => ({
        name: result.name,
        id: result._id
      }))
    };

    // Send the JSON response
    res.json(response);
  } catch (error) {
    console.error('Error occurred during search:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/:id/details', async (req, res) => {
  try {
    const {params, query} = req;
    const {id} = params;    
    const searchTerm = req.query.keyword;
    // Get details by id using your custom module
    const details = await getDetailsById(id);
    if (!details) {
      return res.status(404).json({ error: 'Details not found' });
    }

    // Update the document in the history collection
    const existingSearch = await mongo.find('History',  searchTerm );

    // Update or create a new document in the history collection
    if (existingSearch) {
      // Increase searchCount by 1 and update lastSearched date
      await mongo.update(
        'History',
        { searchTerm },
        {
          $push: {
            selections: { id, details: details.name }
          }
        }
      );
    } else {
      // Insert a new document with searchCount as 1 and current date as lastSearched
      await mongo.save('History', {
        searchTerm,
        searchCount: 1,
        lastSearched: new Date(),
        selections: [{ id, details: details.name }] // Initialize selections with the first selection
      });
    }

    // Send the JSON response with the details
    res.json(details);
  } catch (error) {
    console.error('Error occurred during details retrieval:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
