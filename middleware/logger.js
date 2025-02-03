

//@desc     Logs request to the console
const logger = (req, res, next) => {
    const { method, query: queryParams, baseUrl: path } = req
    // setImmediate is a function in Node.js that schedules a callback function to be executed on the next iteration of the event loop, right after the current execution phase is complete.
    //     How It Works
    // setImmediate callbacks are executed after I / O operations but before timers(setTimeout / setInterval).
    // It ensures that the function inside it runs as soon as possible after the main script execution.
    // 
    // 
    // 
    //  // Purpose:
    // // Logs request details asynchronously without blocking the main execution.
    // Ensures logging happens after the middleware finishes processing, avoiding potential performance bottlenecks.
    //logging request
    setImmediate(async () => {
        const requestLog = {
            method,
            path,
            queryParams,
            body: req.body
        }
        console.log(`Request: ${JSON.stringify(requestLog)}`)
    })

    /// extracting respons's body
    let body = {}
    const chunks = []
    const oldEnd = res.end
    res.end = (chunk) => {
        if (chunk) {
            chunks.push(Buffer.from(chunk))
        }
        body = Buffer.concat(chunks).toString("utf8")
        return oldEnd.call(res, body)
    }

    res.on("finish", async () => {
        return setTimeout(async () => {
            const responseLogInfop = {
                method,
                path,
                statusCode: res.statusCode
            }
            console.log(`Respone:${JSON.stringify(responseLogInfop)}`)
        }, 0)
    })

    next()
}


module.exports = logger



//PG ADMIN Postgress is something like mongodb compass