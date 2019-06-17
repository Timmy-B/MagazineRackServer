const PDF2Pic = require("pdf2pic");
const fs = require("fs");

function genPDFCover(path, rackName, uid) {
    console.log("image")
    const dir = `./racks/${rackName}/${path}`
    console.log(dir)
    const pdf2pic = new PDF2Pic({
        density: 100,           // output pixels per inch
        savename: uid,          // output file name
        savedir: `./images/${rackName}`,    // output file location
        format: "jpg",          // output file format
        size: 800               // output size in pixels
    });

    if (!fs.existsSync(`./images/${rackName}/${uid}.jpg`)) {
        pdf2pic.convertBulk(dir, 1);
    }

}

exports.genPDFCover = genPDFCover;