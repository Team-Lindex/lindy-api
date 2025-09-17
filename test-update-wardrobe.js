const axios = require('axios');

// Base URL for the API
const API_URL = 'http://localhost:3000/api/wardrobe';

// First, get a wardrobe item to update
async function testUpdateWardrobeItem() {
  try {
    // Get all wardrobe items to find one to update
    console.log('Fetching wardrobe items...');
    const response = await axios.get(API_URL);
    
    if (response.data.data && response.data.data.length > 0) {
      const itemToUpdate = response.data.data[0];
      console.log(`Found item to update: ${itemToUpdate._id}`);
      
      // Update the item
      const updateData = {
        tags: [...(itemToUpdate.tags || []), 'updated-test-tag']
      };
      
      console.log(`Updating item with data:`, updateData);
      const updateResponse = await axios.put(`${API_URL}/${itemToUpdate._id}`, updateData);
      
      console.log('Update response:');
      console.log(JSON.stringify(updateResponse.data, null, 2));
    } else {
      console.log('No wardrobe items found to update');
    }
  } catch (error) {
    console.error('Error testing update endpoint:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Run the test
testUpdateWardrobeItem();
