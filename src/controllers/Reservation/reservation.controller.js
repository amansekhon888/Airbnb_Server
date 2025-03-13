import Property from "../../models/Property/Property.js";
import Reservation from "../../models/Reservation/Reservation.js";
import { catchAsyncErrors } from "../../middleware/catchAsyncErrors.js";
import ErrorHandler from "../../Utils/errorhandler.js";
import ResponseHandler from "../../Utils/resHandler.js";
import { checkExistingReservation } from "../../Utils/reservationUtils.js";

export const createReservation = catchAsyncErrors(async (req, res, next) => {
    console.log("user:",req.user._id); 
    const { propertyId, checkIn, checkOut, numberOfGuests, pricePerNight, cleaning_fee = 0, service_fee = 0, tax = 0, discount = 0, totalAmountPaid = 0 } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) return next(new ErrorHandler("Property not found", 404));
    if (!property.isAvailable(checkIn, checkOut)) {
        return next(new ErrorHandler("Sorry, no availability for this property on the selected dates", 400));
    }

    const checkInDate = new Date(checkIn), checkOutDate = new Date(checkOut);
    const numberOfNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    if (numberOfNights <= 0) return next(new ErrorHandler("Invalid check-in/check-out dates", 400));

    const isBooked = await checkExistingReservation(propertyId, checkInDate, checkOutDate);
    console.log(isBooked);
    if (isBooked) return next(new ErrorHandler("Property is already booked for these dates", 400));

    const totalBasePrice = pricePerNight * numberOfNights;
    console.log(totalBasePrice);
    const totalPrice = totalBasePrice + cleaning_fee + service_fee + tax - discount;
    const paymentStatus = totalAmountPaid >= totalPrice ? "fully_paid" : totalAmountPaid > 0 ? "partial_paid" : "pending";

    const newReservation = await Reservation.create({
        userId: req.user._id, propertyId, selectedDates: { checkIn: checkInDate, checkOut: checkOutDate },
        numberOfNights, numberOfGuests, pricePerNight, totalbasePrice: totalBasePrice,
        cleaning_fee, service_fee, tax, discount, totalPrice, totalAmountPaid,
        remainingAmount: totalPrice - totalAmountPaid, paymentStatus,
    });

    return ResponseHandler.send(
        res,
        "Reservation created successfully",
        newReservation,
        201
      );
});

// get specific property reservations
export const getReservation = catchAsyncErrors(async (req, res, next) => {
    const reservation = await Reservation.findById(req.params.id).populate("propertyId");
    if (!reservation) return next(new ErrorHandler("Reservation not found", 404));
    return ResponseHandler.send(res, "Reservation", reservation, 200);
});

// get Reservations
export const getReservations = catchAsyncErrors(async (req, res, next) => {
    const reservations = await Reservation.find({ userId: req.user.id }).populate("propertyId", "title");
    return ResponseHandler.send(res, "Reservations", reservations, 200);
});