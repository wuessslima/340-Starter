const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
    const nav = await utilities.getNav(req);
    req.flash("notice", "This is a flash message.");
    res.render("index", {
        title: "Home", 
        nav,
        user: req.user
    });
}

module.exports = baseController