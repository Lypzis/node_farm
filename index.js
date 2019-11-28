const fs = require('fs'); // fs stands for 'file system'
const http = require('http'); // a server
const url = require('url');
const slugify = require('slugify'); // "beautifies" urls

const replaceTemplate = require('./modules/replaceTemplate');

/**
 * FILES
 * Examples of read and write files in Node
 * - Blocking, synchronous way
 
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8'); 
console.log(textIn); // returns the content written in the file(a .txt in this case)

const textOut = `This is what we know about the avocado: ${textIn}.\n Created on ${Date.now()}`;
fs.writeFileSync('./txt/output.txt', textOut); // will create a new file in the specified folder, with content of 'textOut'
console.log('File written! :D');
///////////////////////////////////////////////
*/

/**
 * - Non-Blocking, Asynchronous way
   - callback hell...
   
fs.readFile('./txt/start.txt', 'utf-8', (err, data) => { // first error, then data, mostly always
    if(err) return console.log(`Error!\n${err}`);
    
    // uses the data retrieved as part of the argument
    fs.readFile(`./txt/${data}.txt`, 'utf-8', (err, data2) => { 
        console.log(data2);
        fs.readFile(`./txt/append.txt`, 'utf-8', (err, data3) => { 
            console.log(data3);
            
            fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
                console.log('Your file has been written :D');
            });
        });
    });
}); // reads asynchronous
console.log('Will read file!');
///////////////////////////////////////////////////
*/

/**
 * SERVER
 */
// top level code can be synch without problems, since will only execute one time
// it is also immutable, so it would be bad to be reading it over and over again for each time
// '/api' is accessed, so instead, its data is read once and saved in a constant
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObject = JSON.parse(data); // object from the data read from the json file.

const slugs = dataObject.map(e => slugify(e.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req, res) => {
  // each time the server receives a request,
  // this callback funtion is fired;
  //console.log(req);
  //console.log(req.headers);
  //console.log(req.url);

  // this object is destructured, these are two constants
  const { query, pathname } = url.parse(req.url, true);
  let output;

  switch (pathname) {
    case '/':
      res.writeHead(200, { 'Content-type': 'text/html' });

      // creates cards with specif data
      const cardsHtml = dataObject.map(e => replaceTemplate(tempCard, e)).join(''); // join to transform the result into a string

      // then inserts them inside the overview template
      output = tempOverview.replace(/{%PRODUCT_CARDS%}/g, cardsHtml);

      res.end(output);
      break;
    case '/overview':
      res.end('This is the overview');
      break;
    case '/product':
      res.writeHead(200, { 'Content-type': 'text/html' });
      const product = dataObject[query.id]; // the selected product from the query of the respective id
      output = replaceTemplate(tempProduct, product);

      console.log(output);

      res.end(output);
      break;
    case '/api':
      res.writeHead(200, { 'Content-type': 'application/json' }); // the type of content for the header
      // The response will be our "API" sending our data :D
      res.end(data);
      break;
    default:
      res.writeHead(404, {
        // header
        'Content-type': 'text',
        'my-own-header': 'hello-world'
      });
      res.end('<h1>Page not found!</h1>');
  }

  //res.end('Hello from the server!'); // sends a response from the server which by the time has received a request :D
}); // server has always request and response as arguments

// the usual port for node is 8000, next is the host
// this will be loop listening for resquests
server.listen('8000', '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
}); // now just access localhost:8000 and check it out
/////////////////////////////////////////////////
