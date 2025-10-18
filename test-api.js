const http = require('http');
const handler = require('./api/index.js');

const server = http.createServer((req, res) => {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };
  handler(req, res);
});

server.listen(3001, () => {
  console.log('✅ Test server running on http://localhost:3001');
  console.log('Testing /api endpoint...');
  
  http.get('http://localhost:3001/api', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const json = JSON.parse(data);
      if (json.status === 'ok') {
        console.log('✅ API endpoint works!');
        console.log('Endpoints:', json.endpoints.join(', '));
        process.exit(0);
      } else {
        console.log('❌ Unexpected response');
        process.exit(1);
      }
    });
  });
});

setTimeout(() => {
  console.log('❌ Timeout');
  process.exit(1);
}, 5000);
