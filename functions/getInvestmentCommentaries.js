const functions = require("firebase-functions");
require("dotenv").config();
const { request, GraphQLClient, gql } = require("graphql-request");

const client = new GraphQLClient(process.env.GRAPH_ENDPOINT);

const query = gql`
  {
    investmentCommentaries {
      id
      title
      year
      document {
        id
        url
      }
    }
  }
`;

exports.getInvestmentCommentaries = functions
  .region("europe-west2")
  .https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    try {
      const data = await client.request(query);
      if (data) {
        // response.json(data);

        const organisedInvestmentCommentaries = [];
        const yearSet = new Set();
        data.investmentCommentaries.forEach((comm) => {
          yearSet.add(comm.year);
        });

        yearSet.forEach((year) => {
          let yearObj = {
            year: year,
            documents: [],
          };

          data.investmentCommentaries.forEach((comm) => {
            if (comm.year === year) {
              let commObject = {
                id: comm.id,
                url: comm.document.url,
                title: comm.title,
              };
              yearObj.documents.push(commObject);
            }
          });

          organisedInvestmentCommentaries.push(yearObj);
        });

        response.json(organisedInvestmentCommentaries);
      } else {
        response.json({ message: "No data" });
      }
    } catch {
      response
        .status(400)
        .json({ message: "An error occurred retrieving the data" });
    }
  });
