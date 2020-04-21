const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// 显示完整的书本实例列表
exports.bookinstance_list = (req, res, next) => {
    BookInstance.find()
        .populate('book')
        .exec(function(err, list_bookinstances){
            if(err){return next(err);}
            //Successful, so render
            res.render('bookinstance_list', {title:'Book Instance List', bookinstance_list: list_bookinstances});
        });
};

// 为每位书本实例显示详细信息的页面
exports.bookinstance_detail = (req, res, next) => {
    
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function(err, bookinstance){
            if(err){return next(err);}
            if(bookinstance==null){
                let err = new Error('Book copy not found');
                err.status = 404;
                return next(err);
            }
            //Successful, so render
            res.render('bookinstance_detail', {title: 'Book', bookinstance: bookinstance});
        });
};

// 由GET显示创建书本实例的表单
exports.bookinstance_create_get = (req, res, next) => {
    Book.find({}, 'title')
        .exec(function(err, books){
            if(err){return next(err);}
            res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books});
        });
};

// 由POST处理书本实例创建操作
exports.bookinstance_create_post = (req, res) => [
    
    // 验证区域
    body('book', 'Book must be specified').isLength({min: 1}).trim(),
    body('imprint', 'Imprint must be specified').isLength({min: 1}).trim(),
    body('due_back', 'Invalid date').optional({checkFalsy: true}).isISO8601(),

    // 数据清理区域
    sanitizeBody('book').trim().escape(),
    sanitizeBody('imprint').trim().escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),

    // 验证,清理后处理请求
    (req, res, next) => {
        const errors = validationResult(req);

        var bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        });

        if(!errors.isEmpty()){
            Book.find({}, 'title')
                .exec(function(err, books){
                    if(err){return next(err);}
                    res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance: bookinstance});
                });
            return;
        } else {
            bookinstance.save(function(err){
                if(err) {return next(err);}
                res.redirect(bookinstance.url);
            });
        }
    }
];

// 由GET显示删除书本实例的表单
exports.bookinstance_delete_get = (req, res) => {
    res.send('bookinstance delete');
};

// 由POST处理书本实例删除操作
exports.bookinstance_delete_post = (req, res) => {
    res.send('bookinstance post delete');
};

// 由GET显示更新书本实例的表单
exports.bookinstance_update_get = (req, res) => {
    res.send('bookinstance get update');
};

// 由POST处理书本实例更新操作
exports.bookinstance_update_post = (req, res) => {
    res.send('bookinstance update post');
};