const AppError = require("../utils/apiError");
const catchAsync = require("../utils/catchAsync");


exports.deleteOne = Model => {
  catchAsync(async (req, res, next) => {



    const doc = await Model.findByIdAndDelete(req.params.id, err => {
      if (err) {
        return next(new AppError('No id found in DB', 404))

      }
    });


    res.status(200).json({
      status: 'success',
      data: {
        doc
      }
    })

  });
}






