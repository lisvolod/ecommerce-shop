import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email є обов\'язковим'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Некоректний формат email']
    },
    password: {
      type: String,
      required: [true, 'Пароль є обов\'язковим'],
      minlength: [6, 'Пароль має бути не менше 6 символів']
    },
    fullName: {
      type: String,
      required: [true, 'ПІБ є обов\'язковим'],
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer'
    },
    refreshToken: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Хешування паролю перед збереженням
UserSchema.pre('save', async function (next) {
  // Якщо пароль не змінювався - пропускаємо
  if (!this.isModified('password')) {
    return next();
  }

  // Хешуємо пароль
  const salt = await bcrypt.genSalt(10); // salt — це випадковий рядок, який додається до пароля перед хешуванням, 
                                          //  щоб зробити злам практично неможливим, бо Навіть однакові паролі будуть мати різні хеші.
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Метод для перевірки паролю
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Віртуальне поле для повернення без чутливих даних
UserSchema.methods.toJSON = function () {  // автоматично викликається при res.json(user), гарантує, що пароль та refreshToken ніколи не поїдуть на фронтенд
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  return user;
};

const User = mongoose.model('User', UserSchema);

export default User;
