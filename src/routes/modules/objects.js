const express = require("express");
const db = require("../../modules/db");
const {isAccessRead} = require("../../modules/auth").gen("sites");

const router = express.Router();

module.exports = () => {
  router.get("/", isAccessRead(), async (req, res, next) => {
    try {
      await db.objects.list()
        .then(result => res.json({message: "ok", result}));
    } catch (error) {
      next(error);
    }
  });
  router.post("/byIds", isAccessRead("ids"), async (req, res, next) => {
    const items = req.body;
    try {
      await db.objects.byIds(items.ids)
        .then(result => res.json({message: "ok", result}));
    } catch (error) {
      next(error);
    }
  });
  return router;
};
