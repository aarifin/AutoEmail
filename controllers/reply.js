var Emails, moment, mong, mongoose, request, sendgrid;

sendgrid = require('sendgrid')('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');

request = require('request');

moment = require('moment-timezone');

mong = require('../routes/emailSchema');

mongoose = require('mongoose');

Emails = mong.autoreply;

mongoose.connect('mongodb://vyomesh:awesome123@proximus.modulusmongo.net:27017/iz6atywA');

exports.sendEmail = function(name, from, propertyID, managerNumber) {
  var propertyURL, replyTo;
  console.log('inside sendEmail');
  replyTo = from;
  propertyURL = 'http://onerent.co/api/property/' + propertyID;
  return request(propertyURL, function(err, res, body) {
    var address, availableDate, bathrooms, bedrooms, browseURL, catPolicy, deposit, dogPolicy, emailReply, i, incomeRequirement, leaseLength, parkingOptions, property, rent, showtimes, utilities;
    if (err) {
      return console.log(err);
    } else {
      property = JSON.parse(body);
      bedrooms = property.bedrooms;
      bathrooms = property.bathrooms;
      showtimes = 'Please schedule a showtime here: http://onerent.co/property/' + propertyID;
      leaseLength = property.leaseTermMonths;
      rent = '$' + property.monthlyRent;
      deposit = '$' + property.deposit;
      parkingOptions = "";
      if (property.features.parking) {
        parkingOptions = property.features.parking;
        parkingOptions = parkingOptions.join(', ');
      }
      if (property.requiredIncomeMultiplier) {
        incomeRequirement = '$' + property.monthlyRent * property.requiredIncomeMultiplier;
      } else {
        incomeRequirement = '$' + property.monthlyRent * 2.5;
      }
      address = property.street + ", " + property.city + " " + property.zip;
      availableDate = property.availableDate;
      browseURL = 'http://onerent.co/property/' + property.id;
      catPolicy = 'Not allowed';
      dogPolicy = 'Not allowed';
      if (property.petPolicy) {
        if (property.petPolicy.catsAllowed === true) {
          catPolicy = 'Allowed';
        }
        if (property.petPolicy.dogsAllowed === true) {
          dogPolicy = 'Allowed';
        }
      }
      utilities = [];
      for (i in property.features.utiliesPaidByOwner) {
        utilities.push(property.features.utiliesPaidByOwner[i]);
      }
      if (utilities.length === 0) {
        utilities = 'None';
      } else {
        utilities = utilities.join(', ');
      }
      emailReply = new sendgrid.Email({
        to: replyTo,
        from: 'pm@onerent.co',
        fromname: 'OneRent',
        subject: 'Thank you for your interest in OneRent!',
        text: ' ',
        html: ' '
      });
      emailReply.setFilters({
        'templates': {
          'settings': {
            'enable': 1,
            'template_id': '635c1f0f-1617-405f-b178-00940cd658fa'
          }
        }
      });
      emailReply.smtpapi.header.sub = {
        ':name': [name],
        ':bedrooms': [bedrooms],
        ':bathrooms': [bathrooms],
        ':address': [address],
        ':showingtimes': [showtimes],
        ':leaseLength': [leaseLength],
        ':parkingOptions': [parkingOptions],
        ':rent': [rent],
        ':deposit': [deposit],
        ':income': [incomeRequirement],
        ':propertyURL': [browseURL],
        ':cats': [catPolicy],
        ':dogs': [dogPolicy],
        ':utilities': [utilities],
        ':managerNumber': [managerNumber],
        ':availableDate': [availableDate]
      };
      return sendgrid.send(emailReply, function(err, json) {
        var replyLog;
        if (err) {
          console.log(err);
        }
        console.log(json);
        replyLog = new Emails();
        replyLog.sentTo = name + ': ' + from;
        replyLog.timeSent = new Date;
        replyLog.messageStatus = json.message;
        return replyLog.save(function(err) {
          if (err) {
            return console.log(err);
          } else {
            return console.log('Email logged');
          }
        });
      });
    }
  });
};
