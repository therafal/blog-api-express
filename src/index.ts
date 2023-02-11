import "dotenv/config";

BigInt.prototype.toJSON = function() { return this.toString() }

require('./app');