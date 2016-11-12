const adminRouter = require('../../../../lib/routes/admin/');

describe('Admin route', () => {

  it('should have all the endpoints registered', () => {
    const routes = [];

    adminRouter.stack.forEach((r) => {
      if (r.route && r.route.path) {
        routes.push(r.route.path);
      }
    });

    expect(routes).to.include('/sample');
  });

});
