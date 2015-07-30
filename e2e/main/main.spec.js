'use strict';

describe('Schedule API', function() {
  var page;

  it('list a schedule', function() {
    browser.get('http://localhost:3000/#/Schedule');
    element(by.model('datepicker.month')).sendKeys('1');
    element(by.model('datepicker.day')).sendKeys('1');
    element(by.model('datepicker.year')).sendKeys('2015');
    element(by.css('.btn-open')).click();

    element.all(by.css('.btn')).first().getText().then(function (text) {
        expect(text).toEqual('A');
    });

    afterEach(function() {
      db.connection.db.dropDatabase();
    })
  });
});
