class SampleService {

  static execute(state, strategy) {
    
    const result = {
      data: {
        teachers: [
          {
            _id: '001',
            name: 'Chris',
            bankAccountId: '002',
          },
          {
            _id: '002',
            name: 'Mike',
            bankAccountId: '003',
          },
        ],
      },
    };

    return Promise.resolve(result);
  }

}

module.exports = exports = SampleService;
