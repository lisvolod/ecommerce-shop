import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Назва товару є обов\'язковою'],
      trim: true,
      minlength: [3, 'Назва має бути не менше 3 символів'],
      maxlength: [200, 'Назва має бути не більше 200 символів']
    },
    description: {
      type: String,
      required: [true, 'Опис товару є обов\'язковим'],
      trim: true,
      minlength: [10, 'Опис має бути не менше 10 символів'],
      maxlength: [2000, 'Опис має бути не більше 2000 символів']
    },
    price: {
      type: Number,
      required: [true, 'Ціна є обов\'язковою'],
      min: [0, 'Ціна не може бути від\'ємною']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Знижка не може бути від\'ємною'],
      max: [100, 'Знижка не може перевищувати 100%']
    },
    stock: {
      type: Number,
      required: [true, 'Кількість на складі є обов\'язковою'],
      min: [0, 'Кількість не може бути від\'ємною'],
      default: 0
    },
    image: {
      type: String,
      required: [true, 'Головне зображення є обов\'язковим'],
      trim: true
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function(arr) {
          return arr.length <= 5;
        },
        message: 'Максимум 5 додаткових зображень'
      }
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Категорія є обов\'язковою']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Віртуальне поле - фінальна ціна зі знижкою
ProductSchema.virtual('finalPrice').get(function () {
  if (this.discount > 0) {
    return Math.round(this.price * (1 - this.discount / 100));
  }
  return this.price;
});

// Віртуальне поле - чи є товар в наявності
ProductSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

// Індекс для пошуку по назві та опису
ProductSchema.index({ name: 'text', description: 'text' });

// Middleware для оновлення productCount в категорії
import Category from './Category.js';

// Після створення товару - збільшити productCount
ProductSchema.post('save', async function(doc) {
  if (doc.category) {
    await Category.findByIdAndUpdate(doc.category, {
      $inc: { productCount: 1 }
    });
  }
});

// Після видалення товару - зменшити productCount
ProductSchema.post('findOneAndDelete', async function(doc) {
  if (doc && doc.category) {
    await Category.findByIdAndUpdate(doc.category, {
      $inc: { productCount: -1 }
    });
  }
});

// При оновленні категорії товару - оновити productCount в обох категоріях
ProductSchema.pre('findOneAndUpdate', async function() {
  const docToUpdate = await this.model.findOne(this.getQuery());
  if (docToUpdate) {
    this._oldCategory = docToUpdate.category;
  }
});

ProductSchema.post('findOneAndUpdate', async function(doc) {
  if (doc && this._oldCategory && doc.category) {
    // Якщо категорія змінилась
    if (this._oldCategory.toString() !== doc.category.toString()) {
      // Зменшити в старій категорії
      await Category.findByIdAndUpdate(this._oldCategory, {
        $inc: { productCount: -1 }
      });
      // Збільшити в новій категорії
      await Category.findByIdAndUpdate(doc.category, {
        $inc: { productCount: 1 }
      });
    }
  }
});

const Product = mongoose.model('Product', ProductSchema);

export default Product;