var cheerio, express, reply, request, router;

express = require("express");

request = require('request');

cheerio = require('cheerio');

reply = require('../controllers/reply');

router = express.Router();

router.get("/", function(req, res, next) {
  return res.render("index", {
    title: "Super Uber Awesome OneRent Autoreply Email Service"
  });
});

router.post('/', function(req, res) {
  var craigslistID, email, from, fromAddress, fromDomain, fromName, text, to;
  console.log('message received');
  email = req.body;
  to = email.to;
  from = email.from;
  text = email.text;
  console.log('From: ' + from);
  fromAddress = from.match("<(.*)>")[1];
  fromDomain = from.split('@')[1];
  fromName = from.split(' ')[0];
  if (/craigslist/.test(fromDomain)) {
    console.log('This is from Craigslist');
    craigslistID = to.match("-(.*)@")[1];
    console.log(craigslistID);
    request('http://www.onerent.co/api/property/availableproperties', function(err, res, body) {
      var apiCLID, i, managerID, managerNumber, propertyID, propertyList, replyTest, results;
      propertyList = JSON.parse(body);
      replyTest = /Section 8/.test(text);
      results = [];
      for (i in propertyList) {
        apiCLID = propertyList[i].craigslistId;
        if ((apiCLID === craigslistID) && (replyTest === false)) {
          propertyID = propertyList[i].id;
          managerID = propertyList[i].managerId;
          if (managerID === "557779495bf385030060c196") {
            managerNumber = '(925) 596-1308';
            console.log('This is Ray');
          }
          if (managerID === '558b429c112fa403006fe0f1') {
            managerNumber = '(669) 251-9324';
            console.log('This is Matt');
          }
          console.log(propertyID);
          console.log(managerNumber);
          results.push(reply.sendEmail(fromName, fromAddress, propertyID, managerNumber));
        } else {
          results.push(void 0);
        }
      }
      return results;
    });
  } else if ((/zillow/.test(fromDomain)) || (/trulia/.test(fromDomain))) {
    if (/trulia/.test(fromDomain)) {
      fromName = '';
    }
    request('http://www.onerent.co/api/property/availableproperties', function(err, res, body) {
      var apiAddress, i, managerID, managerNumber, propertyID, propertyList, regex, replyTest, results;
      propertyList = JSON.parse(body);
      replyTest = /Section 8/.test(text);
      results = [];
      for (i in propertyList) {
        apiAddress = propertyList[i].street;
        regex = new RegExp(apiAddress);
        if ((regex.test(text)) && (replyTest === false)) {
          propertyID = propertyList[i].id;
          managerID = propertyList[i].managerId;
          if (managerID === "557779495bf385030060c196") {
            managerNumber = '(925) 596-1308';
            console.log('This is Ray');
          }
          if (managerID === '558b429c112fa403006fe0f1') {
            managerNumber = '(669) 251-9324';
            console.log('This is Matt');
          }
          console.log(propertyID);
          console.log(managerNumber);
          results.push(reply.sendEmail(fromName, fromAddress, propertyID));
        } else {
          results.push(void 0);
        }
      }
      return results;
    });
  }
  return res.end();
});

module.exports = router;
