const fs = require('fs-extra');
const path = require("path");
const glob = require('glob');

//movers
function moveFile(srcpath, dstpath){
    fs.move(srcpath, dstpath)
        .then(() => {
            console.log('success!')
        })
        .catch(err => {
            console.error(err)
        })

}


//removers
function removeFile(path){
    const path = './file.txt'
    fs.remove(path, err => {
        if (err) return console.error(err)

        console.log('success!')
    })
}

//creators



function libraryScan(rack) {
    glob("**/", {
        cwd: './racks/Magz'
    }, function (er, folders) {
        folders.forEach(function (folder) {
            var folderName = folder.substring(0, folder.lastIndexOf('/'));
            if (folderName.includes('/')) {
                console.log("series:", path.basename(folder))
                filesInFolder(folder)
            } else {
                console.log("publisher:", path.basename(folder))
            }
        })
    })
}


function filesInFolder(folder) {
    var parent = path.basename(folder);

    glob("*.*", {
        cwd: './racks/Magz/' + folder
    }, function (er, files) {
        files.forEach(function (file) {
            console.log(file)
        })
    })

}


exports.libraryScan = libraryScan;
