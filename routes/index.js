var cheerio, express, getPostingBody, reply, request, router, vow;

express = require("express");

request = require('request');

cheerio = require('cheerio');

reply = require('../controllers/reply');

vow = require('vow');

router = express.Router();

router.get("/", function(req, res, next) {
  return res.render("index", {
    title: "Super Uber Awesome OneRent Autoreply Email Service"
  });
});

getPostingBody = function(url) {
  var deferred;
  deferred = vow.defer();
  request(url, function(err, response, html) {
    var $;
    $ = cheerio.load(html);
    return $('#postingbody').filter(function() {
      var data, postingBody;
      data = $(this);
      postingBody = data.html();
      return deferred.resolve(postingBody);
    });
  });
  return deferred.promise();
};

router.post('/', function(req, res) {
  var URL, email, from, fromAddress, fromDomain, fromName, text, to;
  console.log('message received');
  email = req.body;
  to = email.to;
  from = email.from;
  text = email.text;
  console.log('From: ' + from);
  console.log(text);
  fromAddress = from.match("<(.*)>")[1];
  fromDomain = from.split('@')[1];
  fromName = from.split(' ')[0];
  if ((/craigslist/.test(fromDomain)) && !(/robot/.test(from))) {
    URL = text.match("http(.*)html")[0];
    console.log('This is from Craigslist');
    getPostingBody(URL).then(function(postingBody) {
      return request('http://www.onerent.co/api/property/availableproperties', function(err, res, body) {
        var apiStreet, i, managerID, managerNumber, propertyID, propertyList, replyTest, results, street, streetTest;
        propertyList = JSON.parse(body);
        replyTest = /Section 8/.test(text);
        results = [];
        for (i in propertyList) {
          street = propertyList[i].street;
          apiStreet = RegExp(street);
          streetTest = apiStreet.test(postingBody);
          if (streetTest && (replyTest === false)) {
            console.log(apiStreet);
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
            if (managerID === '55d29096f467c60300e841cb') {
              managerNumber = '(415) 595-9585';
              console.log('This is Clay');
            }
            if (managerID === '55dba1d760d8a303000873e3') {
              managerNumber = '(408) 420-0758';
              console.log('This is Justin');
            }
            if (managerID === '55d231e969a6050300429048') {
              managerNumber = '(805) 722-9637';
              console.log('This is Dylan');
            }
            if (managerID === '55a06b2f1c5c49030076d481') {
              managerNumber = '(512) 749-8696';
              console.log('This is Tucker');
            }
            console.log(propertyID);
            results.push(reply.sendEmail(fromName, fromAddress, propertyID, managerNumber));
          } else {
            results.push(void 0);
          }
        }
        return results;
      });
    });
  } else if ((/zillow/.test(fromDomain)) || (/trulia/.test(fromDomain))) {
    console.log('inside else if');
    if (/trulia/.test(fromDomain)) {
      fromAddress = text.match("Email: (.*);")[1];
      fromName = text.match("From: (.*) ")[1];
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
          if (managerID === '55d29096f467c60300e841cb') {
            managerNumber = '(415) 595-9585';
            console.log('This is Clay');
          }
          if (managerID === '55dba1d760d8a303000873e3') {
            managerNumber = '(408) 420-0758';
            console.log('This is Justin');
          }
          if (managerID === '55d231e969a6050300429048') {
            managerNumber = '(805) 722-9637';
            console.log('This is Dylan');
          }
          if (managerID === '55a06b2f1c5c49030076d481') {
            managerNumber = '(512) 749-8696';
            console.log('This is Tucker');
          }
          console.log('Reply sent to: ' + fromAddress);
          console.log('Property ID: ' + propertyID);
          results.push(reply.sendEmail(fromName, fromAddress, propertyID, managerNumber));
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
