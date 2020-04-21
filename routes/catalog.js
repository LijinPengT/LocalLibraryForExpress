const express = require('express');

const router = express.Router();

// 导入控制器模块
const book_controller = require('../controllers/bookController');
const author_controller = require('../controllers/authorController');
const genre_controller = require('../controllers/genreController');
const book_instance_controller = require('../controllers/bookinstanceController');

/// 藏书路由 ///

// GET 获取藏书编目主页
router.get('/', book_controller.index);

// GET 请求添加新的藏书, 必须在显示藏书之前
router.get('/book/create', book_controller.book_create_get);

// POST 请求添加新的藏书
router.post('/book/create', book_controller.book_create_post);

// GET 请求删除藏书
router.get('/book/:id/delete', book_controller.book_delete_get);

// POST 请求删除藏书
router.post('/book/:id/delete', book_controller.book_delete_post);

// GET 请求更新藏书
router.get('/book/:id/update', book_controller.book_update_get);

// POST 请求更新藏书
router.post('/book/:id/update', book_controller.book_update_post);

// GET 请求藏书
router.get('/book/:id', book_controller.book_detail);

// GET 请求藏书完整列表
router.get('/books', book_controller.book_list);

/// 作者路由 ///

// GET 请求添加新的作者, 必须在显示作者之前
router.get('/author/create', author_controller.author_create_get);

// POST 请求添加新的作者
router.post('/author/create', author_controller.author_create_post);

// GET 请求删除作者
router.get('/author/:id/delete', author_controller.author_delete_get);

// POST 请求删除作者
router.post('/author/:id/delete', author_controller.author_delete_post);

// GET 请求更新作者
router.get('/author/:id/update', author_controller.author_update_get);

// POST 请求更新作者
router.post('/author/:id/update', author_controller.author_update_post);

// GET 请求作者
router.get('/author/:id', author_controller.author_detail);

// GET 请求作者完整列表
router.get('/authors', author_controller.author_list);

/// 藏书种类路由 ///

// GET 请求添加新的藏书种类, 必须在显示藏书种类之前
router.get('/genre/create', genre_controller.genre_create_get);

// POST 请求添加新的藏书种类
router.post('/genre/create', genre_controller.genre_create_post);

// GET 请求删除藏书种类
router.get('/genre/:id/delete', genre_controller.genre_delete_get);

// POST 请求删除藏书种类
router.post('/genre/:id/delete', genre_controller.genre_delete_post);

// GET 请求更新藏书种类
router.get('/genre/:id/update', genre_controller.genre_update_get);

// POST 请求更新藏书种类
router.post('/genre/:id/update', genre_controller.genre_update_post);

// GET 请求藏书种类
router.get('/genre/:id', genre_controller.genre_detail);

// GET 请求藏书种类完整列表
router.get('/genres', genre_controller.genre_list);

/// 藏书副本路由 ///

// GET 请求添加新的藏书副本, 必须在显示藏书副本之前
router.get('/bookinstance/create', book_instance_controller.bookinstance_create_get);

// POST 请求添加新的藏书副本
router.post('/bookinstance/create', book_instance_controller.bookinstance_create_post);

// GET 请求删除藏书副本
router.get('/bookinstance/:id/delete', book_instance_controller.bookinstance_delete_get);

// POST 请求删除藏书副本
router.post('/bookinstance/:id/delete', book_instance_controller.bookinstance_delete_post);

// GET 请求更新藏书副本
router.get('/bookinstance/:id/update', book_instance_controller.bookinstance_update_get);

// POST 请求更新藏书副本
router.post('/bookinstance/:id/update', book_instance_controller.bookinstance_update_post);

// GET 请求藏书副本
router.get('/bookinstance/:id', book_instance_controller.bookinstance_detail);

// GET 请求藏书副本完整列表
router.get('/bookinstances', book_instance_controller.bookinstance_list);

module.exports = router;