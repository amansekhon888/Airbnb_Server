import User from "../../models/User/User.js";
import Property from "../../models/Property/Property.js";
import Amenities from "../../models/Property/Amenities.js";
import { catchAsyncErrors } from "../../middleware/catchAsyncErrors.js";
import ErrorHandler from "../../Utils/errorhandler.js";
import ResponseHandler from "../../Utils/resHandler.js";

// export const addProperty = catchAsyncErrors(async (req, res, next) => {
//     const { id } = req.params;
//     const { step, host_id, category, title, property_type, description, type_of_place, availability_dates, gallery, address, price_per_night, cleaning_fee, service_fee, weekly_discount, monthly_discount, weekend_price, discount_first_booking, bedrooms, beds, max_guests, bathrooms, amenities, house_rules, cancellation_policy, safety_and_property, check_in_time, check_out_time, is_self_checkin, pet_allowed, notes, draft_steps_completed, tags, rating } = req.body;

//     let property

//     switch (step) {
//         case 1:
//             if (id) {
//                 property = await Property.findByIdAndUpdate(id, {  host_id, category, title, property_type, description, type_of_place, availability_dates, gallery, address, draft_steps_completed: 1 }, { new: true });
//             } else {
//                 property = await Property.create({ host_id, category, title, property_type, description, type_of_place, availability_dates, gallery, address, isDraft: true, draft_steps_completed: 1  })
//             }
//             break;
//         case 2:
//             property = await Property.findByIdAndUpdate(id, { bedrooms, beds, max_guests, bathrooms, amenities, draft_steps_completed }, { new: true });
//             break;
//         case 3:
//             property = await Property.findByIdAndUpdate(id, { price_per_night, cleaning_fee, service_fee, weekly_discount, monthly_discount, weekend_price, discount_first_booking }, { new: true });
//             break;
//         case 4:
//             property = await Property.findByIdAndUpdate(id, { house_rules, cancellation_policy, safety_and_property, check_in_time, check_out_time }, { new: true });
//             break;
//         case 5:
//             property = await Property.findByIdAndUpdate(id, { is_self_checkin, pet_allowed, notes }, { new: true });
//             break;
//         default:
//             return next(ErrorHandler("Invalid step", 400));
//     }
            
//     return ResponseHandler.send(res, "Property updated successfully", property, 200);
// });
export const addProperty = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { step, host_id, category, title, property_type, description, type_of_place, availability_dates, gallery, address, price_per_night, cleaning_fee, service_fee, weekly_discount, monthly_discount, weekend_price, discount_first_booking, bedrooms, beds, max_guests, bathrooms, amenities, house_rules, cancellation_policy, safety_and_property, check_in_time, check_out_time, is_self_checkin, pet_allowed, notes } = req.body;

    let property;

    if (id) {
        property = await Property.findById(id);
        if (!property) return next(ErrorHandler("Property not found", 404));
    }

    let updatedFields = {};
    let message;

    switch (step) {
        case 1:
            updatedFields = { host_id, category, title, property_type, description, type_of_place, availability_dates, gallery, address };
            break;
        case 2:
            updatedFields = { bedrooms, beds, max_guests, bathrooms, amenities };
            break;
        case 3:
            updatedFields = { price_per_night, cleaning_fee, service_fee, weekly_discount, monthly_discount, weekend_price, discount_first_booking };
            break;
        case 4:
            updatedFields = { house_rules, cancellation_policy, safety_and_property, check_in_time, check_out_time };
            break;
        case 5:
            updatedFields = { is_self_checkin, pet_allowed, notes };
            break;
        case 6:
            updatedFields = { status: "active", isDraft: false };
            message = "Property added successfully";
            break;
        default:
            return next(ErrorHandler("Invalid step", 400));
    }

    updatedFields.draft_steps_completed = Math.max(property?.draft_steps_completed || 0, step);

    if (id) {
        property = await Property.findByIdAndUpdate(id, updatedFields, { new: true });
    } else {
        property = await Property.create({ ...updatedFields, isDraft: true });
        message = "Property added successfully";
    }

    return ResponseHandler.send(res, message || "Property updated successfully", property, 200);
});
