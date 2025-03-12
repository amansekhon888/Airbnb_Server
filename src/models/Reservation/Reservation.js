import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Properties",
      required: true,
    },
    selectedDates: {
      checkIn: Date,
      checkOut: Date,
    },
    numberOfNights: Number,
    numberOfGuests: Number,
    pricePerNight: Number,
    totalbasePrice: Number,
    cleaning_fee: Number,
    service_fee: Number,
    tax: Number,
    discount: Number,
    totalPrice: Number,
    totalAmountPaid: {
      type: Number,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial_paid", "fully_paid", "refunded"],
      default: "pending",
    },
    cancellationReason: String,
    cancelledAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Reservations", ReservationSchema);