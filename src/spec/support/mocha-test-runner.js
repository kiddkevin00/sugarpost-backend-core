const proxyquire = require('proxyquire');

const chai = require('chai');

const sinon = require('sinon');
require('sinon-as-promised');

const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const chaiShallowDeepEqual = require('chai-shallow-deep-equal');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(chaiShallowDeepEqual);

global.proxyquire = proxyquire;

global.expect = chai.expect;

global.spy = sinon.spy;
global.stiub = sinon.stub;
global.mock = sinon.mock;

//chai.config.includeStack = true;
