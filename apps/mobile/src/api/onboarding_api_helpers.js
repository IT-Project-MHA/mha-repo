import {
    apiPatientProfile,
    apiAssignedGender,
    apiTrustedDevice,
    apiTermsAndPrivacy,
} from './django-API';

/*Onboarding API helpers, built on the calls in django-API.js. Use them inside a try/catch block, a failed request throws an ApiError */

//returns true if a patient profile with that phone number exists
async function patientProfileWithPhoneNumberExists(phoneNumber){

}
