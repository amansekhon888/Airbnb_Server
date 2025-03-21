import moment from "moment";
import Reservation from "../../../models/Reservation/Reservation.js";

const isWithinAvailabilityPeriod = (
  availabilityPeriod,
  checkInDate,
  checkOutDate
) => {
  const today = moment().startOf("day");
  if (checkInDate < today.toDate()) return false; // Prevent past date selection

  const currentMonth = moment().startOf("month");
  const availableUntil = currentMonth
    .clone()
    .add(availabilityPeriod - 1, "months")
    .endOf("month");

  return (
    checkInDate >= currentMonth.toDate() &&
    checkOutDate <= availableUntil.toDate()
  );
};

const isResevations = async (propertyId, checkInDate, checkOutDate) => {
  return await Reservation.exists({
    propertyId,
    $or: [
      {
        "selectedDates.checkIn": { $lt: checkOutDate },
        "selectedDates.checkOut": { $gt: checkInDate },
      },
      { "selectedDates.checkIn": { $gte: checkInDate, $lt: checkOutDate } },
      { "selectedDates.checkOut": { $gt: checkInDate, $lte: checkOutDate } },
    ],
  });
};

export const isPropertyAvailable = async (property, checkIn, checkOut) => {
  if (!property.availability_period) return false;

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (
    !isWithinAvailabilityPeriod(
      property.availability_period,
      checkInDate,
      checkOutDate
    )
  )
    return false;
  return !(await isResevations(property._id, checkInDate, checkOutDate));
};
export const getWishlistedAggregation = (userId) => {
  if (!userId) return [];
  return [
    {
      $lookup: {
        from: "wishlists",
        let: { propertyId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$propertyId", "$$propertyId"] },
                  { $eq: ["$userId", userId] }, // Filter by logged-in user
                ],
              },
            },
          },
          { $limit: 1 },
        ],
        as: "wishlistEntry",
      },
    },
    { $addFields: { isWishlisted: { $gt: [{ $size: "$wishlistEntry" }, 0] } } },
    { $project: { wishlistEntry: 0 } },
  ];
};

export const getAvailabilityMatchStage = async (checkInDate, checkOutDate) => {
  const currentMonth = moment().startOf("month");

  const matchStage = {
    status: "active",
    $expr: {
      $and: [
        { $gte: [checkInDate, currentMonth.toDate()] },
        {
          $lte: [
            checkOutDate,
            {
              $dateAdd: {
                startDate: currentMonth.toDate(),
                unit: "month",
                amount: { $toInt: "$availability_period" },
              },
            },
          ],
        },
      ],
    },
  };

  const unavailablePropertyIds = await Reservation.distinct("propertyId", {
    $or: [
      {
        "selectedDates.checkIn": { $lt: checkOutDate },
        "selectedDates.checkOut": { $gt: checkInDate },
      },
      { "selectedDates.checkIn": { $gte: checkInDate, $lt: checkOutDate } },
      { "selectedDates.checkOut": { $gt: checkInDate, $lte: checkOutDate } },
    ],
  });

  if (unavailablePropertyIds.length > 0) {
    matchStage._id = { $nin: unavailablePropertyIds };
  }

  return matchStage;
};
export const getPropertyAggregationPipeline = async ({
  location,
  checkInDate,
  checkOutDate,
  guests,
  userId,
}) => {
  console.log(checkInDate);

  let matchStage = {};
  if (checkInDate || checkOutDate) {
    matchStage = await getAvailabilityMatchStage(checkInDate, checkOutDate);
  }
  if (location) {
    matchStage["$or"] = [
      { "address.city": { $regex: location, $options: "i" } },
      { "address.state": { $regex: location, $options: "i" } },
      { "address.country": { $regex: location, $options: "i" } },
    ];
  }
  if (guests) matchStage.max_guests = { $gte: parseInt(guests) };

  return [{ $match: matchStage }, ...getWishlistedAggregation(userId)];
};
