const http = require('http');
const https = require('https');
const K = process.env.OPENROUTER_KEY;

function cleanUsage(u) {
  if (!u) return { input_tokens: 0, output_tokens: 0 };
  return {
    input_tokens: u.input_tokens || 0,
    output_tokens: u.output_tokens || 0,
    cache_creation_input_tokens: u.cache_creation_input_tokens || 0,
    cache_read_input_tokens: u.cache_read_input_tokens || 0
  };
}

function fixModel(m) {
  if (m && m.includes('/')) return m.split('/').pop();
  return m;
}

function transformSSELine(line) {
  if (!line.startsWith('data: ')) return line;
  const jsonStr = line.slice(6);
  if (jsonStr === '[DONE]') return null;
  try {
    const obj = JSON.parse(jsonStr);
    if (obj.type === 'message_start' && obj.message) {
      obj.message.usage = cleanUsage(obj.message.usage);
      obj.message.model = fixModel(obj.message.model);
      delete obj.message.container;
      delete obj.message.stop_details;
      delete obj.message.provider;
    } else if (obj.type === 'message_delta') {
      if (obj.usage) obj.usage = cleanUsage(obj.usage);
      if (obj.delta) {
        delete obj.delta.container;
        delete obj.delta.stop_details;
      }
    } else if (obj.type === 'content_block_start' && obj.content_block) {
      delete obj.content_block.citations;
    }
    return 'data: ' + JSON.stringify(obj);
  } catch (e) {
    return line;
  }
}

http.createServer((req, res) => {
  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    let body = Buffer.concat(chunks);
    let isStream = false;
    try {
      const j = JSON.parse(body);
      if (j.model && !j.model.includes('/')) j.model = 'anthropic/' + j.model;
      isStream = !!j.stream;
      body = Buffer.from(JSON.stringify(j));
    } catch (e) {}

    const fwdHeaders = {};
    const skip = new Set(['host', 'connection', 'content-length', 'transfer-encoding']);
    for (const [k, v] of Object.entries(req.headers)) {
      if (!skip.has(k.toLowerCase())) fwdHeaders[k] = v;
    }
    fwdHeaders.host = 'openrouter.ai';
    fwdHeaders['x-api-key'] = K;
    fwdHeaders['content-length'] = body.length;

    const opts = {
      hostname: 'openrouter.ai',
      port: 443,
      path: req.url,
      method: req.method,
      headers: fwdHeaders
    };

    const proxy = https.request(opts, upstream => {
      if (!isStream) {
        let rb = '';
        upstream.on('data', c => rb += c);
        upstream.on('end', () => {
          try {
            const obj = JSON.parse(rb);
            if (obj.usage) obj.usage = cleanUsage(obj.usage);
            if (obj.model) obj.model = fixModel(obj.model);
            delete obj.container;
            delete obj.stop_details;
            delete obj.provider;
            rb = JSON.stringify(obj);
          } catch (e) {}
          res.writeHead(upstream.statusCode, {
            'content-type': 'application/json',
            'cache-control': 'no-cache'
          });
          res.end(rb);
        });
      } else {
        res.writeHead(upstream.statusCode, {
          'content-type': 'text/event-stream',
          'cache-control': 'no-cache',
          'connection': 'keep-alive'
        });

        let buffer = '';
        upstream.on('data', chunk => {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop();
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed === '') {
              res.write('\n');
            } else if (trimmed.startsWith('event:')) {
              if (trimmed === 'event: data') continue;
              res.write(trimmed + '\n');
            } else if (trimmed.startsWith('data:')) {
              if (trimmed === 'data: [DONE]') continue;
              const transformed = transformSSELine(trimmed);
              if (transformed) res.write(transformed + '\n');
            } else {
              res.write(trimmed + '\n');
            }
          }
        });
        upstream.on('end', () => {
          if (buffer.trim()) res.write(buffer);
          res.end();
        });
      }
    });

    proxy.on('error', e => {
      res.writeHead(502, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ type: 'error', error: { type: 'api_error', message: e.message } }));
    });
    proxy.end(body);
  });
}).listen(3200, '0.0.0.0', () => console.log('Anthropic->OpenRouter proxy v5 on 3200'));
