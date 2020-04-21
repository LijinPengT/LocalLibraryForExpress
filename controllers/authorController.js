const Author = require('../models/author');

const Book = require('../models/book');
const async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// 显示完整的作者列表
exports.author_list = (req, res, next) => {
    Author.find()
    .sort([['family_name', 'ascending']])
    .exec(function(err, list_authors){
        if(err){return next(err);}
        //Successful, so render
        res.render('author_list', {title:'Author List', author_list: list_authors});
    });
};

// 为每位作者显示详细信息的页面
exports.author_detail = (req, res, next) => {
    
    async.parallel({
        author: function(callback){
            Author.findById(req.params.id)
                .exec(callback)
        },
        authors_books: function(callback){
            Book.find({'author':req.params.id}, 'title summary')
                .exec(callback)
        },
    }, function(err, results){
        if(err){return next(err);}
        if(results.author==null){
            let err = new Error('Author nor found');
            err.status = 404;
            return next(err);
        }
        //Successful, so render
        res.render('author_detail', {title: 'Author Detail', author: results.author, author_books: results.authors_books});
    });
};

// 由GET显示创建作者的表单
exports.author_create_get = (req, res, next) => {
    res.render('author_form', {title: 'Create Author'});
};

// 由POST处理作者创建操作
exports.author_create_post = [
    //验证区域
    body('first_name').isLength({min: 1}).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').isLength({min: 1}).trim().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({checkFalsy: true}).isISO8601(),
    body('date_of_death', 'Invalid date of death').optional({checkFalsy: true}).isISO8601(),
    
    //清理区域
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('family_name').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    // 验证和处理完毕后进行请求处理
    (req, res, next) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            res.render('author_form', {title: 'Create Author', author: req.body, errors: errors.array()});
            return;
        } else {
            let author = new Author({
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death
            });

            author.save(function(err){
                if(err){return next(err);}
                //Successful-redirect to new author record
                res.redirect(author.url)
            });
        }
    }
];

// 由GET显示删除作者的表单
exports.author_delete_get = (req, res, next) => {
    async.parallel({
        author: function(callback){
            Author.findById(req.params.id).exec(callback)
        },
        authors_books: function(callback){
            Book.find({'author': req.params.id}).exec(callback)
        },
    }, function(err, results){
        if(err){return next(err);}
        if(results.author==null){
            res.redirect('/catalog/authors');
        }

        // Successful, so render
        res.render('author_delete', {title: 'Delete Author', author: results.author, author_books: results.authors_books});
    });
};

// 由POST处理作者删除操作
exports.author_delete_post = (req, res, next) => {
    async.parallel({
        author: function(callback){
            Author.findById(req.body.authorid).exec(callback)
        },
        authors_books: function(callback){
            Book.find({'author': req.body.authorid}).exec(callback)
        },
    }, function(err, results){
        if(err){return next(err);}
        // Success
        if(results.authors_books.length>0){
            // Author has books. Render in same way as for GET route
            res.render('author_delete', {title: 'Delete Author', author: results.author, author_books: results.authors_books});
            return;
        } else {
            //Author has no books. Delete object and redirect to the list of authors.
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err){
                if(err){return next(err);}
                //Success-go to author list
                res.redirect('/catalog/authors')
            });
        }
    });
};

// 由GET显示更新作者的表单
exports.author_update_get = (req, res) => {
    res.send('get update');
};

// 由POST处理作者更新操作
exports.author_update_post = (req, res) => {
    res.send('update');
};