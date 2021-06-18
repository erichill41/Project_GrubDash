const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);

    if (foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404,
        message: `Order does not exist: ${orderId}`,
    });
}

function idMatches(req, res, next) {
    const { data: {id} = {} } = req.body;
    const { orderId } = req.params;
    if (id === orderId || id === '' || id === undefined || id === null) {
        return next();
    }
    next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route ${orderId}`,
    });
}

function hasDeliver(req, res, next) {
    const { data: {deliverTo} = {} } = req.body;
    if (deliverTo) {
        return next();
    }
    next({
        status: 400,
        message: `Order must include a deliverTo`,
    });
}

function hasNumber(req, res, next) {
    const { data: {mobileNumber} = {} } = req.body;
    if (mobileNumber) {
        return next();
    }
    next({
        status: 400,
        message: `Order must include a mobileNumber.`,
    });
}

function hasStatus(req, res, next) {
    const { data: {status} = {} } = req.body;
    const validStatus = ['pending','preparing','out-for-delivery'];
    if (validStatus.includes(status)) {
        return next();
    }
    next({
        status: 400,
        message: 'Order must have a status of pending, preparing, out-for-delivery, delivered',
    });
}

function hasDishes(req, res, next) {
    const { data: {dishes} = {} } = req.body;
    if (dishes && dishes.length > 0 && Array.isArray(dishes)) {
        res.locals.dishes = dishes;
        return next();
    }
    next({
        status: 400,
        message: 'Order must include a dish',
    });
}

// fix validQuantity
function validQuantity(req, res, next) {
    const dishes = res.locals.dishes;
    console.log(dishes);
    
    for (let i = 0; i < dishes.length; i++) {
        if (
            !dishes[i].quantity ||
            !(dishes[i].quantity > 0) ||
            !Number.isInteger(dishes[i].quantity) 
        ) {
            return next({
                status: 400,
                message: `Dish ${i} must have a quantity that is an integer greater than 0`,
            });
        }
    }
    next();
}

function create(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

function update(req, res, next) {
    const order = res.locals.order;
    const foundOrder = orders.find((desiredOrder) => desiredOrder.id === order.id);
    const { data: {deliverTo, mobileNumber, status, dishes} = {} } = req.body;

    if (foundOrder) {
        order.deliverTo = deliverTo;
        order.mobileNumber = mobileNumber;
        order.status = status;
        order.dishes = dishes;
    }
    res.json({ data: foundOrder });
}

function read(req, res) {
    res.json({ data: res.locals.order });
}

function list(req, res) {
    res.json({ data: orders });
}

function destroy(req, res, next) {
    const { orderId } = req.params;
    const order = res.locals.order;
    const index = orders.find((order) => order.id === Number(orderId));
    const deletedOrders = orders.splice(index, 1);
    if (order.status === 'pending') {
        res.sendStatus(204);
    }
    next({
        status: 400,
        message: 'An order cannot be deleted unless it is pending',
    });
    
}

module.exports = {
    create: [hasDeliver, hasNumber, hasDishes, validQuantity, create],
    list,
    read: [orderExists, read],
    update: [orderExists, idMatches, hasDeliver, hasStatus, hasNumber, hasDishes, validQuantity, update],
    delete: [orderExists, destroy],
}