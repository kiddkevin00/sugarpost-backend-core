const PreconditionValidator = require('../../../lib/utility/precondition-validator');

describe('Precondition validator', function () {
  let value;

  it('can validate whether a value is empty :: shouldNotBeEmpty()', () => {
    value = '';

    expect(() => { PreconditionValidator.shouldNotBeEmpty(value); }).to.throw();
  });

  it('can validate if a value belongs to one of the provided options :: shouldBeEnumType()', () => {
    value = 'option1';
    const options = [value];

    expect(() => { PreconditionValidator.shouldBeEnumType(value, options); }).to.not.throw();
  });

  it('can validate if a value is a valid time :: shouldBeValidTime()', () => {
    value = new Date().toISOString();

    expect(() => { PreconditionValidator.shouldBeValidTime(value); }).to.not.throw();
  });

  describe('can validate if a value is an array :: shouldBeArrayOrArrayText()', () => {

    it('after parsing', () => {
      value = [1, 2, 3];

      expect(() => { PreconditionValidator.shouldBeArrayOrArrayText(value); }).to.not.throw();
    });

    it('without parsing', () => {
      value = JSON.stringify([1, 2, 3]);

      expect(() => { PreconditionValidator.shouldBeArrayOrArrayText(value); }).to.not.throw();
    });

  });
  
});
