const mockAxiosInstance = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  patch: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  interceptors: {
    request: {
      use: jest.fn((fn) => {
        mockAxiosInstance._requestInterceptor = fn;
      }),
    },
    response: {
      use: jest.fn((successFn, errorFn) => {
        mockAxiosInstance._responseInterceptorSuccess = successFn;
        mockAxiosInstance._responseInterceptorError = errorFn;
      }),
    },
  },
  defaults: {
    headers: {
      common: {},
    },
  },
};

const mockAxios = {
  create: jest.fn(() => mockAxiosInstance),
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  patch: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
  _instance: mockAxiosInstance,
};

module.exports = mockAxios;
module.exports.default = mockAxios;
