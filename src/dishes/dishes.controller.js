const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);

    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404,
        message: `Dish does not exist: ${dishId}`,
    });
}

function idMatches(req, res, next) {
    const { data: {id} = {} } = req.body;
    const { dishId } = req.params;
    if (id === dishId || id === '' || id === undefined || id === null) {
        return next();
    }
    next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Router : ${dishId}`,
    });
}

// middleware for create, update
function hasName(req, res, next) {
    const { data: {name} = {} } = req.body;
    if (name) {
        return next();
    }
    next({
        status: 400,
        message: "A 'name' property is required.",
    });
}

// middleware for create, update
function hasDescription(req, res, next) {
    const { data: {description} = {} } = req.body;
    if (description) {
        return next();
    }
    next({
        status: 400,
        message: "A 'description' is required.",
    });
}

// middleware for create, update
function hasPrice(req, res, next) {
    const { data: {price} = {} } = req.body;
    if (price) {
        return next();
    }
    next({
        status: 400,
        message: "A 'price' property is required.",
    });
}

// middleware for create, update
function priceValid(req, res, next) {
    const { data: {price} = {} } = req.body;
    if (price > 0 && typeof(price) === 'number') {
        return next();
    }
    next({
        status: 400,
        message: "A valid price is required.",
    });
}

// middleware for create, update
function hasImage(req, res, next) {
    const { data: {image_url} = {} } = req.body;
    if (image_url) {
        return next();
    }
    next({
        status: 400,
        message: "An 'image_url' property is required."
    })
}

function create(req, res) {
    const { data: {name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

function read(req, res) {
    res.json({ data: res.locals.dish });
}

function list(req, res) {
    res.json({ data: dishes });
}

function update(req, res) {
    const dish = res.locals.dish;
    const foundDish = dishes.find((desiredDish) => desiredDish.id === dish.id);
    const { data: {id, name, description, price, image_url} = {} } = req.body;

    if (foundDish.id) {
        dish.id = id;
        dish.name = name;
        dish.description = description;
        dish.price = price;
        dish.image_url = image_url;
    }
    res.json({ data: foundDish });
}

module.exports = {
    create: [hasName, hasDescription, hasPrice, priceValid, hasImage, create],
    list,
    read: [dishExists, read],
    update: [dishExists, idMatches, hasName, hasDescription, hasPrice, priceValid, hasImage, update],
}