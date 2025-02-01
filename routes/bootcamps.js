const express = require("express")
const router = express.Router()


router.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "Show all bootcamps!" })
})

router.post("/", (req, res) => {
    res.status(201).json({ success: true, message: "create a new bootcamp" })
})

router.get("/:id", (req, res) => {
    const { id } = req.params
    res.status(200).json({
        success: true,
        message: `Get Bootcamp ${id}`
    })
})

router.put("/:id", (req, res) => {
    const { id } = req.params
    res.status(200).json({ success: true, message: `Bootcamp ${id} has been updated successuffly!` })
})

router.delete("/:id", (req, res) => {
    const { id } = req.params
    res.status(200).json({
        success: true,
        message: `Delete bootcamp ${id}`
    })
})


module.exports = router