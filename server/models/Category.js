import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Назва категорії є обов\'язковою'],
      unique: true,
      trim: true,
      minlength: [2, 'Назва має бути не менше 2 символів'],
      maxlength: [50, 'Назва має бути не більше 50 символів']
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Опис має бути не більше 500 символів']
    },
    productCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

const Category = mongoose.model('Category', CategorySchema);

export default Category;