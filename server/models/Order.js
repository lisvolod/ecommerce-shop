import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    // Користувач (null якщо гість)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    
    // Дані гостя (якщо user === null)
    guestInfo: {
      fullName: {
        type: String,
        trim: true
      },
      email: {
        type: String,
        lowercase: true,
        trim: true
      },
      phone: {
        type: String,
        trim: true
      },
      address: {
        type: String,
        trim: true
      }
    },
    
    // Товари в замовленні
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        price: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],
    
    // Загальна сума
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    
    // Статус замовлення
    status: {
      type: String,
      enum: ['new', 'confirmed', 'assembled', 'shipped', 'delivered', 'cancelled', 'deleted'],
      default: 'new'
    },
    
    // Коментар до замовлення
    comment: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Коментар має бути не більше 500 символів']
    },
    
    // Soft delete
    deletedAt: {
      type: Date,
      default: null
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Метод для отримання замовлень без видалених
OrderSchema.statics.findActive = function() {
  return this.find({ deletedAt: null });
};

// Віртуальне поле - чи видалене замовлення
OrderSchema.virtual('isDeleted').get(function () {
  return this.deletedAt !== null;
});

const Order = mongoose.model('Order', OrderSchema);

export default Order;
