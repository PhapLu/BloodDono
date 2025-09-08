import multer from "multer"

const uploadDisk = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "./src/public/images/upload")
        },
        filename: function (req, file, cb) {
            cb(null, `${Date.now()}-${file.originalname}`)
        },
    }),
})

const uploadMemory = multer({
    storage: multer.memoryStorage(),
})

const uploadFields = uploadMemory.fields([
    { name: "files", maxCount: 5 },
])

const uploadMultiple = uploadDisk.array("files", 5) // Adjust the field name and maxCount as needed

export { uploadDisk, uploadMemory, uploadFields, uploadMultiple }
