const chai = require('chai');
const sinon = require('sinon');
require('sinon-as-promised');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const chaiShallowDeepEqual = require('chai-shallow-deep-equal');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(chaiShallowDeepEqual);

chai.config.includeStack = true;

global.expect = chai.expect;

global.spy = sinon.spy;
global.stub = sinon.stub;
global.mock = sinon.mock;
