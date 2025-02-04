import type { Handler } from "@netlify/functions";
import sanityClient from '@sanity/client';

// You will need to configure environment variables for Sanity.io project id
// and dataset name. Optionally you may also configure a token, useful for
// reading private datasets or mutating data. The variables are named
//
// SANITY_PROJECTID
// SANITY_DATASET
// SANITY_TOKEN
//
// Read more about configuring environment variables at
// https://docs.netlify.com/configure-builds/environment-variables/#declare-variables
const client = sanityClient({
  projectId: process.env.SANITY_PROJECT_ID || '0q6ju337',
  dataset: process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_TOKEN,
  // CDN will not be used if token is set
  useCdn: true,
});

// A proxy for Sanity.io GROQ queries.
//
// Useful for querying private datasets with a token. Usually you will restrict
// access to this function with for example Netlify Identity.
//
// To explore what queries you can do with GROQ, check out the cheat sheet at
// https://www.sanity.io/docs/query-cheat-sheet
//
// Create Sanity.io tokens at https://manage.sanity.io
//
// Read more about restricting access to your Netlify functions at
// https://www.netlify.com/blog/2018/03/29/jamstack-architecture-on-netlify-how-identity-and-functions-work-together/#restricting-access
const handler: Handler = async (event) => {
  const query = event.queryStringParameters?.query ?? "";
  // The rest of the query params are handled as parameters to the query
  const params = { ...event.queryStringParameters, query: null };

  try {
    const result = await client.fetch(query, params);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      headers: { 'Content-Type': 'application/json' },
      statusCode: error.statusCode || 500,
      body: error.responseBody || JSON.stringify({ error: 'Unknown error occurred' }),
    };
  }
};

module.exports = { handler };
