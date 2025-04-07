import * as http from 'http';

async function testRootRoute() {
  console.log('Testing root route at http://localhost:4000/');

  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:4000/', (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers)}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response data:');
        try {
          const parsedData = JSON.parse(data);
          console.log(JSON.stringify(parsedData, null, 2));
        } catch {
          console.log(data);
        }
        resolve(true);
      });
    });
    
    req.on('error', (error) => {
      console.error(`Error: ${error.message}`);
      reject(error);
    });
    
    req.end();
  });
}

testRootRoute().then(() => console.log('Test completed'));
