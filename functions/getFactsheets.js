const functions = require("firebase-functions");
require("dotenv").config();
const { request, GraphQLClient, gql } = require("graphql-request");

const client = new GraphQLClient(process.env.GRAPH_ENDPOINT);

const query = gql`
  {
    factsheets(orderBy: order_ASC) {
      id
      title
      document {
        id
        url
      }
    }
  }
`;

exports.getFactsheets = functions
  .region("europe-west2")
  .https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    try {
      const data = await client.request(query);
      if (data) {
        response.json(data);
      } else {
        response.json({ message: "No data" });
      }
    } catch {
      response
        .status(400)
        .json({ message: "An error occurred retrieving the data" });
    }
  });
