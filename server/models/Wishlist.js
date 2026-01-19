import mongoose from 'mongoose';

const WishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // Один wishlist на користувача
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Метод для додавання товару
WishlistSchema.methods.addItem = function(productId) {
  // Перевірити чи товар вже є
  if (!this.items.includes(productId)) {
    this.items.push(productId);
  }
  return this.save();
};

// Метод для видалення товару
WishlistSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(
    item => item.toString() !== productId.toString()
  );
  return this.save();
};

// Метод для перевірки чи товар в wishlist
WishlistSchema.methods.hasItem = function(productId) {
  return this.items.some(
    item => item.toString() === productId.toString()
  );
};

// Метод для очищення wishlist
WishlistSchema.methods.clearWishlist = function() {
  this.items = [];
  return this.save();
};

const Wishlist = mongoose.model('Wishlist', WishlistSchema);

export default Wishlist;