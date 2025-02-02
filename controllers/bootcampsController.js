const Bootcamp = require("../models/Bootcamp")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/async")
const geocoder = require("../utils/geocoder")
const path = require("path")
//@desc     create a new bootcamp
//@route    POST /api/v1/bootcamps
//@access   Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body)
    if (bootcamp) {
        res.status(201).json({
            success: true,
            data: bootcamp
        })
    }
})

//@desc     Get all the bootcamps
//@route    GET /api/v1/bootcamps
//@access   Do you need to be loggedin to have access????NO! this is poublic
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults)
})

//@desc     Get single bootcamp
//@route    GET /api/v1/bootcamps/:id
//@access   Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const bootcamp = await Bootcamp.findById(id)
    if (!bootcamp) {
        //if we do not put return, we will face the error, the headers are alreadu set..

        return next(new ErrorResponse(`Bootcamp with ID of ${id} not found!`, 404))
    }
    res.status(200).json({
        success: true,
        data: bootcamp
    })
})



//@desc     Update the bootcamp
//@route    PUT /api/v1/bootcamps/:id
//@access   Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const bootcamp = await Bootcamp.findByIdAndUpdate(id, req.body, {
        runValidators: true,
        new: true
    })

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp with ID of ${id} not found!`, 404))
    }

    res.status(200).json({
        success: true,
        data: bootcamp
    })
})


//@desc     Delete Bootcamp
//@route    DELETE /api/v1/bootcamp/:id =>we are dealing with singel resource
//@access   Privates
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const bootcamp = await Bootcamp.findById(id)
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp with ID of ${id} not found!`, 404))
    }
    bootcamp.remove()
    res.status(200).json({
        success: true
    })
})




//@desc     Get Bootcamps within a radius
//@route    GET /api/v1/bootcamp/radius/:zipcode/:distance
//@access   Privates
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    //ZipCode is the location, the user wants to search around!
    //distance is the raidus within which to find bootcamps
    const { zipcode, distance } = req.params
    //first we shopul;d covnert zipcode into GPS coordinates (latitude, longitude)
    //ex=> zipcode 12345 might return somethind like [123.123,4556.454]
    //now we should search Radis in Radians.
    //MongoDB uses radians for geospatial queries, so we need to convert miles to radians.
    //Get the lat and longitude fro  geocide
    const loc = await geocoder.geocode(zipcode)
    const lat = loc[0].latitude
    const lng = loc[0].longitude

    //we have to calculate the radius using Radians
    //Divide distance by radius of Earch
    //Earth Radius  = 3,963 mi / 6/378
    //$geowithin=> Find documents wihin speciofic area
    //$centerSphere=> it will create a circular search arer based on the coordinates...
    //رادیان واحد مسافت بر حسب واحد شعاع (radius) است 
    const radius = distance / 3963
    const bootcamps = await Bootcamp.find({
        location: { $geowithin: { $centerSphere: [[lng, lat], radius] } }
    })

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })

})






//@desc     upload photo for the bootcamp
//@route    PUT /api/v1/bootcamp/:id/photo
//@access   Privates
exports.bootcampFotoUpload = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const bootcamp = await Bootcamp.findById(id)
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp with ID of ${id} not found!`, 404))
    }
    if (!req.files) {
        return next(new ErrorResponse("Please upload a file", 400))
    }
    const files = req.files
    files.file = files.undefined
    const { file } = files


    //Make sure that the image is a photo
    //check the mimetype
    if (!file.mimetype.startsWith("image")) {
        return next(new ErrorResponse(`Please Upload an Image file`, 400))
    }

    //check the file size.. if oyu are susing Nginx you will have limit regarding the size

    //Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400))
    }
    //there is a funciton called mv=move to directory
    //create Custom filename

    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err)
            return next(new ErrorResponse(`Problem with file upload`, 500))
        }

        //inser the file name into the database
        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })
    })

    res.status(200).json({
        success: true,
        data: file.name
    })




})
