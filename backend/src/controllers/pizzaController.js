const { Pizza } = require("../models");
const DEFAULT_LIMIT = 10;

const getPizzas = async (req, res) => {
  try {
    const isVeg = parseBoolean(req.query.veg);
    const sortBy = req.query.sortBy === 'price' ? 'price' : 'createdAt';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT);

    const filter = {};
    if (isVeg !== undefined) {
      filter.isVegetarian = isVeg;
    }
    const totalCount = await Pizza.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    const skip = (page - 1) * limit;

    const pizzas = await Pizza.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
    
    res.json({
        pizzas,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          limit,
        },
      });
    } catch (err) {
      // console.error("Err ",err);
      res.status(500).json({msg:"Internal server err"});
    }
};

const createPizza = async (req, res) => {
  const pizza = new Pizza(req.body);
  await pizza.save();
  res.status(201).json(pizza);
};

module.exports = {
  getPizzas,
  createPizza,
};
