var moment, request, sendgrid;

sendgrid = require('sendgrid')('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');

request = require('request');

moment = require('moment-timezone');

exports.sendEmail = function(name, from, propertyID) {
  var propertyURL, replyTo;
  replyTo = from;
  propertyURL = 'http://onerent.co/api/property/' + propertyID;
  return request(propertyURL, function(err, res, body) {
    var ISOString, address, arrayOfShowtimes, bathrooms, bedrooms, browseURL, catPolicy, deposit, dogPolicy, emailReply, i, incomeRequirement, leaseLength, momentTime, now, parkingOptions, property, rent, showingTime, showtimes, utilities;
    if (err) {
      return console.log(err);
    } else {
      property = JSON.parse(body);
      bedrooms = property.bedrooms;
      bathrooms = property.bathrooms;
      showtimes = property.openHouseDates;
      arrayOfShowtimes = [];
      for (i in showtimes) {
        ISOString = showtimes[i].date;
        momentTime = moment(ISOString);
        now = moment.tz(momentTime, "America/Los_Angeles");
        showingTime = now.format('ddd MMM Do, h:mm a');
        if ((moment(now)).isAfter(moment())) {
          arrayOfShowtimes.push(showingTime);
        }
      }
      if (arrayOfShowtimes.length === 0) {
        arrayOfShowtimes = 'No showtimes are currently scheduled.';
      } else {
        arrayOfShowtimes = arrayOfShowtimes.join(', ');
      }
      leaseLength = property.leaseTermMonths;
      rent = '$' + property.monthlyRent;
      deposit = '$' + property.deposit;
      parkingOptions = property.features.parking;
      if (property.requiredIncomeMultiplier) {
        incomeRequirement = '$' + property.monthlyRent * property.requiredIncomeMultiplier;
      } else {
        incomeRequirement = '$' + property.monthlyRent * 2.5;
      }
      address = property.street + ", " + property.city + " " + property.zip;
      browseURL = 'http://onerent.co/property/' + property.id;
      catPolicy = 'Not allowed';
      if (property.petPolicy.catsAllowed === true) {
        catPolicy = 'Allowed';
      }
      dogPolicy = 'Not allowed';
      if (property.petPolicy.dogsAllowed === true) {
        dogPolicy = 'Allowed';
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
        text: ' '
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
        ':showingtimes': [arrayOfShowtimes],
        ':leaseLength': [leaseLength],
        ':parkingOptions': [parkingOptions.join(', ')],
        ':rent': [rent],
        ':deposit': [deposit],
        ':income': [incomeRequirement],
        ':propertyURL': [browseURL],
        ':cats': [catPolicy],
        ':dogs': [dogPolicy],
        ':utilities': [utilities]
      };
      return sendgrid.send(emailReply, function(err, json) {
        if (err) {
          console.log(err);
        }
        return console.log(json);
      });
    }
  });
};
