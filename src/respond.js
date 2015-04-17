'use strict';

const Stream = require('readable-stream');
const httpify = require('caseless').httpify;

class VirtualResponse extends Stream.PassThrough {
  constructor(props) {
    super();

    props = props || {};

    this.statusCode = props.statusCode || 200;
    httpify(this, props.headers);
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  header(name, value) {
    this.setHeader(name, value);
    return this;
  }

  body(body) {
    if (typeof body === 'string') {
      body = new Buffer(body, 'utf8');
    }

    if (body instanceof Buffer) {
      this.header('Content-Length', body.length);
      this.end(body);
    } else {
      throw new TypeError('Body has to be a string or a Buffer');
    }

    return this;
  }

  pipe(res, options) {
    res.statusCode = this.statusCode;

    const headers = this.headers;
    const headerNames = Object.keys(headers);
    for (let i = 0; i < headerNames.length; ++i) {
      const name = headerNames[i];
      res.setHeader(name, headers[name]);
    }

    return super.pipe(res, options);
  }
}

function respond(props) {
  props = props || {};

  const res = new VirtualResponse(props);

  return 'body' in props ? res.body(props.body) : res;
}

module.exports = respond;
module.exports['default'] = respond;
