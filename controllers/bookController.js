const Book = require('../models/book');

// 显示站点欢迎页面
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');
var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.index = (req, res) => {

    async.parallel({
        book_count: function(callback) {
            Book.countDocuments({},callback);
        },
        book_instance_count: function(callback) {
            BookInstance.countDocuments({}, callback);
        },
        book_instance_available_count: function(callback) {
            BookInstance.countDocuments({status: 'Available'}, callback);
        },
        author_count: function(callback) {
            Author.countDocuments({}, callback);
        },
        genre_count: function(callback) {
            Genre.countDocuments({}, callback);
        },
    }, function(err, results) {
        res.render('index', {title: 'Local Library Home', error: err, data: results});
    });
};

// 显示完整的作者列表
exports.book_list = (req, res, next) => {
    Book.find({}, 'title author')
        .populate('author')
        .exec(function(err, list_books) {
            if(err){return next(err);}
            //Successful, so render
            res.render('book_list', {title: 'Book List', book_list: list_books});
        });
};

// 为每位作者显示详细信息的页面
exports.book_detail = (req, res, next) => {
    
    async.parallel({
        book: function(callback){
            Book.findById(req.params.id)
                .populate('author')
                .populate('genre')
                .exec(callback);
        },
        book_instance: function(callback){
            BookInstance.find({'book': req.params.id})
                .exec(callback);
        },
    },function(err, results){
        if (err) {return next(err);}
        if(results.book==null){
            let err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        //Successful, so render
        res.render('book_detail', {title: 'Title', book: results.book, book_instances: results.book_instance});
    });
};

// 由GET显示创建作者的表单
exports.book_create_get = (req, res, next) => {
    async.parallel({
        authors: function(callback){
            Author.find(callback);
        },
        genres: function(callback){
            Genre.find(callback);
        },
    }, function(err, results){
        if(err){return next(err);}
        res.render('book_form', {title: 'Create Book', authors: results.authors, genres: results.genres});
    });
};

// 由POST处理作者创建操作
exports.book_create_post = [
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre === 'undefined'){
                req.body.genre = [];
            }else{
                req.body.genre=new Array(req.body.genre);
            }
        }
        next();
    },

    // 验证区域
    body('title', 'Title must not be empty.').isLength({min: 1}).trim(),
    body('author','Author must not be empty.').isLength({min: 1}).trim(),
    body('summary','Summary must not be empty.').isLength({min: 1}).trim(),
    body('isbn','ISBN must not be empty.').isLength({min: 1}).trim(),

    // 数据清理区域
    sanitizeBody('*').trim().escape(),
    sanitizeBody('genre.*').escape(),

    // 数据验证和清理后对请求进行处理
    (req, res, next) => {

        // 从请求中获取验证的错误信息
        const errors = validationResult(req);

        // 使用转义后的,整齐的数据创建书本
        var book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
        });

        if(!errors.isEmpty()){
            // 有错误的话, 带着错误提示信息重新渲染表单

            // 获取所有的作者和藏书分类
            async.parallel({
                authors: function(callback){
                    Author.find(callback);
                },
                genres: function(callback){
                    Genre.find(callback);
                },
            }, function(err, results){
                if(err){return next(err);}

                // 标记我们选择的藏书分类
                for(let i = 0; i < results.genres.length; i++){
                    if(book.genre.indexOf(results.genres[i]._id) > -1){
                        results.genres[i].checked='true';
                    }
                }
                res.render('book_form',{title: 'Creat Book', authors: results.authors, genres: results.genres, book: book, errors: errors.array()});
            });
            return;
        } else {
            // 表单数据正确, 保存书本
            book.save(function(err){
                if(err){return next(err);}
                res.redirect(book.url);
            });
        }
    }
];

// 由GET显示删除作者的表单
exports.book_delete_get = (req, res) => {
    res.send('book delete');
};

// 由POST处理作者删除操作
exports.book_delete_post = (req, res) => {
    res.send('post book delete');
};

// 由GET显示更新作者的表单
exports.book_update_get = (req, res, next) => {
    
    // Get book, authors and genres for form.
    async.parallel({
        book: function(callback){
            Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        authors: function(callback){
            Author.find(callback);
        },
        genres: function(callback){
            Genre.find(callback);
        },
    }, function(err, results){
        if(err) {return next(err);}
        if(results.book==null){
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        //Success.
        // Mark our selected genres as checked.
        for(let all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++){
            for(let book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++){
                if(results.genres[all_g_iter]._id.toString()==results.book.genre[book_g_iter]._id.toString()){
                    results.genres[all_g_iter].checked='true';
                }
            }
        }
        res.render('book_form', {title: 'Update Book', authors: results.authors, genres: results.genres, book: results.book});
    });
};

// 由POST处理作者更新操作
exports.book_update_post = [

    // Convert teh genre to an array
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined'){
                req.body.genre=[];
            }else{
                req.body.genre=new Array(req.body.genre);
            }
        }
        next();
    },

    // Validate fields
    body('title', 'Title must not be empty').isLength({min: 1}).trim(),
    body('author', 'Author must not be empty').isLength({min: 1}).trim(),
    body('summary', 'Summary must not be empty').isLength({min: 1}).trim(),
    body('isbn', 'ISBN must not be empty').isLength({min: 1}).trim(),

    // Sanitize fields
    sanitizeBody('title').trim().escape(),
    sanitizeBody('author').trim().escape(),
    sanitizeBody('summary').trim().escape(),
    sanitizeBody('isbn').trim().escape(),
    sanitizeBody('genre').trim().escape(),

    //Process request after validation and sanitization
    (req, res, next) => {

        const errors = validationResult(req);

        var book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            _id: req.params.id
        });

        if(!errors.isEmpty()){
            async.parallel({
                authors: function(callback){
                    Author.find(callback);
                },
                genres: function(callback){
                    Genre.find(callback);
                },
            }, function(err, results){
                if(err){return next(err);}

                for(let i = 0; i < results.genres.length; i++){
                    if(book.genre.indexOf(results.genres[i]._id)>-1){
                        results.genres[i].checked='true';
                    }
                }
                res.render('book_form', {title: 'Update Book', authors: results.authors, genres: results.genres, book: book, errors: errors.array()});
            });
            return;
        }else{
            Book.findByIdAndUpdate(req.params.id, book, {}, function(err, thebook){
                if(err){return next(err);}
                res.redirect(thebook.url);
            });
        }
    }

];