require('../helpers/setup');
var _ = require('lodash');

describe('add-methods - promise-no-chain' + env.ENV_DESC, function() {
  var browser;
  var partials = {};

  require('./midway-base')(this, partials).then(function(_browser) { browser = _browser; });

  var extraAsyncMethods = {
    sleepAndElementById: function(id, cb) {
      var _this = this;
      _this.sleep(200, function(err) {
        if(err) { return cb(err); }
        _this.elementById(id, cb);
      });
    },
    sleepAndText: function(el, cb) {
      var _this = this;
      _this.sleep(200, function(err) {
        if(err) { return cb(err); }
        _this.text(el, cb);
      });
    },
    elementByCssWhenReady: function(selector, timeout, cb) {
      var _this = this;
      _this.waitForElementByCss(selector, timeout, function(err) {
        if(err) { return cb(err); }
        _this.elementByCss(selector, cb);
      });
    }
  };

  var extraElementAsyncMethods = {
    textTwice: function(cb) {
      var _this = this;
      var result = '';
      _this.text(function(err, text) {
        if(err) { return cb(err); }
        result += text;
        _this.text(function(err, text) {
          if(err) { return cb(err); }
          result += text;
          cb(null, result);
        });
      });
    },
  };

  var extraPromiseNoChainMethods = {
    sleepAndElementById: function(id) {
      var _this = this;
      return this
        .sleep(200)
        .then(function() {
          return _this.elementById(id);
        });

    } ,
    sleepAndText: function(el) {
      var _this = this;
      return this
        .sleep(200)
        .then(function() {
          return _this.text(el);
        });
    }
  };

  var extraElementPromiseNoChainMethods = {
    textTwice: function() {
      var _this = this;
      var result = '';
      return _this.text()
        .then(function(text) {
          result += text;
        }).then(function() {
          return _this.text();
        }).then(function(text) {
          result += text;
          return result;
        });
    }
  };

  var allExtraMethodNames = _.union(
    _(extraAsyncMethods).keys(),
    _(extraPromiseNoChainMethods).keys()
  );

  var noExtraMethodCheck = function() {
    _(allExtraMethodNames).each(function(name) {
      should.not.exist(wd.Webdriver.prototype[name]);
      should.not.exist(wd.PromiseChainWebdriver.prototype[name]);
    });
  };

  beforeEach(function() {
    noExtraMethodCheck();
  });

  afterEach(function() {
    _(allExtraMethodNames).each(function(name) {
      wd.removeMethod(name);
    });
    noExtraMethodCheck();
  });

  partials['wd.addPromisedMethod'] =
    '<div id="theDiv">Hello World!</div>';
  it('wd.addPromisedMethod', function() {
    _(extraPromiseNoChainMethods).each(function(method, name) {
      wd.addPromiseMethod(name, method);
    });

    return browser
      .sleepAndElementById('theDiv').should.be.fulfilled
      .then(function() {
        return browser.sleepAndText().should.be.fulfilled;
      }).then(function() {
        return browser.sleepAndElementById('theDiv');
      }).then(function(el){
        return browser.sleepAndText(el).should.become("Hello World!");
      });
  });

  partials['wd.addElementPromisedMethod'] =
    '<div id="theDiv">\n' +
    '  <div id="div1">\n' +
    '    <span>one</span>\n' +
    '    <span>two</span>\n' +
    '  </div>\n' +
    '  <div id="div2">\n' +
    '    <span>one</span>\n' +
    '    <span>two</span>\n' +
    '    <span>three</span>\n' +
    '  </div>\n' +
    '</div>\n';
  it('wd.addElementPromisedMethod', function() {
    _(extraElementPromiseNoChainMethods).each(function(method, name) {
      wd.addElementPromiseMethod(name, method);
    });
    return browser
      .elementById('div1')
      .then(function(el) { return el.textTwice(); })
      .then(function(result ) {
        result.should.equal('one twoone two');
      });
  });

  partials['wd.addAsyncMethod'] =
    '<div id="theDiv">Hello World!</div>';
  it('wd.addAsyncMethod', function() {
    _(extraAsyncMethods).each(function(method, name) {
      wd.addAsyncMethod(name, method);
    });
    return browser
      .sleepAndElementById('theDiv').should.be.fulfilled
      .then(function() {
        return browser.sleepAndText().should.be.fulfilled;
      }).then(function() {
        return browser.sleepAndElementById('theDiv');
      }).then(function(el){
        return browser.sleepAndText(el).should.become("Hello World!");
      });
  });

  partials['wd.addElementAsyncMethod'] =
    '<div id="theDiv">\n' +
    '  <div id="div1">\n' +
    '    <span>one</span>\n' +
    '    <span>two</span>\n' +
    '  </div>\n' +
    '  <div id="div2">\n' +
    '    <span>one</span>\n' +
    '    <span>two</span>\n' +
    '    <span>three</span>\n' +
    '  </div>\n' +
    '</div>\n';
  it('wd.addElementAsyncMethod', function() {
    _(extraElementAsyncMethods).each(function(method, name) {
      wd.addElementAsyncMethod(name, method);
    });
    return browser
      .elementById('div1')
      .then(function(el) { return el.textTwice(); })
      .then(function(result ) {
        result.should.equal('one twoone two');
      });
  });

});
