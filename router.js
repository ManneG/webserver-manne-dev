const { Router } = require('express');

const router = Router();

router.get("/info",(req, res) => {
    res.end(`You are (${req.ip}) visiting ${req.hostname} using ${req.protocol}.`);
});

module.exports = router;