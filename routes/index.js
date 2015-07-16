var cheerio, express, reply, request, router;

express = require("express");

request = require('request');

cheerio = require('cheerio');

reply = require('../controllers/reply');

router = express.Router();

router.get("/", function(req, res, next) {
  return res.render("index", {
    title: "Super Uber Awesome OneRent Autoreply Email Servie"
  });
});

router.post('/', function(req, res) {
  var $, arrayOfLinks, craigsLink, email, from, fromAddress, fromDomain, fromName, testlink, text;
  console.log('message received');
  email = req.body;
  from = email.from;
  text = email.text;
  console.log(from);
  fromAddress = from.match("<(.*)>")[1];
  fromDomain = from.split('@')[1];
  fromName = from.split(' ')[0];
  if (/craigslist/.test(fromDomain)) {
    console.log('This is from Craigslist');
    $ = cheerio.load(email.html);
    arrayOfLinks = [];
    $('a').filter(function() {
      var data;
      data = $(this);
      return arrayOfLinks.push(data.text());
    });
    craigsLink = arrayOfLinks[arrayOfLinks.length - 3];
    testlink = 'http://sfbay.craigslist.org/eby/apa/5115444072.html';
    request(craigsLink, function(err, res, html) {
      var propertyID;
      if (err) {
        return console.log(err);
      } else {
        console.log(html);
        propertyID = html.match('Property ID: (.*)</')[1];
        console.log(propertyID);
        return reply.sendEmail(fromName, fromAddress, propertyID);
      }
    });
  } else {
    request('http://www.onerent.co/api/property/availableproperties', function(err, res, body) {
      var apiAddress, i, propertyID, propertyList, regex, results;
      propertyList = JSON.parse(body);
      results = [];
      for (i in propertyList) {
        apiAddress = propertyList[i].street;
        regex = new RegExp(apiAddress);
        if (regex.test(text)) {
          propertyID = propertyList[i].id;
          console.log(propertyID);
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
