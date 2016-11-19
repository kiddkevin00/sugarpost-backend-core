const authRouter = require('../../../../lib/routes/auth/');

describe('Auth router', () => {

  it('should have all the endpoints registered', () => {
    const routes = [];

    authRouter.stack.forEach((r) => {
      if (r.route && r.route.path) {
        routes.push(r.route.path);
      }
    });

    expect(routes).to.include('/signup');
  });

});
