const functions = require("firebase-functions");
require("dotenv").config();
const getFactsheets = require("./getFactsheets");
const getBrochures = require("./getBrochures");
const getResources = require("./getResources");
const getInvestmentCommentaries = require("./getInvestmentCommentaries");


const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.EMAIL_API);
//
exports.contactThrogmorton = functions
  .region("europe-west2")
  .https.onRequest((request, response) => {
    functions.logger.info(process.env.EMAIL_API, { structuredData: true });

    response.set("Access-Control-Allow-Origin", "*");

    functions.logger.info(JSON.stringify(request.body));

    console.log(request.body);
    console.log(request.hostname);

    let parsedBody = JSON.parse(request.body);

    if (
      !parsedBody.fName ||
      !parsedBody.lName ||
      !parsedBody.email ||
      !parsedBody.tel
    ) {
      functions.logger.info("Not all required fields", {
        structuredData: true,
      });
      response.json({
        success: false,
        message: "Not all required fields filled in.",
      });
    } else {
      const msg = {
        to: "admin@throgmortoncm.co.uk",
        bcc: ["fostertobias@gmail.com"],
        from: "fostertobias@gmail.com",
        subject: "Throgmorton Capital Management - Contact Request",
        templateId: "d-dbcc1840e4cd4bf49ba58ea5b1916752",
        substitutionWrappers: ["{{", "}}"],
        dynamicTemplateData: {
          fName: parsedBody.fName,
          lName: parsedBody.lName,
          contactEmail: parsedBody.email,
          tel: parsedBody.tel,
          message: parsedBody.message,
        },
      };
      sgMail
        .send(msg)
        .then(() => {
          functions.logger.info("EMAIL SENT", { structuredData: true });
          response.json({ success: true, message: "Request submitted." });
        })
        .catch((error) => {
          functions.logger.error("EMAIL ERROR " + error, {
            structuredData: true,
          });
          response.json({
            success: false,
            message: "Error sending contact email",
          });
        });
    }
  });

exports.getFactsheets = getFactsheets.getFactsheets;
exports.getBrochures = getBrochures.getBrochures;
exports.getResources = getResources.getResources;
exports.getInvestmentCommentaries =
  getInvestmentCommentaries.getInvestmentCommentaries;
