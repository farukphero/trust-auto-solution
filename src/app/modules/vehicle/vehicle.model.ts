import mongoose, { Schema } from 'mongoose';
import { TVehicle } from './vehicle.interface';

const vehicleSchema: Schema<TVehicle> = new Schema<TVehicle>(
  {
    Id: {
      type: String,
    },
    user_type: {
      type: String,
      required: true,
    },
    customer: {
      type: Schema.ObjectId,
      ref: 'Customer',
    },
    company: {
      type: Schema.ObjectId,
      ref: 'Company',
    },
    showRoom: {
      type: Schema.ObjectId,
      ref: 'ShowRoom',
    },

    // Vehicle Information

    carReg_no: {
      type: String,
      required: [true, 'Car registration no  is required.'],
    },
    car_registration_no: {
      type: String,
      required: [true, 'Car registration no  is required.'],
    },
    fullRegNum: {
      type: String,
    },
    chassis_no: {
      type: String,
      unique: true,
      required: [true, 'Chassis no  is required.'],
    },
    engine_no: {
      type: String,
      required: [true, 'Engine no  is required.'],
    },

    vehicle_brand: {
      type: String,
      required: [true, 'Vehicle brand is required.'],
    },
    vehicle_name: {
      type: String,
      required: [true, 'Vehicle name is required.'],
    },
    vehicle_model: {
      type: Number,
      required: [true, 'Vehicle model is required.'],
    },
    vehicle_category: {
      type: String,
      required: [true, 'Vehicle category is required.'],
    },
    color_code: {
      type: String,
      required: [true, 'Color & code is required.'],
    },
    mileage: {
      type: Number,
      required: [true, 'Mileage is required.'],
    },
    fuel_type: {
      type: String,
      required: [true, 'Fuel type is required.'],
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware to concatenate carReg_no and car_registration_no
vehicleSchema.pre('save', function (next: any) {
  if (this.carReg_no && this.car_registration_no) {
    this.fullRegNum = `${this.carReg_no} ${this.car_registration_no}`;
  } else {
    this.fullRegNum = '';
  }
  next();
});

vehicleSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as {
    carReg_no: any;
    car_registration_no: any;
    fullRegNum: string;
    $set?: Partial<TVehicle>;
  };

  if (update.$set && update.$set.carReg_no && update.$set.car_registration_no) {
    update.$set.fullRegNum = `${update.$set.carReg_no} ${update.$set.car_registration_no}`;
  } else if (update.carReg_no && update.car_registration_no) {
    update.fullRegNum = `${update.carReg_no} ${update.car_registration_no}`;
  }

  next();
});
export const Vehicle = mongoose.model<TVehicle>('Vehicle', vehicleSchema);
