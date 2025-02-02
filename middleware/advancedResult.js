const advancedResults = (model, populate) => async (req, res, next) => {
    let query;

    // make a copy of an object
    const reqQuery = { ...req.query }
    //Create Query String

    //Fields to exclude
    const removeFields = ['select', "sort", "page", "limit"]
    //Loop over removedFields and delete them from the req.query
    removeFields.forEach((param) => delete reqQuery[param])

    let queryStr = JSON.stringify(reqQuery)

    //Create Operators like ($gt,$gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)
    //Finding resource
    query = model.find(JSON.parse(queryStr))


    //Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(",").join(" ")
        query = query.select(fields)
    }

    //Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ")
        query = query.sort(sortBy)
    } else {
        query = query.sort('-createdAt')
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1
    //100 per-page
    const limit = parseInt(req.query.limit, 10) || 25
    const startIndex = (page - 1) * limit
    query = query.skip(startIndex).limit(limit)

    const endIndex = page * limit
    const total = await model.countDocuments()

    if (populate) {
        query = query.populate(populate)
    }

    //Executing query
    const result = await query
    //Pagination Result
    const pagination = {}
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.advancedResults = {
        success: true,
        count: result.length,
        pagination,
        data: result
    }

    next()

}


module.exports = advancedResults