const PDF2Pic = require("pdf2pic");
var PDFImage = require("pdf-image").PDFImage;


function genPDFCover(path, uid){
    const dir = `./racks/test_123${path}`
    console.log(dir)
    const pdf2pic = new PDF2Pic({
        density: 100,           // output pixels per inch
        savename: uid,   // output file name
        savedir: "./images",    // output file location
        format: "jpg",          // output file format
        size: 600               // output size in pixels
    });

    pdf2pic.convertBulk(dir, 1).then((resolve) => {
        console.log("image converter successfully!");

        return resolve;
    });

    // const dir = `./racks/test_123${path}`
    // console.log(dir)
    // var pdfImage = new PDFImage(dir); 
    // pdfImage.convertPage(0).then(function (imagePath) {
    //     // 0-th page (first page) of the slide.pdf is available as slide-0.png
    //     console.log(imagePath);
    //     fs.existsSync("/tmp/slide-0.png") // => true
    //     console.log("converted")
    // });
}

exports.genPDFCover = genPDFCover;

