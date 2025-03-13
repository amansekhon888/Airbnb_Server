import Reservation from "../models/Reservation/Reservation.js";

export const checkExistingReservation = async (propertyId, checkInDate, checkOutDate) => {
    const existingReservation = await Reservation.findOne({
        propertyId,
        $or: [
            { "selectedDates.checkIn": { $lt: checkOutDate }, "selectedDates.checkOut": { $gt: checkInDate } },
            { "selectedDates.checkIn": { $gte: checkInDate, $lt: checkOutDate } },
            { "selectedDates.checkOut": { $gt: checkInDate, $lte: checkOutDate } },
        ]
    });
    console.log(propertyId, checkInDate, checkOutDate);
    

    return !!existingReservation; // Returns true if a reservation exists
};