const Genre = require('../models/genre');
const Book = require('../models/book');

const async = require('async');
const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');


// 显示完整的藏书种类列表
exports.genre_list = (req, res) => {
    Genre.find()
        .sort([['name', 'ascending']])
        .exec(function(err, list_genres){
            if (err) {return next(err);}
            //Successful, so render
            res.render('genre_list', {title:'Genre List', genre_list: list_genres});
        });
};

// 为每位藏书种类显示详细信息的页面
exports.genre_detail = (req, res, next) => {
    
    async.parallel({
        genre: function(callback){
            Genre.findById(req.params.id)
                .exec(callback);
        },
        genre_books: function(callback){
            Book.find({'genre': req.params.id})
                .exec(callback);
        },
    }, function(err, results){
        if(err){return next(err);}
        if(results.genre==null){
            let err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        //Successful, so render
        res.render('genre_detail', {title:'Genre Detail', genre: results.genre, genre_books: results.genre_books});
    });
};

// 由GET显示创建藏书种类的表单
exports.genre_create_get = (req, res, next) => {
    res.render('genre_form', {title:'Create Genre'});
};

// 由POST处理藏书种类创建操作
exports.genre_create_post = [
    body('name', 'Genre name required').isLength({min: 1}).trim(),

    sanitizeBody('name').trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        let genre = new Genre(
            {name: req.body.name}
        );

        if(!errors.isEmpty()){
            res.render('genre_form', {title: 'Create Genre', genre: genre, errors: errors.array()});
            return;
        } else {
            Genre.findOne({'name': req.body.name})
                .exec(function(err, found_genre){
                    if(err){return next(err);}
                    if(found_genre){
                        res.redirect(found_genre.url);
                    } else {
                        genre.save(function(err){
                            if(err){return next(err);}

                            res.redirect(genre.url);
                        });
                    }
                });
        }
    }
];

// 由GET显示删除藏书种类的表单
exports.genre_delete_get = (req, res) => {
    res.send('delete');
};

// 由POST处理藏书种类删除操作
exports.genre_delete_post = (req, res) => {
    res.send('genre post delete');
};

// 由GET显示更新藏书种类的表单
exports.genre_update_get = (req, res) => {
    res.send('genre get update');
};

// 由POST处理藏书种类更新操作
exports.genre_update_post = (req, res) => {
    res.send('genre update');
};