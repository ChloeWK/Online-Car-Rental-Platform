import { v4 as uuidv4 } from "uuid"
import fs from "fs"
import path from "path"
import { addDays, parseISO, isWithinInterval, isAfter } from "date-fns"
import fsPromises from "fs/promises"

// Import the Order type
// import type { Order } from "@/types/order"

// Define the desired structure for records in reservations.json
export interface CompletedReservationRecord {
  carVin: string;
  userId: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  pickupLocationId: string;
  returnLocationId: string;
  totalPrice: number;
  id: string; // This will store the Order ID
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string; // ISO string
  paymentStatus?: "pending" | "completed" | "failed" | "paid" | undefined;
  paymentDetails?: {
    method: string;
    lastFour: string;
    processedAt: string; // ISO string
  };
  // Add other top-level fields from your desired format if any
}

// Define the structure of the reservations.json file content
interface ReservationsFileContent {
  reservations: CompletedReservationRecord[]; // Store CompletedReservationRecord objects
}

// Path to the reservations.json file
const RESERVATIONS_FILE_PATH = path.join(process.cwd(), "data", "reservations.json")

// Event listeners for reservation changes
const reservationChangeListeners: (() => void)[] = []

// Function to notify listeners when reservations change
function notifyReservationChange() {
  reservationChangeListeners.forEach((listener) => listener())
}

// Function to subscribe to reservation changes
export function subscribeToReservationChanges(callback: () => void) {
  reservationChangeListeners.push(callback)
  return () => {
    const index = reservationChangeListeners.indexOf(callback)
    if (index !== -1) {
      reservationChangeListeners.splice(index, 1)
    }
  }
}

// Helper function to read reservations from the JSON file
async function readReservations(): Promise<CompletedReservationRecord[]> {
  console.log(`Attempting to read reservations from ${RESERVATIONS_FILE_PATH}`);
  try {
    const data = await fsPromises.readFile(RESERVATIONS_FILE_PATH, "utf-8")
    const reservations: CompletedReservationRecord[] = JSON.parse(data)
    console.log(`Successfully read ${reservations.length} reservations from file.`);
    return Array.isArray(reservations) ? reservations : []
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log(`Reservations file ${RESERVATIONS_FILE_PATH} not found, returning empty array.`);
      return []
    } else {
      console.error(`Error reading reservations file ${RESERVATIONS_FILE_PATH}:`, error)
      throw error
    }
  }
}

// Helper function to write reservations to the JSON file
async function writeReservations(reservations: CompletedReservationRecord[]): Promise<void> {
  console.log(`Attempting to write ${reservations.length} reservations to ${RESERVATIONS_FILE_PATH}`);
  try {
    // 将数组包装在 reservations 对象中
    const reservationsData = { reservations };
    await fsPromises.writeFile(RESERVATIONS_FILE_PATH, JSON.stringify(reservationsData, null, 2))
    console.log(`Successfully wrote reservations to ${RESERVATIONS_FILE_PATH}.`);
  } catch (error) {
    console.error(`Error writing reservations file ${RESERVATIONS_FILE_PATH}:`, error)
    throw error
  }
}

// Function to get all completed reservation records
export async function getAllCompletedReservationRecords(): Promise<CompletedReservationRecord[]> {
  return await readReservations()
}

// Function to add a new completed reservation record
export async function addCompletedReservationRecord(record: CompletedReservationRecord): Promise<CompletedReservationRecord> {
  console.log("Adding new completed reservation record:", record.id);
  const reservations = await readReservations()
  console.log("Reservations before adding:", reservations.length);
  reservations.push(record)
  console.log("Reservations after adding:", reservations.length);
  await writeReservations(reservations)
  console.log("New completed reservation record added successfully.");
  return record
}

// Function to get completed reservation records by car VIN
export async function getCompletedReservationRecordsByCarVin(carVin: string): Promise<CompletedReservationRecord[]> {
  const reservations = await readReservations()
  // Filter by car VIN and status (e.g., not cancelled)
  return reservations.filter((record) => record.carVin === carVin && record.status !== "cancelled")
}

// Function to get completed reservation records by user ID
export async function getCompletedReservationRecordsByUserId(userId: string): Promise<CompletedReservationRecord[]> {
  const reservations = await readReservations()
  // Filter by user ID
  return reservations.filter((record) => record.userId === userId)
}

// Function to check if a car is available for a specific date range (Now uses CompletedReservationRecord objects)
export async function isCarAvailableForDates(carVin: string, startDate: Date, endDate: Date): Promise<boolean> {
  const reservations = await readReservations()

  // Check for any overlapping reservations for the given car VIN
  const conflictingReservation = reservations.find((record) => {
    if (record.carVin !== carVin) {
      return false
    }

    const recordStartDate = new Date(record.startDate)
    const recordEndDate = new Date(record.endDate)

    // Check for overlap: [startDate, endDate] overlaps with [recordStartDate, recordEndDate]
    // Overlap exists if (start1 <= end2) and (end1 >= start2)
    return (
      startDate <= recordEndDate &&
      endDate >= recordStartDate
    )
  })

  // If no conflicting reservation is found, the car is available
  return !conflictingReservation
}

// Function to get the conflicting reservation for a car and date range
export async function getConflictingReservation(
  carVin: string,
  startDate: Date,
  endDate: Date,
): Promise<CompletedReservationRecord | undefined> {
  const reservations = await readReservations()

  // Find the first overlapping reservation for the given car VIN
  const conflictingReservation = reservations.find((record) => {
    if (record.carVin !== carVin) {
      return false
    }

    const recordStartDate = new Date(record.startDate)
    const recordEndDate = new Date(record.endDate)

    // Check for overlap
    return (
      startDate <= recordEndDate &&
      endDate >= recordStartDate
    )
  })

  return conflictingReservation
}

// Function to get unavailable dates for a specific car
export async function getCarUnavailableDates(
  carVin: string
): Promise<{ startDate: string; endDate: string }[]> {
  const reservations = await readReservations()

  // Filter reservations for the specific car and map to date ranges
  const unavailableDates = reservations
    .filter(record => record.carVin === carVin)
    .map(record => ({
      startDate: record.startDate,
      endDate: record.endDate,
    }))

  return unavailableDates
}

// Note: Other functions like isCarCurrentlyRented, getCarUnavailableDates, etc.
// need to be updated to work with the new structure where reservations.json stores Order objects.
// This is beyond the scope of this immediate request but is necessary for full functionality.
