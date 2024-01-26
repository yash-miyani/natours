const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel.js');
const AppError = require('../utils/appError.js');
const catchAsync = require('../utils/catchAsync.js');
const factory = require('../controllers/handleFactory.js');

// const mluterStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const mluterStorage = multer.memoryStorage();

const mluterFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), flase);
  }
};
const upload = multer({
  storage: mluterStorage,
  fileFilter: mluterFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res) => {
  // 1) Create user error if user POSTs password data
  if (req.body.passwrod || req.body.passwrodConfrim) {
    return next(
      new AppError(
        'This is is not for password updates. Pleasw use/ UpdateMyPassword',
        400,
      ),
    );
  }

  // 2) Update user document
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  //3) Update user document
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defind ! Please use /signup insted',
  });
};

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);
// DO NOT UPDATE Password this update query
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
