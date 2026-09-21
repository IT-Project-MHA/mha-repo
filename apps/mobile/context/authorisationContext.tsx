// this file contains the context logic for user type
// before user type is declared– onboading sequence occurs
import { userType } from "../constants/userType";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserType = typeof userType[keyof typeof userType];

