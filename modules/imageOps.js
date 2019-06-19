const fs = require("fs");
const pdfjsLib = require("pdfjs-dist");
const Canvas = require("canvas");
const assert = require("assert");
function NodeCanvasFactory() {}
NodeCanvasFactory.prototype = {
  create: function NodeCanvasFactory_create(width, height) {
    assert(width > 0 && height > 0, "Invalid canvas size");
    var canvas = Canvas.createCanvas(width, height);
    var context = canvas.getContext("2d");
    return {
      canvas: canvas,
      context: context
    };
  },

  reset: function NodeCanvasFactory_reset(canvasAndContext, width, height) {
    assert(canvasAndContext.canvas, "Canvas is not specified");
    assert(width > 0 && height > 0, "Invalid canvas size");
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  },

  destroy: function NodeCanvasFactory_destroy(canvasAndContext) {
    assert(canvasAndContext.canvas, "Canvas is not specified");
    // Zeroing the width and height cause Firefox to release graphics
    // resources immediately, which can greatly reduce memory consumption.
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
};

function genPDFCover(path, rackName, uid) {
  const dir = `./racks/${rackName}`;
  const imageDir = `./images/${rackName}/`;
  const pdfPath = `${dir}${path}`;
  var rawData = new Uint8Array(fs.readFileSync(pdfPath));
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir);
  }

  // Load the PDF file.
  var loadingTask = pdfjsLib.getDocument(rawData);
  loadingTask.promise
    .then(function(pdfDocument) {
      console.log(pdfPath + " loaded.");
      pdfDocument.numPages;
      // Get the first page.
      pdfDocument.getPage(1).then(function(page) {
        // Render the page on a Node canvas with 100% scale.
        var viewport = page.getViewport({ scale: 1.0 });
        var canvasFactory = new NodeCanvasFactory();
        var canvasAndContext = canvasFactory.create(
          viewport.width,
          viewport.height
        );
        var renderContext = {
          canvasContext: canvasAndContext.context,
          viewport: viewport,
          canvasFactory: canvasFactory
        };
        var renderTask = page.render(renderContext);
        renderTask.promise.then(function() {
          // Convert the canvas to an image buffer.
          var image = canvasAndContext.canvas.toBuffer();
          fs.writeFile(`${imageDir}${uid}.png`, image, function(error) {
            if (error) {
              console.error("Error: " + error);
            } else {
              console.log("Rendered Cover");
            }
          });
        });
      });
    })
    .catch(function(reason) {
      console.log(reason);
    });
}

function renderPDF(rackName, data, callback) {
    const path = data.path
    const uid = data.uid
    const name = data.name
    const series = data.series
    const publisher = data.publisher
    const description = data.description
    const publish_date = data.publish_date
  const dir = `./racks/${rackName}`;
  const rackDir = `./temp/${rackName}/`;
  const url = `http://localhost:3000/reader/${rackName}/${uid}/`;
  const itemDir = `${rackDir}${uid}/`;
  const pdfPath = `${dir}${path}`;
  var pageSizes = []
  var pageData = {
      bookTitle: name,
      url: url,
      data:[],
      // thumbnail is optional, but it is used in the info dialog
      thumbnail: '//archive.org/download/BookReader/img/page014.jpg',

      // Metadata is optional, but it is used in the info dialog
      metadata: [
          { label: 'Title', value: name },
          { label: 'Publisher', value: publisher },
          { label: 'Series', value: series },      
          { label: 'Description', value: description },
          { label: 'Published', value: publish_date },
      ],
    }
  var rawData = new Uint8Array(fs.readFileSync(pdfPath));
  if (!fs.existsSync(rackDir)) {
    fs.mkdirSync(rackDir);
  }
  if (!fs.existsSync(itemDir)) {
    fs.mkdirSync(itemDir);
  }
  // Load the PDF file.
  let loadingTask = pdfjsLib.getDocument(rawData);

  loadingTask.promise
    .then(function(doc) {
      let numPages = doc.numPages;
      console.log("# Document Loaded");
      console.log(`Number of Pages:  ${numPages}`);

      let lastPromise = Promise.resolve();
      let loadPage = function(pageNum) {
        return doc.getPage(pageNum).then(page => {
          console.log(`# Page ${pageNum}`);
          var viewport = page.getViewport({ scale: 1.0 });
          var canvasFactory = new NodeCanvasFactory();
          var canvasAndContext = canvasFactory.create(
            viewport.width,
            viewport.height
          );
          console.log(viewport.width, viewport.height);
          pageSizes.push({ page: pageNum, width: Math.round(viewport.width), height: Math.round(viewport.height)})
          var renderContext = {
            canvasContext: canvasAndContext.context,
            viewport: viewport,
            canvasFactory: canvasFactory
          };

          var renderTask = page.render(renderContext);
          renderTask.promise.then(function() {
            // Convert the canvas to an image buffer.
            var image = canvasAndContext.canvas.toBuffer();
            fs.writeFile(`${itemDir}${pageNum}.png`, image, function(error) {
              if (error) {
                console.error("Error: " + error);
              } else {
                console.log("Rendered Page:", pageNum);
              }
            });
          });
        });
      };

      for (let i = 1; i <= numPages; i++) {
        lastPromise = lastPromise.then(loadPage.bind(null, i));
      }
      return lastPromise;
    })
    .then(
      () => {
        console.log("# End of Document");
        pageData.data = pagePlacer(pageSizes, pageData.url )
        callback(pageData)
      },
      err => console.error(`Error: ${err}`)
    );
}

function pagePlacer(data, url){
    var pageSizes = []
    // var dualPage
    console.log(data)
  var nextPageSide = 'L'
  for (var i = 0; i < data.length; i++) {
      const height = data[i].height
      const width = data[i].width
      const ratio = height / width
    const uri = `${url}${i+1}.png`
      if(i === 0){
        pageSizes.push([{
          width: width,
          height: height,
          type: 'cover',
          uri: uri
        }])
      }else if(ratio < 1){ 
        pageSizes.push([{
          width: width,
          height: height,
          type: 'spread',
          uri: uri
        }])
        nextPageSide = 'L'
      } else if (nextPageSide == 'L'){
        pageSizes.push([{
          width: width,
          height: height,
          type: 'left',
          uri: uri
        }])
        nextPageSide = 'R'
      }else{
        pageSizes[pageSizes.length - 1].push({
          width: width,
          height: height,
          type: 'right',
          uri: uri
        })
        nextPageSide = 'L'
      }
  }
  return pageSizes
}



exports.genPDFCover = genPDFCover;
exports.renderPDF = renderPDF;
