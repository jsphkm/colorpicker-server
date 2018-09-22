exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/textbottle';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/test-textbottle';
exports.PORT = process.env.PORT || 3000;

exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

exports.CLIENT_ORIGIN = 'https://afternoon-lake-76580.herokuapp.com'