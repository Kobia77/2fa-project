import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  totpSecret?: string;
  isTotpEnabled: boolean;
  backupCodes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
    totpSecret: {
      type: String,
      required: false,
    },
    isTotpEnabled: {
      type: Boolean,
      default: false,
    },
    backupCodes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Add pre-save middleware to ensure backupCodes is always an array
UserSchema.pre("save", function (next) {
  // Initialize backupCodes as an empty array if undefined
  if (!this.backupCodes) {
    this.backupCodes = [];
  }
  next();
});

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
