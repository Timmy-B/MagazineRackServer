const fs = require('fs-extra');
const path = require("path");
const glob = require('glob');
const dbOps = require('./dbOps');
//movers
function moveFile(srcpath, dstpath) {
    fs.move(srcpath, dstpath)
        .then(() => {
            console.log('success!')
        })
        .catch(err => {
            console.error(err)
        })

}


//removers
function removeFile(path) {
    const path = './file.txt'
    fs.remove(path, err => {
        if (err) return console.error(err)

        console.log('success!')
    })
}

//creators



// function libraryScan(rack) {
//     glob("**/", {
//         cwd: './racks/Magz'
//     }, function (er, folders) {
//         folders.forEach(function (folder) {
//             var folderName = folder.substring(0, folder.lastIndexOf('/'));
//             if (folderName.includes('/')) {
//                 console.log("series:", path.basename(folder))
//                 filesInFolder(folder)
//             } else {
//                 console.log("publisher:", path.basename(folder))
//             }
//         })
//     })
// }


// function filesInFolder(folder) {
//     var parent = path.basename(folder);

//     glob("*.*", {
//         cwd: './racks/Magz/' + folder
//     }, function (er, files) {
//         files.forEach(function (file) {
//             console.log(file)
//         })
//     })

// }

function libraryScan(rackID) {
    console.log("scanning id",rackID)
    const rackPath = dbOps.rackPath(rackID)
    glob("**/", {
        cwd: `./racks/${rackPath}`
    }, function (er, folders) {
        folders.forEach(function (folder) {
            var folderName = folder.substring(0, folder.lastIndexOf('/'));
            if (folderName.includes('/')) {
                var publisher = folder.split('/')[0]
                var series = path.basename(folder);
                dbOps.createSeries(series, publisher, rackPath)
                // filesInFolder(folderName)
                filesInFolder(rackPath, folder, publisher, series)

            } else {
                console.log("publisher:", path.basename(folder))
                dbOps.createPublisher(path.basename(folder), rackPath);
            }
        })
    })
}

function filesInFolder(rackPath, folder, publisher, series) {

    glob("*.*", {
        cwd: `./racks/${rackPath}/${folder}`
    }, function (er, files) {
        files.forEach(function (file) {
            const path = `/${folder}${file}`
            const params = { rackPath: rackPath, itemInfo: { name: file, publisher: publisher, description: '', series: series, path: path, publish_date: '' } }
            dbOps.createItem(params)
        })
    })

}



exports.libraryScan = libraryScan;
