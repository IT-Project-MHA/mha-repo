import {
    apiPatientProfile,
    apiSupportLink,
    apiUser
} from './django-API';

/*Onboarding API helpers, built on the calls in django-API.js. Use them inside a try/catch block, a failed request throws an ApiError */

//creates a user
export async function completeUserOnboarding(phone_number, display_name, email){
    apiUser('create', phone_number, display_name, email);
}

//creates a patient profile
export async function completePatientOnboarding( has_diagnosis, other_conditions, assigned_gender_at_birth, birth_year, pain_types){
    apiPatientProfile('create',  has_diagnosis, other_conditions, assigned_gender_at_birth, birth_year, pain_types);
}


//takes the user phone number and connects it to the patient
export async function completeSupportPersonOnboarding(supporter_user, invited_phone_number){

    apiSupportLink('create', supporter_user, invited_phone_number);
}

