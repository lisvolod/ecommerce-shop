import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
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
          min: 1,
          default: 1
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Метод для очищення кошика
CartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

// Метод для додавання товару
CartSchema.methods.addItem = function(productId, quantity = 1) {
  const existingItem = this.items.find(
    item => item.product.toString() === productId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({ product: productId, quantity });
  }

  return this.save();
};

// Метод для оновлення кількості
CartSchema.methods.updateItemQuantity = function(productId, quantity) {
  const item = this.items.find(
    item => item.product.toString() === productId.toString()
  );

  if (item) {
    if (quantity <= 0) {
      this.items = this.items.filter(
        item => item.product.toString() !== productId.toString()
      );
    } else {
      item.quantity = quantity;
    }
  }

  return this.save();
};

// Метод для видалення товару
CartSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(
    item => item.product.toString() !== productId.toString()
  );
  return this.save();
};

const Cart = mongoose.model('Cart', CartSchema);

export default Cart;
