const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GenreSchema = new Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 100,
    }
});

// 虚拟属性: 图书类型URL
GenreSchema
    .virtual('url')
    .get(function(){
        return '/catalog/genre/' + this._id;
    });

// 导出类型
module.exports = mongoose.model('Genre', GenreSchema);