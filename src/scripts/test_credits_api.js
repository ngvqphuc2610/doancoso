// Test script to check movie credits API
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000'; // Adjust if using a different port

async function testCreditsApi(movieId) {
  try {
    console.log(`Testing credits API for movie ID: ${movieId}`);

    // Test the regular API
    const response = await fetch(`${BASE_URL}/api/movies/${movieId}/credits`);
    const data = await response.json();

    console.log('API Response:', JSON.stringify(data, null, 2));

    if (!data.success) {
      console.error('API call failed:', data.message);
      return;
    }

    console.log('Credits found:');
    if (data.data.director) {
      console.log(`Director: ${data.data.director.name}`);
    } else {
      console.log('No director information');
    }

    console.log(`Cast members: ${data.data.cast.length}`);
    data.data.cast.forEach((actor, index) => {
      console.log(`  ${index + 1}. ${actor.name}`);
    });

  } catch (error) {
    console.error('Error testing credits API:', error);
  }
}

// Test with a specific movie ID - change to an ID that exists in your database
const movieId = 1;
testCreditsApi(movieId);
